import React, { useState } from 'react';
import { 
  ChevronRight, 
  Edit3, 
  Sparkles, 
  TrendingUp, 
  Shield, 
  UserPlus, 
  Settings, 
  Mail,
  AlertTriangle,
  LayoutDashboard,
  Calendar,
  Check,
  Loader2,
  ChevronDown,
  ArrowLeft,
  Activity,
  Zap,
  AlertCircle,
  History,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Deal, AccountEvent, Account } from '../types';
import { accounts as MOCK_ACCOUNTS, allDeals as MOCK_DEALS, allContacts as MOCK_CONTACTS } from '@/src/lib/mockData';
import CompetitiveIntelligenceBot from './CompetitiveIntelligenceBot';

const MOCK_EVENTS: AccountEvent[] = [
  { id: 'e1', accountId: '1', type: 'telemetry', title: 'Usage Spike', description: '42% increase in Cloud Security module activity.', timestamp: '2h ago', severity: 'high' },
  { id: 'e2', accountId: '1', type: 'support', title: 'Critical Ticket', description: 'API Integration failure reported by Sarah J.', timestamp: '4h ago', severity: 'high' },
  { id: 'e3', accountId: '1', type: 'cs', title: 'Success Sync', description: 'QBR scheduled for next Tuesday.', timestamp: '1d ago', severity: 'low' },
];

const INITIAL_OPPS: Deal[] = [];

interface Account360Props {
  accountId: string;
  onBack: () => void;
}

