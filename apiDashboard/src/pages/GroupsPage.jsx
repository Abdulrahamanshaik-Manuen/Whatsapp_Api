import React, { useState, useEffect } from 'react';
import {
  Users2,
  Plus,
  Search,
  MoreHorizontal,
  Edit2,
  Trash2,
  UserPlus,
  X,
  Save,
  Check,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Info,
  ExternalLink,
  Phone
} from 'lucide-react';
import axios from 'axios';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/groups');
      setGroups(res.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      showToast("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!formData.name) return showToast("Group name is required");

    try {
      const res = await axios.post('http://localhost:5000/api/groups', formData);
      setGroups([res.data, ...groups]);
      setIsAddModalOpen(false);
      setFormData({ name: '', description: '' });
      showToast("Group created successfully!");
    } catch (error) {
      console.error("Error creating group:", error);
      showToast("Failed to create group");
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    if (!formData.name) return showToast("Group name is required");

    try {
      const res = await axios.put(`http://localhost:5000/api/groups/${currentGroup._id}`, formData);
      setGroups(groups.map(g => g._id === currentGroup._id ? res.data : g));
      setIsEditModalOpen(false);
      setFormData({ name: '', description: '' });
      showToast("Group updated successfully!");
    } catch (error) {
      console.error("Error updating group:", error);
      showToast("Failed to update group");
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/groups/${id}`);
      setGroups(groups.filter(g => g._id !== id));
      showToast("Group deleted successfully");
    } catch (error) {
      console.error("Error deleting group:", error);
      showToast("Failed to delete group");
    }
  };

  const openEditModal = (group) => {
    setCurrentGroup(group);
    setFormData({ name: group.name, description: group.description || '' });
    setIsEditModalOpen(true);
  };

  const openViewModal = (group) => {
    setCurrentGroup(group);
    setIsViewModalOpen(true);
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col bg-slate-50 -m-8 min-h-[calc(100vh-80px)] overflow-hidden relative">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700">
            <Check size={18} className="text-emerald-400" />
            <span className="text-sm font-bold">{toast}</span>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 space-y-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 max-w-2xl relative group">
            <div className="absolute inset-0 bg-emerald-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full"></div>
            <div className="relative flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm group-focus-within:border-emerald-500 group-focus-within:ring-4 group-focus-within:ring-emerald-500/10 transition-all">
              <Search className="text-slate-400 mr-3" size={20} />
              <input
                type="text"
                placeholder={`Search ${groups.length} groups...`}
                className="w-full bg-transparent border-none outline-none text-slate-700 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 mr-2">
              <button
                onClick={() => setViewType('grid')}
                className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewType('table')}
                className={`p-2 rounded-lg transition-all ${viewType === 'table' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={18} />
              </button>
            </div>
            <button
              onClick={() => {
                setFormData({ name: '', description: '' });
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
            >
              <Plus size={18} /> Create Group
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto p-8">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Users2 size={40} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">No groups found</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">
                {searchQuery ? "We couldn't find any groups matching your search." : "Create your first group to start organizing your contacts for better campaigns."}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
              >
                <Plus size={20} /> Create Your First Group
              </button>
            )}
          </div>
        ) : viewType === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGroups.map((group) => (
              <div
                key={group._id}
                className="group bg-white border border-slate-200 rounded-3xl p-6 transition-all duration-300 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:scale-[1.02] cursor-pointer relative"
                onClick={() => openViewModal(group)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Users2 size={24} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(group); }}
                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group._id); }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg line-clamp-1">{group.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 h-8">
                      {group.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-slate-800">{group.contactCount || 0}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contacts</span>
                    </div>
                    <button className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-8 py-4">Group Name</th>
                  <th className="px-8 py-4">Description</th>
                  <th className="px-8 py-4 text-center">Contacts</th>
                  <th className="px-8 py-4">Created At</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGroups.map((group) => (
                  <tr key={group._id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => openViewModal(group)}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Users2 size={18} />
                        </div>
                        <span className="font-bold text-slate-800">{group.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 max-w-md truncate">
                      {group.description || "-"}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">
                        {group.contactCount || 0}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500">
                      {new Date(group.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditModal(group); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group._id); }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl">
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

      {/* Add/Edit Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${isAddModalOpen ? 'bg-emerald-500' : 'bg-blue-500'} text-white flex items-center justify-center`}>
                  {isAddModalOpen ? <Plus size={20} /> : <Edit2 size={20} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{isAddModalOpen ? 'Create New Group' : 'Edit Group'}</h3>
                  <p className="text-xs text-slate-500">{isAddModalOpen ? 'Define a new contact segment' : 'Update group details'}</p>
                </div>
              </div>
              <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleCreateGroup : handleUpdateGroup} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. VIP Customers"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Description (Optional)</label>
                <textarea
                  placeholder="What is this group for?"
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all flex items-center gap-2"
                >
                  <Save size={18} /> {isAddModalOpen ? 'Create Group' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Group Details Modal */}
      {isViewModalOpen && currentGroup && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                  <Users2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{currentGroup.name}</h3>
                  <p className="text-xs text-slate-500">{currentGroup.contactCount || 0} members in this group</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setIsViewModalOpen(false); openEditModal(currentGroup); }}
                  className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-white rounded-xl transition-all"
                >
                  <Edit2 size={20} />
                </button>
                <button onClick={() => setIsViewModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {currentGroup.description && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</h4>
                  <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {currentGroup.description}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Members</h4>
                  <button className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-all">
                    <UserPlus size={14} /> Add Contacts
                  </button>
                </div>

                {(!currentGroup.contacts || currentGroup.contacts.length === 0) ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-300 mb-3">
                      <Users2 size={24} />
                    </div>
                    <p className="text-sm font-medium text-slate-500">No members yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentGroup.contacts.map((contact, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">
                            {contact.substring(contact.length - 2)}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{contact}</span>
                        </div>
                        <button className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <Info size={14} />
                <span>Created on {new Date(currentGroup.createdAt).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:bg-black transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
