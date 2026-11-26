interface LogoProps {
  compact?: boolean;
}

export function Logo({ compact = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-xs"
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.5 7.5C17.5 5.567 15.0376 4 12 4C8.96243 4 6.5 5.567 6.5 7.5C6.5 9.433 8.96243 11 12 11C15.0376 11 17.5 12.567 17.5 14.5C17.5 16.433 15.0376 18 12 18C8.96243 18 6.5 16.433 6.5 14.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M4 20.5H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.65"
          />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display text-lg font-bold tracking-tight text-[#111827] dark:text-[#F8FAFC] whitespace-nowrap">
          Simplify
        </span>
        {!compact && (
          <span className="mt-0.5 text-[11px] font-medium text-[#64748B] dark:text-slate-400 whitespace-nowrap">
            Make Text Simple.
          </span>
        )}
      </div>
    </div>
  );
}
