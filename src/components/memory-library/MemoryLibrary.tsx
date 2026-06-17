import React from "react";
import { BookOpen, Plus, Search, Archive, Pencil, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { Memory } from "@/src/types";
import { useMemories, useAgentRegistry, useArchiveMemory } from "@/src/hooks/useMemoryLibrary";
import MemoryEditor from "./MemoryEditor";

const STATUS_STYLES: Record<string, string> = {
  Published: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Draft: "bg-amber-50 text-amber-700 border border-amber-200",
  Archived: "bg-slate-100 text-slate-500 border border-slate-200",
};

const DEPT_STYLES: Record<string, string> = {
  "Sales Ops": "bg-blue-50 text-blue-700",
  "Sales Engineering": "bg-violet-50 text-violet-700",
  "Marketing": "bg-pink-50 text-pink-700",
  "Product Marketing": "bg-orange-50 text-orange-700",
  "Other": "bg-slate-100 text-slate-600",
};

export default function MemoryLibrary() {
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [filterDept, setFilterDept] = React.useState("");
  const [filterAgent, setFilterAgent] = React.useState("");
  const [editingMemory, setEditingMemory] = React.useState<Memory | null | undefined>(undefined);

  const { data: memories = [], isLoading } = useMemories({
    status: filterStatus || undefined,
    department: filterDept || undefined,
    target_agent: filterAgent || undefined,
  });
  const { data: registry = [] } = useAgentRegistry();
  const archiveMutation = useArchiveMemory();

  const displayed = search
    ? memories.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.description.toLowerCase().includes(search.toLowerCase()),
      )
    : memories;

  const handleArchive = (m: Memory) => {
    if (!confirm(`Archive "${m.name}"? It will no longer be injected into agents.`)) return;
    archiveMutation.mutate(m.id);
  };

  const agentName = (key: string) => registry.find((e) => e.intent_key === key)?.display_name ?? key;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black text-on-background tracking-tighter font-headline mb-2 flex items-center gap-3">
            <BookOpen className="text-primary" size={36} />
            Memory Library
          </h1>
          <p className="text-slate-500 font-label">Operational context published directly into AI agents.</p>
        </div>
        <button
          onClick={() => setEditingMemory(null)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all"
        >
          <Plus size={14} />
          New Memory
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search memories…"
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary outline-none"
        >
          <option value="">All Statuses</option>
          <option>Draft</option>
          <option>Published</option>
          <option>Archived</option>
        </select>

        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary outline-none"
        >
          <option value="">All Departments</option>
          {["Sales Ops", "Sales Engineering", "Marketing", "Product Marketing", "Other"].map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <select
          value={filterAgent}
          onChange={(e) => setFilterAgent(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-primary outline-none"
        >
          <option value="">All Agents</option>
          {registry.filter((e) => e.is_targetable).map((e) => (
            <option key={e.intent_key} value={e.intent_key}>{e.display_name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-400">No memories found</p>
          <p className="text-sm text-slate-300 mt-1">Create your first Memory to get started.</p>
          <button
            onClick={() => setEditingMemory(null)}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold mx-auto"
          >
            <Plus size={13} />
            New Memory
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {["Name", "Department", "Target Agents", "Status", "Version", "Updated", "Author", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{m.name}</p>
                    {m.description && (
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{m.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", DEPT_STYLES[m.department] ?? "bg-slate-100 text-slate-600")}>
                      {m.department}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(m.target_agents ?? []).slice(0, 3).map((k) => (
                        <span key={k} className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-full text-[9px] font-bold">
                          {agentName(k)}
                        </span>
                      ))}
                      {(m.target_agents ?? []).length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[9px] font-bold">
                          +{m.target_agents.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", STATUS_STYLES[m.status] ?? "")}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-medium">
                    {m.current_version ? `v${m.current_version.version_number}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(m.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {m.creator_name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingMemory(m)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-cyan-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      {m.status !== "Archived" && (
                        <button
                          onClick={() => handleArchive(m)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Archive"
                        >
                          <Archive size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingMemory !== undefined && (
        <MemoryEditor
          memory={editingMemory}
          onClose={() => setEditingMemory(undefined)}
        />
      )}
    </div>
  );
}
