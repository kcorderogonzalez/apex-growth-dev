import React from 'react';
import { salesforceMCP } from '@/src/lib/salesforceMCP';
import { 
  Calendar as CalendarIcon, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  BarChart3,
  Search,
  Filter,
  ArrowUpRight,
  Database,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { mockMeetings } from '@/src/lib/mockData';
import { Meeting } from '@/src/types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  addWeeks, 
  subWeeks,
  isToday,
  parseISO
} from 'date-fns';

interface MeetingsManagerProps {
  onOpenAgent: () => void;
}

export default function MeetingsManager({ onOpenAgent }: MeetingsManagerProps) {
  const [meetings, setMeetings] = React.useState<Meeting[]>(mockMeetings);
  const [viewMode, setViewMode] = React.useState<'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [syncingId, setSyncingId] = React.useState<string | null>(null);
  const [showSyncLog, setShowSyncLog] = React.useState<{ id: string; status: string; notes?: string } | null>(null);
  const [activeDisposition, setActiveDisposition] = React.useState<{ id: string; person: string } | null>(null);
  const [selectedMeeting, setSelectedMeeting] = React.useState<Meeting | null>(null);
  const [notes, setNotes] = React.useState('');
  const [mcpStatus, setMcpStatus] = React.useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [sobjectMetadata, setSobjectMetadata] = React.useState<any>(null);

  React.useEffect(() => {
    const checkMCP = async () => {
      const data = await salesforceMCP.listTools();
      if (data) {
        setMcpStatus('connected');
        const metadata = await salesforceMCP.getSObjectMetadata();
        setSobjectMetadata(metadata);
      } else {
        setMcpStatus('disconnected');
      }
    };
    checkMCP();
  }, []);

  const attendanceRate = Math.round((meetings.filter(m => m.status === 'Attended').length / 
    meetings.filter(m => m.status !== 'Upcoming').length) * 100) || 0;
  
  const upcomingCount = meetings.filter(m => m.status === 'Upcoming').length;
  const totalVolume = meetings.length;

  const handleDisposition = async (id: string, status: 'Attended' | 'Canceled', meetingNotes?: string) => {
    if (status === 'Attended' && !activeDisposition && !meetingNotes) {
      const meeting = meetings.find(m => m.id === id);
      if (meeting) {
        setActiveDisposition({ id, person: meeting.person });
        return;
      }
    }

    setSyncingId(id);
    setActiveDisposition(null);
    setNotes('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, status, notes: meetingNotes } : m));
    setSyncingId(null);
    setShowSyncLog({ id, status, notes: meetingNotes });
    setTimeout(() => setShowSyncLog(null), 4000);
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-black font-headline tracking-tight">
            {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : "'Week of' MMM d, yyyy")}
          </h2>
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button 
              onClick={() => setViewMode('month')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === 'month' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Month
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                viewMode === 'week' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Week
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentDate(viewMode === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1))}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Today
          </button>
          <button 
            onClick={() => setCurrentDate(viewMode === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1))}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map(day => (
          <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(viewMode === 'month' ? monthStart : currentDate);
    const endDate = endOfWeek(viewMode === 'month' ? monthEnd : currentDate);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        const dayMeetings = meetings.filter(m => isSameDay(parseISO(m.date), cloneDay));

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "min-h-[120px] border border-slate-100 p-2 transition-all group relative",
              !isSameMonth(day, monthStart) && viewMode === 'month' ? "bg-slate-50/50 text-slate-300" : "text-slate-700",
              isToday(day) ? "bg-primary/5" : ""
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <span className={cn(
                "text-xs font-black font-label w-6 h-6 flex items-center justify-center rounded-full",
                isToday(day) ? "bg-primary text-white" : ""
              )}>
                {formattedDate}
              </span>
            </div>
            <div className="space-y-1">
              {dayMeetings.map(meeting => (
                <div 
                  key={meeting.id}
                  onClick={() => setSelectedMeeting(meeting)}
                  className={cn(
                    "p-2 rounded-lg text-[10px] font-bold border transition-all relative overflow-hidden cursor-pointer hover:shadow-md",
                    meeting.status === 'Upcoming' ? "bg-blue-50 border-blue-100 text-blue-700" :
                    meeting.status === 'Attended' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                    "bg-red-50 border-red-100 text-red-700"
                  )}
                >
                  <div className="flex justify-between items-start gap-1">
                    <div className="truncate">
                      <span className="opacity-60 mr-1">{meeting.time}</span>
                      {meeting.person}
                    </div>
                    {meeting.status === 'Upcoming' && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDisposition(meeting.id, 'Attended');
                          }}
                          disabled={syncingId === meeting.id}
                          className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors"
                          title="Mark Attended"
                        >
                          {syncingId === meeting.id ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDisposition(meeting.id, 'Canceled');
                          }}
                          disabled={syncingId === meeting.id}
                          className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          title="Mark Canceled"
                        >
                          {syncingId === meeting.id ? <Loader2 size={10} className="animate-spin" /> : <X size={10} />}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-[8px] opacity-70 truncate">{meeting.company}</div>
                </div>
              ))}
            </div>
          </div>
        );
        day = addWeeks(day, 0); // This is just to keep the loop logic clean, we increment below
        day = new Date(day.getTime() + 24 * 60 * 60 * 1000);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white">{rows}</div>;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-headline text-on-background">Meetings Manager</h1>
          <p className="text-slate-500 font-label mt-1">AI-powered meeting management and Salesforce synchronization.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenAgent}
            className="px-6 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg"
          >
            <CalendarIcon size={14} className="text-cyan-400" />
            Meeting Scheduler
          </button>
          <div className="bg-surface-container-low px-4 py-2 rounded-2xl border border-outline-variant flex items-center gap-3">
            <div className={cn(
              "h-2 w-2 rounded-full",
              mcpStatus === 'connected' ? "bg-emerald-500 animate-pulse" : 
              mcpStatus === 'checking' ? "bg-amber-500 animate-pulse" : "bg-red-500"
            )} />
            <span className="text-[10px] font-black font-label uppercase tracking-widest text-outline">
              {mcpStatus === 'connected' ? 'Salesforce MCP Connected' : 
               mcpStatus === 'checking' ? 'Connecting to MCP...' : 'Salesforce Sync Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Analytics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <TrendingUp size={24} />
            </div>
            <span className="text-[10px] font-black font-label text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12% vs LW</span>
          </div>
          <p className="text-[10px] font-black font-label text-outline uppercase tracking-widest mb-1">Attendance Rate</p>
          <h3 className="text-3xl font-black font-headline">{attendanceRate}%</h3>
          <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${attendanceRate}%` }} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
              <CalendarIcon size={24} />
            </div>
          </div>
          <p className="text-[10px] font-black font-label text-outline uppercase tracking-widest mb-1">Upcoming Meetings</p>
          <h3 className="text-3xl font-black font-headline">{upcomingCount}</h3>
          <p className="text-xs text-slate-500 mt-2 font-label">Next: Stellar Dynamics (Tomorrow)</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-tertiary/10 rounded-2xl text-tertiary">
              <BarChart3 size={24} />
            </div>
          </div>
          <p className="text-[10px] font-black font-label text-outline uppercase tracking-widest mb-1">Total Volume (MTD)</p>
          <h3 className="text-3xl font-black font-headline">{totalVolume}</h3>
          <p className="text-xs text-slate-500 mt-2 font-label">Target: 45 meetings</p>
        </motion.div>
      </div>

      {/* Calendar View */}
      <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden p-8">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </section>

      {/* SObject Metadata Explorer (Only if connected) */}
      {mcpStatus === 'connected' && sobjectMetadata && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden p-8 text-white border border-slate-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-cyan-500 rounded-xl">
              <Database size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black font-headline tracking-tight">Salesforce SObject Explorer</h2>
              <p className="text-[10px] font-label font-bold text-cyan-400 uppercase tracking-widest">Real-time Schema via MCP</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.isArray(sobjectMetadata) ? sobjectMetadata.slice(0, 8).map((obj: any, idx: number) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-default group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{obj.name || 'Object'}</span>
                  <ArrowUpRight size={14} className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm font-bold truncate">{obj.label || obj.name || 'Unknown'}</p>
              </div>
            )) : (
              <div className="col-span-full bg-white/5 p-4 rounded-xl text-center text-xs text-slate-400 italic">
                SObject dynamic schema loaded successfully.
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* Meeting Details Modal */}
      <AnimatePresence>
        {selectedMeeting && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl text-white shadow-lg",
                    selectedMeeting.status === 'Upcoming' ? "bg-blue-500" :
                    selectedMeeting.status === 'Attended' ? "bg-emerald-500" : "bg-red-500"
                  )}>
                    <CalendarIcon size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black font-headline tracking-tight">{selectedMeeting.person}</h2>
                    <p className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">{selectedMeeting.company} • {selectedMeeting.status}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedMeeting(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black font-label text-slate-400 uppercase tracking-widest">Date & Time</p>
                    <p className="text-sm font-bold text-slate-700">{format(parseISO(selectedMeeting.date), 'MMMM d, yyyy')} at {selectedMeeting.time}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black font-label text-slate-400 uppercase tracking-widest">Status</p>
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                      selectedMeeting.status === 'Upcoming' ? "bg-blue-100 text-blue-700" :
                      selectedMeeting.status === 'Attended' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}>
                      {selectedMeeting.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black font-label text-slate-400 uppercase tracking-widest">Meeting Notes</p>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-sm font-label text-slate-600 leading-relaxed italic">
                    {selectedMeeting.notes || "No notes recorded for this meeting."}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black font-label text-slate-400 uppercase tracking-widest">Contact Journey</p>
                    <span className="text-[10px] font-bold text-primary">{meetings.filter(m => m.contactId === selectedMeeting.contactId).length} Total Meetings</span>
                  </div>
                  <div className="space-y-3">
                    {meetings
                      .filter(m => m.contactId === selectedMeeting.contactId)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((m, idx) => (
                        <div key={m.id} className="relative pl-6 border-l-2 border-slate-100 pb-4 last:pb-0">
                          <div className={cn(
                            "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm",
                            m.status === 'Upcoming' ? "bg-blue-500" :
                            m.status === 'Attended' ? "bg-emerald-500" : "bg-red-500"
                          )} />
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-xs font-bold text-slate-700">{format(parseISO(m.date), 'MMM d, yyyy')}</h4>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{m.status}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                            {m.notes || "No notes recorded."}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setSelectedMeeting(null)}
                  className="px-8 py-3 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notes Modal */}
      <AnimatePresence>
        {activeDisposition && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black font-headline tracking-tight">Meeting Notes</h3>
                  <p className="text-[10px] font-label font-bold text-slate-400 uppercase tracking-widest">Disposition: Attended • {activeDisposition.person}</p>
                </div>
                <button onClick={() => setActiveDisposition(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add meeting notes for Salesforce..."
                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-label outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none mb-6"
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setActiveDisposition(null)}
                  className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleDisposition(activeDisposition.id, 'Attended', notes)}
                  className="flex-1 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                >
                  Save & Sync
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Salesforce Sync Notification */}
      <AnimatePresence>
        {showSyncLog && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 right-8 z-[200] flex items-center gap-4 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-cyan-500/20"
          >
            <div className="relative">
              <Database size={20} className="text-cyan-400" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1 -right-1"
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full border-2 border-slate-900" />
              </motion.div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Salesforce Sync</p>
              <p className="text-xs font-bold">Activity {showSyncLog.status} & Logged</p>
              {showSyncLog.notes && (
                <p className="text-[9px] text-slate-400 italic truncate max-w-[150px]">Notes: {showSyncLog.notes}</p>
              )}
            </div>
            <div className="ml-2 p-1 bg-emerald-500/20 rounded-full">
              <Check size={14} className="text-emerald-500" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
