import React from 'react';
import { Sparkles, Bell, Settings, X, Search } from 'lucide-react';
import { View, Account } from '@/src/types';
import { accounts } from '@/src/lib/mockData';
import { cn } from '@/src/lib/utils';
import DemoSignalButton from './DemoSignalButton';

interface TopNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onHunterLaunch?: (account: Account) => void;
}

export default function TopNav({ currentView, onViewChange, onHunterLaunch }: TopNavProps) {
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return accounts.slice(0, 6);
    const q = query.toLowerCase();
    return accounts
      .filter(a => a.name.toLowerCase().includes(q) || a.industry.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  const handleSelect = (account: Account) => {
    setQuery('');
    setOpen(false);
    onHunterLaunch?.(account);
  };

  const handleFreeSearch = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const existing = accounts.find(a => a.name.toLowerCase() === trimmed.toLowerCase());
    handleSelect(existing ?? {
      id: trimmed,
      name: trimmed,
      type: 'Prospect',
      arr: 0,
      healthScore: 0,
      industry: 'Unknown',
      tier: 'Mid-Market',
      territory: 'Unknown',
    });
  };

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'deals', label: 'Deals' },
    { id: 'quotes', label: 'Quotes' },
    { id: 'accounts', label: 'Accounts' },
  ] as const;

  const isManagerView = currentView === 'manager-insights';
  const userName = isManagerView ? 'Kendall G.' : 'Elena L.';
  const userRole = isManagerView ? 'Sales Rep Manager' : 'South East Territory';

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-sm dark:shadow-none">
      <div className="flex justify-between items-center px-6 h-16 w-full max-w-[1920px] mx-auto">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tighter text-cyan-900 dark:text-cyan-100 font-headline">
            Apex <span className="text-cyan-600 font-medium text-xs ml-1">| Netskope Growth OS</span>
          </span>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onViewChange(link.id as View)}
                className={cn(
                  'text-sm font-label py-5 transition-all relative',
                  currentView === link.id
                    ? 'text-cyan-700 dark:text-cyan-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 font-medium hover:text-cyan-600 dark:hover:text-cyan-300',
                )}
              >
                {link.label}
                {currentView === link.id && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-700 dark:bg-cyan-400" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Hunter search */}
          <div ref={containerRef} className="hidden lg:block relative">
            <div className={cn(
              'flex items-center bg-surface-container-low rounded-full px-3 py-2 gap-2 transition-all border',
              open ? 'ring-2 ring-primary/20 border-primary/30' : 'border-transparent',
            )}>
              <div className="flex items-center gap-1.5 shrink-0">
                <Sparkles size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary font-label">Hunter</span>
              </div>
              <div className="w-px h-4 bg-slate-200" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onKeyDown={e => { if (e.key === 'Enter' && query.trim()) handleFreeSearch(query); }}
                placeholder="Search any account…"
                className="bg-transparent border-none focus:ring-0 p-0 text-sm font-label w-44 outline-none text-slate-700 placeholder:text-slate-400"
              />
              {query ? (
                <button
                  onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                  className="text-slate-300 hover:text-slate-500 shrink-0"
                >
                  <X size={13} />
                </button>
              ) : (
                <Search size={13} className="text-slate-300 shrink-0 pointer-events-none" />
              )}
            </div>

            {open && filtered.length > 0 && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-[200]">
                {!query && (
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-label">Quick Access</p>
                  </div>
                )}
                {filtered.map(account => (
                  <button
                    key={account.id}
                    onClick={() => handleSelect(account)}
                    className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors group border-b border-slate-50 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors truncate">
                        {account.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {account.industry} · {account.tier}
                      </p>
                    </div>
                    <span className={cn(
                      'shrink-0 ml-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest font-label',
                      account.type === 'Customer'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-blue-50 text-blue-700',
                    )}>
                      {account.type}
                    </span>
                  </button>
                ))}
                {/* Free-text search fallback */}
                {query.trim() && (
                  <button
                    onClick={() => handleFreeSearch(query)}
                    className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-primary/5 transition-colors border-t border-slate-100 group"
                  >
                    <Sparkles size={13} className="text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-primary truncate">
                        Research "{query.trim()}"
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Run Hunter on any account</p>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DemoSignalButton />
            <button className="p-2 text-outline hover:text-primary transition-colors">
              <Bell size={20} />
            </button>
            <button className="p-2 text-outline hover:text-primary transition-colors">
              <Settings size={20} />
            </button>
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-on-background leading-none">{userName}</p>
                <p className="text-[10px] font-label text-slate-500 mt-1 uppercase tracking-wider">{userRole}</p>
              </div>
              <div className="h-9 w-9 rounded-full overflow-hidden border border-outline-variant/30 ring-2 ring-primary/10">
                <img
                  className="h-full w-full object-cover"
                  src={isManagerView
                    ? 'https://picsum.photos/seed/kendall/200/200'
                    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuAr3ihTPaCfSmbNafmqafvaiIqfW8V2INgBTveMLvdOWvKU4NL8Tn9ccUxVZ_7iqUZjrzqte8kNiNHnJey88wWcmY4eRNok6pFIV9xF_uuFBgxFxtiagzZ3v24uLG0ZEScKZkEgAWb8-j7FgPBhTRgewwEOU0VMO7XLD9EBKHuy_NlCbTdKXEFPw8UTRT3dNad599YJyB329971pKn0o0K3otSWx4g9NxI5dyrqe4zOw97CwhKnrjaW8fhjSOQjh3YnrfGphOgRLAY'
                  }
                  alt={userName}
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
