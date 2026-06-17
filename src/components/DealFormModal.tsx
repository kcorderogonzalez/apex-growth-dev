import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Handshake, Building2, DollarSign, Calendar, Zap, Mic, Send, Loader2, Check,
  AlertCircle, Target, UserCheck, ListPlus, History, Stars,
} from 'lucide-react';
import { Deal } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { queryAgent } from '@/src/lib/api';

interface DealFormModalProps {
  deal?: Deal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (deal: Partial<Deal>) => void;
}

const emptyDeal = (): Partial<Deal> => ({
  name: '',
  accountName: '',
  value: 0,
  stage: 'discovery',
  status: 'on-track',
  type: 'New Business',
  closeDate: new Date().toISOString().split('T')[0],
  nextStep: '',
  medpicc: {
    metrics: '', economicBuyer: '', decisionCriteria: '',
    decisionProcess: '', identifyPain: '', champion: '', competition: '',
  },
});

export default function DealFormModal({ deal, isOpen, onClose, onSave }: DealFormModalProps) {
  const [formData, setFormData] = React.useState<Partial<Deal>>(emptyDeal());
  const [nlpInput, setNlpInput] = React.useState('');
  const [isParsing, setIsParsing] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [parseError, setParseError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setFormData(deal ?? emptyDeal());
  }, [deal, isOpen]);

  const handleNlpParse = async (input: string) => {
    if (!input.trim()) return;
    setIsParsing(true);
    setParseError(null);
    try {
      const prompt = `Parse this deal description and return the structured data as JSON:
"${input}"

Current deal data for context: ${JSON.stringify(formData)}`;

      const text = await queryAgent(prompt, {
        intent: 'deal_parse',
        context: { currentDeal: formData },
      });

      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      setFormData((prev) => ({
        ...prev,
        ...parsed,
        medpicc: { ...prev.medpicc, ...parsed.medpicc },
      }));
      setNlpInput('');
    } catch (err) {
      setParseError('Could not parse that description. Try being more specific.');
      console.error('NLP Parse error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNlpInput(transcript);
      handleNlpParse(transcript);
    };
    if (isListening) recognition.stop();
    else recognition.start();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
                <Handshake size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black font-headline tracking-tight">
                  {deal ? 'Edit Opportunity' : 'Create New Opportunity'}
                </h2>
                <p className="text-xs font-label font-bold text-slate-400 uppercase tracking-widest">
                  {deal ? `ID: ${deal.id}` : 'Drafting new strategic deal'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left: Core Fields */}
              <div className="space-y-8">
                <section className="space-y-6">
                  <h3 className="text-[10px] font-black font-label uppercase tracking-[0.2em] text-slate-400">Core Opportunity Data</h3>
                  <div className="space-y-4">
                    {[
                      { field: 'name', label: 'Opportunity Name', icon: Zap, placeholder: 'e.g. Q3 Expansion - Alphabet', type: 'text' },
                      { field: 'accountName', label: 'Account Name', icon: Building2, placeholder: 'Search accounts...', type: 'text' },
                    ].map(({ field, label, icon: Icon, placeholder, type }) => (
                      <div key={field} className="relative group">
                        <label className="absolute -top-2 left-4 px-1 bg-white text-[10px] font-black text-primary uppercase tracking-widest z-10">{label}</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                          <Icon size={18} className="text-slate-400" />
                          <input
                            type={type}
                            value={(formData as any)[field] ?? ''}
                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                            placeholder={placeholder}
                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold outline-none"
                          />
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative group">
                        <label className="absolute -top-2 left-4 px-1 bg-white text-[10px] font-black text-primary uppercase tracking-widest z-10">Value (USD)</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                          <DollarSign size={18} className="text-slate-400" />
                          <input
                            type="number"
                            value={formData.value ?? 0}
                            onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold outline-none"
                          />
                        </div>
                      </div>
                      <div className="relative group">
                        <label className="absolute -top-2 left-4 px-1 bg-white text-[10px] font-black text-primary uppercase tracking-widest z-10">Close Date</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                          <Calendar size={18} className="text-slate-400" />
                          <input
                            type="date"
                            value={formData.closeDate ?? ''}
                            onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative group">
                        <label className="absolute -top-2 left-4 px-1 bg-white text-[10px] font-black text-primary uppercase tracking-widest z-10">Sales Stage</label>
                        <select
                          value={formData.stage}
                          onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none"
                        >
                          <option value="discovery">Discovery</option>
                          <option value="proposal">Proposal</option>
                          <option value="negotiation">Negotiation</option>
                          <option value="closing">Closing</option>
                        </select>
                      </div>
                      <div className="relative group">
                        <label className="absolute -top-2 left-4 px-1 bg-white text-[10px] font-black text-primary uppercase tracking-widest z-10">Health Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none"
                        >
                          <option value="healthy">Healthy</option>
                          <option value="on-track">On Track</option>
                          <option value="stalled">Stalled</option>
                        </select>
                      </div>
                    </div>

                    <div className="relative group">
                      <label className="absolute -top-2 left-4 px-1 bg-white text-[10px] font-black text-primary uppercase tracking-widest z-10">Next Strategic Step</label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                        <Send size={18} className="text-slate-400" />
                        <input
                          type="text"
                          value={formData.nextStep ?? ''}
                          onChange={(e) => setFormData({ ...formData, nextStep: e.target.value })}
                          placeholder="e.g. Executive alignment call"
                          className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* NLP Section */}
                <section className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary rounded-lg text-white">
                        <Stars size={14} />
                      </div>
                      <h4 className="text-xs font-black font-headline uppercase tracking-widest text-primary">Hunter NLP Assistant</h4>
                    </div>
                    {isListening && (
                      <span className="flex items-center gap-1.5 text-[10px] font-black text-red-500 uppercase animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        Listening...
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <textarea
                      value={nlpInput}
                      onChange={(e) => setNlpInput(e.target.value)}
                      placeholder="Type or speak to update deal... (e.g. 'Value is 250k, closing next month, champion is Sarah Chen')"
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 pr-12 text-sm font-label focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[100px] resize-none shadow-sm"
                    />
                    <div className="absolute right-3 bottom-3 flex flex-col gap-2">
                      <button
                        onClick={toggleListening}
                        className={cn("p-2 rounded-xl transition-all shadow-md", isListening ? "bg-red-500 text-white" : "bg-white text-slate-400 hover:text-primary")}
                      >
                        <Mic size={18} />
                      </button>
                      <button
                        onClick={() => handleNlpParse(nlpInput)}
                        disabled={isParsing || !nlpInput.trim()}
                        className="p-2 bg-primary text-white rounded-xl hover:scale-105 transition-transform shadow-lg shadow-primary/20 disabled:opacity-50"
                      >
                        {isParsing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      </button>
                    </div>
                  </div>
                  {parseError && <p className="text-xs text-red-500">{parseError}</p>}
                </section>
              </div>

              {/* Right: MEDPICC */}
              <div className="space-y-8">
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black font-label uppercase tracking-[0.2em] text-slate-400">MedPicc Qualification</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                      <Check size={12} className="text-emerald-600" />
                      <span className="text-[10px] font-black text-emerald-700 uppercase">AI Validated</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { id: 'metrics', label: 'Metrics', icon: Target, placeholder: 'Targeting 30% reduction in cloud spend' },
                      { id: 'economicBuyer', label: 'Economic Buyer', icon: UserCheck, placeholder: 'Sarah Chen, CFO' },
                      { id: 'decisionCriteria', label: 'Decision Criteria', icon: ListPlus, placeholder: 'Security compliance, Scalability' },
                      { id: 'decisionProcess', label: 'Decision Process', icon: History, placeholder: 'Technical review -> Security audit' },
                      { id: 'identifyPain', label: 'Identify Pain', icon: AlertCircle, placeholder: 'Legacy system downtime costing $50k/hour' },
                      { id: 'champion', label: 'Champion', icon: Stars, placeholder: 'James Wilson, Head of Infra' },
                      { id: 'competition', label: 'Competition', icon: X, placeholder: 'Zscaler, AWS Native' },
                    ].map((item) => (
                      <div key={item.id} className="relative group">
                        <label className="absolute -top-2 left-4 px-1 bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest z-10 group-focus-within:text-primary transition-colors">{item.label}</label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                          <item.icon size={16} className="text-slate-400 group-focus-within:text-primary transition-colors" />
                          <input
                            type="text"
                            value={(formData.medpicc as any)?.[item.id] ?? ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              medpicc: { ...formData.medpicc!, [item.id]: e.target.value },
                            })}
                            placeholder={item.placeholder}
                            className="w-full bg-transparent border-none focus:ring-0 text-xs font-medium outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-500" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Changes will be synced to Salesforce automatically.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-colors">
                Discard
              </button>
              <button
                onClick={() => onSave(formData)}
                className="px-10 py-3 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                <Check size={16} />
                {deal ? 'Update Opportunity' : 'Create Opportunity'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
