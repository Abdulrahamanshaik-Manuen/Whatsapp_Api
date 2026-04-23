import React, { useState } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Send,
  LayoutTemplate,
  Bot,
  Users,
  BarChart2,
  FileText,
  Webhook,
  KeyRound,
  CreditCard,
  Settings,
  Users2,
  Blocks,
  HelpCircle,
  Bell,
  ChevronDown,
  TrendingUp,
  CheckCircle2,
  Eye,
  MessageCircle,
  Wallet,
  Plus,
  Check,
  Clock,
  XCircle,
  Info,
  PenSquare,
  ChevronRight,
  Code2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import InboxPage from './InboxPage';
import CampaignPage from './CampaignPage';
import TemplateEditor from './TemplateEditor';

const chartData = [
  { name: '12 May', sent: 5800, delivered: 4000, read: 2500, received: 1500 },
  { name: '13 May', sent: 8000, delivered: 6000, read: 3900, received: 2800 },
  { name: '14 May', sent: 7200, delivered: 5000, read: 1800, received: 1500 },
  { name: '15 May', sent: 5900, delivered: 4000, read: 2500, received: 2400 },
  { name: '16 May', sent: 7600, delivered: 5400, read: 2500, received: 2400 },
  { name: '17 May', sent: 6300, delivered: 4500, read: 1800, received: 1200 },
  { name: '18 May', sent: 8200, delivered: 6000, read: 3500, received: 2500 },
];