export default function Account360({ accountId, onBack }: Account360Props) {
  const account = MOCK_ACCOUNTS.find(a => a.id === accountId);
  const accountDeals = MOCK_DEALS.filter(d => d.accountName === account?.name);
  const accountContacts = MOCK_CONTACTS.filter(c => c.accountId === accountId);
  
  const [opportunities, setOpportunities] = useState<Deal[]>(accountDeals);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  React.useEffect(() => {
    setOpportunities(accountDeals);
  }, [accountId]);

  if (!account) return null;

  const handleUpdateStage = (id: string, newStage: Deal['stage']) => {
    setSyncingId(id);
    // Simulate CRM/EDP Sync
    setTimeout(() => {
      setOpportunities(prev => prev.map(opp => opp.id === id ? { ...opp, stage: newStage } : opp));
      setSyncingId(null);
    }, 800);
  };

  const handleUpdateDate = (id: string, newDate: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setOpportunities(prev => prev.map(opp => opp.id === id ? { ...opp, closeDate: newDate } : opp));
      setSyncingId(null);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-xs font-label text-outline mb-3 uppercase tracking-widest">
            <button onClick={onBack} className="hover:text-primary transition-colors flex items-center gap-1">
              <ArrowLeft size={12} />
              Accounts
            </button>
            <ChevronRight size={12} />
            <span className="text-primary font-bold">Account 360</span>
          </nav>
          <h1 className="text-4xl font-extrabold tracking-tight font-headline text-on-background">
            {account.name}
          </h1>
          <p className="text-slate-500 font-label mt-1">
            {account.tier} Tier • {account.industry} Sector • Global Headquarters
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-surface-container-low px-4 py-3 rounded-2xl flex flex-wrap items-center gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-tighter text-outline font-label">Account Health</p>
                <p className={cn(
                  "text-xl font-bold font-label",
                  account.healthScore >= 90 ? "text-green-600" : "text-amber-600"
                )}>{account.healthScore > 0 ? `${account.healthScore}/100` : 'N/A'}</p>
              </div>
              <div className="h-8 w-[1px] bg-outline-variant"></div>
              <div>
                <p className="text-[10px] uppercase tracking-tighter text-outline font-label">ARR Impact</p>
                <p className="text-xl font-bold font-label">{account.arr > 0 ? `$${(account.arr / 1000000).toFixed(1)}M` : '$0'}</p>
              </div>
              <div className="h-8 w-[1px] bg-outline-variant"></div>
              <div>
                <p className="text-[10px] uppercase tracking-tighter text-outline font-label">Last QBR</p>
                <p className="text-xl font-bold font-label text-primary">Feb 14, 2026</p>
              </div>
              <div className="h-8 w-[1px] bg-outline-variant"></div>
              <div>
                <p className="text-[10px] uppercase tracking-tighter text-outline font-label">Open Opps</p>
                <p className="text-xl font-bold font-label text-secondary">{opportunities.length} Active</p>
              </div>
            </div>
          
          <button className="bg-secondary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Edit3 size={18} />
            Manage
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key="overview"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
            {/* AI Expansion Trigger Notification */}
            <section className="mb-10">
              <div className="bg-surface-container-highest text-on-background p-6 rounded-3xl prism-glow flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="flex items-start gap-4 relative z-10">
                  <div className="bg-white/40 p-3 rounded-2xl backdrop-blur-md">
                    <Sparkles className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold font-headline mb-1">AI Expansion Opportunity Identified</h3>
                    <p className="text-slate-700 max-w-2xl leading-relaxed">
                      {account.name} has increased user activity in the "Cloud Security" module by <span className="font-bold">42%</span> this quarter. This growth signal suggests high readiness for a full-suite migration. 
                      <span className="italic block mt-2 opacity-80">AI Suggestion: Schedule a QBR for early next week to discuss Pro-Tier expansion.</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 relative z-10 w-full md:w-auto">
                  <button className="flex-1 md:flex-none bg-on-background text-white px-6 py-3 rounded-xl font-bold font-headline whitespace-nowrap hover:bg-opacity-90 transition-all">
                    Schedule QBR
                  </button>
                  <button className="flex-1 md:flex-none border border-on-background/20 px-6 py-3 rounded-xl font-bold font-headline whitespace-nowrap hover:bg-white/50 transition-all">
                    Dismiss
                  </button>
                </div>
              </div>
            </section>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Panel */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Sentiment Analysis Card */}
                <div className="bg-surface-container-low rounded-[2rem] p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h4 className="font-bold font-headline text-lg">Relationship Sentiment</h4>
                    <TrendingUp className="text-green-500" size={20} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-label text-outline">Overall Tone</span>
                      <span className="text-lg font-bold font-label">Highly Positive</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-container w-[88%] rounded-full"></div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed italic">
                      "Feedback from CTO during last sync indicates strong internal advocacy for Apex."
                    </p>
                  </div>
                </div>

                {/* Key Account Activities Card */}
                <div className="bg-surface-container-low rounded-[2rem] p-6">
                  <h4 className="font-bold font-headline text-lg mb-6 flex items-center gap-2">
                    <Activity className="text-secondary" size={20} />
                    Key Account Activities
                  </h4>
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
                          <h5 className="text-sm font-bold text-on-background">{event.title}</h5>
                          <span className="text-[10px] font-label text-slate-400">{event.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Whitespace Table */}
                <div className="sm:col-span-2 bg-surface-container-low rounded-[2rem] overflow-hidden">
                  <div className="p-6 pb-2">
                    <h4 className="font-bold font-headline text-lg">Expansion Whitespace</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-container-high/30">
                          <th className="px-6 py-4 text-xs font-label uppercase tracking-widest text-outline">Solution Module</th>
                          <th className="px-6 py-4 text-xs font-label uppercase tracking-widest text-outline">Status</th>
                          <th className="px-6 py-4 text-xs font-label uppercase tracking-widest text-outline">Gap Revenue</th>
                          <th className="px-6 py-4 text-xs font-label uppercase tracking-widest text-outline text-right">Potential</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/20">
                        {[
                          { name: 'Advanced Security Pack', status: 'Unexplored', revenue: '$120,000 / yr', potential: 'High', color: 'bg-tertiary', icon: Shield },
                          { name: 'Regional Expansion Seats', status: 'In Discussion', revenue: '$45,000 / yr', potential: 'Medium', color: 'bg-primary', icon: UserPlus },
                          { name: 'AI Workflow Engine', status: 'Adopted', revenue: '--', potential: 'N/A', color: 'bg-slate-400', icon: Settings },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/40 transition-colors">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                                  <row.icon size={14} className="text-slate-600" />
                                </div>
                                <span className="font-bold">{row.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={cn(
                                "text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider",
                                row.status === 'Unexplored' ? "bg-amber-100 text-amber-700" :
                                row.status === 'In Discussion' ? "bg-cyan-100 text-cyan-700" :
                                "bg-slate-200 text-slate-600"
                              )}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-6 py-5 font-label">{row.revenue}</td>
                            <td className="px-6 py-5 text-right">
                              <span className={cn("font-bold", row.potential === 'High' ? "text-tertiary" : row.potential === 'Medium' ? "text-primary" : "text-outline")}>
                                {row.potential}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              <div className="md:col-span-4 space-y-6">
                {/* Competitive Intelligence Bot */}
                <CompetitiveIntelligenceBot accountName={account.name} industry={account.industry} />

                {/* Support Health */}
                <div className="bg-surface-container-highest rounded-[2rem] p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold font-headline text-lg">Support Health</h4>
                    <span className="text-[10px] font-bold font-label bg-white px-2 py-1 rounded-full text-primary">3 OPEN</span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/60 rounded-2xl border-l-4 border-tertiary">
                      <p className="text-xs font-label text-tertiary font-bold mb-1">CRITICAL • 4h ago</p>
                      <h5 className="text-sm font-bold mb-1">API Integration Failure</h5>
                      <p className="text-xs text-outline">Reported by Sarah J. (CTO)</p>
                    </div>
                    <div className="p-4 bg-white/60 rounded-2xl border-l-4 border-secondary">
                      <p className="text-xs font-label text-secondary font-bold mb-1">NORMAL • 12h ago</p>
                      <h5 className="text-sm font-bold mb-1">User Permission Sync</h5>
                      <p className="text-xs text-outline">Reported by Mark T.</p>
                    </div>
                  </div>
                  <button className="w-full mt-6 text-sm font-bold text-primary hover:underline transition-all">View All Tickets</button>
                </div>

                {/* Decision Makers / Contacts */}
                <div className="bg-surface-container-low rounded-[2rem] p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold font-headline text-lg">Key Contacts</h4>
                    <span className="text-[10px] font-bold font-label bg-primary/10 text-primary px-2 py-1 rounded-full">{accountContacts.length} TOTAL</span>
                  </div>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {accountContacts.map((contact, idx) => (
                      <div key={contact.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-2xl transition-all group">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs group-hover:bg-primary group-hover:text-white transition-all">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{contact.name}</p>
                          <p className="text-[10px] text-outline font-label uppercase tracking-widest truncate">{contact.title}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-all">
                            <Mail size={14} />
                          </button>
                          <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-all">
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-3 border border-outline-variant rounded-xl text-xs font-bold font-label uppercase tracking-widest hover:bg-surface-container transition-all">
                    Map Account Hierarchy
                  </button>
                </div>

                {/* Current Deals */}
                <div className="bg-surface-container-highest rounded-[2rem] p-6 shadow-lg border border-primary/10">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold font-headline text-lg flex items-center gap-2">
                      <Zap className="text-primary" size={20} />
                      Current Deals
                    </h4>
                    <span className="text-[10px] font-bold font-label bg-primary/10 text-primary px-2 py-1 rounded-full">CRM SYNC ACTIVE</span>
                  </div>
                  
                  <div className="space-y-4">
                    {opportunities.map((opp) => (
                      <div key={opp.id} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 relative group">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="text-sm font-bold text-on-background">{opp.name}</h5>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <p className="text-[10px] font-label text-slate-500 uppercase tracking-widest">{opp.type}</p>
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
                            <p className="text-sm font-black text-primary">${(opp.value / 1000).toFixed(0)}K</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <label className="text-[9px] font-black font-label text-slate-400 uppercase tracking-widest block mb-1">Stage</label>
                            <div className="relative">
                              <select 
                                value={opp.stage}
                                onChange={(e) => handleUpdateStage(opp.id, e.target.value as Deal['stage'])}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold font-label appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none"
                              >
                                <option value="discovery">Discovery</option>
                                <option value="proposal">Proposal</option>
                                <option value="negotiation">Negotiation</option>
                                <option value="closing">Closing</option>
                              </select>
                              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] font-black font-label text-slate-400 uppercase tracking-widest block mb-1">Close Date</label>
                            <div className="relative">
                              <input 
                                type="date"
                                value={opp.closeDate}
                                onChange={(e) => handleUpdateDate(opp.id, e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold font-label cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {syncingId === opp.id && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10"
                            >
                              <div className="flex items-center gap-2 bg-on-background text-white px-3 py-1.5 rounded-full shadow-xl">
                                <Loader2 size={14} className="animate-spin" />
                                <span className="text-[10px] font-bold font-label">Syncing to CRM...</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
      </AnimatePresence>
    </div>
  );
}
