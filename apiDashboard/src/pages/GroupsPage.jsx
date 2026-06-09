import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Users, Trash2, Edit2, X, Check, Loader2, Download, Folder,
  Calendar, FolderOpen, UserPlus, ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle, TrendingUp, Globe, Layers, Activity,
  ArrowLeft
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

  // New CRM Redesign States
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [selectedDrawerContacts, setSelectedDrawerContacts] = useState([]);
  const [drawerSearchQuery, setDrawerSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState(selectedGroup ? 'details' : 'list');

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
        setMobileView('details');
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
          const nextGroup = remaining[0] || null;
          setSelectedGroup(nextGroup);
          setMobileView(nextGroup ? 'details' : 'list');
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

  // Bulk selection and drawer helper actions
  const handleSelectAllContacts = (e) => {
    if (e.target.checked) {
      setSelectedContactIds(groupContacts.map(c => c._id));
    } else {
      setSelectedContactIds([]);
    }
  };

  const handleSelectContactRow = (id) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter(x => x !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const handleBulkRemoveFromGroup = async () => {
    if (!selectedGroup || !selectedContactIds.length) return;
    if (!window.confirm(`Remove these ${selectedContactIds.length} contacts from this group?`)) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const targets = groupContacts.filter(c => selectedContactIds.includes(c._id));
      
      await Promise.all(targets.map(c => 
        fetch(`${API_BASE_URL}/groups/${selectedGroup._id}/contacts`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ contact: c.phoneNumber })
        })
      ));
      
      setGroupContacts(groupContacts.filter(c => !selectedContactIds.includes(c._id)));
      setSelectedContactIds([]);
      fetchGroups(); // Update metrics
      alert("Members removed successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to remove some members.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkMoveToGroup = async (targetGroupId) => {
    if (!targetGroupId || !selectedGroup || !selectedContactIds.length) return;
    const targets = groupContacts.filter(c => selectedContactIds.includes(c._id));
    const phoneNumbers = targets.map(c => c.phoneNumber);
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // 1. Add to target group
      const addRes = await fetch(`${API_BASE_URL}/groups/${targetGroupId}/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contacts: phoneNumbers })
      });
      
      if (addRes.ok) {
        // 2. Remove from current group
        await Promise.all(targets.map(c => 
          fetch(`${API_BASE_URL}/groups/${selectedGroup._id}/contacts`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contact: c.phoneNumber })
          })
        ));
        
        setGroupContacts(groupContacts.filter(c => !selectedContactIds.includes(c._id)));
        setSelectedContactIds([]);
        fetchGroups();
        alert("Contacts moved successfully!");
      } else {
        alert("Failed to add contacts to the target group.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to move contacts.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkGrantConsent = async () => {
    if (!selectedContactIds.length) return;
    if (!window.confirm(`Grant marketing consent to the ${selectedContactIds.length} selected contacts?`)) return;
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const targets = groupContacts.filter(c => selectedContactIds.includes(c._id));
      
      await Promise.all(targets.map(c => 
        fetch(`${API_BASE_URL}/contacts/${c._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: c.name,
            phoneNumber: c.phoneNumber,
            email: c.email || '',
            location: c.location || '',
            consent: true,
            consent_status: 'verified',
            consent_source: c.consent_source || 'web'
          })
        })
      ));
      
      fetchGroupContacts(selectedGroup._id);
      setSelectedContactIds([]);
      alert("Marketing consent granted to selected contacts!");
    } catch (err) {
      console.error(err);
      alert("Failed to grant consent to some contacts.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportGroupMembers = () => {
    if (!groupContacts.length || !selectedGroup) {
      alert("No members in this group to export.");
      return;
    }

    const headers = ['Name', 'Phone Number', 'Email', 'Location', 'Consent Status', 'Source', 'Joined Date'];
    const csvRows = [
      headers.join(','),
      ...groupContacts.map(c => [
        `"${c.name}"`,
        `"${c.phoneNumber}"`,
        `"${c.email || ''}"`,
        `"${c.location || ''}"`,
        `"${c.consent ? 'verified' : 'unverified'}"`,
        `"${c.consent_source || 'web'}"`,
        `"${new Date(c.createdAt).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `group_${selectedGroup.name.replace(/\s+/g, '_')}_members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleAddDrawerContacts = async () => {
    if (!selectedDrawerContacts.length) return;
    await handleAddContactsToGroup(selectedDrawerContacts);
    setSelectedDrawerContacts([]);
    setShowAddDrawer(false);
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
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-y-auto lg:overflow-hidden relative">
      <main className="flex-1 flex flex-col lg:overflow-hidden p-4 md:p-6 space-y-4 custom-scrollbar">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Groups</h1>
            <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Manage your contact groups</p>
          </div>
          <div>
            <button
              onClick={() => {
                setGroupForm({ name: '', description: '', tags: [] });
                setShowCreateModal(true);
              }}
              className="flex items-center gap-1.5 h-9 px-3.5 bg-[#004277] hover:brightness-105 active:scale-98 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Create Group</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0">
          {/* Card 1: Total Groups */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#004277] flex items-center justify-center shrink-0">
              <FolderOpen size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Total Groups</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{groups.length}</h3>
            </div>
          </div>

          {/* Card 2: Total Members */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Total Members</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">
                {groups.reduce((acc, g) => acc + (g.contactCount || 0), 0)}
              </h3>
            </div>
          </div>

          {/* Card 3: Verified Contacts */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-[#22C55E] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Verified Contacts</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">
                {allContacts.filter(c => c.consent_status === 'verified').length}
              </h3>
            </div>
          </div>

          {/* Card 4: Active Search */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <Search size={20} />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">Active Search</p>
              <h3 className="text-xl font-bold text-slate-900 leading-none">{filteredGroups.length}</h3>
            </div>
          </div>
        </div>

        {/* Split Pane Layout */}
        <div className="flex-1 flex gap-4 min-h-[550px] lg:min-h-0 lg:overflow-hidden">
          
          {/* Left Group List Panel */}
          <div className={`w-full lg:w-[260px] flex flex-col bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm shrink-0 ${mobileView === 'list' ? 'flex' : 'hidden lg:flex'}`}>
            {/* Sidebar Search */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/30">
              <div className="relative group">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004277] transition-colors" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
            
            {/* Sidebar List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
                ))
              ) : filteredGroups.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  No groups
                </div>
              ) : (
                filteredGroups.map((group) => {
                  const isSelected = selectedGroup?._id === group._id;
                  return (
                    <div
                      key={group._id}
                      onClick={() => {
                        setSelectedGroup(group);
                        localStorage.setItem('cached_selected_group', JSON.stringify(group));
                        setGroupContacts([]);
                        localStorage.removeItem('cached_group_contacts');
                        setSelectedContactIds([]); // Clear selections
                        setMobileView('details');
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-lg transition-all cursor-pointer select-none group relative border ${
                        isSelected 
                          ? 'bg-[#004277]/5 text-[#004277] border-[#004277]/10 font-bold' 
                          : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-600 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FolderOpen size={14} className={isSelected ? 'text-[#004277]' : 'text-slate-400 group-hover:text-slate-500'} />
                        <span className="text-xs truncate max-w-[130px]">{group.name}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        isSelected ? 'bg-[#004277] text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {group.contactCount || 0}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Group Details & Contacts Table */}
          <div className={`flex-1 flex flex-col bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm min-w-0 relative ${mobileView === 'details' ? 'flex' : 'hidden lg:flex'}`}>
            {selectedGroup ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* Group Details Header Panel */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setMobileView('list')}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-slate-150/80 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer mr-1 shrink-0"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <h2 className="text-base font-bold text-slate-800 tracking-tight">{selectedGroup.name}</h2>
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-150/60 border border-slate-200 px-1.5 py-0.5 rounded-md leading-none">
                        Created {new Date(selectedGroup.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {selectedGroup.description && (
                      <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed">
                        {selectedGroup.description}
                      </p>
                    )}
                    {selectedGroup.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {selectedGroup.tags.map((tag, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100/50 rounded text-[9px] font-bold uppercase tracking-wider">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        setGroupForm({
                          name: selectedGroup.name,
                          description: selectedGroup.description,
                          tags: selectedGroup.tags || []
                        });
                        setShowEditModal(true);
                      }}
                      className="flex items-center gap-1 h-8 px-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      <Edit2 size={12} className="text-slate-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(selectedGroup._id)}
                      className="flex items-center gap-1 h-8 px-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      <Trash2 size={12} className="text-red-400" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Table Action Toolbar & Contacts Table */}
                <div className="flex-1 flex flex-col min-h-0 bg-white">
                  {/* Contacts Toolbar */}
                  <div className="p-3 border-b border-slate-100 bg-white/70 flex flex-col sm:flex-row items-center gap-3 shrink-0">
                    <div className="relative flex-1 w-full group">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004277] transition-colors" />
                      <input
                        type="text"
                        placeholder="Search contacts..."
                        value={contactSearchQuery}
                        onChange={(e) => setContactSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <button
                        onClick={() => setShowAddDrawer(true)}
                        className="flex items-center gap-1.5 h-8 px-3 bg-[#004277] hover:brightness-105 active:scale-98 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
                      >
                        <Plus size={12} strokeWidth={2.5} />
                        <span>Add</span>
                      </button>
                      <button
                        onClick={handleGrantConsent}
                        disabled={submitting || groupContacts.length === 0}
                        className="flex items-center gap-1.5 h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        <ShieldCheck size={12} className="text-[#22C55E]" />
                        <span>Grant</span>
                      </button>
                      <button
                        onClick={handleExportGroupMembers}
                        disabled={groupContacts.length === 0}
                        className="flex items-center gap-1.5 h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
                      >
                        <Download size={12} className="text-slate-400" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>

                  {/* Dense Table View */}
                  <div className="flex-1 overflow-auto custom-scrollbar min-h-0">
                    <table className="w-full min-w-[650px] text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider select-none">
                          <th className="py-2.5 pl-4 pr-2 w-10 text-center border-r border-slate-100">
                            <input
                              type="checkbox"
                              checked={groupContacts.length > 0 && selectedContactIds.length === groupContacts.length}
                              onChange={handleSelectAllContacts}
                              className="w-3.5 h-3.5 rounded text-[#004277] focus:ring-[#004277] border-slate-300 accent-[#004277] cursor-pointer"
                            />
                          </th>
                          <th className="px-4 py-2.5">Contact</th>
                          <th className="px-4 py-2.5">Phone</th>
                          <th className="px-4 py-2.5">Consent</th>
                          <th className="px-4 py-2.5">Tags</th>
                          <th className="px-4 py-2.5 text-center">Added</th>
                          <th className="px-4 py-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {contactsLoading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                              <td colSpan="7" className="px-4 py-3">
                                <div className="h-4 bg-slate-50 rounded w-full" />
                              </td>
                            </tr>
                          ))
                        ) : groupContacts.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="py-16 text-center text-slate-400 font-semibold text-xs">
                              No members found. Click "Add" to start segmenting.
                            </td>
                          </tr>
                        ) : (
                          groupContacts.filter(c => 
                            c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) || 
                            c.phoneNumber.includes(contactSearchQuery)
                          ).map((contact) => {
                            const isSelected = selectedContactIds.includes(contact._id);
                            return (
                              <tr key={contact._id} className={`group hover:bg-slate-50/40 transition-colors ${isSelected ? 'bg-blue-50/20' : ''}`}>
                                <td className="py-2.5 pl-4 pr-2 text-center border-r border-slate-100">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleSelectContactRow(contact._id)}
                                    className="w-3.5 h-3.5 rounded text-[#004277] focus:ring-[#004277] border-slate-300 accent-[#004277] cursor-pointer"
                                  />
                                </td>
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 bg-[#004277]/10 text-[#004277] rounded-lg flex items-center justify-center font-bold text-[10px] border border-[#004277]/10 group-hover:bg-[#004277] group-hover:text-white group-hover:border-[#004277] transition-all shrink-0">
                                      {contact.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-slate-900 truncate max-w-[130px] group-hover:text-[#004277] transition-colors" title={contact.name}>{contact.name}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-2.5">
                                  <code className="inline-flex items-center text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200/60 px-1.5 py-0.5 rounded font-mono">
                                    +{contact.phoneNumber}
                                  </code>
                                </td>
                                <td className="px-4 py-2.5">
                                  {contact.consent ? (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black uppercase tracking-wider">
                                      <Check size={10} strokeWidth={3} /> Verified
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black uppercase tracking-wider">
                                      <X size={10} strokeWidth={3} /> No Consent
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-2.5">
                                  <div className="flex flex-wrap gap-1">
                                    {contact.tags?.slice(0, 2).map((t, idx) => (
                                      <span key={idx} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-semibold">{t}</span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-4 py-2.5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                  {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </td>
                                <td className="px-4 py-2.5 text-right">
                                  <button
                                    onClick={() => handleRemoveContact(contact.phoneNumber)}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                                    title="Remove from group"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 p-6 animate-in fade-in duration-500">
                <FolderOpen size={48} className="text-slate-300 mb-3" />
                <h3 className="text-sm font-bold text-slate-700">No Group Selected</h3>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs text-center font-semibold">Select a group segment from the left panel to manage list contacts and view options.</p>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Bulk Action floating bar */}
      {selectedContactIds.length > 0 && selectedGroup && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl flex items-center gap-4 z-40 shadow-2xl animate-in slide-in-from-bottom-5">
          <span className="text-[11px] font-bold text-slate-300">
            {selectedContactIds.length} member{selectedContactIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="w-[1px] h-4 bg-slate-800" />
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkGrantConsent}
              className="flex items-center gap-1.5 h-8 px-3 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer select-none"
            >
              <ShieldCheck size={13} className="text-[#22C55E]" />
              Grant Consent
            </button>
            
            <button
              onClick={handleBulkRemoveFromGroup}
              className="flex items-center gap-1.5 h-8 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold rounded-lg transition-colors cursor-pointer select-none border border-red-500/10"
            >
              <Trash2 size={13} />
              Remove
            </button>
            
            {/* Move to another group select dropdown */}
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkMoveToGroup(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="h-8 pl-3 pr-8 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-lg border border-transparent focus:outline-none cursor-pointer appearance-none animate-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2394A3B8\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2.5\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '10px' }}
              >
                <option value="" className="bg-slate-900 text-slate-400">Move to...</option>
                {groups.filter(g => g._id !== selectedGroup._id).map(g => (
                  <option key={g._id} value={g._id} className="bg-slate-900 text-white">{g.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={() => setSelectedContactIds([])}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Right-Side Add Contacts Drawer */}
      <div className={`fixed inset-y-0 right-0 z-50 w-[360px] bg-white border-l border-slate-200 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${showAddDrawer ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus size={16} className="text-[#004277]" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Add Contacts</span>
          </div>
          <button
            onClick={() => {
              setShowAddDrawer(false);
              setSelectedDrawerContacts([]);
              setDrawerSearchQuery('');
            }}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Search */}
        <div className="p-4 border-b border-slate-100 shrink-0 bg-white">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#004277] transition-colors" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={drawerSearchQuery}
              onChange={(e) => setDrawerSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 h-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {allContacts.filter(c => {
            const alreadyInGroup = groupContacts.some(gc => gc.phoneNumber === c.phoneNumber);
            return !alreadyInGroup && (
              c.name.toLowerCase().includes(drawerSearchQuery.toLowerCase()) ||
              c.phoneNumber.includes(drawerSearchQuery)
            );
          }).length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs font-semibold">
              No matching contacts to add
            </div>
          ) : (
            allContacts.filter(c => {
              const alreadyInGroup = groupContacts.some(gc => gc.phoneNumber === c.phoneNumber);
              return !alreadyInGroup && (
                c.name.toLowerCase().includes(drawerSearchQuery.toLowerCase()) ||
                c.phoneNumber.includes(drawerSearchQuery)
              );
            }).map(contact => {
              const isChecked = selectedDrawerContacts.includes(contact.phoneNumber);
              return (
                <div
                  key={contact._id}
                  onClick={() => {
                    if (isChecked) {
                      setSelectedDrawerContacts(selectedDrawerContacts.filter(p => p !== contact.phoneNumber));
                    } else {
                      setSelectedDrawerContacts([...selectedDrawerContacts, contact.phoneNumber]);
                    }
                  }}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                    isChecked 
                      ? 'bg-blue-50/10 border-[#004277]' 
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-[10px]">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-none">{contact.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">+{contact.phoneNumber}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="w-3.5 h-3.5 rounded text-[#004277] focus:ring-[#004277] border-slate-300 accent-[#004277]"
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center gap-2 bg-slate-50/50 shrink-0">
          <button
            onClick={() => {
              setShowAddDrawer(false);
              setSelectedDrawerContacts([]);
              setDrawerSearchQuery('');
            }}
            className="flex-1 h-9 bg-white text-slate-500 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleAddDrawerContacts}
            disabled={submitting || selectedDrawerContacts.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-[#004277] hover:brightness-105 text-white text-xs font-bold rounded-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {submitting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            <span>Add ({selectedDrawerContacts.length})</span>
          </button>
        </div>
      </div>

      {/* Drawer Backdrop */}
      {showAddDrawer && (
        <div 
          onClick={() => {
            setShowAddDrawer(false);
            setSelectedDrawerContacts([]);
            setDrawerSearchQuery('');
          }}
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Create / Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[400px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <FolderOpen size={16} className="text-[#004277]" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
                  {showCreateModal ? 'Create Group' : 'Edit Group'}
                </span>
              </div>
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Group Name *</label>
                <input
                  type="text"
                  placeholder="e.g. VIP Customers"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe this group..."
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#004277] focus:ring-1 focus:ring-[#004277]/10 outline-none transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* Chip-Based Tags UI */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Group Tags</label>
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {groupForm.tags?.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {tag}
                      <button
                        type="button"
                        onClick={() => setGroupForm({ ...groupForm, tags: groupForm.tags.filter((_, i) => i !== idx) })}
                        className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1.5 ml-1">
                    <input
                      type="text"
                      placeholder={groupForm.tags?.length ? "add tag..." : "Add tag..."}
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newTag.trim()) {
                            setGroupForm({ ...groupForm, tags: [...(groupForm.tags || []), newTag.trim()] });
                            setNewTag('');
                          }
                        }
                      }}
                      className="w-16 bg-transparent border-none text-[10px] font-bold text-slate-650 focus:outline-none outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newTag.trim()) {
                          setGroupForm({ ...groupForm, tags: [...(groupForm.tags || []), newTag.trim()] });
                          setNewTag('');
                        }
                      }}
                      className="text-[#004277] hover:text-[#004277]/80 text-[10px] font-extrabold uppercase tracking-wider px-1 cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center gap-2 bg-slate-50/50 shrink-0">
              <button
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="flex-1 h-9 bg-white text-slate-500 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={showCreateModal ? handleCreateGroup : handleUpdateGroup}
                disabled={submitting || !groupForm.name}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-[#004277] hover:brightness-105 text-white text-xs font-bold rounded-lg transition-all active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                <span>{showCreateModal ? 'Create' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
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
