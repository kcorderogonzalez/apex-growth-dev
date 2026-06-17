import React from 'react';
import { 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  History, 
  CheckCircle2,
  Users,
  MapPin,
  BarChart3,
  Handshake,
  Wand2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Deal, RepPerformance } from '@/src/types';
import { allDeals, reps, territories, accounts } from '@/src/lib/mockData';

export default function ManagerInsights() {
  // Kendall G. manages all 8 Territory Managers
  const managerName = "Kendall G.";
  
  // Get top 10 deals by value across all territories for the global pipeline view
  const regionalPipeline = [...allDeals].sort((a, b) => b.value - a.value).slice(0, 10);

  // Calculate territory distribution for all 8 territories
  const territoryStats = territories.map(t => {
    const deals = allDeals.filter(d => d.territory === t.name);
    return {
      territory: t.name,
      value: deals.reduce((sum, d) => sum + d.value, 0),
      count: deals.length,
      color: t.id === 't1' ? 'bg-primary' : t.id === 't2' ? 'bg-secondary' : t.id === 't3' ? 'bg-tertiary' : 'bg-slate-400'
    };
  });

  // Get top accounts across all territories
  const topAccounts = accounts
    .filter(acc => acc.type === 'Customer')
    .sort((a, b) => b.arr - a.arr)
    .slice(0, 5)
    .map(acc => {
      const accountDeals = allDeals.filter(d => d.accountName === acc.name);
      const totalValue = accountDeals.reduce((sum, d) => sum + d.value, 0);
      const rep = accountDeals[0]?.rep || 'Unassigned';
      return {
        name: acc.name,
        rep: rep,
        health: acc.healthScore,
        value: `$${(totalValue / 1000).toFixed(0)}K`
      };
    });

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <section>
        <h1 className="text-4xl font-black text-on-background tracking-tighter font-headline mb-2">Manager Insights: {managerName}</h1>
        <p className="text-slate-500 font-label text-lg">Global Performance & Territory Manager Oversight</p>
      </section>

      {/* Territory Manager Performance */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-headline font-bold text-xl flex items-center gap-2">
            <Zap className="text-secondary" size={24} />
            Territory Manager Performance
          </h3>
          <span className="text-[10px] font-bold font-label text-slate-400 uppercase">Regional Efficiency Variance</span>
        </div>
        <div className="bg-surface-container-highest rounded-3xl p-6 border border-secondary/10 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reps.map((rep) => (
              <div key={rep.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-on-background">{rep.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                        rep.status === 'Effective' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {rep.status}
                      </span>
                      <span className="text-[10px] font-label text-slate-400">Variance: {rep.efficiencyVariance}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-secondary">${(rep.bookings / 1000000).toFixed(1)}M</p>
                    <p className="text-[9px] font-label text-slate-400 uppercase">Bookings</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Technical Win Rate</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", rep.technicalWinRate > 70 ? "bg-emerald-500" : "bg-red-500")} 
                          style={{ width: `${rep.technicalWinRate}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold font-label">{rep.technicalWinRate}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Activity Density</p>
                    <p className="text-xs font-bold font-label">{rep.meetings} Mtgs / {rep.povs} POVs</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regional Deal Health & Integrity */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-headline font-bold text-xl flex items-center gap-2">
            <ShieldCheck className="text-primary" size={24} />
            Regional Deal Health & Integrity
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold font-label bg-red-100 text-red-600 px-3 py-1 rounded-full uppercase">High Risk Detected in Region</span>
            <span className="text-[10px] font-bold font-label bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase">82% Regional Fidelity</span>
          </div>
        </div>
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 backdrop-blur-sm">
                  <th className="px-6 py-5 text-[10px] font-black font-label uppercase tracking-widest text-slate-400">Account & Opportunity</th>
                  <th className="px-6 py-5 text-[10px] font-black font-label uppercase tracking-widest text-slate-400">Territory & Rep</th>
                  <th className="px-6 py-5 text-[10px] font-black font-label uppercase tracking-widest text-slate-400">Health Status</th>
                  <th className="px-6 py-5 text-[10px] font-black font-label uppercase tracking-widest text-slate-400">Integrity Flags</th>
                  <th className="px-6 py-5 text-[10px] font-black font-label uppercase tracking-widest text-slate-400">Next Step</th>
                  <th className="px-6 py-5 text-[10px] font-black font-label uppercase tracking-widest text-slate-400 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {regionalPipeline.map((deal) => {
                  const isZombie = (new Date().getTime() - new Date(deal.lastStageChangeDate).getTime()) > (30 * 24 * 60 * 60 * 1000);
                  const isDirectional = !deal.povSuccess && (deal.stage === 'proposal' || deal.stage === 'negotiation' || deal.stage === 'closing');
                  
                  return (
                    <tr key={deal.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-bold text-sm text-on-background">{deal.accountName}</div>
                        <div className="text-xs font-medium text-slate-600 mt-0.5">{deal.name}</div>
                        <div className="text-[10px] text-slate-400 font-label uppercase tracking-wider mt-1">{deal.stage} • Exp. {deal.closeDate}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-on-background flex items-center gap-1">
                            <MapPin size={10} className="text-primary" />
                            {deal.territory}
                          </span>
                          <span className="text-[10px] text-slate-500 font-label flex items-center gap-1">
                            <Users size={10} />
                            {deal.rep}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5",
                          deal.status === 'healthy' ? "bg-emerald-100 text-emerald-700" : 
                          deal.status === 'stalled' ? "bg-amber-100 text-amber-700" : 
                          "bg-primary/10 text-primary"
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
                            deal.status === 'healthy' ? "bg-emerald-500" : 
                            deal.status === 'stalled' ? "bg-amber-500" : 
                            "bg-primary"
                          )} />
                          {deal.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-2">
                          {isDirectional && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
                              <AlertCircle size={10} />
                              Directional
                            </span>
                          )}
                          {isZombie && (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
                              <History size={10} />
                              Zombie
                            </span>
                          )}
                          {!isDirectional && !isZombie && (
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
                              <CheckCircle2 size={10} />
                              Validated
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs font-medium text-slate-600">
                          {deal.nextStep}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="font-black font-headline text-primary text-base">${(deal.value / 1000).toFixed(0)}K</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Regional Account Health & Pipeline Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container-low p-6 rounded-3xl border border-slate-100">
          <h3 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" />
            Regional Pipeline Distribution
          </h3>
          <div className="space-y-4">
            {territoryStats.map((t, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold font-label">
                  <span>{t.territory} ({t.count} Deals)</span>
                  <span>${(t.value / 1000000).toFixed(1)}M</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", t.color)} style={{ width: `${Math.min((t.value / 10000000) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-3xl border border-slate-100">
          <h3 className="font-headline font-bold text-lg mb-4 flex items-center gap-2">
            <Handshake size={20} className="text-secondary" />
            Top Regional Accounts
          </h3>
          <div className="space-y-3">
            {topAccounts.map((acc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-50">
                <div>
                  <h4 className="text-sm font-bold">{acc.name}</h4>
                  <p className="text-[10px] text-slate-500 font-label">Rep: {acc.rep}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-primary">{acc.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${acc.health}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-emerald-600">{acc.health}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
