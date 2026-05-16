import React, { useState, useEffect } from 'react';
import {
  Menu, Bell, ChevronDown, Zap, User, Settings, ArrowRight
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function Header({ toggleSidebar, onNavigate, userData, businessData, onLogout, setActiveTab }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const user = userData || {};
  const userEmail = businessData?.email || JSON.parse(localStorage.getItem('user') || '{}').email || 'owner@storename.com';
  const userName = user.name || JSON.parse(localStorage.getItem('user') || '{}').name || 'Store Owner';

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error("Unread count fetch error:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors"
        >
          <Menu size={22} />
        </button>
        
        {/* Main Logo in Header */}
        <div className="hidden lg:flex items-center">
           <img src="/manuen_square.png" alt="Icon" className="h-11 w-11 object-contain" />
           <img src="/manuen_logo.png" alt="Manuen" className="h-11 object-contain -ml-5" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${
              showNotifications ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Bell size={20} />
          </button>
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
          
          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>
        <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
        
        {/* Clickable Profile - Direct to Settings */}
        <div
          onClick={() => {
            setActiveTab('Settings');
            onNavigate('/settings');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{userName}</p>
            <p className="text-[10px] text-slate-500">{userEmail}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold shadow-lg group-hover:scale-105 transition-transform">
            {userName[0]}
          </div>
        </div>
      </div>
    </header>
  );
}
