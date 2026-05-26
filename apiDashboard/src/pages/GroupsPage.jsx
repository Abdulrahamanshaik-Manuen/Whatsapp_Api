import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Users, Trash2, Edit2, X, Check, Loader2,
  Calendar, FolderOpen, UserPlus, ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle, TrendingUp, Globe, Layers, Activity
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function GroupsPage() {
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('cached_groups');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedGroup, setSelectedGroup] = useState(() => {
    const saved = localStorage.getItem('cached_selected_group');
    return saved ? JSON.parse(saved) : null;
  });
  const [groupContacts, setGroupContacts] = useState(() => {
    const saved = localStorage.getItem('cached_group_contacts');
    return saved ? JSON.parse(saved) : [];
  });
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(!groups.length);
  const [contactsLoading, setContactsLoading] = useState(!groupContacts.length && selectedGroup);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts');

  // Form states
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [selectedContactsForGroup, setSelectedContactsForGroup] = useState([]);

  useEffect(() => {
    fetchGroups();
    fetchAllContacts();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupContacts(selectedGroup._id);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    if (groups.length === 0) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        const sortedGroups = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setGroups(sortedGroups);
        localStorage.setItem('cached_groups', JSON.stringify(sortedGroups));

        // Only auto-select if we don't have a cached selection OR if cached one is no longer in the list
        if (data.length > 0) {
          const stillExists = selectedGroup ? data.find(g => g._id === selectedGroup._id) : false;
          if (!selectedGroup || !stillExists) {
            setSelectedGroup(sortedGroups[0]);
            localStorage.setItem('cached_selected_group', JSON.stringify(sortedGroups[0]));
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setAllContacts(data);
    } catch (err) {
      console.error("Failed to fetch all contacts:", err);
    }
  };

  const fetchGroupContacts = async (groupId) => {
    if (groupContacts.length === 0) setContactsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setGroupContacts(data);
        localStorage.setItem('cached_group_contacts', JSON.stringify(data));
      }
    } catch (err) {
      console.error("Failed to fetch group contacts:", err);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupForm.name) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/groups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupForm)
      });
      if (response.ok) {
        const newGroup = await response.json();
        setGroups([newGroup, ...groups]);
        setSelectedGroup(newGroup);
        setShowCreateModal(false);
        setGroupForm({ name: '', description: '', tags: [] });
      }
    } catch (err) {
      console.error("Create group failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!groupForm.name || !selectedGroup) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/groups/${selectedGroup._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(groupForm)
      });
      if (response.ok) {
        const updated = await response.json();
        setGroups(groups.map(g => g._id === updated._id ? updated : g));
        setSelectedGroup(updated);
        setShowEditModal(false);
      }
    } catch (err) {
      console.error("Update group failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!window.confirm("Delete this group? This won't delete the contacts.")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const remaining = groups.filter(g => g._id !== id);
        setGroups(remaining);
        if (selectedGroup?._id === id) {
          setSelectedGroup(remaining[0] || null);
        }
      }
    } catch (err) {
      console.error("Delete group failed:", err);
    }
  };

  const handleAddContactsToGroup = async (phoneNumbers) => {
    if (!selectedGroup || !phoneNumbers.length) return;

    // Normalize phone numbers before sending
    const normalizedNumbers = phoneNumbers.map(phone => {
      let cleaned = String(phone).replace(/\D/g, '');
      if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
      }
      return cleaned;
    });

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/groups/${selectedGroup._id}/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contacts: normalizedNumbers })
      });
      if (response.ok) {
        fetchGroupContacts(selectedGroup._id);
        fetchGroups(); // Update contact count
        setShowAddMembersModal(false);
        setSelectedContactsForGroup([]);
      }
    } catch (err) {
      console.error("Add contacts failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddContactToGroup = async (phoneNumber) => {
    await handleAddContactsToGroup([phoneNumber]);
  };

  const handleRemoveContact = async (phoneNumber) => {
    if (!selectedGroup) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/groups/${selectedGroup._id}/contacts`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contact: phoneNumber })
      });
      if (response.ok) {
        setGroupContacts(groupContacts.filter(c => c.phoneNumber !== phoneNumber));
        fetchGroups(); // Update contact count
      }
    } catch (err) {
      console.error("Remove contact failed:", err);
    }
  };

  const handleGrantConsent = async () => {
    if (!selectedGroup) return;

    // Check if consent is already granted for all contacts
    const allConsented = groupContacts.length > 0 && groupContacts.every(c => c.consent);
    if (allConsented) {
      alert("Consent already granted for all members in this group.");
      return;
    }

    if (!window.confirm("Grant marketing consent to all members of this group? This will allow you to send marketing campaigns to them.")) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/groups/${selectedGroup._id}/consent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchGroupContacts(selectedGroup._id); // Refresh to show verified status
      } else {
        alert(data.error || "Failed to grant consent");
      }
    } catch (err) {
      console.error("Grant consent failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableContacts = allContacts.filter(c =>
    !selectedGroup?.contacts?.includes(c.phoneNumber) &&
    (c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      c.phoneNumber.includes(contactSearchQuery))
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F9FAFB] overflow-y-auto">
      <div className="px-8 pt-8 pb-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-primary tracking-tight">
              Groups
            </h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Create, organize and manage contact groups effortlessly</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setGroupForm({ name: '', description: '', tags: [] });
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2.5 px-5 py-3 bg-gradient-to-r from-primary to-primary-light text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/30 active:scale-95"
            >
              <Plus size={18} />
              Create Group
            </button>
          </div>
        </div>

        {/* Global Stat Cards */}
        <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            label="Total Groups" 
            value={groups.length} 
            icon={FolderOpen} 
            color="primary" 
          />
          <StatCard 
            label="Total Members" 
            value={groups.reduce((acc, g) => acc + (g.contactCount || 0), 0)} 
            icon={Users} 
            color="secondary" 
          />
          <StatCard 
            label="Verified Contacts" 
            value={allContacts.filter(c => c.consent_status === 'verified').length} 
            icon={ShieldCheck} 
            color="blue" 
          />
          <StatCard 
            label="Active Search" 
            value={filteredGroups.length} 
            icon={Activity} 
            color="rose" 
          />
        </div>
      </div>

      <div className="px-4 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-0 bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100/80 overflow-hidden">
          {/* Left Sidebar - Group List */}
          <div className={`
            ${selectedGroup ? 'hidden lg:flex' : 'w-full lg:w-[380px] flex'}
            flex-col border-r border-slate-200 shrink-0
          `}>
            <div className="p-5 space-y-4 shrink-0">
              <div className="relative group">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary/80 transition-colors" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-0 focus:border-primary transition-all placeholder:text-slate-400 hover:border-slate-300"
                />
              </div>
            </div>
            <div className="flex-1 px-4 pb-4 space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
                ))
              ) : filteredGroups.length === 0 ? (
                <div className="py-20 text-center opacity-50">
                  <FolderOpen size={48} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-sm font-bold text-slate-900">No Groups Found</p>
                  <p className="text-xs text-slate-500 mt-1">Create your first group to get started</p>
                </div>
              ) : (
                filteredGroups.map((group) => (
                  <div
                    key={group._id}
                    onClick={() => {
                      setSelectedGroup(group);
                      localStorage.setItem('cached_selected_group', JSON.stringify(group));
                      // Clear group contacts so it fetches new ones for this group
                      setGroupContacts([]);
                      localStorage.removeItem('cached_group_contacts');
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group relative overflow-hidden ${selectedGroup?._id === group._id
                      ? 'bg-white border-primary/30 shadow-xl shadow-primary/10 ring-1 ring-primary/20'
                      : 'bg-[#F9FAFB] border-transparent hover:bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50'
                      }`}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg transition-transform group-hover:scale-105 duration-500 ${group.name.charAt(0).toLowerCase() < 'm' ? 'bg-gradient-to-br from-[#003B6D] to-[#004f94]' : 'bg-gradient-to-br from-primary to-primary-light'
                        }`}>
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-black text-slate-800 truncate pr-2 uppercase tracking-tight">{group.name}</h3>
                          <div className={`w-2 h-2 rounded-full ${selectedGroup?._id === group._id ? 'bg-primary animate-pulse' : 'bg-slate-200'}`} />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider bg-slate-100/50 px-2 py-1 rounded-lg">
                            <Users size={10} className="text-slate-400" />
                            {group.contactCount || 0}
                          </div>
                          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                            {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex gap-1 overflow-hidden">
                            {group.tags?.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-primary/5 text-primary border border-primary/10">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Subtle background decoration */}
                    <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Content - Group Detail */}
          <div className={`
            ${selectedGroup ? 'flex w-full lg:flex-1' : 'hidden lg:flex flex-1'}
            flex-col min-w-0
          `}>
            {selectedGroup ? (
              <div className="flex-1 flex flex-col">
                {/* Group Hero Info */}
                <div className="p-8 border-b border-slate-200 shrink-0 bg-[#F9FAFB]">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => {
                        setSelectedGroup(null);
                        localStorage.removeItem('cached_selected_group');
                      }}
                      className="lg:hidden p-1.5 -ml-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                    >
                      <X size={20} />
                    </button>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg shrink-0 ${selectedGroup.name.charAt(0).toLowerCase() < 'm' ? 'bg-gradient-to-br from-[#003B6D] to-[#004f94]' : 'bg-gradient-to-br from-primary to-primary-light'}`}>
                      {selectedGroup.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedGroup.name}</h2>
                      </div>
                      <div className="pl-4 border-l-2 border-primary/20 py-1 mb-4">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                          {selectedGroup.description || 'Organize and manage this group of contacts'}
                        </p>
                      </div>
                      <div className="flex items-center flex-wrap gap-2 mt-4">
                        {selectedGroup.tags?.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-primary/5 text-primary border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Horizontal line separator */}
                  <div className="h-px bg-slate-200 w-full my-6 opacity-50" />

                  <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                    <div className="flex flex-wrap sm:flex-nowrap gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-slate-200/60 shadow-sm flex-1 sm:flex-initial">
                        <div className="w-8 h-8 bg-primary/5 text-primary rounded-lg flex items-center justify-center">
                          <Users size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-none">{selectedGroup.contactCount || 0}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Members</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-slate-200/60 shadow-sm flex-1 sm:flex-initial">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-none">
                            {new Date(selectedGroup.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Created</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-start w-full sm:w-auto">
                      <button
                        onClick={() => {
                          setGroupForm({
                            name: selectedGroup.name,
                            description: selectedGroup.description,
                            tags: selectedGroup.tags || []
                          });
                          setShowEditModal(true);
                        }}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 text-xs font-bold text-primary bg-white border border-primary/20 rounded-xl hover:bg-primary/5 transition-all shadow-sm"
                      >
                        <Edit2 size={14} />
                        Edit Details
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(selectedGroup._id)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 text-xs font-bold text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-all shadow-sm"
                      >
                        <Trash2 size={14} />
                        Delete Group
                      </button>
                    </div>
                  </div>
                </div>

                {/* Group Tabs & Content */}
                <div className="flex-1 flex flex-col bg-[#F9FAFB]">
                  <div className="flex px-8 border-b-2 border-slate-200 bg-[#F9FAFB]">
                    {['contacts'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-4 text-sm font-bold capitalize relative transition-all duration-300 ${activeTab === tab ? 'text-primary' : 'text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        {tab === 'contacts' ? `Contacts (${groupContacts.length})` : tab}
                        {activeTab === tab && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-light rounded-t-full"></div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    {activeTab === 'contacts' ? (
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                          <div className="relative flex-1 max-w-md group w-full">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary/80 transition-colors" />
                            <input
                              type="text"
                              placeholder="Search contacts..."
                              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-0 focus:border-primary transition-all hover:border-slate-300"
                            />
                          </div>
                          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <button
                              onClick={() => setShowAddMembersModal(true)}
                              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white border-2 border-slate-200 text-slate-700 text-xs sm:text-sm font-bold rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all"
                            >
                              <Plus size={16} className="text-primary" />
                              Add Contacts
                            </button>
                            <button
                              onClick={handleGrantConsent}
                              disabled={submitting || groupContacts.length === 0}
                              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-primary text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-primary-light transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none"
                            >
                              <ShieldCheck size={16} />
                              Grant Consent
                            </button>
                          </div>
                        </div>

                        <div className="border-2 border-slate-200 rounded-2xl overflow-hidden shadow-lg">
                          <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse bg-[#F9FAFB]">
                            <thead>
                              <tr className="bg-gradient-to-r from-slate-50 to-slate-50/50 border-b-2 border-slate-200">
                                <th className="w-12 px-6 py-4"><input type="checkbox" className="rounded-lg border-slate-300 text-primary focus:ring-emerald-500" /></th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Tags</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Added</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {contactsLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                  <tr key={i} className="animate-pulse">
                                    <td colSpan="6" className="px-6 py-6"><div className="h-4 bg-slate-100 rounded-full w-full"></div></td>
                                  </tr>
                                ))
                              ) : groupContacts.length === 0 ? (
                                <tr>
                                  <td colSpan="6" className="px-6 py-24 text-center">
                                    <Users size={48} className="mx-auto text-slate-200 mb-4" />
                                    <p className="text-sm font-bold text-slate-900">No members yet</p>
                                    <p className="text-xs text-slate-500 mt-1">Add contacts to start managing this group</p>
                                  </td>
                                </tr>
                              ) : (
                                groupContacts.map((contact) => (
                                  <tr key={contact._id} className="hover:bg-primary/5/30 transition-all duration-200 group">
                                    <td className="px-6 py-4"><input type="checkbox" className="rounded-lg border-slate-300 text-primary focus:ring-emerald-500" /></td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-light text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-md">
                                          {contact.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{contact.name}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                      {contact.phoneNumber.startsWith('91') ? `+${contact.phoneNumber}` : `+91${contact.phoneNumber}`}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex gap-1.5">
                                        {contact.tags?.map((t, i) => (
                                          <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-200">{t}</span>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                      {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        {contact.consent ? (
                                          <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shadow-sm" title="Consent Granted">
                                            <Check size={14} />
                                          </div>
                                        ) : (
                                          <div className="w-6 h-6 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center shadow-sm" title="No Consent">
                                            <X size={14} />
                                          </div>
                                        )}
                                        <button
                                          onClick={() => handleRemoveContact(contact.phoneNumber)}
                                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
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

                        {/* Add Contacts Section */}
                        <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/5 rounded-2xl border-2 border-primary/20">
                          <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                            <UserPlus size={16} />
                            Quick Add Contacts
                          </h4>
                          <div className="flex items-center gap-3">
                            <div className="relative flex-1 group">
                              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                              <input
                                type="text"
                                placeholder="Search and add contacts..."
                                value={contactSearchQuery}
                                onChange={(e) => setContactSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-primary/20 rounded-xl text-sm focus:outline-none focus:ring-0 focus:border-primary transition-all"
                              />

                              {/* Dropdown for searching contacts */}
                              {contactSearchQuery.length > 0 && (
                                <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto custom-scrollbar">
                                  {availableContacts.length === 0 ? (
                                    <div className="p-4 text-center text-xs font-medium text-slate-500">No matching contacts</div>
                                  ) : (
                                    availableContacts.map(c => (
                                      <div
                                        key={c._id}
                                        onClick={() => {
                                          handleAddContactToGroup(c.phoneNumber);
                                          setContactSearchQuery('');
                                        }}
                                        className="p-4 hover:bg-primary/5 cursor-pointer flex items-center justify-between border-b border-slate-100 last:border-b-0 transition-all"
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-[10px]">{c.name.charAt(0).toUpperCase()}</div>
                                          <div>
                                            <p className="text-sm font-bold text-slate-900 leading-none">{c.name}</p>
                                            <p className="text-[10px] text-slate-500 mt-1">+{c.phoneNumber}</p>
                                          </div>
                                        </div>
                                        <Plus size={14} className="text-primary" />
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center py-32 animate-in fade-in zoom-in duration-700">
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-slate-200/50 border border-white">
                          <FolderOpen size={40} className="text-slate-300" />
                        </div>
                        <p className="text-xl font-black text-slate-800 uppercase tracking-widest opacity-20">Coming Soon</p>
                        <p className="text-sm text-slate-400 font-bold mt-4 max-w-xs text-center leading-relaxed">This section is currently under development to provide advanced analytics.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-[#F9FAFB] animate-in fade-in duration-500">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
                  <div className="w-32 h-32 bg-white rounded-[3rem] shadow-2xl shadow-slate-200 flex items-center justify-center relative z-10 border border-slate-100 group-hover:-translate-y-2 transition-transform duration-500">
                    <FolderOpen size={56} className="text-blue-100 group-hover:text-primary transition-colors" />
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
                      <Users size={20} />
                    </div>
                  </div>
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter mt-10">Select a Group</h2>
                <p className="text-sm text-slate-400 font-bold mt-3 max-w-[280px] text-center leading-relaxed uppercase tracking-widest">Choose a segment from the sidebar to manage members and campaigns</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[500px] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b-2 border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  {showCreateModal ? <Plus size={24} /> : <Edit2 size={24} />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-none">{showCreateModal ? 'Create New Group' : 'Edit Group'}</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Manage your contact groups</p>
                </div>
              </div>
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Group Name *</label>
                <input
                  type="text"
                  placeholder="e.g., VIP Customers"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-0 focus:border-primary transition-all placeholder:text-slate-400 hover:border-slate-300"
                />
              </div>
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Description</label>
                <textarea
                  rows="3"
                  placeholder="What is this group for?"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-0 focus:border-primary transition-all placeholder:text-slate-400 resize-none hover:border-slate-300"
                ></textarea>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Group Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {groupForm.tags?.map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-2 px-3.5 py-2 bg-primary/10 text-emerald-700 border-2 border-primary/20 rounded-xl text-xs font-bold uppercase tracking-wider group hover:bg-emerald-200 transition-all">
                      {tag}
                      <button
                        onClick={() => setGroupForm({ ...groupForm, tags: groupForm.tags.filter((_, i) => i !== idx) })}
                        className="hover:text-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newTag) {
                        setGroupForm({ ...groupForm, tags: [...groupForm.tags, newTag] });
                        setNewTag('');
                      }
                    }}
                    className="flex-1 px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-0 focus:border-primary transition-all hover:border-slate-300"
                  />
                  <button
                    onClick={() => {
                      if (newTag) {
                        setGroupForm({ ...groupForm, tags: [...groupForm.tags, newTag] });
                        setNewTag('');
                      }
                    }}
                    className="p-3 bg-primary text-white rounded-xl hover:bg-primary-light transition-all active:scale-95 shadow-lg shadow-primary/30"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 border-t-2 border-slate-200 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="px-6 py-3 bg-white text-slate-600 text-xs font-black uppercase tracking-wider rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={showCreateModal ? handleCreateGroup : handleUpdateGroup}
                disabled={submitting || !groupForm.name}
                className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary-light text-white text-xs font-black uppercase tracking-wider rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-primary/30 active:scale-95 disabled:opacity-50 disabled:shadow-none"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {showCreateModal ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AddMembersModal
        isOpen={showAddMembersModal}
        onClose={() => setShowAddMembersModal(false)}
        contacts={allContacts}
        onAdd={handleAddContactsToGroup}
        submitting={submitting}
      />
    </div>
  );
}

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

// Separate component for Add Members Modal
function AddMembersModal({ isOpen, onClose, contacts, onAdd, submitting }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);

  if (!isOpen) return null;

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phoneNumber.includes(search)
  );

  const toggleSelect = (phone) => {
    if (selected.includes(phone)) {
      setSelected(selected.filter(p => p !== phone));
    } else {
      setSelected([...selected, phone]);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[600px] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
        <div className="p-8 border-b-2 border-slate-200 flex items-center justify-between shrink-0 bg-gradient-to-r from-emerald-50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-none">Add Members</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Select contacts to add to this group</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 pb-4 shrink-0">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary/80 transition-colors" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-0 focus:border-primary transition-all hover:border-slate-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-2">
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={48} className="mx-auto text-slate-200 mb-3" />
                <p className="text-sm font-bold text-slate-500">No contacts found</p>
              </div>
            ) : (
              filtered.map(contact => (
                <div
                  key={contact._id}
                  onClick={() => toggleSelect(contact.phoneNumber)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${selected.includes(contact.phoneNumber)
                    ? 'bg-primary/5 border-primary/50 shadow-md'
                    : 'bg-white border-slate-200 hover:border-primary/40 hover:shadow-sm'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center font-black text-sm text-slate-600">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none">{contact.name}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1.5">+{contact.phoneNumber}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selected.includes(contact.phoneNumber)
                    ? 'bg-primary border-emerald-500 text-white'
                    : 'border-slate-300 text-transparent hover:border-primary/50'
                    }`}>
                    <Check size={14} strokeWidth={4} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-8 border-t-2 border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
          <p className="text-xs font-black text-slate-600 uppercase tracking-wider">
            {selected.length} Contact{selected.length !== 1 ? 's' : ''} Selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white text-slate-600 text-xs font-black uppercase tracking-wider rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => onAdd(selected)}
              disabled={submitting || selected.length === 0}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary-light text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-primary/30 hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:shadow-none"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Add to Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
