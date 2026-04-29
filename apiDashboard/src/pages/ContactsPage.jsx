import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Users,
  UserPlus,
  Upload,
  Download,
  MoreHorizontal,
  Mail,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  Tag,
  Users2,
  Settings,
  History,
  MapPin,
  SortAsc,
  X,
  FileUp,
  Save,
  Check,
  PhoneOff,
  Mic,
  Volume2,
  MoreVertical,
  Smile,
  Paperclip,
  SendHorizontal,
  ExternalLink,
  Calendar,
  ShieldCheck,
  MessageSquare,
  Hash,
  Plus
} from 'lucide-react';
import axios from 'axios';

export default function ContactsPage({ subAction, onActionComplete }) {
  const [activeInternalTab, setActiveInternalTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'table'
  const [activeChip, setActiveChip] = useState('A-Z');
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/contacts');
        const mappedContacts = res.data.map(c => ({
          id: c._id,
          name: c.name,
          status: c.status || 'offline',
          phone: c.phoneNumber,
          email: c.email || '',
          group: c.details?.group || 'General',
          tags: c.details?.tags || [],
          location: c.location || 'Unknown',
          joined: c.details?.joined || new Date(c.createdAt || Date.now()).toLocaleDateString(),
          lastContact: c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString() : 'Never',
          initials: c.name ? c.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??'
        }));
        setContacts(mappedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    fetchContacts();
  }, []);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [detailsContact, setDetailsContact] = useState(null);
  const [toast, setToast] = useState(null);

  const importInputRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (subAction === 'openAddModal') {
      setIsAddModalOpen(true);
      if (onActionComplete) onActionComplete();
    }
  }, [subAction, onActionComplete]);

  const handleExport = () => {
    showToast("Exporting contacts...");

    // Create CSV content
    const headers = ["Name", "Status", "Phone", "Email", "Group", "Location", "Joined"];
    const rows = contacts.map(c => [
      c.name, c.status, c.phone || "", c.email || "", c.group, c.location || "", c.joined
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `whatsapp_contacts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Contacts exported successfully!");
  };

  const handleImportClick = () => {
    importInputRef.current.click();
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showToast("Importing contacts...");
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim() !== '');

      // Skip header
      const newContacts = lines.slice(1).map((line, index) => {
        const [name, status, phone, email, group, location, joined] = line.split(',');
        const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??';
        return {
          id: Date.now() + index,
          name: name || "New Contact",
          status: status || "offline",
          phone: phone || "",
          email: email || "",
          group: group || "Imported",
          location: location || "Unknown",
          joined: joined || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          initials,
          lastContact: "Never"
        };
      });

      setContacts(prev => [...newContacts, ...prev]);
      setIsImportModalOpen(false);
      showToast(`${newContacts.length} contacts imported successfully!`);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const stats = [
    { label: 'Total Contacts', value: contacts.length.toLocaleString(), sub: 'All time places', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Contacts', value: contacts.filter(c => c.status === 'online').length.toLocaleString(), sub: 'Currently active', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'New Month', value: '1', sub: 'Joined this month', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Groups', value: [...new Set(contacts.map(c => c.group))].length.toString(), sub: 'Total groups', icon: Users2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Tags', value: '1', sub: 'Total tags', icon: Tag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const internalNav = [
    { id: 'all', label: 'All Contacts', icon: LayoutGrid },
    { id: 'recent', label: 'Recent', icon: History },
    { id: 'groups', label: 'Groups', icon: Users2, hasSub: true },
    { id: 'tags', label: 'Tags', icon: Tag, hasSub: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const chips = [
    { label: 'A-Z' },
    { label: 'Date Joined' },
    { label: 'Last Contacted' },
    { label: 'Location' },
    { label: 'Vote:ning Inc...' },
  ];

  const handleCall = (contact) => {
    setActiveCall(contact);
    showToast(`Calling ${contact.name}...`);
  };

  const handleMessage = (contact) => {
    setActiveChat(contact);
    showToast(`Opening chat with ${contact.name}`);
  };

  const handleViewDetails = (contact) => {
    setDetailsContact(contact);
  };

  return (
    <div className="flex flex-col bg-slate-50 -m-8 min-h-[calc(100vh-80px)] overflow-hidden relative">
      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={importInputRef}
        className="hidden"
        accept=".csv"
        onChange={handleFileImport}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
            <Check size={18} className="text-emerald-400" />
            <span className="text-sm font-bold">{toast}</span>
          </div>
        </div>
      )}

      {/* Top Bar / Navigation */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 space-y-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 max-w-2xl relative group">
            <div className="absolute inset-0 bg-emerald-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full"></div>
            <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm group-focus-within:border-emerald-500 group-focus-within:ring-4 group-focus-within:ring-emerald-500/10 transition-all">
              <Search className="text-slate-400 mr-3" size={20} />
              <input
                type="text"
                placeholder={`Search ${contacts.length.toLocaleString()} contacts...`}
                className="w-full bg-transparent border-none outline-none text-slate-700 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Download size={18} /> Export
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Upload size={18} className="rotate-180" /> Import
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
            >
              <UserPlus size={18} /> Add New
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            {internalNav.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveInternalTab(item.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeInternalTab === item.id ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
                {item.hasSub && <ChevronDown size={14} className="opacity-50" />}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500">
              <Filter size={14} /> Filters:
            </div>
            <div className="flex items-center gap-2">
              {chips.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveChip(chip.label);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${activeChip === chip.label ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto p-8 space-y-8">
        {/* Stats Row */}
        <div className="flex items-center justify-center gap-12 py-4">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center group cursor-pointer">
              <div className={`w-14 h-14 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                <stat.icon size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 leading-none">{stat.value}</h3>
              <p className="text-xs font-bold text-slate-500 mt-1">{stat.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* View Toggle and Actions */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewType('table')}
              className={`p-2 rounded-lg transition-all ${viewType === 'table' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Content Rendering: Grid or Table */}
        <div className="flex-1">
          {viewType === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContactId(selectedContactId === contact.id ? null : contact.id)}
                  className={`group bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-300 cursor-pointer relative hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${contact.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                      {contact.initials}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${contact.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{contact.status}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">{contact.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                        {contact.phone ? <Phone size={12} /> : <Mail size={12} />}
                        {contact.phone || contact.email}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                        Group: <span className="text-slate-700">{contact.group}</span>
                      </p>
                      {contact.tags && contact.tags.length > 0 && (
                        <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5">
                          Tag: <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{contact.tags[0]}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 transition-all duration-300">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMessage(contact); }}
                          className="flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-all"
                        >
                          <MessageCircle size={14} /> Message
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCall(contact); }}
                          className="flex items-center justify-center gap-2 py-2 bg-slate-50 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-100 transition-all"
                        >
                          <Phone size={14} /> Call
                        </button>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewDetails(contact); }}
                        className="w-full py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-200 transition-all"
                      >
                        View details
                      </button>
                    </div>
                  </div>

                  <button className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Phone/Email</th>
                    <th className="px-6 py-4">Group</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => handleViewDetails(contact)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${contact.status === 'online' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {contact.initials}
                          </div>
                          <span className="font-bold text-slate-800 text-sm">{contact.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${contact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                          <span className="text-xs font-medium text-slate-600 capitalize">{contact.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {contact.phone || contact.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                          {contact.group}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleMessage(contact); }}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          >
                            <MessageCircle size={18} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCall(contact); }}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                          >
                            <Phone size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-all" onClick={(e) => { e.stopPropagation(); showToast(`Menu for ${contact.name}`); }}>
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)}
              className="p-2 text-slate-400 hover:bg-white rounded-lg transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            {[1, 2, 3, 4, 5, 6].map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all font-bold text-xs ${currentPage === page ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'hover:bg-white text-slate-500'}`}
              >
                {page}
              </button>
            ))}
            <span className="px-2 text-slate-400 text-xs">...</span>
            <button
              onClick={() => setCurrentPage(2048)}
              className={`px-3 h-8 flex items-center justify-center rounded-lg transition-all font-bold text-xs ${currentPage === 2048 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'hover:bg-white text-slate-500'}`}
            >
              2048
            </button>
            <button
              onClick={() => currentPage < 2048 && setCurrentPage(p => p + 1)}
              className="p-2 text-slate-400 hover:bg-white rounded-lg transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-slate-400"><span className="text-slate-800">12</span> Contacts per page</p>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Add New Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Add New Contact</h3>
                  <p className="text-xs text-slate-500">Enter contact details to save</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">First Name</label>
                  <input type="text" id="add-fname" placeholder="John" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">Last Name</label>
                  <input type="text" id="add-lname" placeholder="Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Phone Number</label>
                <div className="relative">
                  <input type="text" id="add-phone" placeholder="+91 000 000 0000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">Email (Optional)</label>
                  <input type="email" id="add-email" placeholder="john@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">Location (Optional)</label>
                  <input type="text" id="add-location" placeholder="New York, USA" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all">Cancel</button>
              <button
                onClick={() => {
                  const fname = document.getElementById('add-fname').value;
                  const lname = document.getElementById('add-lname').value;
                  const phone = document.getElementById('add-phone').value;
                  const email = document.getElementById('add-email').value;
                  const location = document.getElementById('add-location').value;
                  if (!fname || !phone) { showToast("Please enter at least Name and Phone"); return; }

                  const handleAddSubmit = async () => {
                    const newContactData = {
                      name: `${fname} ${lname}`.trim(),
                      phoneNumber: phone,
                      email: email,
                      location: location || 'Unknown',
                      details: {
                        joined: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                        group: 'Personal',
                        tags: []
                      }
                    };
                    try {
                      const res = await axios.post('http://localhost:5000/api/contacts', newContactData);
                      const c = res.data;
                      const mappedContact = {
                        id: c._id,
                        name: c.name,
                        status: c.status || 'offline',
                        phone: c.phoneNumber,
                        email: c.email || '',
                        group: c.details?.group || 'Personal',
                        tags: c.details?.tags || [],
                        location: c.location || 'Added via Dashboard',
                        joined: c.details?.joined || new Date().toLocaleDateString(),
                        lastContact: 'Never',
                        initials: c.name ? c.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '??'
                      };
                      setContacts(prev => {
                        const existingIndex = prev.findIndex(c => c.phone === mappedContact.phone);
                        if (existingIndex >= 0) {
                          const newList = [...prev];
                          newList[existingIndex] = mappedContact;
                          return newList;
                        }
                        return [mappedContact, ...prev];
                      });
                      setIsAddModalOpen(false);
                      setDetailsContact(mappedContact); // Update side drawer with new details if it's open
                      showToast("Contact saved successfully!");
                    } catch (error) {
                      console.error("Error adding contact:", error);
                      showToast("Failed to add contact.");
                    }
                  };
                  handleAddSubmit();
                }}
                className="px-8 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center gap-2"
              >
                <Save size={18} /> Save Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Contacts Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                  <FileUp size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Import Contacts</h3>
                  <p className="text-xs text-slate-500">Upload your CSV or Excel file</p>
                </div>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-10">
              <div
                onClick={handleImportClick}
                className="border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center text-center space-y-4 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                  <Upload size={32} />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-800">Click to upload your CSV file</p>
                  <p className="text-xs text-slate-500 mt-1">Select the exported CSV for a perfect match</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button onClick={handleExport} className="px-4 py-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all">
                Download Sample CSV
              </button>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsImportModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all">Cancel</button>
                <button
                  onClick={handleImportClick}
                  className="px-8 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:bg-black transition-all"
                >
                  Choose File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call Simulation Modal */}
      {activeCall && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="flex flex-col items-center text-center space-y-12 max-w-sm w-full p-8 animate-in zoom-in-95 duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20 scale-150"></div>
              <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center text-4xl font-bold text-white relative z-10 shadow-2xl">
                {activeCall.initials}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white tracking-tight">{activeCall.name}</h2>
              <p className="text-emerald-400 font-medium tracking-widest uppercase text-sm animate-pulse">Ringing...</p>
            </div>

            <div className="flex items-center gap-8 pt-8">
              <button className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-all border border-slate-700 shadow-xl">
                <Mic size={24} />
              </button>
              <button onClick={() => setActiveCall(null)} className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-2xl shadow-red-500/40 hover:scale-110">
                <PhoneOff size={32} />
              </button>
              <button className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-all border border-slate-700 shadow-xl">
                <Volume2 size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Simulation Drawer */}
      {activeChat && (
        <div className="fixed bottom-0 right-8 z-[110] w-[400px] h-[550px] bg-white rounded-t-3xl shadow-2xl border-x border-t border-slate-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-full duration-500">
          {/* Chat Header */}
          <div className="bg-slate-900 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold">
                {activeChat.initials}
              </div>
              <div>
                <h4 className="font-bold text-sm">{activeChat.name}</h4>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-all" onClick={() => { setActiveCall(activeChat); setActiveChat(null); }}><Phone size={18} /></button>
              <button onClick={() => setActiveChat(null)} className="p-2 hover:bg-slate-800 rounded-lg transition-all"><X size={18} /></button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 bg-slate-50 p-6 overflow-y-auto space-y-4 flex flex-col justify-end">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm self-start max-w-[80%]">
              <p className="text-sm text-slate-700">Hello! How can I help you today?</p>
              <span className="text-[10px] text-slate-400 mt-1 block">12:30 PM</span>
            </div>
            <div className="bg-emerald-500 text-white p-3 rounded-2xl rounded-tr-none shadow-md self-end max-w-[80%]">
              <p className="text-sm">I'm checking the new WhatsApp API dashboard. It looks amazing!</p>
              <span className="text-[10px] text-emerald-100 mt-1 block">12:31 PM</span>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-2 border border-slate-200">
              <button className="text-slate-400 hover:text-slate-600"><Smile size={20} /></button>
              <button className="text-slate-400 hover:text-slate-600"><Paperclip size={20} /></button>
              <input type="text" placeholder="Type a message..." className="bg-transparent border-none outline-none flex-1 text-sm text-slate-700 py-1" />
              <button className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all">
                <SendHorizontal size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Details Side Drawer */}
      {detailsContact && (
        <div className="fixed inset-0 z-[130] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500" onClick={() => setDetailsContact(null)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Contact Profile</h3>
              <button onClick={() => setDetailsContact(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-8 space-y-8">
                {/* Header Info */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl font-bold border-2 border-emerald-100 shadow-xl shadow-emerald-500/10">
                    {detailsContact.initials}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{detailsContact.name}</h2>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${detailsContact.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">{detailsContact.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button onClick={() => handleMessage(detailsContact)} className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all"><MessageCircle size={20} /></button>
                    <button onClick={() => handleCall(detailsContact)} className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-900/10 hover:bg-black transition-all"><Phone size={20} /></button>
                    <button className="p-3 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all"><MoreVertical size={20} /></button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Info Cards */}
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={14} className="text-emerald-500" /> Identity Details
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400"><Phone size={18} /></div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                          <p className="text-sm font-bold text-slate-800">{detailsContact.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400"><Mail size={18} /></div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Email Address</p>
                          <p className="text-sm font-bold text-slate-800">{detailsContact.email || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400"><MapPin size={18} /></div>
                        <div>
                          <p className="text-xs text-slate-400 font-medium">Location</p>
                          <p className="text-sm font-bold text-slate-800">{detailsContact.location || 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <History size={14} className="text-blue-500" /> Activity Insights
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-xs text-slate-600 font-medium">Joined On</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">{detailsContact.joined}</span>
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" />
                          <span className="text-xs text-slate-600 font-medium">Last Contact</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">{detailsContact.lastContact}</span>
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-slate-400" />
                          <span className="text-xs text-slate-600 font-medium">Current Group</span>
                        </div>
                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700">{detailsContact.group}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Tag size={14} className="text-purple-500" /> Applied Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {detailsContact.tags ? detailsContact.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-xl text-xs font-bold">{tag}</span>
                      )) : (
                        <span className="text-xs text-slate-400 italic">No tags applied</span>
                      )}
                      <button className="px-3 py-1 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1">
                        <Plus size={12} /> Add Tag
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <button className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                <ExternalLink size={18} /> Full History
              </button>
              <button
                onClick={() => {
                  setIsAddModalOpen(true);
                  setTimeout(() => {
                    const [fname, ...lnameArr] = (detailsContact.name || '').split(' ');
                    const lname = lnameArr.join(' ');
                    const phoneInput = (detailsContact.phone || '').trim();

                    const elFname = document.getElementById('add-fname');
                    const elLname = document.getElementById('add-lname');
                    const elPhone = document.getElementById('add-phone');
                    const elEmail = document.getElementById('add-email');
                    const elLocation = document.getElementById('add-location');

                    if (elFname) elFname.value = fname || '';
                    if (elLname) elLname.value = lname || '';
                    if (elPhone) elPhone.value = phoneInput || '';
                    if (elEmail) elEmail.value = detailsContact.email || '';
                    if (elLocation) elLocation.value = detailsContact.location === 'Added via Dashboard' || detailsContact.location === 'Unknown' ? '' : detailsContact.location || '';
                  }, 100);
                }}
                className="flex-1 py-3 bg-emerald-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                <Save size={18} /> Update Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
