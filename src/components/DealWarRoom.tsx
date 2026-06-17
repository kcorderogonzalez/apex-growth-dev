import React from 'react';
import { 
  TrendingUp, 
  MoreHorizontal, 
  AlertCircle, 
  Search, 
  Settings, 
  Bell, 
  Plus, 
  Zap, 
  BarChart3, 
  Handshake, 
  FileText, 
  Users, 
  Lightbulb, 
  HelpCircle,
  Gauge,
  MessageSquare,
  Send,
  Calendar,
  Wand2,
  ShieldCheck,
  CheckCircle2,
  History,
  X,
  ArrowRight,
  Target,
  UserCheck,
  Activity,
  ChevronRight,
  MapPin,
  ListPlus,
  Stars,
  LayoutGrid,
  List,
  Milestone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Deal, MedPicc, Persona } from '@/src/types';
import DealGanttChart from './DealGanttChart';
import DealFormModal from './DealFormModal';
import { allDeals, elenaDeals } from '@/src/lib/mockData';

export default function DealWarRoom() {
  const [selectedDealId, setSelectedDealId] = React.useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [dealToEdit, setDealToEdit] = React.useState<Deal | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'kanban' | 'list' | 'gantt'>('list');
  const [aiInput, setAiInput] = React.useState('');

  const handleSelectDeal = (id: string) => {
    setSelectedDealId(id);
    setIsAnalyzing(true);
    // Simulate AI analysis delay
    setTimeout(() => setIsAnalyzing(false), 1500);
  };

  const handleEditDeal = (id: string) => {
    const deal = elenaDeals.find(d => d.id === id);
    if (deal) {
      setDealToEdit(deal);
      setIsModalOpen(true);
    }
  };

  const handleCreateNew = () => {
    setDealToEdit(null);
    setIsModalOpen(true);
  };

  const handleSaveDeal = (dealData: Partial<Deal>) => {
    console.log("Saving Deal:", dealData);
    // In a real app, this would update the backend/mockData
    setIsModalOpen(false);
  };
  
  const selectedDeal = elenaDeals.find(d => d.id === selectedDealId);

  const stages = [
    { id: 'discovery', label: 'Discovery', color: 'bg-slate-300' },
    { id: 'proposal', label: 'Proposal', color: 'bg-primary-container' },
    { id: 'negotiation', label: 'Negotiation', color: 'bg-secondary' },
    { id: 'closing', label: 'Closing', color: 'bg-emerald-500' },
  ] as const;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Workspace / Kanban */}
      <section className="flex-1 flex flex-col min-w-0 bg-surface">
        {/* Header */}
        <header className="p-8 pb-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight font-headline text-on-background">Deal War Room</h1>
              <p className="text-on-surface-variant font-label mt-1">Strategic overview of your Q3 high-velocity pipeline.</p>
            </div>
            <div className="flex gap-3">
              <div className="flex bg-surface-container-high p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold font-label transition-all flex items-center gap-2",
                    viewMode === 'list' ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <List size={14} />
                  List
                </button>
                <button 
                  onClick={() => setViewMode('gantt')}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold font-label transition-all flex items-center gap-2",
                    viewMode === 'gantt' ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  <Milestone size={14} />
                  Path to Quota
                </button>
              </div>
                <button 
                  onClick={handleCreateNew}
                  className="bg-primary text-white px-6 py-2 rounded-xl font-label font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all"
                >
                  <Plus size={18} />
                  Create New
                </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Pipeline Value', value: '$1.42M', change: '+12.4%', icon: TrendingUp, color: 'text-emerald-600' },
              { label: 'Pipeline Fidelity', value: '76%', change: 'System-Validated', icon: ShieldCheck, color: 'text-primary' },
              { label: 'At Risk (Gut-Feel)', value: '4', change: 'Action Needed', icon: AlertCircle, color: 'text-tertiary' },
              { label: 'Avg. Cycle Time', value: '42 Days', change: '-3 Days', icon: TrendingUp, color: 'text-emerald-600' },
            ].map((metric, idx) => (
              <div key={idx} className="bg-surface-container-low p-5 rounded-2xl">
                <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">{metric.label}</p>
                <h4 className={cn("text-2xl font-bold font-headline", metric.label === 'At Risk' && "text-tertiary")}>{metric.value}</h4>
                <div className={cn("flex items-center gap-1 mt-2", metric.color)}>
                  {metric.icon && <metric.icon size={12} />}
                  <span className="text-xs font-label">{metric.change}</span>
                </div>
              </div>
            ))}
          </div>

        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-8 no-scrollbar">
          <AnimatePresence mode="wait">
            {viewMode === 'gantt' ? (
              <motion.div
                key="gantt"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <DealGanttChart 
                  deals={elenaDeals} 
                  selectedDealId={selectedDealId}
                  onSelectDeal={handleSelectDeal}
                  onEditDeal={handleEditDeal}
                />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Deal Health & Integrity Command Widget */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="font-headline font-bold text-xl flex items-center gap-2">
                      <ShieldCheck className="text-primary" size={24} />
                      Deal Health & Integrity Command
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold font-label bg-red-100 text-red-600 px-3 py-1 rounded-full uppercase">High Risk Detected</span>
                      <span className="text-[10px] font-bold font-label bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase">76% Validated</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/80 backdrop-blur-sm">
                          <th className="px-6 py-5 text-[10px] font-black font-label uppercase tracking-widest text-slate-400">Account & Opportunity</th>
                          <th className="px-6 py-5 text-[10px] font-black font-label uppercase tracking-widest text-slate-400">Territory & Rep</th>
                          <th className="px-6 py-5 text-[10px] font-black font-label uppercase tracking-widest text-slate-400">Health Status</th>
                          <th className="px-6 py-5 text-[10px] font-black font-label uppercase tracking-widest text-slate-400">Integrity Flags</th>
                          <th className="px-6 py-5 text-[10px] font-black font-label uppercase tracking-widest text-slate-400">Next Step</th>
                          <th className="px-6 py-5 text-[10px] font-black font-label uppercase tracking-widest text-slate-400 text-right">Value</th>
                          <th className="px-6 py-5 text-[10px] font-black font-label uppercase tracking-widest text-slate-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {elenaDeals.map((deal) => {
                          const isZombie = (new Date().getTime() - new Date(deal.lastStageChangeDate).getTime()) > (30 * 24 * 60 * 60 * 1000);
                          const isDirectional = !deal.povSuccess && (deal.stage === 'proposal' || deal.stage === 'negotiation' || deal.stage === 'closing');
                          const isSelected = selectedDealId === deal.id;
                          
                          return (
                            <tr 
                              key={deal.id} 
                              onClick={() => handleSelectDeal(deal.id)}
                              className={cn(
                                "hover:bg-slate-50/50 transition-colors group cursor-pointer",
                                isSelected && "bg-primary/5 border-l-2 border-primary"
                              )}
                            >
                              <td className="px-6 py-5">
                                <div className="flex items-start gap-3">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditDeal(deal.id);
                                    }}
                                    className="mt-1 p-2 bg-slate-100 text-slate-500 hover:bg-primary hover:text-white rounded-xl transition-all shadow-sm"
                                    title="Edit Deal"
                                  >
                                    <Settings size={14} />
                                  </button>
                                  <div className="min-w-0">
                                    <div className="font-bold text-sm text-on-background group-hover:text-primary transition-colors truncate">{deal.accountName}</div>
                                    <div className="text-xs font-medium text-slate-600 mt-0.5 truncate">{deal.name}</div>
                                    <div className="text-[10px] text-slate-400 font-label uppercase tracking-wider mt-1">{deal.stage} • Exp. {deal.closeDate}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-on-background flex items-center gap-1">
                                    <MapPin size={10} className="text-primary" />
                                    {deal.territory || 'N/A'}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-label flex items-center gap-1">
                                    <Users size={10} />
                                    {deal.rep || 'N/A'}
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
                                <div className="text-xs font-medium text-slate-600 flex items-center gap-2">
                                  <Wand2 size={12} className="text-primary opacity-50" />
                                  {(deal as any).nextStep || 'Discovery Call'}
                                </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="font-black font-headline text-primary text-base">${(deal.value / 1000).toFixed(0)}K</div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectDeal(deal.id);
                                  }}
                                  className={cn(
                                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    isSelected 
                                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                                      : "bg-slate-100 text-slate-500 hover:bg-primary/10 hover:text-primary"
                                  )}
                                >
                                  <Stars size={14} className={cn(isSelected && isAnalyzing && "animate-spin")} />
                                  {isSelected && isAnalyzing ? "Analyzing..." : isSelected ? "Analyzed" : "Analyze"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Opportunity Detail Drawer (Read-only / Analysis) */}
        <AnimatePresence>
          {isDrawerOpen && selectedDeal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-[600px] bg-white shadow-2xl z-50 flex flex-col"
              >
                {/* Drawer Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                      <Handshake size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black font-headline text-on-background">{selectedDeal.accountName}</h2>
                      <p className="text-sm font-bold text-primary font-headline">{selectedDeal.name}</p>
                      <p className="text-[10px] font-label text-slate-500 uppercase tracking-widest font-bold mt-1">{selectedDeal.type} • ${selectedDeal.value.toLocaleString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                  {/* Sales Stage Progress */}
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black font-label uppercase tracking-[0.2em] text-slate-400">Sales Stage Progression</h3>
                    <div className="flex items-center gap-2">
                      {stages.map((stage, idx) => {
                        const stageOrder = ['discovery', 'proposal', 'negotiation', 'closing'];
                        const currentIdx = stageOrder.indexOf(selectedDeal.stage);
                        const isCompleted = idx < currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <React.Fragment key={stage.id}>
                            <div className="flex flex-col items-center gap-2 flex-1">
                              <div className={cn(
                                "h-2 w-full rounded-full transition-all duration-500",
                                isCompleted ? "bg-emerald-500" : isCurrent ? "bg-primary animate-pulse" : "bg-slate-100"
                              )} />
                              <span className={cn(
                                "text-[9px] font-bold font-label uppercase",
                                isCurrent ? "text-primary" : "text-slate-400"
                              )}>{stage.label}</span>
                            </div>
                            {idx < stages.length - 1 && <ChevronRight size={12} className="text-slate-200 mt-[-18px]" />}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </section>

                  {/* MedPicc Section */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black font-label uppercase tracking-[0.2em] text-slate-400">MedPicc Qualification</h3>
                      <span className="text-[10px] font-bold font-label bg-primary/10 text-primary px-2 py-0.5 rounded">AI Scored: 84/100</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Metrics', value: selectedDeal.medpicc?.metrics, icon: Target },
                        { label: 'Economic Buyer', value: selectedDeal.medpicc?.economicBuyer, icon: UserCheck },
                        { label: 'Decision Criteria', value: selectedDeal.medpicc?.decisionCriteria, icon: ListPlus },
                        { label: 'Decision Process', value: selectedDeal.medpicc?.decisionProcess, icon: History },
                        { label: 'Identify Pain', value: selectedDeal.medpicc?.identifyPain, icon: AlertCircle },
                        { label: 'Champion', value: selectedDeal.medpicc?.champion, icon: Stars },
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <item.icon size={14} className="text-primary" />
                            <span className="text-[10px] font-black font-label uppercase tracking-wider text-slate-400">{item.label}</span>
                          </div>
                          <p className="text-xs font-medium text-on-background leading-relaxed">{item.value || 'Pending validation...'}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Key Buyer Personas */}
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black font-label uppercase tracking-[0.2em] text-slate-400">Key Buyer Personas</h3>
                    <div className="space-y-3">
                      {selectedDeal.personas?.map((persona, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                              {persona.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-on-background">{persona.name}</div>
                              <div className="text-[10px] text-slate-500 font-label">{persona.role}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Sentiment</div>
                              <span className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                persona.sentiment === 'positive' ? "bg-emerald-100 text-emerald-700" :
                                persona.sentiment === 'negative' ? "bg-red-100 text-red-700" :
                                "bg-slate-100 text-slate-600"
                              )}>
                                {persona.sentiment}
                              </span>
                            </div>
                            <div className="text-right w-20">
                              <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Engagement</div>
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${persona.engagement}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* NLP Agent Input */}
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center text-white">
                      <Zap size={14} className="fill-current" />
                    </div>
                    <span className="text-xs font-bold font-headline">Apex AI Agent</span>
                  </div>
                  <div className="relative">
                    <textarea 
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Update opportunity details... (e.g., 'Sarah Chen is now a positive champion, and the decision criteria includes AI safety')"
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 pr-12 text-sm font-label focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[100px] resize-none shadow-sm"
                    />
                    <button 
                      className="absolute right-3 bottom-3 p-2 bg-primary text-white rounded-xl hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-label mt-3 text-center italic">
                    AI will automatically parse your input to update MedPicc and Persona fields.
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </section>

      <DealFormModal 
        isOpen={isModalOpen}
        deal={dealToEdit}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDeal}
      />

      {/* AI Assistant Sidebar */}
      <aside className="w-96 bg-surface-container-low border-l border-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <Zap size={18} className="fill-current" />
            </div>
            <h2 className="font-headline font-bold text-lg tracking-tight">Deal Insight Agent</h2>
          </div>
          <div className="bg-surface-container-highest p-4 rounded-xl prism-glow min-h-[80px] flex items-center">
            <p className="text-xs font-label text-on-background leading-relaxed">
              {isAnalyzing ? (
                <span className="flex items-center gap-2 text-primary font-bold">
                  <Zap size={14} className="animate-pulse" />
                  AI Agent is analyzing deal data...
                </span>
              ) : selectedDeal ? (
                <>
                  Analyzing <span className="font-bold">{selectedDeal.accountName}</span> ({selectedDeal.name}). I've identified {selectedDeal.status === 'stalled' ? '2 friction points' : 'positive momentum'} in the {selectedDeal.stage} phase.
                </>
              ) : (
                "Select a deal to begin AI analysis and strategic insights."
              )}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          <section>
            <h3 className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">Velocity Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-label">Days in Stage</span>
                <span className="text-xs font-bold font-headline text-tertiary">24 Days</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-tertiary w-[85%] h-full rounded-full"></div>
              </div>
              <p className="text-[11px] font-label text-slate-500 italic">85% longer than your average closing velocity for this segment.</p>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">AI Recommended Next Steps</h3>
            <div className="space-y-3">
              {[
                { title: 'Action: Executive Re-engagement', desc: 'Send follow-up email to VP of IT regarding security compliance docs.', icon: Wand2, action: 'Generate Draft' },
                { title: 'Action: Proof of Value', desc: 'Schedule a technical deep dive for the infrastructure team.', icon: Calendar, action: 'Check Availability' },
              ].map((step, idx) => (
                <button key={idx} className="w-full text-left p-4 bg-white rounded-xl shadow-sm border-l-2 border-primary-container hover:shadow-md transition-shadow group">
                  <p className="text-[11px] font-label font-bold text-primary mb-1">{step.title}</p>
                  <p className="text-xs text-on-surface font-label group-hover:text-primary transition-colors">{step.desc}</p>
                  <div className="mt-2 flex items-center text-[10px] text-slate-400 gap-1">
                    <step.icon size={12} />
                    {step.action}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-4">Sentiment Map</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg">
                <span className="text-xs font-label text-emerald-800">Champion: Sarah M.</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">Positive</span>
              </div>
              <div className="flex justify-between items-center bg-amber-50 p-3 rounded-lg">
                <span className="text-xs font-label text-amber-800">Skeptic: James L.</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">Resistant</span>
              </div>
            </div>
          </section>
        </div>

        <div className="p-4 bg-surface-container-highest mt-auto">
          <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-slate-200">
            <MessageSquare className="text-primary" size={18} />
            <input className="bg-transparent border-none focus:ring-0 text-sm font-label w-full outline-none" placeholder="Ask AI about this deal..." type="text" />
            <button className="text-primary">
              <Send size={18} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
