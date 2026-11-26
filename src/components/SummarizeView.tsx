import { useEffect, useRef, useState } from 'react';
import { List } from 'lucide-react';
import { summarizeTextRequest, TransformApiError } from '../services/transformApi';
import type {
  PreferredLanguage,
  SummaryFormat,
  SummaryLength,
  TransformResult,
} from '../types/simplify';
import { validateInputText } from '../utils/textMetrics';
import { OutputPanel } from './OutputPanel';
import { TextEditorPanel } from './TextEditorPanel';

interface SummarizeViewProps {
  sourceText: string;
  onChangeText: (next: string) => void;
  preferredLanguage: PreferredLanguage;
  showSideBySideByDefault: boolean;
}

const LENGTH_OPTIONS: Array<{
  value: SummaryLength;
  title: string;
  description: string;
}> = [
  {
    value: 'short',
    title: 'Short Summary',
    description: 'Essential core message only, built for quick reading.',
  },
  {
    value: 'medium',
    title: 'Medium Summary',
    description: 'Balanced coverage of main arguments and key facts.',
  },
  {
    value: 'detailed',
    title: 'Detailed Summary',
    description: 'Thorough overview keeping context, dates, and evidence.',
  },
];

const FORMAT_OPTIONS: Array<{ value: SummaryFormat; label: string }> = [
  { value: 'paragraphs', label: 'Normal paragraphs' },
  { value: 'bullets', label: 'Bullet points' },
  { value: 'takeaways', label: 'Key takeaways' },
  { value: 'step-by-step', label: 'Step-by-step explanation' },
];

export function SummarizeView({
  sourceText,
  onChangeText,
  preferredLanguage,
  showSideBySideByDefault,
}: SummarizeViewProps) {
  const [summaryLength, setSummaryLength] = useState<SummaryLength>('medium');
  const [outputFormat, setOutputFormat] = useState<SummaryFormat>('paragraphs');
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

  const runSummarize = async () => {
    if (isLoading) return;

    const check = validateInputText(sourceText);
    if (!check.valid) {
      setValidationError(check.error || 'Please enter text to summarize.');
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
      const output = await summarizeTextRequest(
        {
          text: sourceText,
          summaryLength,
          outputFormat,
          preferredLanguage,
        },
        controller.signal
      );

      const lengthLabel = LENGTH_OPTIONS.find((opt) => opt.value === summaryLength)?.title || 'Medium Summary';
      const formatLabel = FORMAT_OPTIONS.find((opt) => opt.value === outputFormat)?.label || 'Normal paragraphs';
      setResult({
        text: output,
        mode: 'summarize',
        subtitle: `${lengthLabel} · ${formatLabel}`,
        generatedAt: Date.now(),
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (err instanceof TransformApiError) {
        setApiError(err.message);
      } else {
        setApiError('An unexpected error occurred while summarizing your text.');
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
          Summarize
        </h1>
        <p className="mt-1.5 text-sm text-[#64748B] dark:text-slate-300">
          Distill long articles, reports, or essays into structured summaries without losing key facts.
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
        label="Text to summarize"
        validationError={validationError}
        disabled={isLoading}
        minHeightClass="min-h-[190px]"
      />

      <section
        aria-label="Summary options"
        className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#151F35] sm:p-5"
      >
        <div className="space-y-5">
          <div>
            <h2 className="mb-3 font-display text-sm font-semibold text-[#111827] dark:text-[#F8FAFC]">
              Summary length
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3" role="radiogroup" aria-label="Summary length">
              {LENGTH_OPTIONS.map((option) => {
                const selected = summaryLength === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={isLoading}
                    onClick={() => setSummaryLength(option.value)}
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
                      {option.title}
                    </span>
                    <span className="mt-1 text-xs leading-relaxed text-[#64748B] dark:text-slate-400">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#E2E8F0] pt-4 dark:border-slate-800">
            <h2 className="mb-2 font-display text-sm font-semibold text-[#111827] dark:text-[#F8FAFC]">
              Output format
            </h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Output format">
              {FORMAT_OPTIONS.map((format) => {
                const selected = outputFormat === format.value;
                return (
                  <button
                    key={format.value}
                    type="button"
                    disabled={isLoading}
                    aria-pressed={selected}
                    onClick={() => setOutputFormat(format.value)}
                    className={`min-h-[40px] rounded-lg border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap truncate ${
                      selected
                        ? 'border-[#2563EB] bg-[#2563EB] text-white'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#111827] hover:bg-slate-100 dark:border-slate-700 dark:bg-[#0B1120] dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    {format.label}
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
              onClick={runSummarize}
              disabled={isLoading}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap shrink-0"
            >
              <List className="h-4 w-4" aria-hidden="true" />
              <span>{isLoading ? 'Transforming your text...' : 'Summarize'}</span>
            </button>
          </div>
        </div>
      </section>

      <OutputPanel
        title="Summary result"
        originalText={sourceText}
        result={result}
        isLoading={isLoading}
        error={apiError}
        emptyPrompt="Paste your text above, choose a summary length and format, and click Summarize."
        showSideBySideDefault={showSideBySideByDefault}
        onRegenerate={runSummarize}
        onStartOver={handleStartOver}
      />
    </div>
  );
}
