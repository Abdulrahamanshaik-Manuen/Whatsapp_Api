import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DashboardContent from '../components/DashboardContent';
import CampaignsPage from './CampaignsPage';
import MessagesPage from './MessagesPage';
import InboxPage from './InboxPage';
import TemplatesPage from './TemplatesPage';
import ContactsPage from './ContactsPage';
import AutomationPage from './AutomationPage';
import AnalyticsPage from './AnalyticsPage';
import WhatsAppSetupPage from './WhatsAppSetupPage';
import BillingPage from './BillingPage';
import SettingsPage from './SettingsPage';
import GroupsPage from './GroupsPage';

const tabPathMap = {
  'Dashboard': '/dashboard',
  'Campaigns': '/campaigns',
  'Contacts': '/contacts',
  'Messages': '/messages',
  'Message History': '/history',
  'Analytics': '/analytics',
  'Templates': '/templates',
  'Automations': '/automations',
  'WhatsApp Setup': '/setup',
  'Billing & Plan': '/billing',
  'Settings': '/settings',
  'Groups': '/groups'
};

const pathToTabMap = Object.fromEntries(
  Object.entries(tabPathMap).map(([tab, path]) => [path, tab])
);

export default function DashboardPage({ onNavigate, initialPath }) {

  const [activeTab, setActiveTab] = useState(() => {
    if (initialPath && pathToTabMap[initialPath]) {
      return pathToTabMap[initialPath];
    }
    return localStorage.getItem('activeDashboardTab') || 'Dashboard';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [businessData, setBusinessData] = useState(null);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUserData(data.user);
        setBusinessData(data.business);
      }
    } catch (err) {
      console.error("Fetch User Data Error:", err);
    }
  };

  useEffect(() => {
    if (initialPath && pathToTabMap[initialPath]) {
      const targetTab = pathToTabMap[initialPath];
      if (targetTab !== activeTab) {
        setActiveTab(targetTab);
      }
    }
  }, [initialPath, activeTab]);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    localStorage.setItem('activeDashboardTab', activeTab);

    // Update URL if it doesn't match the current tab
    const targetPath = tabPathMap[activeTab];
    if (targetPath && window.location.pathname !== targetPath) {
      onNavigate(targetPath);
    }
  }, [activeTab, onNavigate]);

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

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onNavigate={onNavigate}
      />

      <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
        <Header toggleSidebar={toggleSidebar} onNavigate={onNavigate} />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {activeTab === 'Dashboard' ? (
            <DashboardContent
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onNavigate={onNavigate}
              userData={userData}
              businessData={businessData}
            />
          ) : activeTab === 'Campaigns' ? (
            <CampaignsPage onNavigate={onNavigate} />
          ) : activeTab === 'Messages' ? (
            <InboxPage />
          ) : activeTab === 'Message History' ? (
            <MessagesPage />
          ) : activeTab === 'Templates' ? (
            <TemplatesPage />
          ) : activeTab === 'Contacts' ? (
            <ContactsPage />
          ) : activeTab === 'Automations' ? (
            <AutomationPage />
          ) : activeTab === 'Analytics' ? (
            <AnalyticsPage />
          ) : activeTab === 'WhatsApp Setup' ? (
            <WhatsAppSetupPage userData={userData} onUpdate={fetchUserData} />
          ) : activeTab === 'Billing & Plan' ? (
            <BillingPage userData={userData} />
          ) : activeTab === 'Settings' ? (
            <SettingsPage
              userData={userData}
              businessData={businessData}
              onUpdate={fetchUserData}
            />
          ) : activeTab === 'Groups' ? (
            <GroupsPage />
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
                Back to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
