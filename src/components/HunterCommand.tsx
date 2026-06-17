import React from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { accounts } from '@/src/lib/mockData';
import { Account } from '@/src/types';

interface HunterCommandProps {
  onAccountSelect: (account: Account) => void;
}

export default function HunterCommand({ onAccountSelect }: HunterCommandProps) {
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return accounts.slice(0, 8);
    const q = query.toLowerCase();
    return accounts
      .filter(a => a.name.toLowerCase().includes(q) || a.industry.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  const handleSelect = (account: Account) => {
    setQuery('');
    setOpen(false);
    onAccountSelect(account);
  };

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search size={16} className="text-slate-400 group-focus-within:text-primary transition-colors" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search any account to launch Hunter..."
          className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-12 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all shadow-sm group-hover:shadow-md"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus(); }}
            className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-slate-500"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden">
          {filtered.map(account => (
            <button
              key={account.id}
              onClick={() => handleSelect(account)}
              className="w-full text-left px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0"
            >
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{account.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{account.industry} · {account.tier} · {account.territory}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border',
                  account.type === 'Customer'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200',
                )}>
                  {account.type}
                </span>
                <Sparkles size={12} className="text-slate-200 group-hover:text-primary transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}

      {!query && (
        <div className="mt-4 space-y-2 px-2">
          <span className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">Quick Access</span>
          <div className="flex flex-wrap gap-2">
            {accounts.slice(0, 6).map(acc => (
              <button
                key={acc.id}
                onClick={() => handleSelect(acc)}
                className="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-[11px] font-bold text-primary hover:border-primary hover:bg-primary/5 transition-all shadow-sm"
              >
                {acc.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
