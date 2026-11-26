import { useEffect, useRef, useState } from 'react';
import { Newspaper } from 'lucide-react';
import { historicalTransformRequest, TransformApiError } from '../services/transformApi';
import type {
  HistoricalFormat,
  HistoricalPeriod,
  PreferredLanguage,
  TransformResult,
} from '../types/simplify';
import { validateInputText } from '../utils/textMetrics';
import { OutputPanel } from './OutputPanel';
import { TextEditorPanel } from './TextEditorPanel';

interface HistoricalViewProps {
  sourceText: string;
  onChangeText: (next: string) => void;
  preferredLanguage: PreferredLanguage;
  showSideBySideByDefault: boolean;
}

const PERIODS: HistoricalPeriod[] = [
  '1920s',
  '1930s',
  '1940s',
  '1950s',
  '1960s',
  '1970s',
  '1980s',
  '1990s',
  '2000s',
];

const WRITING_FORMATS: Array<{
  value: HistoricalFormat;
  title: string;
  description: string;
}> = [
  {
    value: 'newspaper',
    title: 'Newspaper Article',
    description: 'Headline and inverted-pyramid print news structure.',
  },
  {
    value: 'news-report',
    title: 'News Report',
    description: 'Objective journalistic dispatch inspired by the decade.',
  },
  {
    value: 'editorial',
    title: 'Editorial',
    description: 'Measured commentary and opinion-column prose style.',
  },
  {
    value: 'magazine',
    title: 'Magazine Article',
    description: 'Engaging long-form feature rhythm and narrative tone.',
  },
];

export function HistoricalView({
  sourceText,
  onChangeText,
  preferredLanguage,
  showSideBySideByDefault,
}: HistoricalViewProps) {
  const [period, setPeriod] = useState<HistoricalPeriod>('1980s');
  const [writingFormat, setWritingFormat] = useState<HistoricalFormat>('newspaper');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<TransformResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const runHistoricalTransform = async () => {
    if (isLoading) return;

    const check = validateInputText(sourceText);
    if (!check.valid) {
      setValidationError(check.error || 'Please enter text to transform.');
      setApiError(null);
      return;
    }

    setValidationError(null);
    setApiError(null);
    setIsLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const output = await historicalTransformRequest(
        {
          text: sourceText,
          period,
          writingFormat,
          preferredLanguage,
        },
        controller.signal
      );

      const formatLabel = WRITING_FORMATS.find((f) => f.value === writingFormat)?.title || 'Newspaper Article';
      setResult({
        text: output,
        mode: 'historical',
        subtitle: `${period} style · ${formatLabel}`,
        generatedAt: Date.now(),
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (err instanceof TransformApiError) {
        setApiError(err.message);
      } else {
        setApiError('An unexpected error occurred while transforming your text.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    abortRef.current?.abort();
    setIsLoading(false);
    setValidationError(null);
    setApiError(null);
    setResult(null);
    onChangeText('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#111827] dark:text-[#F8FAFC] sm:text-3xl">
          Historical Styles
        </h1>
        <p className="mt-1.5 text-sm text-[#64748B] dark:text-slate-300">
          Reimagine modern informational text in the journalistic voice of a chosen decade while preserving every fact.
        </p>
      </div>

      <TextEditorPanel
        value={sourceText}
        onChange={(next) => {
          setValidationError(null);
          onChangeText(next);
        }}
        onClear={() => {
          setValidationError(null);
          setApiError(null);
          setResult(null);
        }}
        label="Text to rewrite"
        validationError={validationError}
        disabled={isLoading}
        minHeightClass="min-h-[190px]"
      />

      <section
        aria-label="Historical style options"
        className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#151F35] sm:p-5"
      >
        <div className="space-y-5">
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-sm font-semibold text-[#111827] dark:text-[#F8FAFC]">
                Historical period
              </h2>
              <span className="text-xs text-[#64748B] dark:text-slate-400">
                Style adaptation only — facts stay accurate
              </span>
            </div>

            <div
              className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9"
              role="radiogroup"
              aria-label="Historical period"
            >
              {PERIODS.map((decade) => {
                const selected = period === decade;
                return (
                  <button
                    key={decade}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={isLoading}
                    onClick={() => setPeriod(decade)}
                    className={`min-h-[40px] rounded-lg border px-2 py-2 font-mono text-xs font-medium tabular-nums transition-colors ${
                      selected
                        ? 'border-[#2563EB] bg-[#2563EB] text-white'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#111827] hover:bg-slate-100 dark:border-slate-700 dark:bg-[#0B1120] dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {decade}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#E2E8F0] pt-4 dark:border-slate-800">
            <h2 className="mb-3 font-display text-sm font-semibold text-[#111827] dark:text-[#F8FAFC]">
              Writing format
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" role="radiogroup" aria-label="Writing format">
              {WRITING_FORMATS.map((fmt) => {
                const selected = writingFormat === fmt.value;
                return (
                  <button
                    key={fmt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={isLoading}
                    onClick={() => setWritingFormat(fmt.value)}
                    className={`flex flex-col rounded-lg border p-3.5 text-left transition-all duration-150 disabled:opacity-60 ${
                      selected
                        ? 'border-[#2563EB] bg-[#2563EB]/5 ring-1 ring-[#2563EB] dark:bg-[#2563EB]/15'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-slate-300 dark:border-slate-700 dark:bg-[#0B1120] dark:hover:border-slate-600'
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold ${
                        selected ? 'text-[#2563EB] dark:text-blue-400' : 'text-[#111827] dark:text-[#F8FAFC]'
                      }`}
                    >
                      {fmt.title}
                    </span>
                    <span className="mt-1 text-xs leading-relaxed text-[#64748B] dark:text-slate-400">
                      {fmt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4 dark:border-slate-800">
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Output language:{' '}
              <span className="font-medium text-[#111827] dark:text-slate-200">
                {preferredLanguage === 'preserve' ? 'Same as input' : preferredLanguage}
              </span>
            </p>
            <button
              type="button"
              onClick={runHistoricalTransform}
              disabled={isLoading}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <Newspaper className="h-4 w-4" aria-hidden="true" />
              <span>{isLoading ? 'Transforming your text...' : 'Transform'}</span>
            </button>
          </div>
        </div>
      </section>

      <OutputPanel
        title="Historical style output"
        originalText={sourceText}
        result={result}
        isLoading={isLoading}
        error={apiError}
        emptyPrompt="Paste your text above, select a decade from 1920s to 2000s and a writing format, then click Transform."
        showSideBySideDefault={showSideBySideByDefault}
        noticeText={`Stylistic rewrite inspired by ${period} journalism. Original facts and dates are preserved without fabricating sources.`}
        onRegenerate={runHistoricalTransform}
        onStartOver={handleStartOver}
      />
    </div>
  );
}
