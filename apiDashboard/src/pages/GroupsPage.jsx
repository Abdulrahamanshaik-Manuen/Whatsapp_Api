import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Users, Tag, MoreVertical,
  Trash2, Edit2, X, Check, Loader2,
  Calendar, FolderOpen, ChevronRight, UserPlus,
  Mail, Phone, Filter, Grid, List as ListIcon,
  MessageSquare, Info, ShieldCheck, Download
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupContacts, setGroupContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts'); // contacts, about, activity

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
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setGroups(data);
        if (data.length > 0 && !selectedGroup) {
          setSelectedGroup(data[0]);
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
    setContactsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/groups/${groupId}/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setGroupContacts(data);
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
        fetchGroupContacts(selectedGroup._id); // Refresh to show verified status if needed
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
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      {/* Page Header */}
      <div className="px-8 py-6 border-b border-slate-100 bg-white shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Groups</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your contact groups and organize your contacts</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <ShieldCheck size={24} />
            </button>
            <button 
              onClick={() => {
                setGroupForm({ name: '', description: '', tags: [] });
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#059669] text-white text-sm font-semibold rounded-lg hover:bg-[#047857] transition-all shadow-sm active:scale-95"
            >
              <Plus size={18} />
              Create Group
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-0 overflow-hidden">
        {/* Left Sidebar - Group List */}
        <div className="w-[350px] flex flex-col border-r border-slate-100 bg-[#F9FAFB] overflow-hidden">
          <div className="p-4 space-y-4 shrink-0">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search groups by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 cursor-pointer">
                Sort by: Newest
                <ChevronRight size={14} className="rotate-90" />
              </div>
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                <button className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md"><Grid size={14} /></button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"><ListIcon size={14} /></button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pt-0 space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-xl border border-slate-100 animate-pulse"></div>
              ))
            ) : filteredGroups.length === 0 ? (
              <div className="py-20 text-center opacity-40">
                <FolderOpen size={40} className="mx-auto text-slate-300 mb-4" />
                <p className="text-sm font-medium text-slate-900">No Groups Found</p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div
                  key={group._id}
                  onClick={() => setSelectedGroup(group)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group relative ${
                    selectedGroup?._id === group._id
                      ? 'bg-white border-emerald-500 ring-1 ring-emerald-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl ${
                      group.name.charAt(0).toLowerCase() < 'm' ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}>
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 truncate pr-6">{group.name}</h3>
                        <MoreVertical size={14} className="text-slate-400 absolute top-4 right-4" />
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{group.description || 'No description provided'}</p>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <Users size={12} className="text-slate-400" />
                          {group.contactCount || 0} members
                        </div>
                        <div className="flex gap-1 overflow-hidden">
                          {group.tags?.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              idx === 0 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            }`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Content - Group Detail */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {selectedGroup ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Group Hero Info */}
              <div className="p-8 border-b border-slate-100 shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-3xl ${
                      selectedGroup.name.charAt(0).toLowerCase() < 'm' ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}>
                      {selectedGroup.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedGroup.name}</h2>
                        <button 
                          onClick={() => {
                            setGroupForm({ 
                              name: selectedGroup.name, 
                              description: selectedGroup.description,
                              tags: selectedGroup.tags || []
                            });
                            setShowEditModal(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{selectedGroup.description || 'Test group for priority contacts'}</p>
                      <div className="flex items-center gap-2 mt-4">
                        {selectedGroup.tags?.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold">
                            {tag}
                          </span>
                        ))}
                        <button className="w-6 h-6 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-200">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-center">
                      <p className="text-xl font-bold text-slate-900 leading-none">{selectedGroup.contactCount || 0}</p>
                      <p className="text-xs font-medium text-slate-400 mt-1.5">Members</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-slate-900 leading-none">
                        {new Date(selectedGroup.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs font-medium text-slate-400 mt-1.5">Created</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => setShowEditModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                      >
                        <Edit2 size={14} />
                        Edit Group
                      </button>
                      <button 
                        onClick={() => handleDeleteGroup(selectedGroup._id)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={14} />
                        Delete Group
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Group Tabs & Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex px-8 border-b border-slate-100 bg-white">
                  {['contacts', 'about', 'activity'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 text-sm font-semibold capitalize relative transition-all ${
                        activeTab === tab ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab === 'contacts' ? `Contacts (${groupContacts.length})` : tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"></div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                  {activeTab === 'contacts' ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search contacts by name or phone..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-all"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setShowAddMembersModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all"
                          >
                            <Plus size={16} className="text-emerald-600" />
                            Add Contacts
                          </button>
                          <button 
                            onClick={handleGrantConsent}
                            disabled={submitting || groupContacts.length === 0}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-100 transition-all disabled:opacity-50"
                          >
                            <ShieldCheck size={16} />
                            Grant Consent
                          </button>
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                              <th className="w-12 px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" /></th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tags</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Added On</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {contactsLoading ? (
                              Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                  <td colSpan="6" className="px-6 py-6"><div className="h-4 bg-slate-50 rounded-full w-full"></div></td>
                                </tr>
                              ))
                            ) : groupContacts.length === 0 ? (
                              <tr>
                                <td colSpan="6" className="px-6 py-20 text-center opacity-40">
                                  <Users size={40} className="mx-auto text-slate-300 mb-4" />
                                  <p className="text-sm font-medium text-slate-900">No Members Yet</p>
                                </td>
                              </tr>
                            ) : (
                              groupContacts.map((contact) => (
                                <tr key={contact._id} className="hover:bg-slate-50/30 transition-all group">
                                  <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" /></td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-xs">
                                        {contact.name.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="text-sm font-semibold text-slate-900">{contact.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-600">
                                    {contact.phoneNumber.startsWith('91') ? `+${contact.phoneNumber}` : `+91${contact.phoneNumber}`}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex gap-1.5">
                                      {contact.tags?.map((t, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">{t}</span>
                                      ))}
                                      <button className="w-5 h-5 rounded bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-200">
                                        <Plus size={10} />
                                      </button>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                    {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button 
                                      onClick={() => handleRemoveContact(contact.phoneNumber)}
                                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Add Contacts Tooltip/Section at bottom */}
                      <div className="p-8 bg-emerald-50/30 rounded-2xl border border-emerald-100">
                        <h4 className="text-sm font-bold text-emerald-800 mb-4">Add Contacts to Group</h4>
                        <div className="flex items-center gap-4">
                          <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search and select contacts..."
                              value={contactSearchQuery}
                              onChange={(e) => setContactSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                            />
                            
                            {/* Simple Dropdown for searching contacts */}
                            {contactSearchQuery.length > 0 && (
                              <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto custom-scrollbar">
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
                                      className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center font-bold text-[10px]">{c.name.charAt(0).toUpperCase()}</div>
                                        <div>
                                          <p className="text-sm font-bold text-slate-900 leading-none">{c.name}</p>
                                          <p className="text-[10px] text-slate-500 mt-1">+{c.phoneNumber}</p>
                                        </div>
                                      </div>
                                      <Plus size={14} className="text-emerald-600" />
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          <button className="px-6 py-3 bg-[#059669] text-white text-sm font-bold rounded-lg hover:bg-[#047857] transition-all active:scale-95 shadow-sm shadow-emerald-900/10">
                            Add to Group
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-30">
                      <FolderOpen size={48} className="mx-auto text-slate-400 mb-4" />
                      <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">Coming Soon</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white opacity-40">
              <FolderOpen size={64} className="text-slate-200 mb-6" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Select a group to view details</h2>
              <p className="text-sm text-slate-500 mt-2">Manage members, tags, and settings here</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[500px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  {showCreateModal ? <Plus size={24} /> : <Edit2 size={24} />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 leading-none">{showCreateModal ? 'Create New Group' : 'Edit Group Details'}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Organize your contacts efficiently</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g., VIP Customers"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="What is this group for?"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-slate-300 resize-none"
                ></textarea>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Group Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {groupForm.tags?.map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-wider group">
                      {tag}
                      <button 
                        onClick={() => setGroupForm({ ...groupForm, tags: groupForm.tags.filter((_, i) => i !== idx) })}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newTag) {
                        setGroupForm({ ...groupForm, tags: [...groupForm.tags, newTag] });
                        setNewTag('');
                      }
                    }}
                    className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all"
                  />
                  <button 
                    onClick={() => {
                      if (newTag) {
                        setGroupForm({ ...groupForm, tags: [...groupForm.tags, newTag] });
                        setNewTag('');
                      }
                    }}
                    className="p-3 bg-primary text-white rounded-2xl hover:brightness-110 transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 flex items-center justify-end gap-3 bg-slate-50/30">
              <button 
                onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                className="px-6 py-3.5 bg-white text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={showCreateModal ? handleCreateGroup : handleUpdateGroup}
                disabled={submitting || !groupForm.name}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {showCreateModal ? 'Create Group' : 'Save Changes'}
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

// Separate component or sub-render for Add Members Modal
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[600px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 leading-none">Add Members</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">Select contacts to add to this group</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 pb-4 shrink-0">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-2">
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <p className="text-center py-10 text-slate-400 text-xs font-bold uppercase">No contacts found</p>
            ) : (
              filtered.map(contact => (
                <div 
                  key={contact._id} 
                  onClick={() => toggleSelect(contact.phoneNumber)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                    selected.includes(contact.phoneNumber) 
                      ? 'bg-primary/5 border-primary shadow-sm' 
                      : 'bg-white border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-xs">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 leading-none">{contact.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">+{contact.phoneNumber}</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                    selected.includes(contact.phoneNumber)
                      ? 'bg-primary border-primary text-white'
                      : 'border-slate-200 text-transparent'
                  }`}>
                    <Check size={14} strokeWidth={4} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between shrink-0">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            {selected.length} Contacts Selected
          </p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-3.5 bg-white text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-2xl border border-slate-200"
            >
              Cancel
            </button>
            <button 
              onClick={() => onAdd(selected)}
              disabled={submitting || selected.length === 0}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-50"
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
