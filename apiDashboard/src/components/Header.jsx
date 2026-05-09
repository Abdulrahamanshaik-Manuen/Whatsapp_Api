import React, { useState } from 'react';
import {
  Menu, Bell, ChevronDown, Zap, User, Settings, ArrowRight
} from 'lucide-react';

export default function Header({ toggleSidebar, onNavigate }) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onNavigate) onNavigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors"
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            {getGreeting()}, {user.name?.split(' ')[0] || 'Venishetty'}
          </h2>
          <p className="text-slate-500 text-[10px] md:text-[11px] font-bold uppercase tracking-widest leading-none mt-1 opacity-60">Here's what's happening today.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100">
          <Zap size={16} fill="currentColor" />
          Upgrade Plan
        </button>
        <div className="relative">
          <button className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-all">
            <Bell size={20} />
          </button>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </div>
        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
        <div className="relative">
          <div
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{user.name || 'Store Owner'}</p>
              <p className="text-[10px] text-slate-500">{user.email || 'owner@storename.com'}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold shadow-lg group-hover:scale-105 transition-transform">
              {(user.name || 'S')[0]}
            </div>
            <ChevronDown size={16} className={`text-slate-400 group-hover:text-slate-600 transition-all duration-300 ${userDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/50 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => setUserDropdownOpen(false)}
                className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
              >
                <User size={16} className="text-slate-400" /> My Profile
              </button>
              <button
                onClick={() => setUserDropdownOpen(false)}
                className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
              >
                <Settings size={16} className="text-slate-400" /> Account Settings
              </button>
              <div className="h-[1px] bg-slate-100 my-1 mx-2"></div>
              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full px-4 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <ArrowRight size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
