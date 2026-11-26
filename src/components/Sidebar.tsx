import { useEffect, useState } from 'react';
import {
  FileText,
  Home,
  List,
  Menu,
  Newspaper,
  Settings,
  X,
} from 'lucide-react';
import type { WorkspacePage } from '../types/simplify';
import { Logo } from './Logo';

interface SidebarProps {
  activePage: WorkspacePage;
  onNavigate: (page: WorkspacePage) => void;
}

interface NavItem {
  id: WorkspacePage;
  label: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'simplify', label: 'Simplify Text', icon: FileText },
  { id: 'summarize', label: 'Summarize', icon: List },
  { id: 'historical', label: 'Historical Styles', icon: Newspaper },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleSelect = (page: WorkspacePage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Compact Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E2E8F0] bg-white/95 px-4 backdrop-blur-sm dark:border-slate-800 dark:bg-[#0B1120]/95 md:hidden">
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="flex min-h-[44px] items-center rounded-lg pr-2 text-left"
          aria-label="Go to Simplify Home"
        >
          <Logo compact />
        </button>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation-menu"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#111827] transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-[#151F35] dark:text-[#F8FAFC] dark:hover:bg-slate-800"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Dropdown Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="fixed inset-x-0 top-14 z-20 border-b border-[#E2E8F0] bg-white px-4 py-3 shadow-lg dark:border-slate-800 dark:bg-[#151F35] md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#2563EB] text-white'
                      : 'text-[#111827] hover:bg-[#F8FAFC] dark:text-[#F8FAFC] dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:justify-between md:border-r md:border-[#E2E8F0] md:bg-[#F8FAFC] md:p-5 dark:md:border-slate-800 dark:md:bg-[#151F35]">
        <div>
          <button
            type="button"
            onClick={() => handleSelect('home')}
            className="mb-8 flex w-full items-center rounded-lg p-1 text-left transition-opacity hover:opacity-90"
            aria-label="Simplify Home"
          >
            <Logo />
          </button>

          <nav aria-label="Main navigation" className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex h-10 w-full items-center gap-3 rounded-lg px-3.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-[#64748B] hover:bg-white hover:text-[#111827] dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#E2E8F0] pt-4 dark:border-slate-800">
          <p className="text-xs leading-relaxed text-[#64748B] dark:text-slate-400">
            Text is processed per request by AI and never stored permanently.
          </p>
        </div>
      </aside>
    </>
  );
}
