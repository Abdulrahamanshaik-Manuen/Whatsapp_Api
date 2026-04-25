import React, { useState, useEffect } from 'react';
import {
  Search, Filter, MoreVertical, Download, ChevronDown, ChevronLeft, ChevronRight,
  CheckCircle2, AlertCircle, MessageSquare, Send, Clock, Calendar, Eye,
  ArrowUpRight, ArrowDownRight, Share2, Trash2, CheckSquare, Copy,
  RefreshCw, Info, ExternalLink, MoreHorizontal, LayoutPanelLeft, Bot, User,
  FileText, Image as ImageIcon, FileOutput, X, Globe, Zap, History, Database
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

// Mock Sparkline Data
const sparkData = [
  { val: 40 }, { val: 60 }, { val: 45 }, { val: 70 }, { val: 55 }, { val: 80 }, { val: 65 }
];

const initialLogs = [];

export default function MessageLogsPage() {
  const [logs, setLogs] = useState(initialLogs);
  const [selectedLog, setSelectedLog] = useState(null);
  const [directionFilter, setDirectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenDetails = (log) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === logs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(logs.map(log => log.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleResendFailed = () => {
    showToast("Resending failed messages...");
    setTimeout(() => {
      setLogs(prev => prev.map(log => log.status === 'Failed' ? { ...log, status: 'Pending', error: 'Retrying...' } : log));
      showToast("Retry initiated successfully!");
    }, 1500);
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    showToast(`Deleting ${selectedIds.length} logs...`);
    setTimeout(() => {
      setLogs(prev => prev.filter(log => !selectedIds.includes(log.id)));
      setSelectedIds([]);
      showToast("Logs deleted successfully.");
    }, 1000);
  };

  const handleExport = () => {
    showToast("Preparing log export...");
    setTimeout(() => {
      showToast("Log report downloaded successfully!");
    }, 1500);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         log.phone.includes(searchQuery) || 
                         log.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDirection = directionFilter === 'All' || log.direction === directionFilter;
    const matchesStatus = statusFilter === 'All Statuses' || log.status === statusFilter;
    const matchesType = typeFilter === 'All Types' || log.type === typeFilter;
    return matchesSearch && matchesDirection && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-8 z-[200] animate-in slide-in-from-top duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
            <Zap size={18} className="text-amber-400" />
            <span className="text-sm font-bold">{toast}</span>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-3">
        <div className="relative group">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
            <Download size={16} /> Export Logs <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by phone, message ID or content..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none"
          >
            <option>All Statuses</option>
            <option>Delivered</option>
            <option>Read</option>
            <option>Failed</option>
            <option>Pending</option>
          </select>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none"
          >
            <option>All Types</option>
            <option>Text</option>
            <option>Image</option>
            <option>Document</option>
            <option>Template</option>
          </select>
          <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200">
            {['All', 'Outbound', 'Inbound'].map((dir) => (
              <button 
                key={dir}
                onClick={() => setDirectionFilter(dir)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${directionFilter === dir ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {dir}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors">
            <Calendar size={16} className="text-slate-400" />
            <span>May 18, 2025 - May 24, 2025</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Success Rate', value: '1%', trend: '1%', isUp: true, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Error Volume', value: '1', trend: '1%', isUp: false, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Total Messages', value: '1', trend: '1%', isUp: true, icon: Database, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Avg. Delivery Time', value: '1s', trend: '0s', isUp: false, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'Messages Today', value: '1', trend: 'chart', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-default group">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon size={18} />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
            {stat.trend === 'chart' ? (
              <div className="h-8 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line type="monotone" dataKey="val" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className={`text-[10px] font-bold flex items-center gap-1 mt-2 ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend} <span className="text-slate-400">vs last 7 days</span>
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Table Actions Row */}
      <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors" onClick={toggleSelectAll}>
            <input 
              type="checkbox" 
              checked={selectedIds.length > 0 && selectedIds.length === logs.length}
              onChange={toggleSelectAll}
              className="rounded border-slate-300 pointer-events-none" 
            />
            <span>{selectedIds.length} Selected</span>
          </div>
          <button onClick={handleResendFailed} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all">
            <RefreshCw size={14} /> Resend Failed
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all">
            <Download size={14} /> Export Selected
          </button>
          <button onClick={() => showToast("Marking selected as read...")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all">
            <CheckSquare size={14} /> Mark as Read
          </button>
          <button onClick={handleDelete} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition-all rounded-lg border ${selectedIds.length > 0 ? 'text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100' : 'text-slate-300 border-slate-100 cursor-not-allowed'}`}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 cursor-pointer">
            <option>10 / page</option>
            <option>25 / page</option>
            <option>50 / page</option>
          </select>
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-md border border-slate-200"><ChevronLeft size={14} /></button>
            <button className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-md border border-slate-200"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Main Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4 w-10 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length > 0 && selectedIds.length === logs.length}
                    onChange={toggleSelectAll}
                    className="rounded" 
                  />
                </th>
                <th className="px-6 py-4 flex items-center gap-1 cursor-pointer hover:text-slate-800 transition-colors">Time <ChevronDown size={12} /></th>
                <th className="px-6 py-4">Direction</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Channel</th>
                <th className="px-6 py-4">Latency</th>
                <th className="px-6 py-4">Agent/Bot</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Database size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-500">No logs found matching your criteria.</p>
                      <button onClick={() => { setSearchQuery(''); setDirectionFilter('All'); setStatusFilter('All Statuses'); setTypeFilter('All Types'); }} className="text-xs font-bold text-blue-600 hover:underline">Clear all filters</button>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.map((log, i) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => handleOpenDetails(log)}>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(log.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(log.id); }}
                      className="rounded" 
                    />
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-slate-600 leading-tight">{log.time}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {log.direction === 'Outbound' ? 
                        <ArrowUpRight size={14} className="text-emerald-500" /> : 
                        <ArrowDownRight size={14} className="text-blue-500" />
                      }
                      <span className={`text-[11px] font-bold uppercase tracking-tight ${log.direction === 'Outbound' ? 'text-emerald-600' : 'text-blue-600'}`}>{log.direction}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">{log.recipient}</span>
                      <span className="text-[10px] text-slate-500">{log.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-600 truncate max-w-[180px] font-medium">{log.message}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      {log.type === 'Text' ? <FileText size={14} /> : log.type === 'Image' ? <ImageIcon size={14} /> : log.type === 'Document' ? <History size={14} /> : <Zap size={14} />}
                      <span className="text-xs font-bold text-slate-700">{log.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'Delivered' ? 'bg-emerald-500' : log.status === 'Read' ? 'bg-blue-500' : log.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                        <span className={`text-xs font-bold ${log.status === 'Delivered' ? 'text-emerald-600' : log.status === 'Read' ? 'text-blue-600' : log.status === 'Pending' ? 'text-amber-600' : 'text-rose-600'}`}>{log.status}</span>
                      </div>
                      {log.error && <span className="text-[10px] text-slate-400 font-medium">{log.error}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <MessageSquare size={12} fill="currentColor" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{log.latency}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{log.agent}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors"><Eye size={16} /></button>
                      <button onClick={(e) => { e.stopPropagation(); showToast("Opening options..."); }} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors"><MoreHorizontal size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
          <p className="text-xs font-medium text-slate-500">Showing {filteredLogs.length} entries</p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronLeft size={16} /></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-green-600 text-white font-bold text-xs shadow-md">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Message Details Drawer */}
      {isDrawerOpen && selectedLog && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-[450px] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800">Message Details</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Message ID Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message ID</span>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${selectedLog.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : selectedLog.status === 'Read' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'} text-[10px] font-bold`}>
                    <CheckCircle2 size={12} /> {selectedLog.status}
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl relative group">
                  <span className="text-[11px] font-medium text-slate-600 break-all leading-relaxed">{selectedLog.id}</span>
                  <button onClick={() => { navigator.clipboard.writeText(selectedLog.id); showToast("ID copied to clipboard!"); }} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-6 border-b border-slate-100">
                {['Overview', 'Timeline', 'Raw Data', 'Error Info'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${activeTab === tab ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 rounded-full"></div>}
                  </button>
                ))}
              </div>

              {activeTab === 'Overview' && (
                <>
                  {/* Message Preview */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message Preview</span>
                    <div className="bg-[#f0f2f5] p-6 rounded-3xl relative overflow-hidden">
                       <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '300px' }}></div>
                       <div className="relative z-10 bg-white p-4 rounded-2xl rounded-tr-sm shadow-sm max-w-[90%]">
                          <p className="text-sm text-slate-800 leading-relaxed font-medium">{selectedLog.message}</p>
                          <div className="flex items-center justify-end gap-1 mt-2">
                            <span className="text-[9px] text-slate-400 font-bold">{selectedLog.time.split(' ').slice(-2).join(' ')}</span>
                            <div className={`flex items-center ${selectedLog.status === 'Read' ? 'text-blue-500' : 'text-slate-400'}`}>
                              <CheckCircle2 size={12} />
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Message Information Grid */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message Information</span>
                    <div className="space-y-3">
                      {[
                        { label: 'Recipient', value: `${selectedLog.recipient} (${selectedLog.phone})`, isLink: true, icon: Globe },
                        { label: 'Direction', value: selectedLog.direction },
                        { label: 'Type', value: selectedLog.type },
                        { label: 'Channel', value: 'WhatsApp Business API' },
                        { label: 'Agent/Bot', value: selectedLog.agent },
                        { label: 'Template Name', value: selectedLog.template || 'N/A' },
                        { label: 'Sent Time', value: selectedLog.sentAt || selectedLog.time },
                        { label: 'Delivered Time', value: selectedLog.deliveredAt || '-' },
                        { label: 'Read Time', value: selectedLog.readAt || '-' },
                        { label: 'Latency', value: selectedLog.latency }
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm py-1 border-b border-slate-50 last:border-0">
                          <span className="text-slate-500 font-medium">{item.label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold ${item.isLink ? 'text-blue-600 hover:underline cursor-pointer' : 'text-slate-800'}`}>{item.value}</span>
                            {item.icon && <item.icon size={14} className="text-slate-400" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <button onClick={() => showToast("Retrying message dispatch...")} className="flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-xs border border-emerald-100 hover:bg-emerald-100 transition-all shadow-sm">
                      <RefreshCw size={16} /> Resend Message
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(selectedLog.id); showToast("ID copied!"); }} className="flex items-center justify-center gap-2 p-3 bg-slate-50 text-slate-600 rounded-2xl font-bold text-xs border border-slate-200 hover:bg-slate-100 transition-all shadow-sm">
                      <Copy size={16} /> Copy Message ID
                    </button>
                    <button onClick={() => showToast("Opening support ticket...")} className="flex items-center justify-center gap-2 p-3 bg-rose-50 text-rose-600 rounded-2xl font-bold text-xs border border-rose-100 hover:bg-rose-100 transition-all col-span-2 mt-2 shadow-sm">
                      <AlertCircle size={16} /> Report Issue
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'Timeline' && (
                <div className="space-y-8 py-4 px-2">
                   {[
                     { label: 'Accepted by WhatsApp', time: selectedLog.sentAt || selectedLog.time, desc: 'Message received by API Gateway', status: 'done' },
                     { label: 'Sent to Device', time: selectedLog.sentAt || selectedLog.time, desc: 'Message dispatched to user device', status: 'done' },
                     { label: 'Delivered', time: selectedLog.deliveredAt || '-', desc: 'User device received message', status: selectedLog.deliveredAt ? 'done' : 'pending' },
                     { label: 'Read by User', time: selectedLog.readAt || '-', desc: 'User opened the message chat', status: selectedLog.readAt ? 'done' : 'pending' },
                     { label: 'Replied', time: '-', desc: 'Waiting for user interaction', status: 'pending' }
                   ].map((step, i) => (
                     <div key={i} className="flex gap-4 relative">
                        {i !== 4 && <div className="absolute left-[15px] top-8 bottom-[-24px] w-0.5 bg-slate-100"></div>}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 border-white shadow-sm ${step.status === 'done' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {step.status === 'done' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                        </div>
                        <div className="flex-1 pb-4">
                           <div className="flex justify-between items-start mb-1">
                             <h4 className="text-sm font-black text-slate-800">{step.label}</h4>
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{step.time}</span>
                           </div>
                           <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
              )}

              {activeTab === 'Raw Data' && (
                <div className="bg-slate-900 rounded-2xl p-6 overflow-hidden shadow-xl border border-slate-800">
                   <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">JSON Response</span>
                      <button onClick={() => { navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2)); showToast("JSON copied!"); }} className="text-emerald-400 hover:text-white transition-colors"><Copy size={14} /></button>
                   </div>
                   <pre className="text-[11px] text-emerald-400 font-mono leading-relaxed overflow-x-auto custom-scrollbar">
{JSON.stringify({
  messaging_product: "whatsapp",
  to: selectedLog.phone,
  type: selectedLog.type.toLowerCase(),
  status: selectedLog.status.toLowerCase(),
  id: selectedLog.id,
  metadata: {
    agent: selectedLog.agent,
    latency: selectedLog.latency,
    timestamp: selectedLog.time
  }
}, null, 2)}
                   </pre>
                </div>
              )}

              {activeTab === 'Error Info' && (
                <div className="space-y-6">
                  {selectedLog.status === 'Failed' ? (
                    <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl space-y-4">
                       <div className="flex items-center gap-3 text-rose-600">
                          <AlertCircle size={24} />
                          <h4 className="font-black text-lg">Error: {selectedLog.error}</h4>
                       </div>
                       <p className="text-sm text-slate-600 font-medium leading-relaxed">
                         The message could not be delivered because the provided phone number is not registered on WhatsApp. Please verify the number and try again.
                       </p>
                       <div className="pt-4 space-y-2">
                          <p className="text-xs font-bold text-slate-400 uppercase">Error Code</p>
                          <code className="block p-2 bg-white border border-rose-100 rounded-lg text-rose-600 font-mono text-xs">131030: PHONE_NUMBER_NOT_REGISTERED</code>
                       </div>
                    </div>
                  ) : (
                    <div className="p-10 text-center space-y-4">
                       <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
                          <CheckCircle2 size={32} />
                       </div>
                       <h4 className="font-bold text-slate-800">No Issues Detected</h4>
                       <p className="text-sm text-slate-500">This message was delivered successfully without any errors.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
