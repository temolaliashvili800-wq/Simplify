import { Moon, Sun } from 'lucide-react';
import type { AppSettings, PreferredLanguage, ReadingLevel } from '../types/simplify';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
}

const LANGUAGES: Array<{ value: PreferredLanguage; label: string }> = [
  { value: 'preserve', label: 'Same as original text' },
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'French', label: 'French' },
  { value: 'German', label: 'German' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Japanese', label: 'Japanese' },
];

const READING_LEVELS: Array<{ value: ReadingLevel; label: string }> = [
  { value: 'very-simple', label: 'Very Simple' },
  { value: 'standard', label: 'Standard' },
  { value: 'advanced', label: 'Advanced' },
];

export function SettingsView({ settings, onUpdateSettings }: SettingsViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#111827] dark:text-[#F8FAFC] sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-[#64748B] dark:text-slate-300">
          Customize your reading workspace, preferred output language, and display appearance.
        </p>
      </div>

      {/* Appearance */}
      <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#151F35]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-[#111827] dark:text-[#F8FAFC]">
              Appearance
            </h2>
            <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">
              Switch between clean daylight white and low-glare dark mode.
            </p>
          </div>

          <div
            className="inline-flex rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-1 dark:border-slate-700 dark:bg-[#0B1120]"
            role="radiogroup"
            aria-label="Theme appearance"
          >
            <button
              type="button"
              role="radio"
              aria-checked={settings.theme === 'light'}
              onClick={() => onUpdateSettings({ theme: 'light' })}
              className={`inline-flex min-h-[38px] items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                settings.theme === 'light'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#111827] dark:text-slate-300 dark:hover:text-[#F8FAFC]'
              }`}
            >
              <Sun className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Light</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={settings.theme === 'dark'}
              onClick={() => onUpdateSettings({ theme: 'dark' })}
              className={`inline-flex min-h-[38px] items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                settings.theme === 'dark'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#111827] dark:text-slate-300 dark:hover:text-[#F8FAFC]'
              }`}
            >
              <Moon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Dark</span>
            </button>
          </div>
        </div>
      </section>

      {/* Transformation Preferences */}
      <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#151F35]">
        <h2 className="font-display text-base font-semibold text-[#111827] dark:text-[#F8FAFC]">
          Workspace preferences
        </h2>

        <div className="mt-5 space-y-5 divide-y divide-[#E2E8F0] dark:divide-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <label
                htmlFor="preferred-language-select"
                className="text-sm font-medium text-[#111827] dark:text-[#F8FAFC]"
              >
                Preferred output language
              </label>
              <p className="mt-0.5 text-xs text-[#64748B] dark:text-slate-400">
                Keep the source language by default, or translate results during transformation.
              </p>
            </div>
            <select
              id="preferred-language-select"
              value={settings.preferredLanguage}
              onChange={(e) =>
                onUpdateSettings({ preferredLanguage: e.target.value as PreferredLanguage })
              }
              className="min-h-[40px] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#111827] dark:border-slate-700 dark:bg-[#0B1120] dark:text-[#F8FAFC] sm:w-72"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <label
                htmlFor="default-reading-level-select"
                className="text-sm font-medium text-[#111827] dark:text-[#F8FAFC]"
              >
                Default reading level
              </label>
              <p className="mt-0.5 text-xs text-[#64748B] dark:text-slate-400">
                Pre-selected level when opening the Simplify Text workspace.
              </p>
            </div>
            <select
              id="default-reading-level-select"
              value={settings.defaultReadingLevel}
              onChange={(e) =>
                onUpdateSettings({ defaultReadingLevel: e.target.value as ReadingLevel })
              }
              className="min-h-[40px] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#111827] dark:border-slate-700 dark:bg-[#0B1120] dark:text-[#F8FAFC] sm:w-72"
            >
              {READING_LEVELS.map((lvl) => (
                <option key={lvl.value} value={lvl.value}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-4 pt-5">
            <div>
              <label
                htmlFor="side-by-side-toggle"
                className="text-sm font-medium text-[#111827] dark:text-[#F8FAFC]"
              >
                Side-by-side comparison on desktop
              </label>
              <p className="mt-0.5 text-xs text-[#64748B] dark:text-slate-400">
                Show original and transformed text next to each other automatically on wide screens.
              </p>
            </div>
            <button
              id="side-by-side-toggle"
              type="button"
              role="switch"
              aria-checked={settings.showSideBySideByDefault}
              onClick={() =>
                onUpdateSettings({
                  showSideBySideByDefault: !settings.showSideBySideByDefault,
                })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                settings.showSideBySideByDefault
                  ? 'bg-[#2563EB]'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.showSideBySideByDefault ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* About & Privacy */}
      <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#151F35]">
        <h2 className="font-display text-base font-semibold text-[#111827] dark:text-[#F8FAFC]">
          About Simplify
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#64748B] dark:text-slate-300">
          Simplify is a focused text transformation platform built to make complex writing clearer, shorter, and adaptable across historical journalistic styles.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#64748B] dark:text-slate-300">
          <span className="font-medium text-[#111827] dark:text-[#F8FAFC]">Privacy:</span> No user accounts or sign-in are required. Text you enter is sent strictly to our backend AI transformation service to generate your requested output and is not saved permanently on our servers.
        </p>
      </section>
    </div>
  );
}
