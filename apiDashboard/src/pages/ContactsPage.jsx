import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Plus, Users, User, Edit2,
  CheckCircle2, AlertCircle, RefreshCcw,
  Smartphone, ChevronRight, Globe, Layers,
  Trash2, ExternalLink, UserPlus, FileUp,
  Mail, MapPin, Tag, Calendar, MoreVertical,
  X, Send, ShieldCheck, Info, Loader2, Download,
  Check, Phone, FilterX, MessageSquare, LayoutGrid, List,
  QrCode, Copy
} from 'lucide-react';
import { useSubscriptionGate } from '../context/SubscriptionGateContext';

const API_BASE_URL = 'http://localhost:5000/api';


export default function ContactsPage({ onNavigate, setActiveTab, userData }) {
  const { requireSub } = useSubscriptionGate();
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('cached_contacts');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(!contacts.length);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDrawer, setShowAddDrawer] = useState(false); // Right-side drawer
  const [editingContactId, setEditingContactId] = useState(null); // Track contact edits
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedContactForChat, setSelectedContactForChat] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]); // Bulk selection array

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
    setSelectedIds([]); // Clear selection when filters change
  }, [filters]);

  const fetchContacts = async () => {
    if (contacts.length === 0) setLoading(true);
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
        localStorage.setItem('cached_contacts', JSON.stringify(data));
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
      const url = editingContactId 
        ? `${API_BASE_URL}/contacts/${editingContactId}`
        : `${API_BASE_URL}/contacts`;
      const method = editingContactId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newContact)
      });

      if (response.ok) {
        alert(editingContactId ? "Contact updated successfully!" : "Contact saved successfully!");
        setShowAddDrawer(false);
        setEditingContactId(null);
        setNewContact({ name: '', phoneNumber: '', email: '', location: '', consent: true, consent_source: 'web', consent_status: 'verified' });
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
        setSelectedIds(selectedIds.filter(x => x !== id));
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
      const result = await requireSub(() =>
        fetch(`${API_BASE_URL}/messages/send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            to: selectedContactForChat.phoneNumber,
            message: chatMessage
          })
        }).then(r => r.json().then(d => ({ ...d, _ok: r.ok })))
      );

      if (!result) return;

      if (result._ok) {
        setChatMessage('');
        setShowChatModal(false);
        if (setActiveTab) setActiveTab('Messages');
        if (onNavigate) onNavigate('/messages');
      } else {
        alert(result.error || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Error in handleSendMessage:', err);
      alert('Error sending message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk operation handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(contacts.map(c => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkExport = () => {
    const selectedContacts = contacts.filter(c => selectedIds.includes(c._id));
    if (selectedContacts.length === 0) return;

    const headers = ['Name', 'Phone Number', 'Email', 'Location', 'Consent Status', 'Source', 'Joined Date'];
    const csvRows = [
      headers.join(','),
      ...selectedContacts.map(c => [
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
    a.setAttribute('download', `contacts_bulk_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete these ${selectedIds.length} contacts?`)) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await Promise.all(selectedIds.map(id =>
        fetch(`${API_BASE_URL}/contacts/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ));
      setContacts(contacts.filter(c => !selectedIds.includes(c._id)));
      setSelectedIds([]);
      alert("Selected contacts deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete some contacts.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSendCampaign = () => {
    const selectedContacts = contacts.filter(c => selectedIds.includes(c._id));
    const phones = selectedContacts.map(c => c.phoneNumber);
    
    localStorage.setItem('preselected_contacts', JSON.stringify(phones));
    
    if (setActiveTab) setActiveTab('Create Campaign');
    if (onNavigate) onNavigate('/campaigns/create');
  };

  const handleEditContactClick = (contact) => {
    setEditingContactId(contact._id);
    setNewContact({
      name: contact.name,
      phoneNumber: contact.phoneNumber,
      email: contact.email || '',
      location: contact.location || '',
      consent: contact.consent,
      consent_source: contact.consent_source,
      consent_status: contact.consent_status
    });
    setShowAddDrawer(true);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden relative">
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar pb-24">

        {/* Page Header Slot */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Contacts</h1>
            <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Manage your customer database</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 mr-1 shrink-0">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${viewMode === 'table' ? 'bg-white text-[#004277] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${viewMode === 'grid' ? 'bg-white text-[#004277] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={14} />
              </button>
            </div>

            <button
              onClick={() => setShowAddDrawer(true)}
              className="flex items-center gap-1.5 h-9 px-3.5 bg-[#004277] hover:brightness-105 active:scale-98 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Add Contact</span>
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1.5 h-9 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
            >
              <FileUp size={14} className="text-slate-400" />
              <span>Import</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 h-9 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Download size={14} className="text-slate-400" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowQRModal(true)}
              className="flex items-center gap-1.5 h-9 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
            >
              <QrCode size={14} />
              <span>Lead QR</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Contacts */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#004277] flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Total Contacts</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{contacts.length}</h3>
            </div>
          </div>

          {/* Card 2: Verified */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-[#22C55E] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Verified</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">
                {contacts.filter(c => c.consent_status === 'verified').length}
              </h3>
            </div>
          </div>

          {/* Card 3: Web Leads */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <Globe size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Web Leads</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">
                {contacts.filter(c => c.consent_source === 'web').length}
              </h3>
            </div>
          </div>

          {/* Card 4: Imports */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Imports</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">
                {contacts.filter(c => c.consent_source === 'csv').length}
              </h3>
            </div>
          </div>
        </div>

        {/* Search & Filter Row */}
        <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full group">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004277] transition-colors" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-9 pr-3 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <select
              value={filters.consent_status}
              onChange={(e) => setFilters({ ...filters, consent_status: e.target.value })}
              className="flex-1 md:flex-initial h-8 pl-2.5 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider focus:outline-none cursor-pointer appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '10px' }}
            >
              <option value="">Status ▼</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
            
            <select
              value={filters.consent_source}
              onChange={(e) => setFilters({ ...filters, consent_source: e.target.value })}
              className="flex-1 md:flex-initial h-8 pl-2.5 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider focus:outline-none cursor-pointer appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2364748B\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '10px' }}
            >
              <option value="">Source ▼</option>
              <option value="web">Web</option>
              <option value="csv">CSV</option>
              <option value="qr">QR Code</option>
              <option value="store">Store</option>
            </select>
            
            <button
              onClick={() => { setFilters({ consent_status: '', consent_source: '' }); setSearchQuery(''); fetchContacts(); }}
              className="h-8 px-2.5 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 text-slate-400 rounded-lg transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title="Reset Filters"
            >
              <FilterX size={15} />
            </button>
          </div>
        </div>

        {/* Contacts View */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[10px] text-slate-500 font-bold uppercase tracking-wider select-none">
                    <th className="py-3 pl-4 pr-2 w-10 text-center border-r border-slate-100">
                      <input
                        type="checkbox"
                        checked={contacts.length > 0 && selectedIds.length === contacts.length}
                        onChange={handleSelectAll}
                        className="w-3.5 h-3.5 rounded text-[#004277] focus:ring-[#004277] border-slate-300 accent-[#004277] cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 font-extrabold">Contact</th>
                    <th className="px-4 py-3 font-extrabold">Phone</th>
                    <th className="px-4 py-3 font-extrabold">Status</th>
                    <th className="px-4 py-3 font-extrabold">Source</th>
                    <th className="px-4 py-3 font-extrabold">Last Contact</th>
                    <th className="px-4 py-3 text-center font-extrabold">Joined</th>
                    <th className="px-4 py-3 text-right font-extrabold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan="8" className="px-4 py-3.5">
                          <div className="h-4 bg-slate-50 rounded w-full" />
                        </td>
                      </tr>
                    ))
                  ) : contacts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400 font-semibold text-xs">
                        No contacts found.
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact) => {
                      const isSelected = selectedIds.includes(contact._id);
                      return (
                        <tr key={contact._id} className={`group hover:bg-slate-50/40 transition-colors ${isSelected ? 'bg-blue-50/20' : ''}`}>
                          <td className="py-2.5 pl-4 pr-2 text-center border-r border-slate-100">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectRow(contact._id)}
                              className="w-3.5 h-3.5 rounded text-[#004277] focus:ring-[#004277] border-slate-300 accent-[#004277] cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 bg-[#004277]/10 text-[#004277] rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border border-[#004277]/10 group-hover:bg-[#004277] group-hover:text-white group-hover:border-[#004277] transition-all duration-200">
                                {contact.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate max-w-[150px] group-hover:text-[#004277] transition-colors" title={contact.name}>{contact.name}</p>
                                <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[150px]" title={contact.email}>{contact.email || 'no-email@system.com'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <code className="inline-flex items-center text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded font-mono select-all">
                              +{contact.phoneNumber}
                            </code>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                              contact.consent_status === 'verified'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${contact.consent_status === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {contact.consent_status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border transition-colors ${
                              contact.consent_source === 'web'
                                ? 'bg-blue-50 text-blue-700 border-blue-100/60'
                                : contact.consent_source === 'csv'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-100/60'
                                : contact.consent_source === 'qr'
                                ? 'bg-purple-50 text-purple-700 border-purple-100/60'
                                : 'bg-slate-50 text-slate-600 border-slate-200/60'
                            }`}>
                              {contact.consent_source}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-slate-500 font-semibold text-[10px]">
                            {contact.last_customer_message_at ? (
                              <span className="text-slate-700 font-bold">
                                {new Date(contact.last_customer_message_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium italic">Never contacted</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                            {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center justify-end gap-1 shrink-0">
                              <button
                                onClick={() => { setSelectedContactForChat(contact); setShowChatModal(true); }}
                                className="p-1.5 text-slate-400 hover:text-[#004277] hover:bg-slate-100 rounded-lg transition-all cursor-pointer active:scale-95"
                                title="Send Quick Message"
                              >
                                <MessageSquare size={14} />
                              </button>
                              <button
                                onClick={() => handleEditContactClick(contact)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer active:scale-95"
                                title="Edit Profile"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteContact(contact._id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer active:scale-95"
                                title="Delete Contact"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View Layout */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse" />
              ))
            ) : contacts.length === 0 ? (
              <div className="col-span-full py-16 bg-white rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center p-6 gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 border border-slate-100 shadow-inner">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Your directory is empty</h3>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">Start building your community by adding your first contact or importing a database.</p>
                </div>
              </div>
            ) : (
              contacts.map((contact) => {
                const isSelected = selectedIds.includes(contact._id);
                return (
                  <div key={contact._id} className={`group bg-white p-4 rounded-xl border transition-all flex flex-col gap-4 relative overflow-hidden shadow-sm ${isSelected ? 'border-[#004277] bg-blue-50/10' : 'border-slate-200'}`}>
                    
                    {/* Top corner checkbox */}
                    <div className="absolute top-3 right-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(contact._id)}
                        className="w-3.5 h-3.5 rounded text-[#004277] focus:ring-[#004277] border-slate-300 accent-[#004277] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#004277]/10 text-[#004277] rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border border-[#004277]/10">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1 pr-6">
                        <h3 className="text-xs font-black text-slate-800 truncate" title={contact.name}>{contact.name}</h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">{contact.email || 'no-email@system.com'}</p>
                        
                        <div className="flex items-center gap-1.5 mt-2">
                          <code className="text-[9px] font-bold text-slate-600 bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded font-mono">
                            +{contact.phoneNumber}
                          </code>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border whitespace-nowrap ${contact.consent_status === 'verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                            {contact.consent_status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-500 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Source</p>
                        <p className="font-extrabold uppercase tracking-wide text-slate-700 mt-0.5">{contact.consent_source}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Location</p>
                        <p className="text-slate-700 mt-0.5 truncate" title={contact.location}>{contact.location || 'Not set'}</p>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-100/50">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Last Contact</p>
                        <p className="text-slate-700 mt-0.5">
                          {contact.last_customer_message_at ? (
                            new Date(contact.last_customer_message_at).toLocaleDateString()
                          ) : 'Never'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => { setSelectedContactForChat(contact); setShowChatModal(true); }}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-[#004277] hover:brightness-105 text-white text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-98"
                      >
                        <MessageSquare size={13} />
                        <span>Chat</span>
                      </button>
                      <button
                        onClick={() => handleEditContactClick(contact)}
                        className="h-8 px-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center"
                        title="Edit"
                      >
                        <Plus size={13} className="rotate-45" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact._id)}
                        className="h-8 px-2 bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-500 text-xs font-bold rounded-lg border border-rose-100/50 transition-colors cursor-pointer flex items-center justify-center"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        )}

      </main>

      {/* Bulk Action floating bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl flex items-center gap-4 z-40 shadow-2xl animate-in slide-in-from-bottom-5">
          <span className="text-[11px] font-bold text-slate-300">
            {selectedIds.length} contact{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="w-[1px] h-4 bg-slate-800" />
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkExport}
              className="flex items-center gap-1.5 h-8 px-3 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer select-none"
            >
              <Download size={13} />
              Export
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 h-8 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold rounded-lg transition-colors cursor-pointer select-none border border-red-500/10"
            >
              <Trash2 size={13} />
              Delete
            </button>
            <button
              onClick={handleBulkSendCampaign}
              className="flex items-center gap-1.5 h-8 px-3 bg-[#25D366] hover:brightness-105 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer select-none"
            >
              <Send size={13} />
              Send Campaign
            </button>
          </div>
          <button
            onClick={() => setSelectedIds([])}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Drawer Backdrop overlay */}
      {showAddDrawer && (
        <div 
          onClick={() => {
            setShowAddDrawer(false);
            setEditingContactId(null);
            setNewContact({ name: '', phoneNumber: '', email: '', location: '', consent: true, consent_source: 'web', consent_status: 'verified' });
          }}
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Add/Edit Contact Right-Side Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-[360px] bg-white border-l border-slate-200 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${showAddDrawer ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-[#004277]" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
              {editingContactId ? 'Edit Contact' : 'Add New Contact'}
            </span>
          </div>
          <button
            onClick={() => {
              setShowAddDrawer(false);
              setEditingContactId(null);
              setNewContact({ name: '', phoneNumber: '', email: '', location: '', consent: true, consent_source: 'web', consent_status: 'verified' });
            }}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Phone Number *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold font-mono">
                +
              </span>
              <input
                type="tel"
                placeholder="Country code + number (e.g. 919876543210)"
                value={newContact.phoneNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setNewContact({ ...newContact, phoneNumber: val });
                }}
                className="w-full pl-6 pr-3 h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Email Address</label>
            <input
              type="email"
              placeholder="e.g. email@example.com"
              value={newContact.email || ''}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Location</label>
            <input
              type="text"
              placeholder="e.g. Mumbai, India"
              value={newContact.location || ''}
              onChange={(e) => setNewContact({ ...newContact, location: e.target.value })}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Consent Status</label>
            <select
              value={newContact.consent_status}
              onChange={(e) => setNewContact({ ...newContact, consent_status: e.target.value })}
              className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Consent Source</label>
            <select
              value={newContact.consent_source}
              onChange={(e) => setNewContact({ ...newContact, consent_source: e.target.value })}
              className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="web">Web Form</option>
              <option value="csv">CSV Import</option>
              <option value="qr">QR Code</option>
              <option value="store">Physical Store</option>
            </select>
          </div>

          <div
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${newContact.consent ? 'bg-emerald-50/20 border-emerald-200/50' : 'bg-slate-50 border-slate-150'}`}
            onClick={() => setNewContact({ ...newContact, consent: !newContact.consent })}
          >
            <div className={`w-8 h-4 rounded-full relative transition-colors shrink-0 ${newContact.consent ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${newContact.consent ? 'left-4.5' : 'left-0.5'}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider leading-none mb-0.5">Marketing Consent</p>
              <p className="text-[8px] text-slate-400 font-semibold leading-none">Subscribed for broadcasts</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center gap-2 bg-slate-50/50 shrink-0">
          <button
            onClick={() => {
              setShowAddDrawer(false);
              setEditingContactId(null);
              setNewContact({ name: '', phoneNumber: '', email: '', location: '', consent: true, consent_source: 'web', consent_status: 'verified' });
            }}
            className="flex-1 h-9 bg-white text-slate-500 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveContact}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-[#004277] hover:brightness-105 text-white text-xs font-bold rounded-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {submitting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            <span>Save Contact</span>
          </button>
        </div>
      </div>

      {/* Redesigned Quick Chat Modal */}
      {showChatModal && selectedContactForChat && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[400px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Send WhatsApp</span>
              <button
                onClick={() => setShowChatModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">To:</span>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                  <User size={13} className="text-slate-400" />
                  <span>{selectedContactForChat.name} (+{selectedContactForChat.phoneNumber})</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Message Content *</label>
                <textarea
                  rows="4"
                  placeholder="Type your WhatsApp message here..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-[10px]">
                <Info size={13} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-slate-500 font-semibold leading-relaxed">
                  Message will be delivered instantly via your connected WhatsApp Business account.
                </p>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 flex items-center gap-2 bg-slate-50/50 shrink-0">
              <button
                onClick={() => setShowChatModal(false)}
                className="flex-1 h-9 bg-white text-slate-500 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={submitting || !chatMessage.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-primary text-white text-xs font-bold rounded-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload CSV Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[500px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileUp size={16} className="text-[#004277]" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Bulk Import Contacts</span>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-[#004277]/25 hover:bg-[#004277]/5 transition-all cursor-pointer relative group bg-slate-50/50">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  disabled={submitting}
                />
                {submitting ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={32} className="animate-spin text-[#004277]" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processing...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-[#004277] transition-all shadow-sm border border-slate-200">
                      <Download size={20} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-800">Click to upload or drag & drop</p>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Supports CSV, XLSX up to 10MB</p>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                    <Info size={13} />
                  </div>
                  <h4 className="text-[10px] font-black text-slate-850 uppercase tracking-widest">Required Format</h4>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-500">
                  <div className="bg-white p-2 rounded-lg border border-slate-150 shadow-sm">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Column 1</p>
                    <p className="font-extrabold text-slate-800">mobilenumber*</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-150 shadow-sm">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Column 2</p>
                    <p className="font-extrabold text-slate-800">name*</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-150 shadow-sm">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Column 3</p>
                    <p className="font-extrabold text-slate-800">consent* (true/false)</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-150 shadow-sm">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Column 4</p>
                    <p className="font-extrabold text-slate-800">status* (verified/unverified)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50 shrink-0">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-2 bg-white text-slate-500 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
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
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="bg-white w-full max-w-[360px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50 shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <QrCode size={16} className="text-[#004277]" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Lead Capture QR</h3>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-2 bg-white rounded-xl border border-slate-150 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`${window.location.origin}/lead/${userData?._id || 'unknown'}`)}`}
                    alt="Lead Capture QR"
                    className="w-28 h-28"
                  />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#004277] uppercase tracking-widest">Automatic Lead Generation</p>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed px-2 mt-1">
                    Customers scan this to join your list and give consent.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Direct Link</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                  <input
                    readOnly
                    value={`${window.location.origin}/lead/${userData?._id || ''}`}
                    className="flex-1 bg-transparent border-none text-[10px] font-bold text-slate-500 truncate focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/lead/${userData?._id || ''}`);
                      alert("Copied to clipboard!");
                    }}
                    className="p-1 text-slate-400 hover:text-[#004277] transition-colors cursor-pointer"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50/30 rounded-lg border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest text-center flex-1">Secured System Active</span>
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full py-2 bg-white text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
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