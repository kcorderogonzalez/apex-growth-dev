import React, { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import { AgentMemory, AdminConstraints, MemoryEntry, MemoryCategory } from '@/src/types';
import {
  loadMemory, saveMemory, loadAdminConstraints, saveAdminConstraints,
  applyChanges, isParamLocked, memoryToContextSummary,
} from '@/src/data/agentMemory';

const USER_ID = 'dev-user';

// ─── State ────────────────────────────────────────────────────────────────────

interface MemoryState {
  memory: AgentMemory;
  adminConstraints: AdminConstraints;
  versionConflict: boolean;
  conflictDismissed: boolean;
}

type MemoryAction =
  | { type: 'ADD_ENTRY'; entry: MemoryEntry; changes: Record<string, unknown> }
  | { type: 'TOGGLE_ENTRY'; id: string }
  | { type: 'DELETE_ENTRY'; id: string }
  | { type: 'UPDATE_ADMIN'; constraints: AdminConstraints }
  | { type: 'DISMISS_CONFLICT' };

function reducer(state: MemoryState, action: MemoryAction): MemoryState {
  switch (action.type) {
    case 'ADD_ENTRY': {
      const updatedMemory = applyChanges(
        { ...state.memory, entries: [...state.memory.entries, action.entry] },
        action.changes,
      );
      saveMemory(updatedMemory);
      return { ...state, memory: updatedMemory };
    }
    case 'TOGGLE_ENTRY': {
      const entries = state.memory.entries.map(e =>
        e.id === action.id ? { ...e, active: !e.active } : e,
      );
      // Rebuild structured prefs from active entries only
      const activeEntries = entries.filter(e => e.active);
      let updatedMemory = { ...state.memory, entries };
      for (const entry of activeEntries) {
        updatedMemory = applyChanges(updatedMemory, entry.changes);
      }
      saveMemory(updatedMemory);
      return { ...state, memory: updatedMemory };
    }
    case 'DELETE_ENTRY': {
      const entries = state.memory.entries.filter(e => e.id !== action.id);
      const updatedMemory = { ...state.memory, entries };
      saveMemory(updatedMemory);
      return { ...state, memory: updatedMemory };
    }
    case 'UPDATE_ADMIN': {
      saveAdminConstraints(action.constraints);
      return { ...state, adminConstraints: action.constraints };
    }
    case 'DISMISS_CONFLICT':
      return { ...state, conflictDismissed: true };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AgentMemoryContextValue {
  memory: AgentMemory;
  adminConstraints: AdminConstraints;
  versionConflict: boolean;
  addEntry: (
    originalText: string,
    confirmedRule: string,
    category: MemoryCategory,
    changes: Record<string, unknown>,
  ) => void;
  toggleEntry: (id: string) => void;
  deleteEntry: (id: string) => void;
  updateAdminConstraints: (constraints: AdminConstraints) => void;
  dismissConflict: () => void;
  isLocked: (paramPath: string) => boolean;
  contextSummary: () => string;
  isAdminMode: boolean;
  setAdminMode: (v: boolean) => void;
}

const AgentMemoryContext = createContext<AgentMemoryContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AgentMemoryProvider({ children }: { children: React.ReactNode }) {
  const [isAdminMode, setAdminMode] = useState(false);

  const init = (): MemoryState => {
    const { memory, versionConflict } = loadMemory(USER_ID);
    const adminConstraints = loadAdminConstraints();
    return { memory, adminConstraints, versionConflict, conflictDismissed: false };
  };

  const [state, dispatch] = useReducer(reducer, undefined, init);

  const addEntry = useCallback(
    (originalText: string, confirmedRule: string, category: MemoryCategory, changes: Record<string, unknown>) => {
      const entry: MemoryEntry = {
        id: `mem-${Date.now()}`,
        originalText,
        confirmedRule,
        category,
        changes,
        createdAt: new Date().toISOString(),
        active: true,
      };
      dispatch({ type: 'ADD_ENTRY', entry, changes });
    },
    [],
  );

  const toggleEntry = useCallback((id: string) => dispatch({ type: 'TOGGLE_ENTRY', id }), []);
  const deleteEntry = useCallback((id: string) => dispatch({ type: 'DELETE_ENTRY', id }), []);
  const updateAdminConstraints = useCallback(
    (constraints: AdminConstraints) => dispatch({ type: 'UPDATE_ADMIN', constraints }),
    [],
  );
  const dismissConflict = useCallback(() => dispatch({ type: 'DISMISS_CONFLICT' }), []);

  const isLocked = useCallback(
    (paramPath: string) => !!isParamLocked(paramPath, state.adminConstraints),
    [state.adminConstraints],
  );

  const contextSummary = useCallback(
    () => memoryToContextSummary(state.memory),
    [state.memory],
  );

  const versionConflict = state.versionConflict && !state.conflictDismissed;

  return (
    <AgentMemoryContext.Provider value={{
      memory: state.memory,
      adminConstraints: state.adminConstraints,
      versionConflict,
      addEntry,
      toggleEntry,
      deleteEntry,
      updateAdminConstraints,
      dismissConflict,
      isLocked,
      contextSummary,
      isAdminMode,
      setAdminMode,
    }}>
      {children}
    </AgentMemoryContext.Provider>
  );
}

export function useAgentMemory() {
  const ctx = useContext(AgentMemoryContext);
  if (!ctx) throw new Error('useAgentMemory must be used inside AgentMemoryProvider');
  return ctx;
}
