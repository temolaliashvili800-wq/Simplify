import { useId, useRef, useState } from 'react';
import { BookOpen, ClipboardPaste, FileUp, Trash2 } from 'lucide-react';
import {
  countCharacters,
  countWords,
  estimateReadingTimeMinutes,
  MAX_TEXT_LENGTH,
  SAMPLE_TEXTS,
  validateUploadedFile,
} from '../utils/textMetrics';

interface TextEditorPanelProps {
  value: string;
  onChange: (nextValue: string) => void;
  onClear?: () => void;
  label?: string;
  placeholder?: string;
  validationError?: string | null;
  disabled?: boolean;
  minHeightClass?: string;
}

export function TextEditorPanel({
  value,
  onChange,
  onClear,
  label = 'Source text',
  placeholder = 'Paste your text here and discover a simpler way to understand it...',
  validationError,
  disabled = false,
  minHeightClass = 'min-h-[220px]',
}: TextEditorPanelProps) {
  const textareaId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [utilityNotice, setUtilityNotice] = useState<string | null>(null);

  const wordCount = countWords(value);
  const charCount = countCharacters(value);
  const readingMinutes = estimateReadingTimeMinutes(wordCount);
  const lengthRatio = Math.min(100, Math.round((charCount / MAX_TEXT_LENGTH) * 100));
  const isOverLimit = charCount > MAX_TEXT_LENGTH;

  const handlePaste = async () => {
    setUtilityNotice(null);
    if (!navigator.clipboard?.readText) {
      setUtilityNotice('Clipboard access is unavailable in this browser. Use Ctrl+V or Cmd+V inside the editor.');
      return;
    }
    try {
      const clipText = await navigator.clipboard.readText();
      if (!clipText.trim()) {
        setUtilityNotice('Your clipboard appears empty.');
        return;
      }
      onChange(clipText);
    } catch {
      setUtilityNotice('Clipboard permission was denied. Use Ctrl+V or Cmd+V directly in the text area.');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setUtilityNotice(null);
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const check = validateUploadedFile({ name: file.name, size: file.size, type: file.type });
    if (!check.valid) {
      setUtilityNotice(check.error || 'Unable to load file.');
      return;
    }

    try {
      const content = await file.text();
      if (content.length > MAX_TEXT_LENGTH) {
        onChange(content.slice(0, MAX_TEXT_LENGTH));
        setUtilityNotice(
          `Loaded the first ${MAX_TEXT_LENGTH.toLocaleString()} characters from "${file.name}" to stay within the maximum text limit.`
        );
      } else {
        onChange(content);
      }
    } catch {
      setUtilityNotice('Failed to read the selected file.');
    }
  };

  const handleLoadSample = () => {
    setUtilityNotice(null);
    const samples = [SAMPLE_TEXTS.science, SAMPLE_TEXTS.policy, SAMPLE_TEXTS.technology];
    const currentIndex = samples.findIndex((s) => s === value.trim());
    const nextSample = samples[(currentIndex + 1) % samples.length];
    onChange(nextSample);
  };

  const handleClear = () => {
    setUtilityNotice(null);
    onChange('');
    onClear?.();
  };

  return (
    <section
      aria-label={label}
      className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs transition-colors dark:border-slate-800 dark:bg-[#151F35]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] px-4 py-3 dark:border-slate-800 sm:px-5">
        <label
          htmlFor={textareaId}
          className="text-sm font-semibold text-[#111827] dark:text-[#F8FAFC]"
        >
          {label}
        </label>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleLoadSample}
            disabled={disabled}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#111827] disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-[#F8FAFC] whitespace-nowrap shrink-0"
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Sample text</span>
          </button>

          <button
            type="button"
            onClick={handlePaste}
            disabled={disabled}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#111827] disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-[#F8FAFC] whitespace-nowrap shrink-0"
          >
            <ClipboardPaste className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Paste</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#111827] disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-[#F8FAFC] whitespace-nowrap shrink-0"
          >
            <FileUp className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Upload .txt</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.csv,text/plain,text/markdown"
            onChange={handleFileChange}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />

          {value.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#64748B] transition-colors hover:bg-[#F8FAFC] hover:text-[#111827] disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-[#F8FAFC] whitespace-nowrap shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <textarea
          id={textareaId}
          value={value}
          onChange={(e) => {
            setUtilityNotice(null);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={Boolean(validationError || isOverLimit)}
          className={`w-full resize-y bg-transparent text-[15px] leading-relaxed text-[#111827] placeholder:text-[#64748B]/75 focus:outline-none disabled:opacity-60 dark:text-[#F8FAFC] dark:placeholder:text-slate-400/75 ${minHeightClass}`}
        />

        {(validationError || utilityNotice) && (
          <div
            role="alert"
            className="mt-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-xs font-medium text-[#111827] dark:border-slate-700 dark:bg-[#0B1120] dark:text-slate-200"
          >
            {validationError || utilityNotice}
          </div>
        )}
      </div>

      <div className="border-t border-[#E2E8F0] px-4 py-3 dark:border-slate-800 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#64748B] dark:text-slate-400">
          <div className="flex items-center gap-2 font-mono tabular-nums">
            <span>
              {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
            </span>
            {readingMinutes > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{readingMinutes} min read</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 font-mono tabular-nums">
            <span className={isOverLimit ? 'font-semibold text-red-600 dark:text-red-400' : ''}>
              {charCount.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()} characters
            </span>
          </div>
        </div>

        <div
          className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#E2E8F0] dark:bg-slate-800"
          aria-hidden="true"
        >
          <div
            className={`h-full transition-all duration-150 ${
              isOverLimit ? 'bg-red-600 dark:bg-red-500' : 'bg-[#2563EB]'
            }`}
            style={{ width: `${lengthRatio}%` }}
          />
        </div>
      </div>
    </section>
  );
}
