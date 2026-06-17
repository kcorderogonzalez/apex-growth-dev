import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Building2, 
  ChevronRight, 
  Activity, 
  MessageSquare, 
  LifeBuoy, 
  Zap,
  ChevronDown,
  Loader2,
  Search,
  AlertCircle,
  History,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Account, Deal, AccountEvent } from '../types';
import { useVisibleData } from '@/src/hooks/useVisibleData';
import HunterAgent from './HunterAgent';

interface AccountsDashboardProps {
  onSelectAccount: (accountId: string) => void;
  onHunterCommand: (account: Account) => void;
}

const MOCK_EVENTS: AccountEvent[] = [
  { id: 'e1', accountId: 'acc-30', accountName: 'Adobe', type: 'telemetry', title: 'Usage Spike', description: '42% increase in Cloud Security module activity.', timestamp: '2h ago', severity: 'high' },
  { id: 'e2', accountId: 'acc-31', accountName: 'Salesforce', type: 'support', title: 'Critical Ticket', description: 'API Integration failure reported by Sarah J.', timestamp: '4h ago', severity: 'high' },
  { id: 'e3', accountId: 'acc-30', accountName: 'Adobe', type: 'cs', title: 'Success Sync', description: 'QBR scheduled for next Tuesday.', timestamp: '1d ago', severity: 'low' },
  { id: 'e4', accountId: 'acc-34', accountName: 'Netflix', type: 'marketing', title: 'Webinar Attendee', description: 'CTO attended "Zero Trust 2026" webinar.', timestamp: '2d ago', severity: 'medium' },
];

