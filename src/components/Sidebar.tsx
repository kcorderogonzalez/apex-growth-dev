import React from 'react';
import {
  BarChart3,
  Handshake,
  FileText,
  Users,
  Lightbulb,
  HelpCircle,
  Zap,
  Sparkles,
  LayoutDashboard,
  Calendar,
  Brain,
  ShieldCheck,
  BookOpen,
  Play,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { View } from '@/src/types';
import { motion } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { user, logout, impersonating, returnToAdmin } = useAuth();
  const handleSignOut = impersonating ? returnToAdmin : logout;

  const navItems = [
    { id: 'pipeline', label: 'Pipeline', icon: BarChart3 },
    { id: 'deals', label: 'Deals', icon: Handshake },
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'accounts', label: 'Accounts', icon: Users },
    { id: 'meetings', label: 'Meetings Manager', icon: Calendar },
    { id: 'sequence-activity', label: 'Sequence Activity', icon: Play },
    { id: 'manager-insights', label: 'Manager Insights', icon: Lightbulb },
    { id: 'memory', label: 'Agent Memory', icon: Brain },
    ...(user?.role === 'admin' || user?.role === 'ops'
      ? [{ id: 'memory-library' as const, label: 'Memory Library', icon: BookOpen }]
      : []),
    ...(user?.role === 'admin' || user?.role === 'rsm'
      ? [{ id: 'users' as const, label: 'User Management', icon: ShieldCheck }]
      : []),
  ];

  return (
    <aside className="hidden md:flex flex-col h-[calc(100vh-64px)] w-72 fixed left-0 py-8 px-4 bg-slate-50 dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800">
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary-container flex items-center justify-center">
            <Zap className="text-on-primary-container fill-current" size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-cyan-800 dark:text-cyan-200 font-headline leading-tight">Apex AI</h2>
            <p className="text-[10px] text-slate-500 font-label tracking-tight uppercase">Proactive Sales Intelligence</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as View)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
              currentView === item.id 
                ? "bg-cyan-100/50 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-100 border-r-4 border-cyan-600 scale-[0.98]" 
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
            )}
          >
            <item.icon size={20} />
            <span className={cn("text-sm", currentView === item.id ? "font-semibold" : "font-medium")}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
        {user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{user.full_name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>
        )}
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors">
          <HelpCircle size={20} />
          <span className="text-sm font-medium">Help Center</span>
        </button>
        {user && (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Zap size={20} className="opacity-50" />
            <span className="text-sm font-medium">{impersonating ? 'Return to Admin' : 'Sign Out'}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
