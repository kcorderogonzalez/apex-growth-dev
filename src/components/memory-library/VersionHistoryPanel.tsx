import React from "react";
import { X, Eye, RotateCcw, Clock } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useVersionHistory, usePromoteVersion } from "@/src/hooks/useMemoryLibrary";
import type { MemoryVersion } from "@/src/types";

interface VersionHistoryPanelProps {
  memoryId: string;
  memoryName: string;
  onClose: () => void;
}

function ViewModal({ version, onClose }: { version: MemoryVersion; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Version {version.version_number}</p>
            <p className="text-sm font-bold text-slate-700 mt-0.5">
              {new Date(version.authored_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              {version.author_name && ` — ${version.author_name}`}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-body leading-relaxed">{version.content}</pre>
        </div>
      </div>
    </div>
  );
}

export default function VersionHistoryPanel({ memoryId, memoryName, onClose }: VersionHistoryPanelProps) {
  const { data: versions = [], isLoading } = useVersionHistory(memoryId);
  const promote = usePromoteVersion();
  const [viewingVersion, setViewingVersion] = React.useState<MemoryVersion | null>(null);

  const handlePromote = (v: MemoryVersion) => {
    if (!confirm(`Promote v${v.version_number} to current? This will replace the active content.`)) return;
    promote.mutate({ memoryId, versionId: v.id });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex">
        <div className="flex-1" onClick={onClose} />
        <div className="w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Version History</p>
              <h2 className="text-sm font-black text-slate-800 leading-tight">{memoryName}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading && (
              <div className="flex items-center justify-center py-10 text-slate-400 text-sm">Loading…</div>
            )}
            {versions.map((v) => (
              <div
                key={v.id}
                className={cn(
                  "border rounded-xl p-4 space-y-2",
                  v.is_current ? "border-primary/30 bg-cyan-50" : "border-slate-100 bg-white",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-xs font-black text-slate-700">v{v.version_number}</span>
                    {v.is_current && (
                      <span className="px-2 py-0.5 bg-primary text-white rounded-full text-[9px] font-black uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(v.authored_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                {v.author_name && (
                  <p className="text-[10px] text-slate-500 font-medium">{v.author_name}</p>
                )}

                {v.change_summary && (
                  <p className="text-xs text-slate-600 italic">"{v.change_summary}"</p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setViewingVersion(v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-colors"
                  >
                    <Eye size={11} />
                    View
                  </button>
                  {!v.is_current && (
                    <button
                      onClick={() => handlePromote(v)}
                      disabled={promote.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50"
                    >
                      <RotateCcw size={11} />
                      Promote
                    </button>
                  )}
                </div>
              </div>
            ))}

            {!isLoading && versions.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">No versions yet.</div>
            )}
          </div>
        </div>
      </div>

      {viewingVersion && (
        <ViewModal version={viewingVersion} onClose={() => setViewingVersion(null)} />
      )}
    </>
  );
}
