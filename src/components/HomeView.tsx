import { ArrowRight, FileText, List, Newspaper } from 'lucide-react';
import type { WorkspacePage } from '../types/simplify';
import { TextEditorPanel } from './TextEditorPanel';

interface HomeViewProps {
  sourceText: string;
  onChangeText: (next: string) => void;
  onSelectMode: (page: Exclude<WorkspacePage, 'home' | 'settings'>) => void;
}

const FEATURE_CARDS: Array<{
  id: Exclude<WorkspacePage, 'home' | 'settings'>;
  title: string;
  description: string;
  icon: typeof FileText;
}> = [
  {
    id: 'simplify',
    title: 'Simplify Text',
    description: 'Turn complicated text into clear and easy-to-understand language.',
    icon: FileText,
  },
  {
    id: 'summarize',
    title: 'Summarize',
    description: 'Extract the most important information from long texts.',
    icon: List,
  },
  {
    id: 'historical',
    title: 'Historical Styles',
    description: 'Rewrite modern information using the journalistic style of different historical periods.',
    icon: Newspaper,
  },
];

export function HomeView({ sourceText, onChangeText, onSelectMode }: HomeViewProps) {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#111827] dark:text-[#F8FAFC] sm:text-4xl [text-wrap:balance]">
          Transform any text into something easier to understand.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#64748B] dark:text-slate-300">
          Paste your text, choose a transformation, and let Simplify do the work.
        </p>
      </div>

      <TextEditorPanel
        value={sourceText}
        onChange={onChangeText}
        label="Your text"
        placeholder="Paste your text here and discover a simpler way to understand it..."
        minHeightClass="min-h-[240px]"
      />

      <section aria-label="Transformation modes">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-[#111827] dark:text-[#F8FAFC]">
            Choose a transformation
          </h2>
          <span className="text-xs text-[#64748B] dark:text-slate-400">
            Your text carries over automatically
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onSelectMode(card.id)}
                className="group flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-5 text-left shadow-xs transition-all duration-150 hover:border-[#2563EB] hover:shadow-sm dark:border-slate-800 dark:bg-[#151F35] dark:hover:border-[#2563EB]"
              >
                <div>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-blue-400">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-[#111827] dark:text-[#F8FAFC]">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#64748B] dark:text-slate-300">
                    {card.description}
                  </p>
                </div>

                <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] dark:text-blue-400">
                  <span>Open workspace</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
