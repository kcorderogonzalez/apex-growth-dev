import React from "react";
import { X, History, Sparkles, Save, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { Memory } from "@/src/types";
import { useSaveMemory, useSaveVersion } from "@/src/hooks/useMemoryLibrary";
import AgentMultiSelect from "./AgentMultiSelect";
import VersionHistoryPanel from "./VersionHistoryPanel";
import DraftAssistantPanel from "./DraftAssistantPanel";

const DEPARTMENTS = ["Sales Ops", "Sales Engineering", "Marketing", "Product Marketing", "Other"] as const;

interface MemoryEditorProps {
  memory?: Memory | null;
  onClose: () => void;
}

export default function MemoryEditor({ memory, onClose }: MemoryEditorProps) {
  const [name, setName] = React.useState(memory?.name ?? "");
  const [description, setDescription] = React.useState(memory?.description ?? "");
  const [department, setDepartment] = React.useState<string>(memory?.department ?? "Sales Ops");
  const [targetAgents, setTargetAgents] = React.useState<string[]>(memory?.target_agents ?? []);
  const [content, setContent] = React.useState(memory?.current_version?.content ?? "");
  const [changeSummary, setChangeSummary] = React.useState("");
  const [showHistory, setShowHistory] = React.useState(false);
  const [showAssistant, setShowAssistant] = React.useState(true);
  const contentRef = React.useRef<HTMLTextAreaElement>(null);

  const { createMut, updateMut } = useSaveMemory();
  const saveVersion = useSaveVersion();

  const isSaving = createMut.isPending || updateMut.isPending || saveVersion.isPending;
  const isNew = !memory;

  const handleSave = async (publish: boolean) => {
    const status = publish ? "Published" : "Draft";
    if (isNew) {
      createMut.mutate(
        { name, description, department: department as any, target_agents: targetAgents, content, change_summary: changeSummary || undefined, status },
        { onSuccess: onClose },
      );
    } else {
      await updateMut.mutateAsync({
        id: memory.id,
        data: { name, description, department: department as any, target_agents: targetAgents, status },
      });
      if (content !== memory.current_version?.content) {
        saveVersion.mutate(
          { id: memory.id, data: { content, change_summary: changeSummary || undefined, status } },
          { onSuccess: onClose },
        );
      } else {
        onClose();
      }
    }
  };

  const handleInsert = (text: string) => {
    setContent((prev) => (prev ? prev + "\n\n" + text : text));
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
      }
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-40 flex bg-black/40" onClick={onClose}>
      <div className="flex-1" />

      <div className={cn("flex h-full bg-white shadow-2xl border-l border-slate-200 transition-all", showAssistant ? "w-full max-w-5xl" : "w-full max-w-2xl")} onClick={(e) => e.stopPropagation()}>
        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              {isNew ? "New Memory" : "Edit Memory"}
            </h2>
            <div className="flex items-center gap-2">
              {memory && (
                <button
                  onClick={() => setShowHistory(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-colors"
                >
                  <History size={11} />
                  History
                </button>
              )}
              <button
                onClick={() => setShowAssistant((s) => !s)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors",
                  showAssistant
                    ? "bg-primary text-white"
                    : "bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100",
                )}
              >
                <Sparkles size={11} />
                Draft Assistant ✦
              </button>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors ml-1">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Memory Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. PANW Displacement Playbook"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="One-line summary for library browsing"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:border-primary outline-none transition-all"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Target Agents</label>
              <AgentMultiSelect value={targetAgents} onChange={setTargetAgents} />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Content</label>
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                placeholder="Write Memory content here. Use markdown headers and bullets for structure."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Change Summary (optional)</label>
              <input
                type="text"
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                placeholder="Brief note on what changed"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={!name.trim() || isSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={!name.trim() || isSaving}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-40"
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : null}
              Publish
            </button>
          </div>
        </div>

        {/* Draft Assistant side panel */}
        {showAssistant && (
          <div className="w-80 border-l border-slate-200 flex flex-col">
            <DraftAssistantPanel
              selectedAgentKeys={targetAgents}
              currentContent={content}
              onInsert={handleInsert}
              onClose={() => setShowAssistant(false)}
            />
          </div>
        )}
      </div>

      {showHistory && memory && (
        <VersionHistoryPanel
          memoryId={memory.id}
          memoryName={memory.name}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
