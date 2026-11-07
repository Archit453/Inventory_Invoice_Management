import type { FC, ReactNode } from 'react';
import { Search, Plus } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
  extraActions?: ReactNode;
}

export const Header: FC<HeaderProps> = ({
  title,
  subtitle,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  actionButtonLabel,
  onActionButtonClick,
  extraActions,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 px-8 py-4 sticky top-0 z-20 shadow-xs no-print">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          {onSearchChange && (
            <div className="relative w-64 md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          )}

          {extraActions}

          {actionButtonLabel && onActionButtonClick && (
            <button
              onClick={onActionButtonClick}
              className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-[#131D31] hover:bg-slate-800 text-white font-semibold text-xs tracking-wider uppercase transition-all duration-150 shadow-sm active:scale-98"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>{actionButtonLabel}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
