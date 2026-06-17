import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2,
  Info,
  ChevronRight,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { QuoteItem } from '@/src/types';

interface AttributeState {
  userCount: number;
  supportTier: 'Standard' | 'Gold' | 'Platinum';
  aiModules: string[];
  isLegacyMigration: boolean;
}

const AI_MODULES = [
  { id: 'threat', name: 'Advanced Threat Protection', sku: 'ATP-01', price: 12 },
  { id: 'data', name: 'Data Loss Prevention', sku: 'DLP-02', price: 15 },
  { id: 'zero', name: 'Zero Trust Engine', sku: 'ZTE-03', price: 20 },
];

const SUPPORT_TIERS = {
  Standard: { multiplier: 1.0, sku: 'SUP-STD' },
  Gold: { multiplier: 1.2, sku: 'GCH-SKU' }, // TC 1.1.1
  Platinum: { multiplier: 1.5, sku: 'SUP-PLAT' },
};

export default function GuidedQuoteBuilder() {
  const [attributes, setAttributes] = useState<AttributeState>({
    userCount: 500,
    supportTier: 'Standard',
    aiModules: [],
    isLegacyMigration: false,
  });

  const [generatedItems, setGeneratedItems] = useState<QuoteItem[]>([]);
  const [showApprovalNotice, setShowApprovalNotice] = useState(false);

  // Scenario #1: Product Configuration Logic
  useEffect(() => {
    const items: QuoteItem[] = [];
    const basePricePerUser = 45;
    
    // 1. Base License SKU
    items.push({
      id: 'base',
      sku: `BASE-${attributes.userCount > 1000 ? 'ENT' : 'MID'}`,
      name: 'Core Security License',
      quantity: attributes.userCount,
      price: basePricePerUser,
    });

    // 2. Support SKU (TC 1.1.1)
    const tier = SUPPORT_TIERS[attributes.supportTier];
    items.push({
      id: 'support',
      sku: tier.sku,
      name: `${attributes.supportTier} Support Plan`,
      quantity: 1,
      price: (basePricePerUser * attributes.userCount) * (tier.multiplier - 1),
    });

    // 3. AI Module SKUs
    attributes.aiModules.forEach(modId => {
      const mod = AI_MODULES.find(m => m.id === modId);
      if (mod) {
        items.push({
          id: mod.id,
          sku: mod.sku,
          name: mod.name,
          quantity: attributes.userCount,
          price: mod.price,
        });
      }
    });

    setGeneratedItems(items);

    // TC 1.1.2: Real-time approval notification
    const needsApproval = attributes.supportTier === 'Platinum' || attributes.aiModules.length > 2;
    setShowApprovalNotice(needsApproval);
  }, [attributes]);

  // Scenario #2: Legacy Mapping
  const handleLegacyMigration = () => {
    setAttributes({
      userCount: 1250,
      supportTier: 'Gold',
      aiModules: ['threat', 'data'],
      isLegacyMigration: true,
    });
  };

  const totalValue = generatedItems.reduce((sum, item) => sum + (item.price * (item.id === 'support' ? 1 : item.quantity)), 0);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-slate-100">
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-surface-container-low/30">
        <div>
          <h2 className="text-2xl font-black font-headline text-on-background flex items-center gap-2">
            <Zap className="text-primary" size={24} />
            Guided Configuration
          </h2>
          <p className="text-sm text-slate-500 font-label mt-1">Attribute-based SKU generation with NPP guardrails</p>
        </div>
        <button 
          onClick={handleLegacyMigration}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-xs font-label hover:bg-primary/20 transition-all"
        >
          <RefreshCw size={14} />
          Map Legacy Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-slate-100">
        {/* Attribute Selection */}
        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-black font-label uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Users size={14} />
              User Capacity
            </label>
            <div className="flex items-center gap-6">
              <input 
                type="range" 
                min="100" 
                max="5000" 
                step="100"
                value={attributes.userCount}
                onChange={(e) => setAttributes({...attributes, userCount: parseInt(e.target.value)})}
                className="flex-1 h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-primary"
              />
              <span className="text-xl font-black font-headline text-primary w-20 text-right">{attributes.userCount}</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black font-label uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <ShieldCheck size={14} />
              Support Tier
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['Standard', 'Gold', 'Platinum'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setAttributes({...attributes, supportTier: tier})}
                  className={cn(
                    "py-3 px-4 rounded-2xl font-bold font-label text-sm transition-all border-2",
                    attributes.supportTier === tier 
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-white border-slate-100 text-slate-500 hover:border-primary/30"
                  )}
                >
                  {tier}
                </button>
              ))}
            </div>
            {attributes.supportTier === 'Gold' && (
              <p className="text-[10px] text-emerald-600 font-bold font-label flex items-center gap-1">
                <CheckCircle2 size={12} />
                TC 1.1.1: GCH-SKU multiplier applied (1.2x)
              </p>
            )}
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black font-label uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Sparkles size={14} />
              AI Security Modules
            </label>
            <div className="space-y-2">
              {AI_MODULES.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => {
                    const newModules = attributes.aiModules.includes(mod.id)
                      ? attributes.aiModules.filter(id => id !== mod.id)
                      : [...attributes.aiModules, mod.id];
                    setAttributes({...attributes, aiModules: newModules});
                  }}
                  className={cn(
                    "w-full p-4 rounded-2xl flex items-center justify-between border-2 transition-all",
                    attributes.aiModules.includes(mod.id)
                      ? "bg-surface-container-low border-primary"
                      : "bg-white border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center border",
                      attributes.aiModules.includes(mod.id) ? "bg-primary border-primary text-white" : "border-slate-300"
                    )}>
                      {attributes.aiModules.includes(mod.id) && <CheckCircle2 size={12} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-background">{mod.name}</p>
                      <p className="text-[10px] font-label text-slate-400 uppercase tracking-widest">{mod.sku}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black font-label text-primary">+${mod.price}/u</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generated Output */}
        <div className="p-8 bg-slate-50/50 flex flex-col">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black font-headline text-lg">System-Generated SKUs</h3>
              <span className="text-[10px] font-black font-label bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">NPP VALIDATED</span>
            </div>
            
            <div className="space-y-3">
              {generatedItems.map((item) => (
                <motion.div 
                  layout
                  key={item.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center"
                >
                  <div>
                    <p className="text-xs font-black font-label text-primary uppercase tracking-widest">{item.sku}</p>
                    <p className="text-sm font-bold text-on-background">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-label">Qty: {item.quantity.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black font-headline">${(item.price * (item.id === 'support' ? 1 : item.quantity)).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-label">${item.price.toFixed(2)}/unit</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <AnimatePresence>
              {showApprovalNotice && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3"
                >
                  <AlertCircle className="text-amber-600 shrink-0" size={20} />
                  <div>
                    <p className="text-xs font-black text-amber-700 font-label uppercase tracking-widest">TC 1.1.2: Approval Required</p>
                    <p className="text-xs text-amber-600 font-medium mt-1">Non-standard configuration detected. Real-time notification sent to Deal Desk.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-xs font-black font-label text-slate-400 uppercase tracking-widest">Total Contract Value</p>
                <p className="text-4xl font-black font-headline text-on-background">${totalValue.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black font-label text-emerald-600 uppercase tracking-widest">Simplification Index</p>
                <p className="text-xl font-black font-headline text-emerald-600">92%</p>
              </div>
            </div>
            <button className="w-full bg-primary text-white py-4 rounded-2xl font-black font-headline text-lg shadow-xl shadow-primary/30 hover:opacity-90 transition-all flex items-center justify-center gap-2">
              Generate Final Proposal
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Users({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
