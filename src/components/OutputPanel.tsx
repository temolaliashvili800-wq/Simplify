import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Columns2,
  Copy,
  FileText,
  Loader2,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import {
  calculateLengthDeltaLabel,
  countCharacters,
  countWords,
} from '../utils/textMetrics';
import type { TransformResult } from '../types/simplify';

interface OutputPanelProps {
  title: string;
  originalText: string;
  result: TransformResult | null;
  isLoading: boolean;
  error: string | null;
  emptyPrompt: string;
  showSideBySideDefault?: boolean;
  noticeText?: string;
  onRegenerate: () => void;
  onStartOver: () => void;
}

export function OutputPanel({
  title,
  originalText,
  result,
  isLoading,
  error,
  emptyPrompt,
  showSideBySideDefault = false,
  noticeText,
  onRegenerate,
  onStartOver,
}: OutputPanelProps) {
  const [copied, setCopied] = useState(false);
  const [compareMode, setCompareMode] = useState(showSideBySideDefault);

  useEffect(() => {
    setCompareMode(showSideBySideDefault);
  }, [showSideBySideDefault]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
    } catch {
      // Fallback via temporary textarea if clipboard API is restricted
      const el = document.createElement('textarea');
      el.value = result.text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
    }
  };

  const resultWords = result ? countWords(result.text) : 0;
  const resultChars = result ? countCharacters(result.text) : 0;
  const originalWords = countWords(originalText);
  const deltaLabel = result ? calculateLengthDeltaLabel(originalWords, resultWords) : null;

  return (
    <section
      aria-label="Transformation output"
      aria-live="polite"
      className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs transition-colors dark:border-slate-800 dark:bg-[#151F35]"
    >
      {/* Output Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] px-4 py-3 dark:border-slate-800 sm:px-5">
        <div className="min-w-0">
          <h2 className="font-display text-sm font-semibold text-[#111827] dark:text-[#F8FAFC]">
            {title}
          </h2>
          {result && (
            <p className="mt-0.5 text-xs text-[#64748B] dark:text-slate-400">
              {result.subtitle}
            </p>
          )}
        </div>

        {result && !isLoading && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCompareMode((prev) => !prev)}
              aria-pressed={compareMode}
              className={`hidden lg:inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                compareMode
                  ? 'border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-blue-400'
                  : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#111827] hover:bg-slate-100 dark:border-slate-700 dark:bg-[#0B1120] dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Columns2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{compareMode ? 'Hide comparison' : 'Compare side by side'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#111827] transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-[#0B1120] dark:text-[#F8FAFC] dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-xs font-medium text-[#111827] transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-[#0B1120] dark:text-[#F8FAFC] dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Regenerate</span>
            </button>

            <button
              type="button"
              onClick={onStartOver}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#111827] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-[#F8FAFC] whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Start over</span>
            </button>
          </div>
        )}
      </div>

      {/* Output Body */}
      <div className="p-4 sm:p-5">
        {isLoading && (
          <div className="py-8">
            <div className="flex items-center gap-3 text-sm font-medium text-[#2563EB]">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Transforming your text...</span>
            </div>
            <div className="mt-5 space-y-2.5" aria-hidden="true">
              <div className="h-3.5 w-11/12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3.5 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3.5 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3.5 w-3/5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50/70 p-4 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
              <p className="leading-relaxed">{error}</p>
            </div>
            {originalText.trim().length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#1D4ED8]"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Try again</span>
                </button>
              </div>
            )}
          </div>
        )}

        {!isLoading && !error && !result && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#64748B] dark:bg-[#0B1120] dark:text-slate-400">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#64748B] dark:text-slate-400">
              {emptyPrompt}
            </p>
          </div>
        )}

        {!isLoading && !error && result && (
          <>
            {noticeText && (
              <p className="mb-4 border-b border-[#E2E8F0] pb-3 text-xs text-[#64748B] dark:border-slate-800 dark:text-slate-400">
                {noticeText}
              </p>
            )}

            {compareMode ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                <div className="border-b border-[#E2E8F0] pb-5 dark:border-slate-800 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
                  <div className="mb-2.5 flex items-center justify-between text-xs font-medium text-[#64748B] dark:text-slate-400">
                    <span>Original text</span>
                    <span className="font-mono tabular-nums">{originalWords.toLocaleString()} words</span>
                  </div>
                  <div className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#64748B] dark:text-slate-300">
                    {originalText}
                  </div>
                </div>

                <div>
                  <div className="mb-2.5 flex items-center justify-between text-xs font-medium text-[#2563EB]">
                    <span>Transformed text</span>
                    <span className="font-mono tabular-nums">{resultWords.toLocaleString()} words</span>
                  </div>
                  <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#111827] dark:text-[#F8FAFC]">
                    {result.text}
                  </div>
                </div>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-[15px] leading-[1.7] text-[#111827] dark:text-[#F8FAFC]">
                {result.text}
              </div>
            )}
          </>
        )}
      </div>

      {/* Output Footer Metrics */}
      {!isLoading && !error && result && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] px-4 py-3 text-xs text-[#64748B] dark:border-slate-800 dark:text-slate-400 sm:px-5">
          <div className="flex flex-wrap items-center gap-2 font-mono tabular-nums">
            <span>
              {resultWords.toLocaleString()} {resultWords === 1 ? 'word' : 'words'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{resultChars.toLocaleString()} characters</span>
            {deltaLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-sans font-medium text-[#2563EB]">{deltaLabel}</span>
              </>
            )}
          </div>

          <span className="text-xs text-[#64748B] dark:text-slate-400">
            Generated by Simplify AI
          </span>
        </div>
      )}
    </section>
  );
}
