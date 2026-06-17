import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  History, 
  CheckCircle2,
  Calendar,
  ArrowRight,
  Zap,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Deal } from '../types';

interface DealGanttChartProps {
  deals: Deal[];
  quotaGoal?: number;
  selectedDealId?: string | null;
  onSelectDeal: (id: string) => void;
  onEditDeal: (id: string) => void;
}

export default function DealGanttChart({ 
  deals, 
  quotaGoal = 1500000, 
  selectedDealId,
  onSelectDeal,
  onEditDeal
}: DealGanttChartProps) {
  const [currentQuarter, setCurrentQuarter] = useState(2); // Default to Q2 (Current)
  const [currentYear, setCurrentYear] = useState(2026);

  const quarterMonths = useMemo(() => {
    const startMonth = (currentQuarter - 1) * 3;
    return [startMonth, startMonth + 1, startMonth + 2].map(m => {
      const date = new Date(currentYear, m, 1);
      return {
        index: m,
        name: date.toLocaleString('default', { month: 'long' }),
        shortName: date.toLocaleString('default', { month: 'short' }),
        days: new Date(currentYear, m + 1, 0).getDate()
      };
    });
  }, [currentQuarter, currentYear]);

  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const date = new Date(deal.closeDate);
      const month = date.getMonth();
      const year = date.getFullYear();
      const q = Math.floor(month / 3) + 1;
      return q === currentQuarter && year === currentYear;
    }).sort((a, b) => new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime());
  }, [deals, currentQuarter, currentYear]);

  const totalARR = useMemo(() => {
    return filteredDeals.reduce((sum, deal) => sum + deal.value, 0);
  }, [filteredDeals]);

  const quotaProgress = Math.min((totalARR / quotaGoal) * 100, 100);

  const getDayPosition = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth();
    const day = date.getDate();
    
    const monthInfo = quarterMonths.find(m => m.index === month);
    if (!monthInfo) return 0;

    const monthStartIdx = quarterMonths.findIndex(m => m.index === month);
    let totalDaysBefore = 0;
    for (let i = 0; i < monthStartIdx; i++) {
      totalDaysBefore += quarterMonths[i].days;
    }

    const totalQuarterDays = quarterMonths.reduce((sum, m) => sum + m.days, 0);
    return ((totalDaysBefore + day) / totalQuarterDays) * 100;
  };

  const handlePrevQuarter = () => {
    if (currentQuarter === 1) {
      setCurrentQuarter(4);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentQuarter(prev => prev - 1);
    }
  };

  const handleNextQuarter = () => {
    if (currentQuarter === 4) {
      setCurrentQuarter(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentQuarter(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
        <div>
          <h2 className="text-2xl font-black font-headline text-on-background flex items-center gap-3">
            <Calendar className="text-primary" size={24} />
            Quarterly Path to Quota
          </h2>
          <p className="text-slate-500 font-label text-sm mt-1">Visualizing deal velocity and risk across Q{currentQuarter} {currentYear}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button 
              onClick={handlePrevQuarter}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-4 text-sm font-black font-headline min-w-[100px] text-center">
              Q{currentQuarter} {currentYear}
            </span>
            <button 
              onClick={handleNextQuarter}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-primary transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="h-10 w-[1px] bg-slate-200 hidden md:block" />

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-black font-label text-slate-400 uppercase tracking-widest mb-1">Total Pipeline</p>
              <p className="text-lg font-black font-headline text-primary">${(totalARR / 1000).toLocaleString()}K</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black font-label text-slate-400 uppercase tracking-widest mb-1">Quota Goal</p>
              <p className="text-lg font-black font-headline text-on-background">${(quotaGoal / 1000).toLocaleString()}K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quota Progress Bar */}
      <div className="px-8 py-6 bg-white border-b border-slate-50">
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-center gap-2">
            <Target className="text-primary" size={16} />
            <span className="text-xs font-black font-label uppercase tracking-widest text-slate-500">Path to Quota</span>
          </div>
          <span className={cn(
            "text-sm font-black font-headline",
            quotaProgress >= 100 ? "text-emerald-600" : "text-primary"
          )}>
            {quotaProgress.toFixed(1)}% Complete
          </span>
        </div>
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${quotaProgress}%` }}
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              quotaProgress >= 100 ? "bg-emerald-500" : "bg-primary"
            )}
          />
          {quotaProgress < 100 && (
            <div className="absolute top-0 bottom-0 right-0 left-0 flex items-center justify-end pr-4 pointer-events-none">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gap: ${((quotaGoal - totalARR) / 1000).toLocaleString()}K</span>
            </div>
          )}
        </div>
      </div>

      {/* Gantt View */}
      <div className="flex-1 overflow-auto p-8 bg-slate-50/20">
        <div className="min-w-[800px] relative">
          {/* Timeline Header */}
          <div className="flex border-b border-slate-100 mb-6 sticky top-0 bg-white/80 backdrop-blur-md z-10 rounded-t-xl">
            <div className="w-64 flex-shrink-0 p-4 font-black font-label text-[10px] uppercase tracking-widest text-slate-400">Deal Details</div>
            <div className="flex-1 flex">
              {quarterMonths.map((month, idx) => (
                <div key={idx} className="flex-1 border-l border-slate-100 p-4 text-center font-black font-label text-[10px] uppercase tracking-widest text-slate-400">
                  {month.name}
                </div>
              ))}
            </div>
          </div>

          {/* Grid Lines */}
          <div className="absolute inset-0 pointer-events-none flex">
            <div className="w-64 flex-shrink-0" />
            <div className="flex-1 flex">
              {quarterMonths.map((_, idx) => (
                <div key={idx} className="flex-1 border-l border-slate-100/50 h-full" />
              ))}
            </div>
          </div>

          {/* Deal Rows */}
          <div className="space-y-4 relative">
            {filteredDeals.length > 0 ? (
              filteredDeals.map((deal) => {
                const isZombie = (new Date().getTime() - new Date(deal.lastStageChangeDate).getTime()) > (30 * 24 * 60 * 60 * 1000);
                const isDirectional = !deal.povSuccess && (deal.stage === 'proposal' || deal.stage === 'negotiation' || deal.stage === 'closing');
                const position = getDayPosition(deal.closeDate);

                return (
                  <div key={deal.id} className="flex group">
                    {/* Deal Info */}
                    <div className="w-64 flex-shrink-0 pr-6">
                      <div 
                        onClick={() => onSelectDeal(deal.id)}
                        className={cn(
                          "bg-white p-4 rounded-2xl border transition-all cursor-pointer relative group/card",
                          selectedDealId === deal.id ? "border-primary ring-2 ring-primary/10 shadow-lg" : "border-slate-100 shadow-sm hover:shadow-md hover:border-primary/30"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditDeal(deal.id);
                            }}
                            className="p-1.5 bg-slate-50 text-slate-400 hover:bg-primary hover:text-white rounded-lg transition-all shadow-sm flex-shrink-0"
                            title="Edit Deal"
                          >
                            <Settings size={12} />
                          </button>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-on-background truncate">{deal.accountName}</h4>
                            <p className="text-[10px] font-bold text-primary truncate mt-0.5">{deal.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">${(deal.value / 1000).toFixed(0)}K</span>
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded uppercase">{deal.stage}</span>
                        </div>
                      </div>
                    </div>

                    {/* Gantt Bar Area */}
                    <div className="flex-1 relative flex items-center">
                      <div className="absolute left-0 right-0 h-[1px] bg-slate-100" />
                      
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute h-10 flex items-center"
                        style={{ left: `${position}%` }}
                      >
                        {/* The "Path" line from start of quarter to this deal */}
                        <div className="absolute right-full h-[2px] bg-primary/10 w-[1000px] pointer-events-none" />
                        
                        <div className="relative flex items-center">
                          {/* Deal Marker */}
                          <div className={cn(
                            "w-4 h-4 rounded-full border-4 border-white shadow-lg z-10 transition-transform group-hover:scale-125",
                            deal.status === 'healthy' ? "bg-emerald-500" : 
                            deal.status === 'stalled' ? "bg-amber-500" : "bg-primary"
                          )} />
                          
                          {/* Tooltip-like Info */}
                          <div className="ml-3 bg-white px-3 py-2 rounded-xl shadow-xl border border-slate-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar size={10} className="text-slate-400" />
                              <span className="text-[10px] font-black text-on-background uppercase tracking-widest">{new Date(deal.closeDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex gap-2">
                              {isDirectional && (
                                <span className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase tracking-widest">
                                  <AlertCircle size={8} />
                                  Directional
                                </span>
                              )}
                              {isZombie && (
                                <span className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase tracking-widest">
                                  <History size={8} />
                                  Zombie
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                <Calendar className="text-slate-300 mb-4" size={48} />
                <p className="text-slate-500 font-headline font-bold">No deals scheduled for this quarter</p>
                <p className="text-slate-400 text-xs font-label mt-1">Try switching to another quarter to see your pipeline.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black font-label uppercase tracking-widest text-slate-500">Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-[10px] font-black font-label uppercase tracking-widest text-slate-500">Stalled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-[10px] font-black font-label uppercase tracking-widest text-slate-500">On-Track</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-primary">
          <Zap size={14} />
          <span className="text-[10px] font-black font-label uppercase tracking-widest">AI-Powered Forecasting Active</span>
        </div>
      </div>
    </div>
  );
}
