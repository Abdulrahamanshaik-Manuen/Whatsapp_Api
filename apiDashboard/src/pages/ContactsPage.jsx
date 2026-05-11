import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Plus, Users,
  CheckCircle2, AlertCircle, RefreshCcw,
  Smartphone, ChevronRight, Globe, Layers,
  Trash2, ExternalLink, UserPlus, FileUp,
  Mail, MapPin, Tag, Calendar, MoreVertical,
  X, Send, ShieldCheck, Info, Loader2, Download,
  Check, Phone, FilterX, MessageSquare, LayoutGrid, List
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function ContactsPage() {
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
        alert("Message sent successfully!");
        setChatMessage('');
        setShowChatModal(false);
      } else {
        alert("Failed to send message.");
      }
    } catch (err) {
      alert("Error sending message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar pb-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Contact Manager</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <Users size={14} className="text-primary" />
              Manage your WhatsApp audience and leads
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Table View"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              >
                <Download size={16} />
                Export CSV
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              >
                <FileUp size={16} />
                Import CSV
              </button>
               <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-primary/25 active:scale-95"
              >
                <UserPlus size={16} />
                Add Contact
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Contacts</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">{contacts.length}</p>
                </div>
              </div>
            </div>
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Verified Consent</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                    {contacts.filter(c => c.consent_status === 'verified').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                  <Globe size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Web Leads</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                    {contacts.filter(c => c.consent_source === 'web').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <FileUp size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CSV Imports</p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                    {contacts.filter(c => c.consent_source === 'csv').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or phone number..."
                 value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-300"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={filters.consent_status}
                onChange={(e) => setFilters({ ...filters, consent_status: e.target.value })}
                className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest focus:outline-none cursor-pointer flex-1 md:flex-none"
              >
                <option value="">Status: All</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
              <select
                value={filters.consent_source}
                onChange={(e) => setFilters({ ...filters, consent_source: e.target.value })}
                className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest focus:outline-none cursor-pointer flex-1 md:flex-none"
              >
                <option value="">Source: All</option>
                <option value="web">Web</option>
                <option value="csv">CSV</option>
                <option value="qr">QR Code</option>
                <option value="store">Store</option>
              </select>
              <button
                onClick={() => { setFilters({ consent_status: '', consent_source: '' }); setSearchQuery(''); fetchContacts(); }}
                className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200 transition-colors"
              >
                <FilterX size={20} />
              </button>
            </div>
          </div>

          {/* Contacts View */}
          {viewMode === 'table' ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Identity</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source & Status</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Added Date</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan="5" className="px-6 py-8">
                            <div className="h-4 bg-slate-100 rounded-full w-full opacity-50"></div>
                          </td>
                        </tr>
                      ))
                    ) : contacts.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center justify-center opacity-40">
                            <Layers size={40} className="text-slate-200 mb-4" />
                            <h3 className="text-lg font-black text-slate-800">No Contacts Found</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Start by adding a contact or importing a CSV file</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      contacts.map((contact) => (
                        <tr key={contact._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary/20">
                                {contact.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-800 leading-none mb-1.5">{contact.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                                  <Mail size={10} className="text-slate-300" />
                                  {contact.email || 'No email provided'}
                                </p>
                              </div>
                            </div>
                          </td>
                           <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
                                <Phone size={12} />
                              </div>
                              <span className="text-xs font-black text-slate-800">+{contact.phoneNumber}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-2">
                               <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border ${contact.consent_status === 'verified' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                  {contact.consent_status}
                                </span>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                  <Tag size={10} className="text-slate-300" />
                                  {contact.consent_source}
                                </span>
                              </div>
                              {contact.location && (
                                <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                  <MapPin size={10} className="text-slate-300" />
                                  {contact.location}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px]">
                              <Calendar size={12} className="text-slate-300" />
                              {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <a
                                href={`tel:${contact.phoneNumber}`}
                                className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center hover:bg-secondary hover:text-white transition-all shadow-sm"
                                title="Call Contact"
                              >
                                <Phone size={16} />
                              </a>
                              <button
                                onClick={() => { setSelectedContactForChat(contact); setShowChatModal(true); }}
                                className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                title="Quick Chat"
                              >
                                <MessageSquare size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteContact(contact._id)}
                                className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                title="Delete"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-[200px] bg-white rounded-[2rem] border border-slate-100 animate-pulse"></div>
                ))
              ) : contacts.length === 0 ? (
                <div className="col-span-full py-20 bg-white rounded-[2rem] border border-slate-100 text-center flex flex-col items-center justify-center opacity-40">
                  <Layers size={40} className="text-slate-200 mb-4" />
                  <h3 className="text-lg font-black text-slate-800">No Contacts Found</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Start by adding a contact or importing a CSV file</p>
                </div>
              ) : (
                contacts.map((contact) => (
                  <div key={contact._id} className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-indigo-600/10 transition-all duration-300 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border ${contact.consent_status === 'verified' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                        {contact.consent_status}
                      </span>
                    </div>
                     <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center text-white font-black text-xl shadow-xl shadow-primary/30 group-hover:scale-110 transition-transform">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                       <div>
                        <h3 className="text-sm font-black text-slate-800 mb-1">{contact.name}</h3>
                        <p className="text-xs font-black text-primary">+{contact.phoneNumber}</p>
                        {contact.location && (
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
                            <MapPin size={10} /> {contact.location}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full pt-2">
                         <a
                          href={`tel:${contact.phoneNumber}`}
                          className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-secondary/10 hover:text-secondary transition-all border border-slate-100"
                        >
                          <Phone size={16} />
                        </a>
                        <button
                          onClick={() => { setSelectedContactForChat(contact); setShowChatModal(true); }}
                          className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-all border border-slate-100"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact._id)}
                          className="flex-1 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
      </main>

      {/* Quick Chat Modal */}
      {showChatModal && selectedContactForChat && (
         <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[450px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-primary text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black">
                  {selectedContactForChat.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-black leading-none">{selectedContactForChat.name}</h3>
                  <p className="text-[10px] font-bold opacity-70 mt-1 uppercase">Quick Conversation</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">WhatsApp Number</p>
                <p className="text-sm font-black text-slate-800">+{selectedContactForChat.phoneNumber}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Body</label>
                <textarea
                  rows="4"
                  placeholder="Type your message here..."
                   value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-300 resize-none"
                ></textarea>
              </div>
              <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <Info size={14} />
                <p className="text-[10px] font-bold uppercase tracking-wide">This will be sent via your primary WhatsApp number</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex items-center gap-3">
              <button
                onClick={() => setShowChatModal(false)}
                className="flex-1 py-3.5 bg-white text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
               <button
                onClick={handleSendMessage}
                disabled={submitting || !chatMessage.trim()}
                className="flex-[2] py-3.5 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[500px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex flex-col max-h-[85vh]">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 leading-none">Add Single Contact</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Create a new audience member</p>
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
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Abdul Shaik"
                     value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number (with code)</label>
                  <input
                    type="text"
                    placeholder="e.g., 919876543210"
                     value={newContact.phoneNumber}
                    onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="shaik@manuen.com"
                       value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                    <input
                      type="text"
                      placeholder="City, Country"
                       value={newContact.location}
                      onChange={(e) => setNewContact({ ...newContact, location: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consent Source</label>
                    <select
                       value={newContact.consent_source}
                      onChange={(e) => setNewContact({ ...newContact, consent_source: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="web">Web</option>
                      <option value="store">Store</option>
                      <option value="qr">QR Code</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Consent Status</label>
                    <select
                       value={newContact.consent_status}
                      onChange={(e) => setNewContact({ ...newContact, consent_status: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                   <div className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${newContact.consent ? 'bg-secondary' : 'bg-slate-300'}`} onClick={() => setNewContact({ ...newContact, consent: !newContact.consent })}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newContact.consent ? 'left-5' : 'left-1'}`}></div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Marketing Consent</p>
                    <p className="text-[9px] text-secondary/70 font-bold uppercase tracking-widest">User has opted-in for messages</p>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-50 flex items-center justify-end gap-3 shrink-0">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3.5 bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                 <button
                  onClick={handleSaveContact}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  Save Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload CSV Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[500px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <FileUp size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 leading-none">Import CSV Audience</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Bulk upload your contact database</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

             <div className="p-8 space-y-6">
              <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer relative group">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  disabled={submitting}
                />
                 {submitting ? (
                  <Loader2 size={40} className="animate-spin text-primary" />
                ) : (
                  <>
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-primary transition-colors">
                      <Download size={32} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-slate-700">Click to upload or drag & drop</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Supports .CSV and .XLSX files</p>
                    </div>
                  </>
                )}
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-3">
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} className="text-indigo-600" />
                  CSV Format Requirements
                </h4>
                <ul className="text-[10px] text-slate-500 font-bold uppercase tracking-widest space-y-2 list-disc ml-4">
                  <li>Column 1: phoneNumber (required)</li>
                  <li>Column 2: name (optional)</li>
                  <li>Column 3: email (optional)</li>
                  <li>Column 4: location (optional)</li>
                </ul>
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 flex items-center justify-center">
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-full py-4 bg-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all"
              >
                Close Importer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}