export default function AccountsDashboard({ onSelectAccount, onHunterCommand }: AccountsDashboardProps) {
  const { visibleAccounts: MOCK_ACCOUNTS, visibleDeals: MOCK_DEALS } = useVisibleData();
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  // Re-sync when territory changes (e.g. impersonation switch)
  React.useEffect(() => { setDeals(MOCK_DEALS); }, [MOCK_DEALS]);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUpdateStage = (id: string, newStage: Deal['stage']) => {
    setSyncingId(id);
    setTimeout(() => {
      setDeals(prev => prev.map(opp => opp.id === id ? { ...opp, stage: newStage } : opp));
      setSyncingId(null);
    }, 800);
  };

  const handleUpdateDate = (id: string, newDate: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setDeals(prev => prev.map(opp => opp.id === id ? { ...opp, closeDate: newDate } : opp));
      setSyncingId(null);
    }, 800);
  };

  const filteredAccounts = MOCK_ACCOUNTS.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight font-headline text-on-background">Account Dashboard</h1>
        <p className="text-slate-500 font-label mt-1">Manage your territory, active deals, and key account signals.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main List Section */}
        <div className="xl:col-span-8 space-y-8">
          {/* Account List */}
          <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                <Users className="text-primary" size={20} />
                My Accounts
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search accounts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-label outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black font-label uppercase tracking-widest text-slate-400">Account Name</th>
                    <th className="px-8 py-4 text-[10px] font-black font-label uppercase tracking-widest text-slate-400">Type</th>
                    <th className="px-8 py-4 text-[10px] font-black font-label uppercase tracking-widest text-slate-400 text-right">ARR</th>
                    <th className="px-8 py-4 text-[10px] font-black font-label uppercase tracking-widest text-slate-400 text-center">Health</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <button 
                          onClick={() => onSelectAccount(account.id)}
                          className="font-bold text-primary hover:underline text-left"
                        >
                          {account.name}
                        </button>
                        <p className="text-[10px] text-slate-400 font-label uppercase tracking-widest mt-0.5">{account.industry}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black font-label uppercase tracking-wider",
                          account.type === 'Customer' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {account.type === 'Customer' ? <ShieldCheck size={12} /> : <Building2 size={12} />}
                          {account.type}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black font-headline text-sm">
                        {account.arr > 0 ? `$${(account.arr / 1000).toLocaleString()}K` : '--'}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex flex-col items-center">
                          <span className={cn(
                            "text-sm font-black font-headline",
                            account.healthScore >= 90 ? "text-emerald-600" : 
                            account.healthScore >= 70 ? "text-amber-600" : "text-slate-400"
                          )}>
                            {account.healthScore > 0 ? account.healthScore : '--'}
                          </span>
                          {account.healthScore > 0 && (
                            <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full",
                                  account.healthScore >= 90 ? "bg-emerald-500" : "bg-amber-500"
                                )}
                                style={{ width: `${account.healthScore}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onHunterCommand(account);
                            }}
                            className="p-2 rounded-lg bg-slate-50 text-primary hover:bg-primary hover:text-white transition-all flex items-center gap-2 px-3"
                            title="Execute Hunter Playbook"
                          >
                            <Sparkles size={14} />
                            <span className="text-[10px] font-bold uppercase">Hunter</span>
                          </button>
                          <button 
                            onClick={() => onSelectAccount(account.id)}
                            className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-400 hover:text-primary transition-all"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Active Deals Section (Renamed from Pipeline Hygiene) */}
          <section className="bg-surface-container-highest rounded-[2.5rem] p-8 shadow-lg border border-primary/10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                <Zap className="text-primary" size={20} />
                Current Deals
              </h2>
              <span className="text-[10px] font-black font-label bg-primary/10 text-primary px-3 py-1 rounded-full tracking-widest uppercase">CRM SYNC ACTIVE</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deals.map((opp) => (
                <div key={opp.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 relative group shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h5 className="text-sm font-bold text-primary">{opp.accountName}</h5>
                      <h6 className="text-base font-bold text-on-background">{opp.name}</h6>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <p className="text-[10px] font-black font-label text-slate-400 uppercase tracking-widest">{opp.type}</p>
                        {!opp.povSuccess && (opp.stage === 'proposal' || opp.stage === 'negotiation' || opp.stage === 'closing') && (
                          <span className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                            <AlertCircle size={10} />
                            Directional
                          </span>
                        )}
                        {(new Date().getTime() - new Date(opp.lastStageChangeDate).getTime()) > (30 * 24 * 60 * 60 * 1000) && (
                          <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                            <History size={10} />
                            Zombie
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-primary">${(opp.value / 1000).toFixed(0)}K</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black font-label text-slate-400 uppercase tracking-widest block">Stage</label>
                      <div className="relative">
                        <select 
                          value={opp.stage}
                          onChange={(e) => handleUpdateStage(opp.id, e.target.value as Deal['stage'])}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold font-label appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                          <option value="discovery">Discovery</option>
                          <option value="proposal">Proposal</option>
                          <option value="negotiation">Negotiation</option>
                          <option value="closing">Closing</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black font-label text-slate-400 uppercase tracking-widest block">Close Date</label>
                      <input 
                        type="date"
                        value={opp.closeDate}
                        onChange={(e) => handleUpdateDate(opp.id, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold font-label cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {syncingId === opp.id && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-3xl flex items-center justify-center z-10"
                      >
                        <div className="flex items-center gap-2 bg-on-background text-white px-4 py-2 rounded-full shadow-2xl">
                          <Loader2 size={16} className="animate-spin" />
                          <span className="text-xs font-bold font-label">Syncing to CRM...</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar Section */}
        <div className="xl:col-span-4 space-y-8">
          {/* Key Account Events */}
          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold font-headline mb-8 flex items-center gap-2">
              <Activity className="text-secondary" size={20} />
              Key Account Events
            </h2>
            <div className="space-y-6">
              {MOCK_EVENTS.map((event) => (
                <div key={event.id} className="relative pl-6 border-l-2 border-slate-100 pb-2">
                  <div className={cn(
                    "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm",
                    event.type === 'telemetry' ? "bg-primary" : 
                    event.type === 'support' ? "bg-tertiary" : 
                    event.type === 'cs' ? "bg-secondary" : "bg-slate-400"
                  )} />
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black font-label text-primary uppercase tracking-widest mb-0.5">
                        {event.accountName}
                      </span>
                      <h4 className="text-sm font-bold text-on-background">{event.title}</h4>
                    </div>
                    <span className="text-[10px] font-label text-slate-400">{event.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className={cn(
                      "text-[9px] font-black font-label uppercase tracking-widest px-2 py-0.5 rounded-full",
                      event.type === 'telemetry' ? "bg-primary/10 text-primary" : 
                      event.type === 'support' ? "bg-tertiary/10 text-tertiary" : 
                      event.type === 'cs' ? "bg-secondary/10 text-secondary" : "bg-slate-100 text-slate-500"
                    )}>
                      {event.type}
                    </span>
                    {event.severity === 'high' && (
                      <span className="flex items-center gap-1 text-[9px] font-black font-label text-red-500 uppercase tracking-widest">
                        <Activity size={10} />
                        Action Required
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 rounded-2xl border border-slate-100 text-xs font-black font-label uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
              View Full Feed
            </button>
          </section>

          {/* Quick Stats */}
          <section className="bg-primary/5 rounded-[2.5rem] p-8">
            <h3 className="font-bold font-headline text-lg mb-6">Territory Health</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-label text-slate-500 mb-2">
                  <span>ARR Target</span>
                  <span className="font-bold text-on-background">$2.4M / $3.0M</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[80%] rounded-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-black font-label text-slate-400 uppercase tracking-widest mb-1">Avg Health</p>
                  <p className="text-2xl font-black font-headline text-emerald-600">84</p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <p className="text-[10px] font-black font-label text-slate-400 uppercase tracking-widest mb-1">Retention</p>
                  <p className="text-2xl font-black font-headline text-primary">98%</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
