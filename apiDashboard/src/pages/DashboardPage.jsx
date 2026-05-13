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

import WhatsAppSetupPage from './WhatsAppSetupPage';
import BillingPage from './BillingPage';
import SettingsPage from './SettingsPage';
import GroupsPage from './GroupsPage';
import CreateTemplatePage from './CreateTemplatePage';
import TemplateDetailsPage from './TemplateDetailsPage';
import CreateCampaignPage from './CreateCampaignPage';
import AutomationBuilder from './AutomationBuilder';

const tabPathMap = {
  'Dashboard': '/dashboard',
  'Campaigns': '/campaigns',
  'Contacts': '/contacts',
  'Messages': '/messages',
  'Message History': '/history',

  'Templates': '/templates',
  'Automations': '/automations',
  'Automation Builder': '/automations/builder',
  'WhatsApp Setup': '/setup',
  'Billing & Plan': '/billing',
  'Settings': '/settings',
  'Groups': '/groups',
  'Create Template': '/templates/create',
  'Template Details': '/templates/view',
  'Create Campaign': '/campaigns/create'
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
  const [selectedTemplateData, setSelectedTemplateData] = useState(() => {
    const saved = localStorage.getItem('selectedTemplateData');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedAutomationData, setSelectedAutomationData] = useState(() => {
    const saved = localStorage.getItem('selectedAutomationData');
    return saved ? JSON.parse(saved) : null;
  });

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

    const normalize = p => p?.replace(/\/+$/, '') || '';
    const targetPath = tabPathMap[activeTab];
    const currentPath = normalize(window.location.pathname);
    
    console.log('[Dashboard] Tab Sync:', { activeTab, targetPath, currentPath });

    if (targetPath && normalize(targetPath) !== currentPath) {
      console.log('[Dashboard] Navigating to:', targetPath);
      // onNavigate(targetPath);
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
        userData={userData}
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
          ) : activeTab === 'Create Campaign' ? (
            <CreateCampaignPage onNavigate={onNavigate} />
          ) : activeTab === 'Messages' ? (
            <InboxPage />
          ) : activeTab === 'Message History' ? (
            <MessagesPage />
          ) : activeTab === 'Templates' ? (
            <TemplatesPage onNavigate={(path, data) => {
              if (path === '/templates/view') {
                localStorage.setItem('selectedTemplateData', JSON.stringify(data));
                setSelectedTemplateData(data);
                setActiveTab('Template Details');
                onNavigate(path);
              } else {
                onNavigate(path);
              }
            }} />
          ) : activeTab === 'Template Details' ? (
            <TemplateDetailsPage 
              template={selectedTemplateData} 
              onBack={() => {
                localStorage.removeItem('selectedTemplateData');
                setSelectedTemplateData(null);
                setActiveTab('Templates');
                onNavigate('/templates');
              }} 
            />
          ) : activeTab === 'Contacts' ? (
            <ContactsPage onNavigate={onNavigate} setActiveTab={setActiveTab} userData={userData} />
          ) : activeTab === 'Automations' ? (
            <AutomationPage onNavigate={(path, data) => {
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
                setActiveTab('Automations');
                onNavigate('/automations');
              }} 
            />
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
          ) : activeTab === 'Create Template' ? (
            <CreateTemplatePage onNavigate={onNavigate} />
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
