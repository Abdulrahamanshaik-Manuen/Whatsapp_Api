import React, { useState, useEffect } from 'react';
import {
  Search, Mail, Calendar, Shield, Users,
  Activity, Clock, ShieldCheck, Edit2, Eye, Loader2,
  Smartphone, Tag, CheckCircle2,
  Ban as SuspendIcon, X, CreditCard, Layout
} from 'lucide-react';

const formatTimeAgo = (date) => {
  if (!date) return 'Never';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "just now";
};

// Client-style KPI card
const StatCard = ({ label, value, badgeColor, icon: Icon }) => {
  const badgeClasses = badgeColor === 'green'
    ? 'bg-emerald-50 text-[#63C132]'
    : badgeColor === 'slate'
      ? 'bg-slate-50 text-slate-500'
      : 'bg-blue-50 text-[#003B6D]';
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3.5 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer shadow-sm">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${badgeClasses}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[11px] text-slate-500 font-semibold leading-none mb-1.5">{label}</p>
        <h3 className="text-xl font-bold text-slate-900 leading-none">{value}</h3>
      </div>
    </div>
  );
};

export default function UserManagement() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(() => {
    const cached = localStorage.getItem('admin_users_data');
    return cached ? JSON.parse(cached) : { users: [], stats: { total: 0, active: 0, completed: 0 }, plans: [] };
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (response.ok) {
        setData(result);
        localStorage.setItem('admin_users_data', JSON.stringify(result));
      }
    } catch (err) {
      console.error("Fetch Users Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) fetchUsers();
    } catch (err) {
      console.error("Update Status Error:", err);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedUser.name,
          businessName: selectedUser.businessName,
          status: selectedUser.status,
          planId: selectedUser.planId,
          limit: selectedUser.limit
        })
      });
      if (response.ok) { setShowEditModal(false); fetchUsers(); }
    } catch (err) {
      console.error("Update User Error:", err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = data.users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery) ||
      user.businessName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#F8FAFC]">

      {/* Page Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">User Management</h1>
          <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Manage all user accounts and message plans</p>
        </div>
      </div>

      {/* KPI Cards — client style: 3 cols on all screens */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Total Users"   value={data.stats.total}     badgeColor="blue"  icon={Users} />
        <StatCard label="Active Users"  value={data.stats.active}    badgeColor="green" icon={Activity} />
        <StatCard label="Expired Plans" value={data.stats.completed} badgeColor="slate" icon={ShieldCheck} />
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, business, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-400 transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-full sm:w-auto shrink-0 justify-center">
          {['all', 'active', 'suspended'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${filterStatus === status
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* User Table — scrollable on mobile */}
      <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse text-xs">
            <thead>
              <tr className="text-slate-400 font-bold uppercase text-[9px] tracking-wider border-b border-slate-100 bg-slate-50/30">
                <th className="py-3 px-4 font-bold">User</th>
                <th className="py-3 px-4 font-bold">Plan</th>
                <th className="py-3 px-4 font-bold">Messages Used</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-center">Dates</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <Search size={32} className="text-slate-300" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                    {/* User */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center font-bold text-xs border border-slate-200 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{user.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Shield size={10} className="text-secondary shrink-0" />
                            <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{user.businessName}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Plan */}
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        user.plan.includes('Enterprise') ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        user.plan.includes('Growth')     ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {user.plan}
                      </span>
                    </td>
                    {/* Usage */}
                    <td className="py-2.5 px-4">
                      <div className="space-y-1 w-36">
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                          <span>{user.usage.toLocaleString()} / {user.limit.toLocaleString()}</span>
                          <span className="text-primary">{user.usagePercentage}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                          <div
                            className={`h-full transition-all duration-1000 ${
                              user.usagePercentage > 90 ? 'bg-rose-500' :
                              user.usagePercentage > 70 ? 'bg-amber-500' : 'bg-primary'
                            }`}
                            style={{ width: `${user.usagePercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${user.status === 'active' ? 'text-secondary' : 'text-slate-400'}`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    {/* Dates */}
                    <td className="py-2.5 px-4 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="flex items-center gap-1 text-slate-400 font-bold text-[9px]">
                          <Calendar size={10} />
                          <span>{new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400/60 font-bold text-[8px] italic">
                          <Clock size={10} />
                          <span>{formatTimeAgo(user.lastActive)}</span>
                        </div>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSelectedUser(user); setShowViewModal(true); }}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg border border-transparent hover:border-primary/10 transition-all"
                          title="View Details"
                        >
                          <Eye size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => { setSelectedUser(user); setShowEditModal(true); }}
                          className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-100 transition-all"
                          title="Edit User"
                        >
                          <Edit2 size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(user.id, user.status === 'active' ? 'suspended' : 'active')}
                          className={`p-1.5 rounded-lg border transition-all ${
                            user.status === 'active'
                              ? 'text-rose-400 hover:text-rose-500 bg-rose-50/50 hover:bg-rose-50 border-rose-100/50'
                              : 'text-emerald-400 hover:text-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 border-emerald-100/50'
                          }`}
                          title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                        >
                          {user.status === 'active' ? <SuspendIcon size={14} strokeWidth={2.5} /> : <CheckCircle2 size={14} strokeWidth={2.5} />}
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

      {/* ── View Modal ── */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full sm:max-w-[500px] rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
            <div className="p-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedUser.logoUrl ? (
                  <img src={selectedUser.logoUrl} alt="Logo" className="w-10 h-10 object-cover rounded-lg border border-white/20 shadow-sm bg-white" />
                ) : (
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold text-lg backdrop-blur-sm">
                    {selectedUser.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold">{selectedUser.name}</h3>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-65">User Details</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <InfoTile label="Email"    value={selectedUser.email}        icon={Mail} />
                <InfoTile label="Phone"    value={selectedUser.phone}        icon={Smartphone} />
                <InfoTile label="Business" value={selectedUser.businessName} icon={Shield} />
                <InfoTile label="Plan"     value={selectedUser.plan}         icon={CreditCard} />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account Status</p>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${selectedUser.status === 'active' ? 'bg-[#EAFDF5] text-[#10B981] border border-[#A7F3D0]' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                    {selectedUser.status}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-500">
                    <span>MESSAGES USED</span>
                    <span className="text-primary">{selectedUser.usage.toLocaleString()} / {selectedUser.limit.toLocaleString()} ({selectedUser.usagePercentage}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full transition-all duration-1000 ${selectedUser.usagePercentage > 90 ? 'bg-rose-500' : selectedUser.usagePercentage > 70 ? 'bg-amber-500' : 'bg-primary'}`}
                      style={{ width: `${selectedUser.usagePercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Corporate Profile Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <InfoTile label="Category" value={selectedUser.businessCategory} icon={Tag} />
                  <InfoTile label="Location"  value={selectedUser.city && selectedUser.country ? `${selectedUser.city}, ${selectedUser.country}` : selectedUser.city || selectedUser.country || 'N/A'} icon={Layout} />
                </div>
                <div className="px-1 space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Street Address</p>
                  <p className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-100 p-3 rounded-lg leading-normal">
                    {selectedUser.address && selectedUser.state ? `${selectedUser.address}, ${selectedUser.state}` : selectedUser.address || 'N/A'}
                  </p>
                </div>
                <div className="px-1 space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</p>
                  <p className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-100 p-3 rounded-lg leading-normal">
                    {selectedUser.businessDescription || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 pt-3 border-t border-slate-50 text-[10px]">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Joined Date</p>
                  <p className="font-bold text-slate-800">{new Date(selectedUser.joinedDate).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Seen</p>
                  <p className="font-bold text-slate-800">{formatTimeAgo(selectedUser.lastActive)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <form onSubmit={handleUpdateUser} className="bg-white w-full sm:max-w-[500px] rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Edit User</h3>
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">Change user plan and details</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-400 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                  <input
                    type="text"
                    value={selectedUser.businessName}
                    onChange={(e) => setSelectedUser({ ...selectedUser, businessName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-400 transition-all"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Choose Plan</label>
                  <select
                    value={selectedUser.planId}
                    onChange={(e) => {
                      const plan = data.plans.find(p => p._id === e.target.value);
                      setSelectedUser({ ...selectedUser, planId: e.target.value, limit: plan?.message_limit || selectedUser.limit });
                    }}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none appearance-none cursor-pointer"
                  >
                    {data.plans.map(plan => (
                      <option key={plan._id} value={plan._id}>{plan.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Limit</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={selectedUser.limit}
                      onChange={(e) => setSelectedUser({ ...selectedUser, limit: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase">Limit</span>
                  </div>
                  <p className="text-[8px] text-slate-400 font-semibold ml-1 italic leading-none">Note: This will override the plan limit.</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Status</label>
                <select
                  value={selectedUser.status}
                  onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
              <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-2 bg-white text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200 hover:bg-slate-100 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={updating} className="flex-[2] py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md hover:bg-primary-light transition-all flex items-center justify-center gap-1.5">
                {updating ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function InfoTile({ label, value, icon: Icon }) {
  return (
    <div className="p-3 bg-white border border-slate-100 rounded-lg flex flex-col gap-1 shadow-sm">
      <div className="flex items-center gap-1.5 text-slate-400">
        <Icon size={11} />
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-xs font-semibold text-slate-800 truncate">{value || 'N/A'}</p>
    </div>
  );
}
