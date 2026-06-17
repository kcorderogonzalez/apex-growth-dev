import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  archiveMemory,
  createMemory,
  getAgentRegistry,
  getMemories,
  getMemory,
  getMemoryVersions,
  promoteVersion,
  saveMemoryVersion,
  updateMemory,
} from "../lib/api";
import type { MemoryFilters, MemoryCreateData, MemoryUpdateData, MemoryVersionCreateData } from "../lib/api";

export function useMemories(filters?: MemoryFilters) {
  return useQuery({
    queryKey: ["memories", filters],
    queryFn: () => getMemories(filters),
  });
}

export function useMemory(id: string | null) {
  return useQuery({
    queryKey: ["memory", id],
    queryFn: () => getMemory(id!),
    enabled: !!id,
  });
}

export function useVersionHistory(memoryId: string | null) {
  return useQuery({
    queryKey: ["memory-versions", memoryId],
    queryFn: () => getMemoryVersions(memoryId!),
    enabled: !!memoryId,
  });
}

export function useAgentRegistry() {
  return useQuery({
    queryKey: ["agent-registry"],
    queryFn: getAgentRegistry,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveMemory() {
  const qc = useQueryClient();
  const createMut = useMutation({
    mutationFn: (data: MemoryCreateData) => createMemory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["memories"] }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemoryUpdateData }) => updateMemory(id, data),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: ["memories"] });
      qc.invalidateQueries({ queryKey: ["memory", id] });
    },
  });
  return { createMut, updateMut };
}

export function useSaveVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MemoryVersionCreateData }) => saveMemoryVersion(id, data),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: ["memories"] });
      qc.invalidateQueries({ queryKey: ["memory", id] });
      qc.invalidateQueries({ queryKey: ["memory-versions", id] });
    },
  });
}

export function usePromoteVersion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memoryId, versionId }: { memoryId: string; versionId: string }) =>
      promoteVersion(memoryId, versionId),
    onSuccess: (_r, { memoryId }) => {
      qc.invalidateQueries({ queryKey: ["memories"] });
      qc.invalidateQueries({ queryKey: ["memory", memoryId] });
      qc.invalidateQueries({ queryKey: ["memory-versions", memoryId] });
    },
  });
}

export function useArchiveMemory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveMemory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["memories"] }),
  });
}
