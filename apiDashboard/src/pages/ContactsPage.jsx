import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Plus, Users,
  CheckCircle2, AlertCircle, RefreshCcw,
  Smartphone, ChevronRight, Globe, Layers,
  Trash2, ExternalLink, UserPlus, FileUp,
  Mail, MapPin, Tag, Calendar, MoreVertical,
  X, Send, ShieldCheck, Info, Loader2, Download,
  Check, Phone, FilterX, MessageSquare, LayoutGrid, List,
  QrCode, Copy
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

// Reusable StatCard following Dashboard/MessageLogs style
const StatCard = ({ label, value, color, icon: Icon }) => {
  const colors = {
    primary: 'from-primary/10 to-primary/20 text-primary border-primary/10',
    secondary: 'from-secondary/10 to-secondary/20 text-secondary border-secondary/10',
    blue: 'from-blue-500/10 to-cyan-500/10 text-blue-600 border-blue-100',
    indigo: 'from-indigo-500/10 to-blue-500/10 text-indigo-600 border-indigo-100',
    orange: 'from-orange-500/10 to-amber-500/10 text-orange-600 border-orange-100',
    rose: 'from-rose-500/10 to-pink-500/10 text-rose-600 border-rose-100'
  };

  return (
    <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
          <p className="text-2xl font-black text-primary tracking-tight leading-none">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default function ContactsPage({ onNavigate, setActiveTab, userData }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedContactForChat, setSelectedContactForChat] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);

  // New Contact State
  const [newContact, setNewContact] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    location: '',
    consent: true,
    consent_source: 'web',
    consent_status: 'verified'
  });

  const handleExport = () => {
    if (contacts.length === 0) {
      alert("No contacts to export.");
      return;
    }

    const headers = ['Name', 'Phone Number', 'Email', 'Location', 'Consent Status', 'Source', 'Joined Date'];
    const csvRows = [
      headers.join(','),
      ...contacts.map(c => [
        `"${c.name}"`,
        `"${c.phoneNumber}"`,
        `"${c.email || ''}"`,
        `"${c.location || ''}"`,
        `"${c.consent_status}"`,
        `"${c.consent_source}"`,
        `"${new Date(c.createdAt).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Filters
  const [filters, setFilters] = useState({
    consent_status: '',
    consent_source: ''
  });

  useEffect(() => {
    fetchContacts();
  }, [filters]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${API_BASE_URL}/contacts?`;
      if (filters.consent_status) url += `consent_status=${filters.consent_status}&`;
      if (filters.consent_source) url += `consent_source=${filters.consent_source}&`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setContacts(data);
      }
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/contacts/search/${query}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) setContacts(data);
      } catch (err) {
        console.error("Search failed:", err);
      }
    } else if (query.length === 0) {
      fetchContacts();
    }
  };

  const handleSaveContact = async () => {
    if (!newContact.name || !newContact.phoneNumber) {
      alert("Please fill in Name and Phone Number.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newContact)
      });

      if (response.ok) {
        alert("Contact saved successfully!");
        setShowAddModal(false);
        setNewContact({ name: '', phoneNumber: '', email: '', location: '', consent: true });
        fetchContacts();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save contact");
      }
    } catch (err) {
      alert("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setContacts(contacts.filter(c => c._id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/contacts/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Success: ${data.success}, Failed: ${data.failed}`);
        setShowUploadModal(false);
        fetchContacts();
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      alert("An error occurred during upload.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedContactForChat) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: selectedContactForChat.phoneNumber,
          message: chatMessage
        })
      });

      if (response.ok) {
        console.log("Message sent successfully, navigating to inbox...");
        setChatMessage('');
        setShowChatModal(false);

        // Use both setActiveTab for immediate UI update and onNavigate for URL sync
        if (setActiveTab) {
          setActiveTab('Messages');
        }
        if (onNavigate) {
          onNavigate('/messages');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to send message:", errorData);
        alert(errorData.error || "Failed to send message.");
      }
    } catch (err) {
      console.error("Error in handleSendMessage:", err);
      alert("Error sending message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar pb-10">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-primary tracking-tight flex items-center gap-3">
              Contacts
            </h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">
              Manage and organize your WhatsApp audience database
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 mr-2">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>

            <button
              onClick={handleExport}
              className="group flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
            >
              <Download size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
              Export
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="group flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
            >
              <FileUp size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
              Import
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-light transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <UserPlus size={16} />
              Add Contact
            </button>
            <button
              onClick={() => setShowQRModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
              title="Customer Lead QR"
            >
              <QrCode size={16} />
              Lead QR
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard
            label="Total Contacts"
            value={contacts.length}
            color="primary"
            icon={Users}
          />
          <StatCard
            label="Verified Consent"
            value={contacts.filter(c => c.consent_status === 'verified').length}
            color="secondary"
            icon={ShieldCheck}
          />
          <StatCard
            label="Web Leads"
            value={contacts.filter(c => c.consent_source === 'web').length}
            color="blue"
            icon={Globe}
          />
          <StatCard
            label="Bulk Imports"
            value={contacts.filter(c => c.consent_source === 'csv').length}
            color="indigo"
            icon={Layers}
          />
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl">
              <select
                value={filters.consent_status}
                onChange={(e) => setFilters({ ...filters, consent_status: e.target.value })}
                className="pl-3 pr-8 py-1.5 bg-transparent text-[11px] font-bold text-slate-600 uppercase tracking-wider focus:outline-none cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '12px' }}
              >
                <option value="">All Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
              <div className="w-px h-4 bg-slate-200" />
              <select
                value={filters.consent_source}
                onChange={(e) => setFilters({ ...filters, consent_source: e.target.value })}
                className="pl-3 pr-8 py-1.5 bg-transparent text-[11px] font-bold text-slate-600 uppercase tracking-wider focus:outline-none cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '12px' }}
              >
                <option value="">All Sources</option>
                <option value="web">Web</option>
                <option value="csv">CSV</option>
                <option value="qr">QR Code</option>
                <option value="store">Store</option>
              </select>
            </div>
            <button
              onClick={() => { setFilters({ consent_status: '', consent_source: '' }); setSearchQuery(''); fetchContacts(); }}
              className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all active:scale-95 shadow-sm"
              title="Reset Filters"
            >
              <FilterX size={20} />
            </button>
          </div>
        </div>

        {/* Contacts View */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="pl-6 pr-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-100/50">Contact Name</th>
                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-100/50">WhatsApp Number</th>
                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-100/50">Consent Status</th>
                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-100/50">Source</th>
                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-100/50 text-center">Joined</th>
                    <th className="px-6 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="6" className="px-6 py-4">
                          <div className="h-4 bg-slate-50 rounded w-full" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    contacts.map((contact) => (
                      <tr key={contact._id} className="group hover:bg-slate-50 transition-colors">
                        <td className="pl-6 pr-4 py-4 border-r border-slate-50/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center font-bold text-xs border border-slate-200 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">{contact.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium truncate">{contact.email || 'no-email@system.com'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-50/50">
                          <code className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200/60">
                            +{contact.phoneNumber}
                          </code>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-50/50">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${contact.consent_status === 'verified' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-orange-500'}`} />
                            <span className="text-[11px] font-bold text-slate-700 capitalize">{contact.consent_status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-50/50">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Tag size={12} className="text-slate-300" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">{contact.consent_source}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-slate-50/50 text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => { setSelectedContactForChat(contact); setShowChatModal(true); }}
                              className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                              title="Message"
                            >
                              <MessageSquare size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteContact(contact._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                              title="Remove"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View Rendering */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-64 glass-panel rounded-[2.5rem] animate-pulse" />
              ))
            ) : contacts.length === 0 ? (
              <div className="col-span-full py-32 glass-panel rounded-[2.5rem] text-center flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
                  <Users size={40} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Your audience is empty</h3>
                <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">Start building your community by adding your first contact or importing a list.</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div key={contact._id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden flex flex-col gap-5">
                  {/* Card Header: Avatar, Name, Phone & Status */}
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 bg-[#004277] text-white rounded-[1.25rem] flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform duration-500 flex-shrink-0">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name, Phone & Badge Row */}
                    <div className="flex-1 min-w-0 relative">
                      <div className="absolute top-0 right-0">
                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border shrink-0 ${contact.consent_status === 'verified' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                          {contact.consent_status}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-800 leading-tight pr-14 mb-1 line-clamp-2" title={contact.name}>
                        {contact.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold mt-1.5">
                        <Smartphone size={12} className="text-slate-400" />
                        <span>+{contact.phoneNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info List */}
                  <div className="space-y-3 w-full">
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                      <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100/50">
                        <Mail size={14} />
                      </div>
                      <span className="truncate">{contact.email || 'No email provided'}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                      <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100/50">
                        <MapPin size={14} />
                      </div>
                      <span className="truncate">{contact.location || 'Location not set'}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100/50">
                        <Tag size={13} />
                      </div>
                      <span>{contact.consent_source}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 w-full pt-1">
                    <button
                      onClick={() => { setSelectedContactForChat(contact); setShowChatModal(true); }}
                      className="flex-[2] h-11 rounded-2xl bg-[#004277] text-white flex items-center justify-center hover:bg-primary-light transition-all text-xs font-black gap-2 shadow-lg shadow-blue-900/10 active:scale-95"
                    >
                      <MessageSquare size={16} />
                      Quick Chat
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact._id)}
                      className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95 border border-rose-100/50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Quick Chat Modal */}
      {showChatModal && selectedContactForChat && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[450px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold text-sm backdrop-blur-sm">
                  {selectedContactForChat.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">{selectedContactForChat.name}</h3>
                  <p className="text-[10px] font-medium opacity-70 uppercase tracking-widest">Direct Message</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">WhatsApp Number</p>
                  <p className="text-sm font-bold text-slate-800">+{selectedContactForChat.phoneNumber}</p>
                </div>
                <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                  <Phone size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Message Content</label>
                <textarea
                  rows="4"
                  placeholder="Type your WhatsApp message here..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100/50">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium leading-relaxed">
                  Messages sent here are delivered instantly via your connected WhatsApp API business account.
                </p>
              </div>
            </div>
            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex items-center gap-3">
              <button
                onClick={() => setShowChatModal(false)}
                className="flex-1 py-3 bg-white text-slate-500 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={submitting || !chatMessage.trim()}
                className="flex-[2] py-3 bg-primary text-white text-xs font-bold rounded-xl shadow-xl shadow-primary/20 hover:bg-primary-light transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Send WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[500px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Add New Contact</h2>
                    <p className="text-xs text-slate-400 font-medium">Create a new entry in your audience database</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm border-r border-slate-200 pr-2 h-5 flex items-center">
                        +91
                      </div>
                      <input
                        type="tel"
                        placeholder="XXXXXXXXXX"
                        value={newContact.phoneNumber.replace(/^(\+91|91)/, '')}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setNewContact({ ...newContact, phoneNumber: `91${val}` });
                        }}
                        className="w-full pl-16 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={newContact.email}
                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Location</label>
                      <input
                        type="text"
                        placeholder="City, Country"
                        value={newContact.location}
                        onChange={(e) => setNewContact({ ...newContact, location: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Consent Source</label>
                      <select
                        value={newContact.consent_source}
                        onChange={(e) => setNewContact({ ...newContact, consent_source: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 cursor-pointer"
                      >
                        <option value="web">Website</option>
                        <option value="store">Physical Store</option>
                        <option value="qr">QR Code</option>
                        <option value="csv">CSV Import</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                      <select
                        value={newContact.consent_status}
                        onChange={(e) => setNewContact({ ...newContact, consent_status: e.target.value })}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 cursor-pointer"
                      >
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                      </select>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${newContact.consent ? 'bg-secondary/5 border-secondary/20' : 'bg-slate-50 border-slate-100'}`}
                    onClick={() => setNewContact({ ...newContact, consent: !newContact.consent })}
                  >
                    <div className={`w-10 h-6 rounded-full relative transition-colors ${newContact.consent ? 'bg-secondary' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newContact.consent ? 'left-5' : 'left-1'}`} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-800 uppercase tracking-widest leading-none mb-1">Marketing Consent</p>
                      <p className="text-[10px] text-slate-500 font-medium">User has opted-in for receiving updates</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-50 flex items-center justify-end gap-3 shrink-0 bg-slate-50/30">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveContact}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-light transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Save Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload CSV Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[600px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            {/* Sticky Header */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                  <FileUp size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Bulk Import Contacts</h2>
                  <p className="text-xs text-slate-400 font-medium">Upload your CSV or Excel database</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="p-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer relative group bg-slate-50/50">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  disabled={submitting}
                />
                {submitting ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={40} className="animate-spin text-primary" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Processing...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 group-hover:text-primary transition-all shadow-sm border border-slate-100">
                      <Download size={32} />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-slate-800">Click to upload or drag & drop</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-1">Supports CSV, XLSX up to 10MB</p>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Info size={16} />
                  </div>
                  <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">
                    Required CSV Format
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'COLUMN 1', value: 'mobilenumber*', desc: 'Required' },
                    { label: 'COLUMN 2', value: 'name*', desc: 'Required' },
                    { label: 'COLUMN 3', value: 'consent*', desc: 'Required (true/false)' },
                    { label: 'COLUMN 4', value: 'consent status*', desc: 'Required (verified/unverified)' },
                    { label: 'COLUMN 5', value: 'consent source*', desc: 'Required' },
                    { label: 'OPTIONAL', value: 'email / location', desc: 'Optional fields' }
                  ].map((col, idx) => (
                    <div key={idx} className={`bg-white p-4 rounded-2xl border border-slate-200/50 shadow-sm ${idx === 4 || idx === 5 ? 'col-span-1' : ''}`}>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight mb-1">{col.label}</p>
                      <p className="text-xs font-black text-slate-800 mb-0.5">{col.value}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{col.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="p-8 border-t border-slate-50 flex items-center justify-end bg-slate-50/30 shrink-0">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-8 py-3 bg-white text-slate-500 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              >
                Close Importer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead QR Modal */}
      {showQRModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setShowQRModal(false)}
        >
          <div 
            className="bg-white w-full max-w-[400px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Clean Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/5 text-primary rounded-lg flex items-center justify-center">
                  <QrCode size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Lead Capture QR</h3>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Refined QR Section */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm relative">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`${window.location.origin}/lead/${userData?._id || 'unknown'}`)}`}
                    alt="Lead Capture QR"
                    className="w-32 h-32"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Automatic Lead Generation</p>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed px-4">
                    Customers scan this to join your list and give consent.
                  </p>
                </div>
              </div>

              {/* URL Section */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Direct Link</label>
                <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200/60">
                  <input 
                    readOnly
                    value={`${window.location.origin}/lead/${userData?._id || ''}`}
                    className="flex-1 bg-transparent border-none text-[10px] font-bold text-slate-500 truncate focus:outline-none"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/lead/${userData?._id || ''}`);
                      alert("Copied!");
                    }}
                    className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-50/30 rounded-xl border border-emerald-100/50">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest text-center flex-1">System Active & Secured</span>
              </div>
            </div>

            {/* Simple Footer */}
            <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-50">
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full py-3 bg-white text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              >
                Close Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}