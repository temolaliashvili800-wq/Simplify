import { useEffect, useState } from 'react';
import { HistoricalView } from './components/HistoricalView';
import { HomeView } from './components/HomeView';
import { SettingsView } from './components/SettingsView';
import { Sidebar } from './components/Sidebar';
import { SimplifyView } from './components/SimplifyView';
import { SummarizeView } from './components/SummarizeView';
import type { AppSettings, WorkspacePage } from './types/simplify';

const SETTINGS_STORAGE_KEY = 'simplify_preferences_v1';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  preferredLanguage: 'preserve',
  defaultReadingLevel: 'standard',
  showSideBySideByDefault: false,
};

function loadInitialSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      preferredLanguage: parsed.preferredLanguage || 'preserve',
      defaultReadingLevel: parsed.defaultReadingLevel || 'standard',
      showSideBySideByDefault: Boolean(parsed.showSideBySideByDefault),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function App() {
  const [activePage, setActivePage] = useState<WorkspacePage>('home');
  const [sourceText, setSourceText] = useState('');
  const [settings, setSettings] = useState<AppSettings>(loadInitialSettings);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage quota or private-mode errors
    }
  }, [settings]);

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] dark:bg-[#0B1120] dark:text-[#F8FAFC] md:flex">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          {activePage === 'home' && (
            <HomeView
              sourceText={sourceText}
              onChangeText={setSourceText}
              onSelectMode={(mode) => setActivePage(mode)}
            />
          )}

          {activePage === 'simplify' && (
            <SimplifyView
              sourceText={sourceText}
              onChangeText={setSourceText}
              defaultReadingLevel={settings.defaultReadingLevel}
              preferredLanguage={settings.preferredLanguage}
              showSideBySideByDefault={settings.showSideBySideByDefault}
            />
          )}

          {activePage === 'summarize' && (
            <SummarizeView
              sourceText={sourceText}
              onChangeText={setSourceText}
              preferredLanguage={settings.preferredLanguage}
              showSideBySideByDefault={settings.showSideBySideByDefault}
            />
          )}

          {activePage === 'historical' && (
            <HistoricalView
              sourceText={sourceText}
              onChangeText={setSourceText}
              preferredLanguage={settings.preferredLanguage}
              showSideBySideByDefault={settings.showSideBySideByDefault}
            />
          )}

          {activePage === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </div>
      </main>
    </div>
  );
}
