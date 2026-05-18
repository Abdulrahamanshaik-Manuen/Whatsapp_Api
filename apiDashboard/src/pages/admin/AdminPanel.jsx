import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import Header from '../../components/Header';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import TemplateRequests from './TemplateRequests';
import AutomationHub from './AutomationHub';
import AdminBilling from './AdminBilling';
import AdminSettings from './AdminSettings';
import AdminCreateTemplate from './AdminCreateTemplate';
import AdminMessageLogs from './AdminMessageLogs';
import AutomationBuilder from '../AutomationBuilder';

const adminTabPathMap = {
  'Dashboard': '/admin',
  'User Management': '/admin/users',
  'Template Requests': '/admin/templates',
  'Automation Hub': '/admin/automations',
  'Automation Builder': '/automations/builder',
  'Message Logs': '/admin/logs',
  'Billing & Subscriptions': '/admin/billing',
  'System Settings': '/admin/settings',
  'Create Template': '/admin/templates/create'
};

const pathToTabMap = Object.fromEntries(
  Object.entries(adminTabPathMap).map(([tab, path]) => [path, tab])
);

export default function AdminPanel({ onNavigate, initialPath }) {
  const [activeTab, setActiveTab] = useState(() => {
    if (initialPath && pathToTabMap[initialPath]) {
      return pathToTabMap[initialPath];
    }
    return localStorage.getItem('activeAdminTab') || 'Dashboard';
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [selectedAutomationData, setSelectedAutomationData] = useState(() => {
    const saved = localStorage.getItem('selectedAutomationData');
    return saved ? JSON.parse(saved) : null;
  });

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setAdminData(data.user);
        if (data.user.role !== 'admin') {
            onNavigate('/dashboard'); // Kick out if not admin
        }
      } else {
          onNavigate('/login');
      }
    } catch (err) {
      console.error("Fetch Admin Data Error:", err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (initialPath && pathToTabMap[initialPath]) {
      const targetTab = pathToTabMap[initialPath];
      if (targetTab !== activeTab) {
        setActiveTab(targetTab);
      }
    }
  }, [initialPath, activeTab]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    if (adminTabPathMap[tabName]) {
      onNavigate(adminTabPathMap[tabName]);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-[#F5F7FA] font-['Inter',_sans-serif] overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onNavigate={onNavigate}
        userData={adminData}
      />

      <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
        {activeTab !== 'Automation Builder' && <Header toggleSidebar={toggleSidebar} onNavigate={onNavigate} setActiveTab={handleTabChange} />}

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {activeTab === 'Dashboard' ? (
            <AdminDashboard onNavigate={onNavigate} />
          ) : activeTab === 'User Management' ? (
            <UserManagement />
          ) : activeTab === 'Template Requests' ? (
            <TemplateRequests onNavigateCreate={() => handleTabChange('Create Template')} />
          ) : activeTab === 'Automation Hub' ? (
            <AutomationHub onNavigate={(path, data) => {
              if (path === '/automations/builder') {
                if (data) {
                  localStorage.setItem('selectedAutomationData', JSON.stringify(data));
                  setSelectedAutomationData(data);
                } else {
                  localStorage.removeItem('selectedAutomationData');
                  setSelectedAutomationData(null);
                }
                setActiveTab('Automation Builder');
              }
              onNavigate(path);
            }} />
          ) : activeTab === 'Automation Builder' ? (
            <AutomationBuilder 
              automation={selectedAutomationData}
              onClose={() => {
                localStorage.removeItem('selectedAutomationData');
                setSelectedAutomationData(null);
                setActiveTab('Automation Hub');
                onNavigate('/admin/automations');
              }} 
            />
          ) : activeTab === 'Billing & Subscriptions' ? (
            <AdminBilling />
          ) : activeTab === 'System Settings' ? (
            <AdminSettings />
          ) : activeTab === 'Create Template' ? (
            <AdminCreateTemplate onBack={() => handleTabChange('Template Requests')} />
          ) : activeTab === 'Message Logs' ? (
            <AdminMessageLogs />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white h-full">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                <div className="animate-pulse font-black text-2xl">?</div>
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">{activeTab}</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Coming Soon</p>
              <button
                onClick={() => setActiveTab('Dashboard')}
                className="mt-6 text-primary text-sm font-bold hover:underline"
              >
                Back to Admin Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
