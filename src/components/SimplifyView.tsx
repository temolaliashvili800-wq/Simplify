import { useEffect, useRef, useState } from 'react';
import { FileText } from 'lucide-react';
import { simplifyTextRequest, TransformApiError } from '../services/transformApi';
import type { PreferredLanguage, ReadingLevel, TransformResult } from '../types/simplify';
import { validateInputText } from '../utils/textMetrics';
import { OutputPanel } from './OutputPanel';
import { TextEditorPanel } from './TextEditorPanel';

interface SimplifyViewProps {
  sourceText: string;
  onChangeText: (next: string) => void;
  defaultReadingLevel: ReadingLevel;
  preferredLanguage: PreferredLanguage;
  showSideBySideByDefault: boolean;
}

const READING_LEVEL_OPTIONS: Array<{
  value: ReadingLevel;
  title: string;
  description: string;
}> = [
  {
    value: 'very-simple',
    title: 'Very Simple',
    description: 'Basic vocabulary, short sentences, and plain explanations for beginners.',
  },
  {
    value: 'standard',
    title: 'Standard',
    description: 'Clear, natural everyday language keeping important context and details.',
  },
  {
    value: 'advanced',
    title: 'Advanced',
    description: 'Retains technical precision while improving flow and sentence clarity.',
  },
];

export function SimplifyView({
  sourceText,
  onChangeText,
  defaultReadingLevel,
  preferredLanguage,
  showSideBySideByDefault,
}: SimplifyViewProps) {
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>(defaultReadingLevel);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [result, setResult] = useState<TransformResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setReadingLevel(defaultReadingLevel);
  }, [defaultReadingLevel]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const runSimplify = async () => {
    if (isLoading) return;

    const check = validateInputText(sourceText);
    if (!check.valid) {
      setValidationError(check.error || 'Please enter text to simplify.');
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
      const output = await simplifyTextRequest(
        {
          text: sourceText,
          readingLevel,
          preferredLanguage,
        },
        controller.signal
      );

      const levelLabel = READING_LEVEL_OPTIONS.find((opt) => opt.value === readingLevel)?.title || 'Standard';
      const langNote = preferredLanguage === 'preserve' ? 'Original language' : preferredLanguage;
      setResult({
        text: output,
        mode: 'simplify',
        subtitle: `${levelLabel} reading level · ${langNote}`,
        generatedAt: Date.now(),
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (err instanceof TransformApiError) {
        setApiError(err.message);
      } else {
        setApiError('An unexpected error occurred while simplifying your text.');
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
          Simplify Text
        </h1>
        <p className="mt-1.5 text-sm text-[#64748B] dark:text-slate-300">
          Turn dense or technical writing into clear, readable prose at your chosen reading level.
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
        label="Text to simplify"
        validationError={validationError}
        disabled={isLoading}
        minHeightClass="min-h-[190px]"
      />

      <section
        aria-label="Reading level"
        className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#151F35] sm:p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-[#111827] dark:text-[#F8FAFC]">
            Reading level
          </h2>
          <span className="text-xs text-[#64748B] dark:text-slate-400">
            Preserves all core facts and numbers
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3" role="radiogroup" aria-label="Reading level">
          {READING_LEVEL_OPTIONS.map((option) => {
            const selected = readingLevel === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={isLoading}
                onClick={() => setReadingLevel(option.value)}
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

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-4 dark:border-slate-800">
          <p className="text-xs text-[#64748B] dark:text-slate-400">
            Output language: <span className="font-medium text-[#111827] dark:text-slate-200">{preferredLanguage === 'preserve' ? 'Same as input' : preferredLanguage}</span>
          </p>
          <button
            type="button"
            onClick={runSimplify}
            disabled={isLoading}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap shrink-0"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            <span>{isLoading ? 'Transforming your text...' : 'Simplify Text'}</span>
          </button>
        </div>
      </section>

      <OutputPanel
        title="Simplified result"
        originalText={sourceText}
        result={result}
        isLoading={isLoading}
        error={apiError}
        emptyPrompt="Paste or type your text above, pick a reading level, and click Simplify Text to generate a clearer version."
        showSideBySideDefault={showSideBySideByDefault}
        onRegenerate={runSimplify}
        onStartOver={handleStartOver}
      />
    </div>
  );
}
