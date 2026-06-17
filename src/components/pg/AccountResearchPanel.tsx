import React from 'react';
import { Search, Sparkles, X, TrendingUp, Building2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { accounts } from '@/src/lib/mockData';
import { Account } from '@/src/types';
import { getCrmProfile } from '@/src/data/crmData';

interface AccountResearchPanelProps {
  onLaunchHunter: (account: Account) => void;
}

const HOT_ACCOUNTS = new Set(
  accounts
    .filter(a => {
      const crm = getCrmProfile(a.name);
      return crm?.purchaseIntent?.strength === 'Hot';
    })
    .map(a => a.id),
);

export default function AccountResearchPanel({ onLaunchHunter }: AccountResearchPanelProps) {
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return accounts;
    const q = query.toLowerCase();
    return accounts.filter(
      a =>
        a.name.toLowerCase().includes(q) ||
        a.industry.toLowerCase().includes(q) ||
        a.territory.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="flex flex-col h-full">
      {/* Sticky search */}
      <div className="px-4 pt-4 pb-3 bg-white sticky top-0 z-10 border-b border-slate-50">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search accounts…"
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-9 pr-8 text-xs font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Quick chips */}
      {!query && (
        <div className="px-4 pt-3 pb-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-label mb-2">Quick Launch</p>
          <div className="flex flex-wrap gap-1.5">
            {accounts.slice(0, 5).map(acc => (
              <button
                key={acc.id}
                onClick={() => onLaunchHunter(acc)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border',
                  HOT_ACCOUNTS.has(acc.id)
                    ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                    : 'bg-white border-slate-100 text-primary hover:border-primary hover:bg-primary/5',
                )}
              >
                {acc.name}
                {HOT_ACCOUNTS.has(acc.id) && <span className="ml-1 text-amber-500">🔥</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Account list */}
      <div className="flex-1 divide-y divide-slate-50">
        {filtered.map(acc => {
          const isHot = HOT_ACCOUNTS.has(acc.id);
          return (
            <div
              key={acc.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors group cursor-pointer"
              onClick={() => onLaunchHunter(acc)}
            >
              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Building2 size={14} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate group-hover:text-primary transition-colors">
                    {acc.name}
                  </p>
                  {isHot && (
                    <span className="shrink-0 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-label">Hot</span>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 truncate mt-0.5">{acc.industry} · {acc.tier}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn(
                  'text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full font-label',
                  acc.type === 'Customer'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-blue-50 text-blue-700',
                )}>
                  {acc.type}
                </span>
                <Sparkles
                  size={13}
                  className="text-slate-200 group-hover:text-primary transition-colors"
                />
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Search size={28} className="opacity-20 mb-3" />
            <p className="text-xs font-label">No accounts match "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
