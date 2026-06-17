import React from 'react';
import { LucideIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface PanelShellProps {
  title: string;
  icon: LucideIcon;
  badge?: number;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
  accentColor?: string;
  /** When set, the panel uses a fixed pixel width instead of flex-1 */
  fixedWidth?: number;
}

export default function PanelShell({
  title,
  icon: Icon,
  badge = 0,
  collapsed,
  onToggle,
  children,
  headerExtra,
  accentColor = 'text-slate-500',
  fixedWidth,
}: PanelShellProps) {
  return (
    <div
      className={cn(
        'flex flex-col border-r border-slate-200 bg-white overflow-hidden transition-all duration-200',
        collapsed ? 'flex-none w-12' : fixedWidth ? 'flex-none min-w-0' : 'flex-1 min-w-0',
      )}
      style={!collapsed && fixedWidth ? { width: fixedWidth } : undefined}
    >
      {collapsed ? (
        <button
          onClick={onToggle}
          className="flex flex-col items-center pt-5 pb-4 px-1.5 gap-3 h-full w-full hover:bg-slate-50 transition-colors"
          title={`Expand ${title}`}
        >
          <div className="relative shrink-0">
            <Icon size={18} className={accentColor} />
            {badge > 0 && (
              <span className="absolute -top-1.5 -right-2 h-4 min-w-[1rem] px-0.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center leading-none">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </div>
          <div
            className="text-[8px] font-black uppercase tracking-widest text-slate-300 font-label select-none"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {title}
          </div>
          <div className="mt-auto mb-1">
            <ChevronRight size={12} className="text-slate-300" />
          </div>
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Icon size={15} className={accentColor} />
              <span className="font-headline font-bold text-sm text-slate-800 truncate">{title}</span>
              {badge > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-black rounded-full font-label leading-none">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {headerExtra}
              <button
                onClick={onToggle}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                title="Collapse panel"
              >
                <ChevronLeft size={13} className="text-slate-400" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </>
      )}
    </div>
  );
}