export default function UserPage({ activePath, onNavigate }) {
  const [activeTab, setActiveTab] = useState('/dashboard');

  const navItemsMain = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', active: true },
    { name: 'Inbox', icon: MessageSquare, path: '/inbox', badge: 12 },
    { name: 'Campaigns', icon: Send, path: '/campaigns' },
    { name: 'Templates', icon: LayoutTemplate, path: '/templates' },
    { name: 'Automation', icon: Bot, path: '/automation' },
    { name: 'Contacts', icon: Users, path: '/contacts' },
    { name: 'Analytics', icon: BarChart2, path: '/analytics' },
    { name: 'Message Logs', icon: FileText, path: '/logs' },
  ];

  const navItemsDev = [
    { name: 'API & Webhooks', icon: Webhook, path: '/webhooks' },
    { name: 'API Keys', icon: KeyRound, path: '/keys' },
  ];

  const navItemsAccount = [
    { name: 'Billing', icon: CreditCard, path: '/billing' },
    { name: 'Settings', icon: Settings, path: '/settings' },
    { name: 'Team', icon: Users2, path: '/team' },
    { name: 'Integrations', icon: Blocks, path: '/integrations' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-[260px] bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 h-full overflow-y-auto hidden md:flex">
        <div className="p-5 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
            <MessageSquare size={20} />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight">YourBrand</h1>
            <p className="text-xs text-slate-400">WhatsApp API</p>
          </div>
        </div>

        <div className="flex-1 px-3 py-4 space-y-6">
          <div>
            <p className="px-3 text-xs font-semibold text-slate-500 mb-2">MAIN</p>
            <div className="space-y-1">
              {navItemsMain.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${item.active
                      ? 'bg-emerald-900/40 text-emerald-400'
                      : 'hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={item.active ? 'text-emerald-400' : 'text-slate-400'} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="px-3 text-xs font-semibold text-slate-500 mb-2">DEVELOPER</p>
            <div className="space-y-1">
              {navItemsDev.map((item) => (
                <button
                  key={item.name}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <item.icon size={18} className="text-slate-400" />
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="px-3 text-xs font-semibold text-slate-500 mb-2">ACCOUNT</p>
            <div className="space-y-1">
              {navItemsAccount.map((item) => (
                <button
                  key={item.name}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <item.icon size={18} className="text-slate-400" />
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Bottom */}
        <div className="p-4 m-3 bg-slate-800 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-700 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-sm">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-white">Amit Sharma</p>
              <p className="text-xs text-slate-400">Business Plan</p>
            </div>
          </div>
          <ChevronDown size={16} className="text-slate-400" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            {activeTab === '/inbox' ? (
              <>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  Inbox
                </h2>
                <p className="text-slate-500 text-sm mt-1">Manage all your WhatsApp conversations in one place</p>
              </>
            ) : activeTab === '/campaigns' ? (
              <>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  Campaigns
                </h2>
                <p className="text-slate-500 text-sm mt-1">Manage and track your WhatsApp broadcast campaigns</p>
              </>
            ) : activeTab === '/templates' ? (
              <>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  Template Editor
                </h2>
                <p className="text-slate-500 text-sm mt-1">Design and preview your WhatsApp message templates</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  Welcome back, Amit <span className="text-2xl">👋</span>
                </h2>
                <p className="text-slate-500 text-sm mt-1">Here's what's happening with your WhatsApp Business.</p>
              </>
            )}
          </div>

          <div className="flex items-center gap-6">
            {activeTab === '/inbox' ? (
              <div className="hidden lg:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-none mb-1">All Systems</p>
                    <p className="text-[10px] text-slate-500 leading-none">Operational</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50/50 text-green-700 shadow-sm">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span className="text-sm font-semibold">WhatsApp Connected</span>
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">My Business</p>
                  <p className="text-xs text-slate-500">+91 98765 43210</p>
                </div>
                <ChevronDown size={16} className="text-slate-400 ml-2" />
              </div>
            )}

            <div className="flex items-center gap-4">
              <button className="text-slate-400 hover:text-slate-600 transition-colors">
                <HelpCircle size={20} />
              </button>
              <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
                <Bell size={20} />
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 border-2 border-white rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold shadow-sm cursor-pointer border border-slate-300">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className={`flex-1 overflow-y-auto ${activeTab === '/inbox' ? 'p-6 bg-slate-50/50' : 'p-8'}`}>
          {activeTab === '/inbox' ? (
            <InboxPage />
          ) : activeTab === '/campaigns' ? (
            <CampaignPage />
          ) : activeTab === '/templates' ? (
            <TemplateEditor />
          ) : (
            <div className={`max-w-7xl mx-auto space-y-6 ${activeTab !== '/dashboard' ? 'hidden' : ''}`}>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Stat 1 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-4 text-green-500">
                  <Send size={20} />
                </div>
                <p className="text-slate-500 text-sm font-medium">Messages Sent</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">25,680</h3>
                <p className="text-emerald-500 text-xs flex items-center gap-1 mt-2 font-medium">
                  <TrendingUp size={12} /> 12.5%
                </p>
                <p className="text-slate-400 text-xs mt-1">vs last 7 days</p>
              </div>

              {/* Stat 2 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 text-blue-500">
                  <CheckCircle2 size={20} />
                </div>
                <p className="text-slate-500 text-sm font-medium">Delivered</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">24,312</h3>
                <p className="text-emerald-500 text-xs flex items-center gap-1 mt-2 font-medium">
                  94.67%
                </p>
                <p className="text-slate-400 text-xs mt-1">vs last 7 days</p>
              </div>

              {/* Stat 3 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-4 text-purple-500">
                  <Eye size={20} />
                </div>
                <p className="text-slate-500 text-sm font-medium">Read</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">18,721</h3>
                <p className="text-emerald-500 text-xs flex items-center gap-1 mt-2 font-medium">
                  72.68%
                </p>
                <p className="text-slate-400 text-xs mt-1">vs last 7 days</p>
              </div>

              {/* Stat 4 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-4 text-amber-500">
                  <MessageCircle size={20} />
                </div>
                <p className="text-slate-500 text-sm font-medium">Received</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">8,542</h3>
                <p className="text-emerald-500 text-xs flex items-center gap-1 mt-2 font-medium">
                  <TrendingUp size={12} /> 8.3%
                </p>
                <p className="text-slate-400 text-xs mt-1">vs last 7 days</p>
              </div>

              {/* Stat 5 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center mb-4 text-rose-500">
                  <Users size={20} />
                </div>
                <p className="text-slate-500 text-sm font-medium">Active Contacts</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">6,842</h3>
                <p className="text-emerald-500 text-xs flex items-center gap-1 mt-2 font-medium">
                  <TrendingUp size={12} /> 10.2%
                </p>
                <p className="text-slate-400 text-xs mt-1">vs last 7 days</p>
              </div>

              {/* Stat 6 */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-4 text-indigo-500">
                  <Wallet size={20} />
                </div>
                <p className="text-slate-500 text-sm font-medium">Wallet Balance</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">₹2,450.00</h3>
                <button className="mt-3 flex items-center justify-center gap-1 w-full py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                  <Plus size={14} /> Add Funds
                </button>
              </div>
            </div>

            {/* Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Chart */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Message Summary</h3>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-slate-50">
                    <span className="text-sm text-slate-600 font-medium">Last 7 Days</span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </div>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `${val / 1000}K`} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Line type="monotone" dataKey="sent" name="Sent" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="delivered" name="Delivered" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="read" name="Read" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                      <Line type="monotone" dataKey="received" name="Received" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b', strokeWidth: 2 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-3 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800">WhatsApp Business Profile</h3>
                  <button className="px-3 py-1 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    Edit
                  </button>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-400 text-white flex items-center justify-center text-xl font-bold">
                    MB
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">My Business</h4>
                    <p className="text-sm text-slate-500">+91 98765 43210</p>
                  </div>
                  <div className="ml-auto bg-green-50 text-green-600 text-xs font-semibold px-2 py-1 rounded-md">
                    Connected
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Business ID</p>
                    <p className="text-sm font-medium text-slate-800">178901234567890</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">WhatsApp Business Account ID</p>
                    <p className="text-sm font-medium text-slate-800">123456789012345</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
                      <CheckCircle2 size={14} className="text-green-500" />
                      <span className="text-xs font-semibold text-green-700">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Notifications */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-3 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800">Recent Notifications</h3>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    View All
                  </button>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={16} className="text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">Template "Order_Confirmation"</p>
                      <p className="text-xs text-slate-500">Approved</p>
                    </div>
                    <span className="text-xs text-slate-400">2h ago</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock size={16} className="text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">Template "New_Arrival"</p>
                      <p className="text-xs text-slate-500">Pending Approval</p>
                    </div>
                    <span className="text-xs text-slate-400">5h ago</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <XCircle size={16} className="text-red-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">Template "Discount_Offer"</p>
                      <p className="text-xs text-slate-500">Rejected</p>
                    </div>
                    <span className="text-xs text-slate-400">1d ago</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Info size={16} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">WhatsApp number quality update</p>
                      <p className="text-xs text-slate-500">Your number quality is now High</p>
                    </div>
                    <span className="text-xs text-slate-400">2d ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Campaign Overview */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Campaign Overview</h3>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="pb-3 text-sm font-semibold text-slate-500">Campaign Name</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500">Status</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500 text-right">Sent</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500 text-right">Delivered</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500 text-right">Read</th>
                        <th className="pb-3 text-sm font-semibold text-slate-500 text-right">CTR</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-slate-50">
                        <td className="py-4 font-medium text-slate-800">New Collection Launch</td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Sent
                          </span>
                        </td>
                        <td className="py-4 text-right text-slate-600">5,230</td>
                        <td className="py-4 text-right text-slate-600">4,975</td>
                        <td className="py-4 text-right text-slate-600">3,542</td>
                        <td className="py-4 text-right font-medium text-slate-800">12.45%</td>
                      </tr>
                      <tr className="border-b border-slate-50">
                        <td className="py-4 font-medium text-slate-800">Weekend Offer</td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Scheduled
                          </span>
                        </td>
                        <td className="py-4 text-right text-slate-400">-</td>
                        <td className="py-4 text-right text-slate-400">-</td>
                        <td className="py-4 text-right text-slate-400">-</td>
                        <td className="py-4 text-right text-slate-400">-</td>
                      </tr>
                      <tr className="border-b border-slate-50">
                        <td className="py-4 font-medium text-slate-800">Customer Feedback</td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Completed
                          </span>
                        </td>
                        <td className="py-4 text-right text-slate-600">2,340</td>
                        <td className="py-4 text-right text-slate-600">2,250</td>
                        <td className="py-4 text-right text-slate-600">1,782</td>
                        <td className="py-4 text-right font-medium text-slate-800">9.21%</td>
                      </tr>
                      <tr>
                        <td className="py-4 font-medium text-slate-800">Festive Season Sale</td>
                        <td className="py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Completed
                          </span>
                        </td>
                        <td className="py-4 text-right text-slate-600">8,750</td>
                        <td className="py-4 text-right text-slate-600">8,120</td>
                        <td className="py-4 text-right text-slate-600">6,341</td>
                        <td className="py-4 text-right font-medium text-slate-800">15.67%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 lg:col-span-4 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <button className="flex flex-col items-center justify-center gap-3 p-4 border border-slate-100 rounded-xl hover:border-green-200 hover:bg-green-50/50 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                      <Send size={20} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Create Campaign</span>
                  </button>

                  <button className="flex flex-col items-center justify-center gap-3 p-4 border border-slate-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/50 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                      <LayoutTemplate size={20} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Send Template</span>
                  </button>

                  <button className="flex flex-col items-center justify-center gap-3 p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <Users size={20} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Add Contacts</span>
                  </button>

                  <button className="flex flex-col items-center justify-center gap-3 p-4 border border-slate-100 rounded-xl hover:border-amber-200 hover:bg-amber-50/50 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                      <PenSquare size={20} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Create Template</span>
                  </button>

                  <button className="flex flex-col items-center justify-center gap-3 p-4 border border-slate-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                      <MessageCircle size={20} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 text-center">Chat with Contact</span>
                  </button>

                  <button className="flex flex-col items-center justify-center gap-3 p-4 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                      <Code2 size={20} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 text-center">API Documentation</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
          )}
        </main>
      </div>
    </div>
  );
}
