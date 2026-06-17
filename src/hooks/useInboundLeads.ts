import React from 'react';
import { fetchInboundLeadStats, fetchInboundLeads, triggerLeadProcessing } from '@/src/lib/api';
import type { InboundLeadStats, ProcessedInboundLead } from '@/src/types';

interface InboundLeadsState {
  stats: InboundLeadStats | null;
  primaryQueue: ProcessedInboundLead[];
  rsmQueue: ProcessedInboundLead[];
  needsResolution: ProcessedInboundLead[];
  lowQuality: ProcessedInboundLead[];
  isLoading: boolean;
  isProcessing: boolean;
  processingProgress: { processed: number; remaining: number } | null;
  error: string | null;
  lastRefreshed: Date | null;
}

const INITIAL: InboundLeadsState = {
  stats: null,
  primaryQueue: [],
  rsmQueue: [],
  needsResolution: [],
  lowQuality: [],
  isLoading: false,
  isProcessing: false,
  processingProgress: null,
  error: null,
  lastRefreshed: null,
};

export function useInboundLeads(userTerritory?: string) {
  const [state, setState] = React.useState<InboundLeadsState>(INITIAL);
  const pollingRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = React.useRef(true);

  const loadQueues = React.useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      const [primary, rsm, needsRes, lowQ, stats] = await Promise.all([
        fetchInboundLeads('primary', userTerritory),
        fetchInboundLeads('rsm', userTerritory),
        fetchInboundLeads('needs_resolution', userTerritory),
        fetchInboundLeads('low_quality', userTerritory),
        fetchInboundLeadStats(),
      ]);
      if (!mountedRef.current) return;
      setState(prev => ({
        ...prev,
        stats,
        primaryQueue: primary,
        rsmQueue: rsm,
        needsResolution: needsRes,
        lowQuality: lowQ,
        isLoading: false,
        lastRefreshed: new Date(),
        error: null,
      }));
    } catch (err) {
      if (!mountedRef.current) return;
      setState(prev => ({ ...prev, isLoading: false, error: String(err) }));
    }
  }, [userTerritory]);

  const processAndPoll = React.useCallback(async () => {
    if (!mountedRef.current) return;
    setState(prev => ({ ...prev, isProcessing: true, processingProgress: null }));

    let remaining = 1;
    let totalProcessed = 0;

    while (remaining > 0 && mountedRef.current) {
      try {
        const result = await triggerLeadProcessing(25);
        totalProcessed += result.processed;
        remaining = result.pending_remaining;
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            processingProgress: { processed: totalProcessed, remaining },
          }));
        }
        if (remaining > 0) {
          await new Promise(r => setTimeout(r, 500));
        }
      } catch {
        break;
      }
    }

    if (mountedRef.current) {
      setState(prev => ({ ...prev, isProcessing: false, processingProgress: null }));
      await loadQueues();
    }
  }, [loadQueues]);

  // Initial load + trigger processing if pending leads exist
  React.useEffect(() => {
    mountedRef.current = true;
    setState(prev => ({ ...prev, isLoading: true }));

    (async () => {
      try {
        const stats = await fetchInboundLeadStats();
        if (!mountedRef.current) return;
        setState(prev => ({ ...prev, stats }));

        if (stats.pending > 0) {
          await processAndPoll();
        } else {
          await loadQueues();
        }
      } catch (err) {
        if (mountedRef.current) {
          setState(prev => ({ ...prev, isLoading: false, error: String(err) }));
        }
      }
    })();

    // Poll for new unprocessed leads every 30s
    pollingRef.current = setInterval(async () => {
      if (!mountedRef.current) return;
      try {
        const stats = await fetchInboundLeadStats();
        if (stats.pending > 0 && mountedRef.current) {
          await processAndPoll();
        }
      } catch { /* silent */ }
    }, 30_000);

    return () => {
      mountedRef.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [loadQueues, processAndPoll]);

  const refresh = React.useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    loadQueues();
  }, [loadQueues]);

  const reprocessAll = React.useCallback(async () => {
    await processAndPoll();
  }, [processAndPoll]);

  return { ...state, refresh, reprocessAll };
}
