
import React from 'react';
import { LayoutDashboard, Vote, ShieldCheck, Cpu, Database, Settings } from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'vote', icon: Vote, label: 'Cast Vote' },
    { id: 'audit', icon: ShieldCheck, label: 'Contract Auditor' },
    { id: 'architect', icon: Cpu, label: 'AI Architect' },
    { id: 'ledger', icon: Database, label: 'Verify Ledger' },
  ] as const;

  return (
    <div className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col fixed left-0 top-0 z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Database size={24} />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg tracking-tight">ChainVote</h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Enterprise v2.0</p>
        </div>
      </div>

      <nav className="flex-1 mt-4 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === item.id 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} className={currentView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-colors">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
