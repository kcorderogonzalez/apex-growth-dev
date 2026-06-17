import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, UserPlus, RefreshCw, ChevronDown, X, CheckCircle2 } from 'lucide-react';
import { useDemoData } from '@/src/context/DemoDataContext';
import { cn } from '@/src/lib/utils';

export default function DemoSignalButton() {
  const { generateNewLead, reviveContact, nextDormantPick, state, clearEvent } = useDemoData();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-dismiss toast after 3.5s
  React.useEffect(() => {
    if (!state.lastEvent) return;
    const t = setTimeout(clearEvent, 3500);
    return () => clearTimeout(t);
  }, [state.lastEvent, clearEvent]);

  const dormant = nextDormantPick();

  const actions = [
    {
      id: 'lead',
      icon: UserPlus,
      label: 'New Inbound Lead',
      description: 'Simulate a form fill or MQL from marketing',
      color: 'text-emerald-600',
      bg: 'hover:bg-emerald-50',
      onClick: () => { generateNewLead(); setOpen(false); },
    },
    {
      id: 'revival',
      icon: RefreshCw,
      label: 'Revive Contact',
      description: dormant ? `${dormant.contactName} at ${dormant.company}` : 'No dormant contacts',
      color: 'text-amber-600',
      bg: 'hover:bg-amber-50',
      onClick: () => { reviveContact(); setOpen(false); },
      disabled: !dormant,
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-widest transition-all',
          open
            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
        )}
      >
        <Zap size={13} className={open ? 'text-white' : 'text-amber-500'} />
        Demo
        <ChevronDown size={11} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-[200]"
          >
            <div className="px-4 py-2.5 border-b border-slate-50">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Generate Demo Signal</p>
            </div>
            {actions.map(action => (
              <button
                key={action.id}
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  'w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-b border-slate-50 last:border-0 disabled:opacity-40 disabled:cursor-not-allowed',
                  !action.disabled && action.bg,
                )}
              >
                <action.icon size={15} className={cn('mt-0.5 shrink-0', action.color)} />
                <div>
                  <p className={cn('text-xs font-bold', action.color)}>{action.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{action.description}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notification */}
      <AnimatePresence>
        {state.lastEvent && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-20 right-6 z-[300] flex items-start gap-3 bg-white border border-emerald-200 rounded-2xl shadow-xl px-4 py-3 max-w-xs"
          >
            <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-800">{state.lastEvent.label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{state.lastEvent.detail}</p>
            </div>
            <button onClick={clearEvent} className="text-slate-300 hover:text-slate-500 mt-0.5">
              <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
