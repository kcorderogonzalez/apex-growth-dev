import React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAgentRegistry } from "@/src/hooks/useMemoryLibrary";

interface AgentMultiSelectProps {
  value: string[];
  onChange: (keys: string[]) => void;
}

export default function AgentMultiSelect({ value, onChange }: AgentMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const { data: registry = [] } = useAgentRegistry();
  const targetable = registry.filter((e) => e.is_targetable);

  const toggle = (key: string) => {
    onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);
  };

  const selectedNames = targetable
    .filter((e) => value.includes(e.intent_key))
    .map((e) => e.display_name);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
      >
        <span className="text-slate-700 truncate">
          {selectedNames.length === 0 ? (
            <span className="text-slate-400">Select agents…</span>
          ) : (
            <span className="flex flex-wrap gap-1">
              {selectedNames.map((n) => (
                <span key={n} className="px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded-full text-[10px] font-bold">
                  {n}
                </span>
              ))}
            </span>
          )}
        </span>
        {open ? <ChevronUp size={14} className="text-slate-400 shrink-0 ml-2" /> : <ChevronDown size={14} className="text-slate-400 shrink-0 ml-2" />}
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          {targetable.map((entry) => {
            const checked = value.includes(entry.intent_key);
            return (
              <button
                key={entry.intent_key}
                type="button"
                onClick={() => toggle(entry.intent_key)}
                className={cn(
                  "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors",
                  checked && "bg-cyan-50",
                )}
              >
                <div className={cn(
                  "mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0",
                  checked ? "bg-primary border-primary" : "border-slate-300",
                )}>
                  {checked && <Check size={10} className="text-white" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">{entry.display_name}</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{entry.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
