import React from 'react';
import { 
  TrendingUp, 
  MoreVertical, 
  FileText, 
  Copy, 
  Share2, 
  FileDown, 
  Trash2, 
  ShoppingCart, 
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Zap,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Quote } from '@/src/types';
import GuidedQuoteBuilder from './GuidedQuoteBuilder';
import { elenaDeals } from '@/src/lib/mockData';

export default function QuoteBuilder() {
  const dynamicQuotes: Quote[] = elenaDeals.slice(0, 4).map((deal, idx) => ({
    id: `q-${idx}`,
    name: `${deal.name} Proposal`,
    status: idx === 0 ? 'sent' : idx === 1 ? 'pending' : 'draft',
    value: deal.value,
    client: deal.accountName,
    ftrAccuracy: true,
    simplificationIndex: 75 + Math.floor(Math.random() * 20)
  }));

  const [mode, setMode] = React.useState<'standard' | 'guided'>('guided');

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tight text-on-surface mb-2">Quote Builder</h1>
          <p className="text-slate-500 font-body">Create, customize, and approve intelligent sales proposals.</p>
        </div>
        <div className="flex bg-surface-container-low p-1.5 rounded-2xl border border-slate-100 self-start">
          <button 
            onClick={() => setMode('guided')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold font-headline text-sm transition-all",
              mode === 'guided' ? "bg-white shadow-md text-primary" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Zap size={16} />
            Guided Mode
          </button>
          <button 
            onClick={() => setMode('standard')}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold font-headline text-sm transition-all",
              mode === 'standard' ? "bg-white shadow-md text-primary" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <List size={16} />
            Standard Mode
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {mode === 'guided' ? (
          <motion.div
            key="guided"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GuidedQuoteBuilder />
          </motion.div>
        ) : (
          <motion.div
            key="standard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-6"
          >
            {/* Active Quotes Table */}
            <div className="xl:col-span-8 order-2 xl:order-1 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden p-2">
            <div className="p-6 flex justify-between items-center">
              <h2 className="font-headline font-bold text-xl">Active Quotes</h2>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 rounded-full text-xs font-label font-bold bg-surface-container text-on-secondary-container">All</button>
                <button className="px-4 py-1.5 rounded-full text-xs font-label font-bold text-slate-500 hover:bg-surface-container">My Quotes</button>
                <button className="px-4 py-1.5 rounded-full text-xs font-label font-bold text-slate-500 hover:bg-surface-container">Needs Approval</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low/50 font-label text-xs uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Quote Name</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Value</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y-8 divide-white">
                  {dynamicQuotes.map((quote) => (
                    <tr key={quote.id} className="bg-surface-container-low/30 hover:bg-surface-container-low transition-colors rounded-xl">
                      <td className="px-6 py-5 font-headline font-semibold text-sm">
                        {quote.name}
                        <div className="text-[10px] text-slate-400 font-label mt-1">Simplification Index: {quote.simplificationIndex}%</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-label font-bold uppercase",
                          quote.status === 'sent' ? "bg-blue-100 text-blue-700" :
                          quote.status === 'pending' ? "bg-amber-100 text-amber-700" :
                          "bg-slate-200 text-slate-600"
                        )}>
                          {quote.status === 'pending' ? 'Pending Approval' : quote.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-label font-bold">${quote.value.toLocaleString()}.00</td>
                      <td className="px-6 py-5 text-sm text-slate-600">{quote.client}</td>
                      <td className="px-6 py-5 text-right">
                        <button className="text-slate-400 hover:text-primary transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-high p-8 rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingCart className="text-secondary" size={24} />
                <h3 className="font-headline font-bold text-lg">New Quote Items</h3>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <label className="absolute -top-2 left-4 bg-surface-container-high px-1 text-[10px] font-label font-bold uppercase text-outline">Product Catalog</label>
                  <select className="w-full bg-transparent border-2 border-outline-variant rounded-xl py-3 px-4 focus:ring-primary focus:border-primary font-body text-sm outline-none appearance-none">
                    <option>Select Product...</option>
                    <option>Data Analytics Hub - Monthly</option>
                    <option>Security Firewall Pro</option>
                    <option>Apex AI Support Pack</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="absolute -top-2 left-4 bg-surface-container-high px-1 text-[10px] font-label font-bold uppercase text-outline">Quantity</label>
                    <input className="w-full bg-transparent border-2 border-outline-variant rounded-xl py-3 px-4 focus:ring-primary focus:border-primary font-label outline-none" type="number" defaultValue="1" />
                  </div>
                  <div className="relative">
                    <label className="absolute -top-2 left-4 bg-surface-container-high px-1 text-[10px] font-label font-bold uppercase text-outline">Discount %</label>
                    <input className="w-full bg-transparent border-2 border-outline-variant rounded-xl py-3 px-4 focus:ring-primary focus:border-primary font-label outline-none" placeholder="AI Optimized: 14%" type="text" />
                  </div>
                </div>
                <button className="w-full bg-secondary text-white py-3 rounded-xl font-headline font-bold text-sm shadow-lg shadow-secondary/20 hover:opacity-90 transition-all">
                  Add to Proposal
                </button>
              </div>
            </div>

            <div className="bg-primary/5 p-8 rounded-[2.5rem] flex flex-col justify-between">
              <div>
                <h3 className="font-headline font-bold text-lg mb-2">Quote Summary</h3>
                <div className="space-y-2 mt-6">
                  <div className="flex justify-between font-label text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span>$12,400.00</span>
                  </div>
                  <div className="flex justify-between font-label text-sm text-primary">
                    <span>AI Recommended Discount (14%)</span>
                    <span>-$1,736.00</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-4 mt-4">
                    <span className="font-headline font-bold text-lg">Total</span>
                    <span className="font-headline font-black text-2xl text-on-surface">$10,664.00</span>
                  </div>
                </div>
              </div>
              <button className="w-full mt-8 bg-primary text-white py-4 rounded-2xl font-headline font-black tracking-tight text-lg shadow-xl shadow-primary/30 hover:opacity-90 transition-all">
                Submit for Approval
              </button>
            </div>
          </div>
        </div>

        {/* AI Pricing Insights */}
        <div className="xl:col-span-4 order-1 xl:order-2 space-y-6">
          <div className="bg-surface-container-highest prism-glow p-6 rounded-[2rem] border-0">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-primary" size={24} />
              <h2 className="font-headline font-bold text-lg text-on-background">AI Pricing Insights</h2>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-white/60 rounded-2xl">
                <p className="text-xs font-label text-slate-500 uppercase tracking-widest mb-1">Recommended Discount</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-headline font-extrabold text-primary">12-15%</span>
                  <span className="text-sm font-label text-green-600 mb-1 flex items-center">
                    <TrendingUp size={14} className="mr-1" />
                    +4% Close Rate
                  </span>
                </div>
                <p className="text-sm mt-3 text-slate-600 leading-relaxed italic">
                  "Based on similar Q3 deals in the Enterprise segment, 14% is the sweet spot for approval without escalation."
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant">Competitor Benchmark</h3>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                  <div className="h-full bg-primary" style={{ width: '65%' }}></div>
                  <div className="h-full bg-primary-container/40" style={{ width: '35%' }}></div>
                </div>
                <div className="flex justify-between text-xs font-label font-medium">
                  <span>Apex Quote</span>
                  <span className="text-primary-container">Market Average</span>
                </div>
              </div>
              <button className="w-full py-3 rounded-xl border border-primary/20 text-primary font-headline font-bold text-sm hover:bg-primary/5 transition-all">
                Apply Optimal Pricing
              </button>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 rounded-[2rem]">
            <h3 className="font-headline font-bold text-lg mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Duplicate', icon: Copy, color: 'text-secondary' },
                { label: 'Share Link', icon: Share2, color: 'text-secondary' },
                { label: 'Export PDF', icon: FileDown, color: 'text-secondary' },
                { label: 'Discard', icon: Trash2, color: 'text-red-500' },
              ].map((action, idx) => (
                <button key={idx} className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl hover:shadow-md transition-shadow">
                  <action.icon className={action.color} size={20} />
                  <span className="text-xs font-label font-bold">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
    </div>
  );
}
