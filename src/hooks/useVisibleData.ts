import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { accounts, allDeals, allContacts } from '../lib/mockData';
import { allInboundLeads, allOutboundPicks, type InboundLead, type PriorityOutreachPick } from '../data/crmData';

// Build company → territory lookup from the accounts array (single source of truth)
const COMPANY_TERRITORY: Record<string, string> = Object.fromEntries(
  accounts.map(a => [a.name, a.territory ?? '']).filter(([, t]) => t !== '')
);

function companyTerritory(company: string): string | null {
  return COMPANY_TERRITORY[company] ?? null;
}

/**
 * Returns accounts, deals, contacts, inbound leads, and outbound picks
 * scoped to the current user's territory. Admin sees everything.
 */
export function useVisibleData() {
  const { user } = useAuth();
  const territory = user?.territory ?? null;
  const isAdmin = !user || user.role === 'admin';

  const visibleAccounts = useMemo(
    () => (isAdmin || !territory ? accounts : accounts.filter(a => a.territory === territory)),
    [territory, isAdmin],
  );

  const visibleDeals = useMemo(
    () => (isAdmin || !territory ? allDeals : allDeals.filter(d => d.territory === territory)),
    [territory, isAdmin],
  );

  const visibleContacts = useMemo(() => {
    if (isAdmin || !territory) return allContacts;
    const accountIds = new Set(visibleAccounts.map(a => a.id));
    return allContacts.filter(c => accountIds.has(c.accountId));
  }, [visibleAccounts, territory, isAdmin]);

  const visibleInboundLeads = useMemo((): InboundLead[] => {
    if (isAdmin || !territory) return allInboundLeads;
    return allInboundLeads.filter(l => {
      const t = companyTerritory(l.company);
      return t === null || t === territory; // include leads where company unknown (defensive)
    });
  }, [territory, isAdmin]);

  const visibleOutboundPicks = useMemo((): PriorityOutreachPick[] => {
    if (isAdmin || !territory) return allOutboundPicks;
    return allOutboundPicks.filter(p => {
      const t = companyTerritory(p.company);
      return t === null || t === territory;
    });
  }, [territory, isAdmin]);

  return {
    territory,
    isAdmin,
    visibleAccounts,
    visibleDeals,
    visibleContacts,
    visibleInboundLeads,
    visibleOutboundPicks,
  };
}
