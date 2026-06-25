import React, { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DemoDataProvider } from './context/DemoDataContext';
import { AgentMemoryProvider } from './context/AgentMemoryContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/auth/LoginScreen';
import UserManagementScreen from './components/admin/UserManagementScreen';
import MemoryAgent from './components/MemoryAgent';
import MemoryLibrary from './components/memory-library/MemoryLibrary';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import PipelineGenScreen from './components/pg/PipelineGenScreen';
import AccountsDashboard from './components/AccountsDashboard';
import Account360 from './components/Account360';
import DealWarRoom from './components/DealWarRoom';
import QuoteBuilder from './components/QuoteBuilder';
import ManagerInsights from './components/ManagerInsights';
import MeetingsManager from './components/MeetingsManager';
import HunterAgent from './components/HunterAgent';
import MeetingScheduler from './components/MeetingScheduler';
import SequenceActivity from './components/SequenceActivity';
import OpportunitiesScreen from './components/OpportunitiesScreen';
import { View, Account } from './types';
import { accounts, allDeals, allContacts } from './lib/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Handshake, FileText, Users, Lightbulb, Loader2, ArrowLeftCircle } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function AppShell() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <AppMain />;
}

function ImpersonationBanner() {
  const { user, impersonating, returnToAdmin } = useAuth();
  if (!impersonating || !user) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-sm font-medium flex items-center justify-between px-4 py-1.5 shadow-md">
      <span>Viewing as <strong>{user.full_name}</strong> ({user.role.toUpperCase()}{user.territory ? ` · ${user.territory}` : ''})</span>
      <button
        onClick={returnToAdmin}
        className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 rounded-full px-3 py-0.5 transition-colors"
      >
        <ArrowLeftCircle size={14} />
        Return to Admin
      </button>
    </div>
  );
}

function AppMain() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<View>('pipeline');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [hunterAccount, setHunterAccount] = useState<Account | null>(null);

  // Filter accounts to this user's territory for non-admin roles
  const visibleAccounts = useMemo(() => {
    if (!user || user.role === 'admin') return accounts;
    if (user.territory) return accounts.filter(a => a.territory === user.territory);
    return accounts;
  }, [user]);

  // Names of all accounts in the user's territory (for Hunter context)
  const territoryAccountNames = useMemo(
    () => visibleAccounts.map(a => a.name),
    [visibleAccounts],
  );

  const hunterContacts = useMemo(
    () => (hunterAccount ? allContacts.filter(c => c.accountId === hunterAccount.id) : []),
    [hunterAccount],
  );
  const hunterDeals = useMemo(
    () => (hunterAccount ? allDeals.filter(d => d.accountName === hunterAccount.name) : []),
    [hunterAccount],
  );

  const [showGSyncAgent, setShowGSyncAgent] = useState(false);

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    if (view === 'accounts') setSelectedAccountId(null);
  };

  const isPipelineView = currentView === 'pipeline' || currentView === 'sequence-activity' || currentView === 'opportunities';

  const renderView = () => {
    switch (currentView) {
      case 'pipeline':
        return <PipelineGenScreen onLaunchHunter={setHunterAccount} />;
      case 'accounts':
        return selectedAccountId ? (
          <Account360 accountId={selectedAccountId} onBack={() => setSelectedAccountId(null)} />
        ) : (
          <AccountsDashboard onSelectAccount={setSelectedAccountId} onHunterCommand={setHunterAccount} />
        );
      case 'opportunities':
        return <OpportunitiesScreen />;
      case 'deals':
        return <DealWarRoom />;
      case 'quotes':
        return <QuoteBuilder />;
      case 'manager-insights':
        return <ManagerInsights />;
      case 'meetings':
        return <MeetingsManager onOpenAgent={() => setShowGSyncAgent(true)} />;
      case 'memory':
        return <MemoryAgent />;
      case 'memory-library':
        return <MemoryLibrary />;
      case 'users':
        return <UserManagementScreen />;
      case 'sequence-activity':
        return <SequenceActivity />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Lightbulb size={48} className="mb-4 opacity-20" />
            <p className="text-xl font-headline font-medium">Insights View Coming Soon</p>
          </div>
        );
    }
  };

  return (
    <AgentMemoryProvider>
    <DemoDataProvider>
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      <ImpersonationBanner />
      <TopNav currentView={currentView} onViewChange={handleViewChange} onHunterLaunch={setHunterAccount} />

      <div className="flex pt-16 min-h-screen">
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
        />

        <main className={`flex-1 lg:ml-72 bg-surface overflow-x-hidden${isPipelineView ? '' : ' p-6 lg:p-10'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {hunterAccount && (
            <HunterAgent
              account={hunterAccount}
              contacts={hunterContacts}
              deals={hunterDeals}
              territoryAccounts={territoryAccountNames}
              onClose={() => setHunterAccount(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showGSyncAgent && (
            <MeetingScheduler
              onClose={() => setShowGSyncAgent(false)}
              onViewDashboard={() => {
                setCurrentView('meetings');
                setShowGSyncAgent(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden z-50 rounded-t-3xl">
        {[
          { id: 'pipeline', icon: BarChart3, label: 'Pipeline' },
          { id: 'deals', icon: Handshake, label: 'Deals' },
          { id: 'quotes', icon: FileText, label: 'Quotes' },
          { id: 'accounts', icon: Users, label: 'Accounts' },
          { id: 'manager-insights', icon: Lightbulb, label: 'Insights' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => handleViewChange(item.id as View)}
            className={`flex flex-col items-center justify-center p-2 transition-all duration-200 ${
              currentView === item.id ? 'bg-cyan-600 text-white rounded-xl scale-110' : 'text-slate-400'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium text-[10px] uppercase tracking-wider font-label mt-1">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
    </DemoDataProvider>
    </AgentMemoryProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </QueryClientProvider>
  );
}
