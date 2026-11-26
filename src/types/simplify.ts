export type WorkspacePage = 'home' | 'simplify' | 'summarize' | 'historical' | 'settings';

export type TransformMode = 'simplify' | 'summarize' | 'historical';

export type ReadingLevel = 'very-simple' | 'standard' | 'advanced';

export type SummaryLength = 'short' | 'medium' | 'detailed';

export type SummaryFormat = 'paragraphs' | 'bullets' | 'takeaways' | 'step-by-step';

export type HistoricalPeriod =
  | '1920s'
  | '1930s'
  | '1940s'
  | '1950s'
  | '1960s'
  | '1970s'
  | '1980s'
  | '1990s'
  | '2000s';

export type HistoricalFormat = 'newspaper' | 'news-report' | 'editorial' | 'magazine';

export type PreferredLanguage =
  | 'preserve'
  | 'English'
  | 'Spanish'
  | 'French'
  | 'German'
  | 'Portuguese'
  | 'Italian'
  | 'Japanese';

export interface AppSettings {
  theme: 'light' | 'dark';
  preferredLanguage: PreferredLanguage;
  defaultReadingLevel: ReadingLevel;
  showSideBySideByDefault: boolean;
}

export interface TransformResult {
  text: string;
  mode: TransformMode;
  subtitle: string;
  generatedAt: number;
}
