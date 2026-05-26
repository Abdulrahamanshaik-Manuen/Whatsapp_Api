import React, { useState, useEffect } from 'react';
import {
  Search, MessageSquare,
  Clock, CheckCircle2, XCircle, RefreshCw,
  ChevronLeft, ChevronRight, Eye,
  Database, Plus, ExternalLink, Globe
} from 'lucide-react';

const StatCard = ({ label, value, color, icon: Icon, trend }) => {
  const bgColors = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary text-white shadow-lg shadow-secondary/20',
    blue: 'bg-blue-500/10 text-blue-600',
    purple: 'bg-purple-500/10 text-purple-600',
    orange: 'bg-orange-500/10 text-orange-600',
    amber: 'bg-amber-500/10 text-amber-600',
    rose: 'bg-rose-500/10 text-rose-600',
    emerald: 'bg-emerald-500/10 text-emerald-600',
    slate: 'bg-slate-500/10 text-slate-600',
  };
  const lineColors = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    emerald: 'bg-emerald-500',
    slate: 'bg-slate-500',
  };

  return (
    <div className="bg-white p-4 md:p-5 rounded-[1.25rem] border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden group">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 flex-shrink-0 ${bgColors[color] || bgColors.primary} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div className="space-y-0.5 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-black text-primary truncate">{value}</h3>
            {trend && (
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-0 ${lineColors[color] || lineColors.primary} opacity-20 group-hover:w-full transition-all duration-500`}></div>
    </div>
  );
};

export default function TemplateRequests({ onNavigateCreate }) {
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('admin_templates_data');
  });
  const [data, setData] = useState(() => {
    const cached = localStorage.getItem('admin_templates_data');
    return cached ? JSON.parse(cached) : { templates: [], stats: { total: 0, pending: 0, approved: 0, rejected: 0, disabled: 0 } };
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/admin/templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok) {
        setData(result);
        localStorage.setItem('admin_templates_data', JSON.stringify(result));
      }
    } catch (err) {
      console.error("Fetch Templates Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (templateId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/admin/templates/${templateId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        // If approved, automatically trigger Meta submission
        if (newStatus === 'approved') {
          await handleSubmitToMeta(templateId);
        } else {
          fetchTemplates();
          setShowReviewModal(false);
        }
      }
    } catch (err) {
      console.error("Status Change Error:", err);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitToMeta = async (templateId) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/admin/templates/${templateId}/submit-meta`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchTemplates();
        setShowReviewModal(false);
      }
    } catch (err) {
      console.error("Meta Submission Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTemplates = data.templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.wabaId?.includes(searchQuery);
    
    let matchesStatus = statusFilter === 'All';
    if (!matchesStatus) {
      const s = t.status.toLowerCase();
      if (statusFilter === 'Admin Pending') matchesStatus = s === 'pending_admin_approval';
      else if (statusFilter === 'Meta Pending') matchesStatus = s === 'pending_meta_approval';
      else matchesStatus = s.includes(statusFilter.toLowerCase());
    }
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => b.id.localeCompare(a.id));

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar pb-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-primary tracking-tight">Template Requests</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Review and manage WhatsApp template requests from all clients</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={fetchTemplates}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Sync Meta</span>
            </button>
            <button
              onClick={onNavigateCreate}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-primary-light transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Create Template</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard label="Total Requests" value={data.stats.total} color="primary" icon={MessageSquare} />
          <StatCard label="Pending Review" value={data.stats.pending} color="orange" icon={Clock} />
          <StatCard label="Approved" value={data.stats.approved} color="secondary" icon={CheckCircle2} />
          <StatCard label="Rejected" value={data.stats.rejected} color="rose" icon={XCircle} />
        </div>

        {/* Filters & Table Card */}
        <div className="bg-white rounded-2xl md:rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, client, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
              {['All', 'Admin Pending', 'Meta Pending', 'Approved', 'Rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap min-w-[120px] text-center ${statusFilter === status
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-slate-50 w-full"></div>

          {/* Table Area */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Template Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Source (Client)</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-6 py-6">
                        <div className="h-4 bg-slate-50 rounded-lg w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredTemplates.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                        <Database size={32} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight">No requests found</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map(template => (
                    <tr key={template.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-800">{template.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">ID: {template.metaId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-800">{template.client}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">WABA: {template.wabaId} • Phone: {template.phoneId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-wider border border-slate-100">
                          {template.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={template.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5 transition-all">
                          {template.status.toLowerCase().includes('pending') && (
                            <>
                              <button
                                onClick={() => handleStatusChange(template.id, 'approved')}
                                className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                                title="Approve"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button
                                onClick={() => handleStatusChange(template.id, 'rejected')}
                                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => { setSelectedTemplate(template); setShowReviewModal(true); }}
                            className="p-2 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-800">{filteredTemplates.length}</span> requests
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 opacity-30 cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1.5 px-2">
                <span className="text-[10px] font-black text-slate-800">Page 1 of 1</span>
              </div>
              <button className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 opacity-30 cursor-not-allowed">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Review & Submit Modal */}
      {showReviewModal && selectedTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />

          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-8 border-b border-slate-100 flex items-start sm:items-center justify-between bg-slate-50/50 gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedTemplate.name}</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">
                  Client: {selectedTemplate.client} • {selectedTemplate.category}
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-100 text-slate-400 transition-all"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-8 custom-scrollbar">
              {/* WhatsApp Preview */}
              <div className="flex-1 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp Preview</p>
                <div className="bg-[#E5DDD5] p-6 rounded-[2rem] shadow-inner relative overflow-hidden min-h-[400px]">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}></div>

                  <div className="bg-white rounded-2xl p-4 shadow-sm relative z-10 max-w-[85%]">
                    {selectedTemplate.header && (
                      <div className="mb-3">
                        {selectedTemplate.header.type === 'IMAGE' || selectedTemplate.header.type === 'VIDEO' ? (
                          <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                            {selectedTemplate.header.media_url ? (
                              <img src={selectedTemplate.header.media_url} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                              <div className="text-slate-300 flex flex-col items-center gap-2">
                                <Database size={24} />
                                <span className="text-[10px] font-bold uppercase">Media Placeholder</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="font-black text-slate-900 text-sm">{selectedTemplate.header.text}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedTemplate.content}</p>
                      {selectedTemplate.footer && (
                        <p className="text-[11px] text-slate-400 font-medium">{selectedTemplate.footer}</p>
                      )}
                    </div>

                    {selectedTemplate.buttons?.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        {selectedTemplate.buttons.map((btn, idx) => (
                          <div key={idx} className="flex items-center justify-center gap-2 py-2 text-primary font-bold text-xs bg-slate-50/50 rounded-xl border border-slate-100">
                            <ExternalLink size={14} />
                            {btn.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Technical Audit & Actions */}
              <div className="w-full md:w-80 space-y-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta Audit Info</p>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target WABA ID</p>
                      <p className="text-xs font-black text-slate-800 break-all">{selectedTemplate.wabaId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Phone ID</p>
                      <p className="text-xs font-black text-slate-800 break-all">{selectedTemplate.phoneId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Internal Status</p>
                      <StatusBadge status={selectedTemplate.status} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedTemplate.status.toLowerCase().includes('pending') && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedTemplate.id, 'approved')}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                        Approve & Submit to Meta
                      </button>

                      <button
                        onClick={() => handleStatusChange(selectedTemplate.id, 'rejected')}
                        className="w-full py-4 bg-white border border-rose-100 text-rose-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} />
                        Reject Template
                      </button>
                    </>
                  )}

                  {selectedTemplate.status.toLowerCase() === 'approved' && (
                    <div className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      This template is already approved
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = status.toLowerCase();

  if (normalized === 'pending_admin_approval') {
    return (
      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border bg-amber-50 text-amber-600 border-amber-100">
        Admin Review
      </span>
    );
  }

  if (normalized === 'pending_meta_approval') {
    return (
      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border bg-blue-50 text-blue-600 border-blue-100">
        Meta Review
      </span>
    );
  }

  if (normalized === 'approved') {
    return (
      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border bg-emerald-50 text-emerald-600 border-emerald-100">
        Approved
      </span>
    );
  }

  if (normalized === 'rejected') {
    return (
      <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border bg-rose-50 text-rose-600 border-rose-100">
        Rejected
      </span>
    );
  }

  return (
    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border bg-slate-50 text-slate-500 border-slate-100">
      {status || 'Draft'}
    </span>
  );
}

const formatTimeAgo = (date) => {
  if (!date) return 'Never';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "just now";
};
