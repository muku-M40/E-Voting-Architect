
import React from 'react';
import { LayoutDashboard, Vote, ShieldCheck, Cpu, Database, Settings, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { ViewType, User } from '../types';

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onLogout }) => {
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

      <div className="mt-auto border-t border-slate-800">
        {user && (
          <div className="p-4 bg-slate-900/50">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  {user.type === 'web3' ? <Shield size={16} /> : <UserIcon size={16} />}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active {user.type === 'web3' ? 'Wallet' : 'Account'}</p>
                  <p className="text-xs font-bold text-white truncate">{user.identifier}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Authorized</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                <Settings size={18} />
                Profile Settings
              </button>
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 rounded-lg transition-all text-sm font-bold"
              >
                <LogOut size={18} />
                Disconnect Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
