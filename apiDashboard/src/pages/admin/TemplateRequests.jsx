import React, { useState, useEffect } from 'react';
import {
  Search, MessageSquare,
  Clock, CheckCircle2, XCircle, RefreshCw,
  ChevronLeft, ChevronRight, Eye,
  Database, Plus, ExternalLink, Globe, Loader2
} from 'lucide-react';

const StatCard = ({ label, value, color, icon: Icon }) => {
  const bgColors = {
    primary: 'bg-blue-50 text-[#003B6D]',
    secondary: 'bg-emerald-50 text-[#63C132]',
    orange: 'bg-orange-50 text-orange-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3.5 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer shadow-sm">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${bgColors[color] || bgColors.primary}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">{label}</p>
        <h3 className="text-xl font-bold text-slate-900 leading-none">{value}</h3>
      </div>
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
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar pb-12">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Template Requests</h1>
            <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Review and manage WhatsApp template requests from all clients</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={fetchTemplates}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Sync Meta</span>
            </button>
            <button
              onClick={onNavigateCreate}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#003B6D] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all active:scale-95 shadow-sm"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Create Template</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <StatCard label="Total Requests" value={data.stats.total} color="primary" icon={MessageSquare} />
          <StatCard label="Pending Review" value={data.stats.pending} color="orange" icon={Clock} />
          <StatCard label="Approved" value={data.stats.approved} color="secondary" icon={CheckCircle2} />
          <StatCard label="Rejected" value={data.stats.rejected} color="rose" icon={XCircle} />
        </div>

        {/* Action Bar */}
        <div className="flex flex-col gap-3">
          <div className="relative w-full group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, client, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-400 transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
            {['All', 'Admin Pending', 'Meta Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === status
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[750px] text-left border-collapse text-xs">
              <thead>
                <tr className="text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100 bg-slate-50/30">
                  <th className="py-3 px-4 font-bold">Template Name</th>
                  <th className="py-3 px-4 font-bold">Meta Source (Client)</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-4 py-4">
                        <div className="h-4 bg-slate-50 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredTemplates.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-12 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                        <Database size={24} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 tracking-tight">No requests found</h3>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-1">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map(template => (
                    <tr key={template.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="py-2.5 px-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800">{template.name}</p>
                          <p className="text-[9px] text-slate-400 font-semibold tracking-tight">ID: {template.metaId}</p>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800">{template.client}</p>
                          <p className="text-[9px] text-slate-400 font-semibold tracking-tighter">WABA: {template.wabaId} • Phone: {template.phoneId}</p>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[9px] font-bold uppercase tracking-wider border border-slate-100">
                          {template.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusBadge status={template.status} />
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {template.status.toLowerCase().includes('pending') && (
                            <>
                              <button
                                onClick={() => handleStatusChange(template.id, 'approved')}
                                className="p-1 text-emerald-500 hover:bg-emerald-50 rounded transition-all"
                                title="Approve"
                              >
                                <CheckCircle2 size={14} />
                              </button>
                              <button
                                onClick={() => handleStatusChange(template.id, 'rejected')}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-all"
                                title="Reject"
                              >
                                <XCircle size={14} />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => { setSelectedTemplate(template); setShowReviewModal(true); }}
                            className="p-1 text-slate-400 hover:text-primary hover:bg-primary/5 rounded transition-all"
                            title="View Details"
                          >
                            <Eye size={14} />
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
          <div className="flex items-center justify-between p-3 border-t border-slate-100 bg-slate-50/20 text-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-800">{filteredTemplates.length}</span> requests
            </p>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded bg-slate-50 border border-slate-100 text-slate-400 opacity-40 cursor-not-allowed">
                <ChevronLeft size={14} />
              </button>
              <span className="text-[10px] font-bold text-slate-700 px-2">Page 1 of 1</span>
              <button className="p-1.5 rounded bg-slate-50 border border-slate-100 text-slate-400 opacity-40 cursor-not-allowed">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Review & Submit Modal */}
      {showReviewModal && selectedTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />

          <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">{selectedTemplate.name}</h2>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                  Client: {selectedTemplate.client} • {selectedTemplate.category}
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-all"
              >
                <XCircle size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col md:flex-row gap-4 custom-scrollbar">
              {/* WhatsApp Preview */}
              <div className="flex-1 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp Preview</p>
                <div className="bg-[#E5DDD5] p-4 rounded-lg shadow-inner relative overflow-hidden min-h-[300px] flex items-start justify-center">
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}></div>

                  <div className="bg-white rounded-lg p-3 shadow-sm relative z-10 w-full max-w-[280px] my-auto">
                    {selectedTemplate.header && (
                      <div className="mb-2">
                        {selectedTemplate.header.type === 'IMAGE' || selectedTemplate.header.type === 'VIDEO' ? (
                          <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                            {(selectedTemplate.header.media_url || selectedTemplate.header.handle) ? (
                              <img
                                src={selectedTemplate.header.media_url || selectedTemplate.header.handle}
                                className="w-full h-full object-cover"
                                alt="Template Media"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`text-slate-300 flex-col items-center gap-1 ${(selectedTemplate.header.media_url || selectedTemplate.header.handle) ? 'hidden' : 'flex'}`}>
                              <Database size={16} />
                              <span className="text-[9px] font-bold uppercase">No Media URL</span>
                            </div>
                          </div>
                        ) : (
                          <p className="font-bold text-slate-900 text-xs">{selectedTemplate.header.text}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedTemplate.content}</p>
                      {selectedTemplate.footer && (
                        <p className="text-[10px] text-slate-400 font-medium">{selectedTemplate.footer}</p>
                      )}
                    </div>

                    {selectedTemplate.buttons?.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                        {selectedTemplate.buttons.map((btn, idx) => (
                          <div key={idx} className="flex items-center justify-center gap-1.5 py-1.5 text-primary font-bold text-[10px] bg-slate-50/50 rounded-lg border border-slate-100">
                            <ExternalLink size={12} />
                            {btn.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Technical Audit & Actions */}
              <div className="w-full md:w-72 space-y-4 shrink-0">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meta Audit Info</p>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target WABA ID</p>
                      <p className="text-xs font-bold text-slate-800 break-all">{selectedTemplate.wabaId}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target Phone ID</p>
                      <p className="text-xs font-bold text-slate-800 break-all">{selectedTemplate.phoneId}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Internal Status</p>
                      <StatusBadge status={selectedTemplate.status} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedTemplate.status.toLowerCase().includes('pending') && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedTemplate.id, 'approved')}
                        disabled={isSubmitting}
                        className="w-full py-2.5 bg-[#63C132] hover:bg-[#63C132]/90 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                        Approve & Submit to Meta
                      </button>

                      <button
                        onClick={() => handleStatusChange(selectedTemplate.id, 'rejected')}
                        className="w-full py-2.5 bg-white border border-rose-200 text-rose-500 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle size={14} />
                        Reject Template
                      </button>
                    </>
                  )}

                  {selectedTemplate.status.toLowerCase() === 'approved' && (
                    <div className="w-full py-2.5 bg-emerald-50 text-emerald-600 rounded-lg text-center text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
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
      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-amber-50 text-amber-600 border-amber-100">
        Admin Review
      </span>
    );
  }

  if (normalized === 'pending_meta_approval') {
    return (
      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-blue-50 text-blue-600 border-blue-100">
        Meta Review
      </span>
    );
  }

  if (normalized === 'approved') {
    return (
      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-600 border-emerald-100">
        Approved
      </span>
    );
  }

  if (normalized === 'rejected') {
    return (
      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-rose-50 text-rose-600 border-rose-100">
        Rejected
      </span>
    );
  }

  return (
    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-slate-50 text-slate-500 border-slate-100">
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
