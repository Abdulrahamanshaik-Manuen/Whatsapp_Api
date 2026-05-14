import React, { useState, useEffect } from 'react';
import { 
  Search, User, Mail, Phone, Calendar, Shield, 
  MoreVertical, Ban, CheckCircle, ExternalLink, 
  MessageCircle, Users, Activity, Clock, ShieldCheck,
  Edit2, Eye, Trash2, Filter, Loader2, ArrowUpRight,
  UserPlus, Smartphone, Tag, Smartphone as Device,
  CheckCircle2, AlertCircle, Ban as SuspendIcon, X, Check,
  ChevronRight, CreditCard, Layout, Zap
} from 'lucide-react';

// Simple Time Helper
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

const StatCard = ({ label, value, color, icon: Icon, trend }) => {
  const colors = {
    primary: 'from-primary/10 to-primary/20 text-primary border-primary/10',
    secondary: 'from-secondary/10 to-secondary/20 text-secondary border-secondary/10',
    blue: 'from-blue-500/10 to-cyan-500/10 text-blue-600 border-blue-100',
    indigo: 'from-indigo-500/10 to-blue-500/10 text-indigo-600 border-indigo-100',
    slate: 'from-slate-500/10 to-slate-700/10 text-slate-600 border-slate-100'
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${colors[color]} opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-14 h-14 bg-gradient-to-br ${colors[color]} rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-slate-200/50`}>
          <Icon size={28} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-primary tracking-tighter leading-none">{value}</p>
            {trend && <span className="text-[10px] font-black text-secondary">{trend}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UserManagement() {
  const [data, setData] = useState({ users: [], stats: { total: 0, active: 0, completed: 0 }, plans: [] });
  const [loading, setLoading] = useState(true);
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
      }
    } catch (err) {
      console.error("Fetch Users Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchUsers();
      }
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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: selectedUser.name,
          businessName: selectedUser.businessName,
          status: selectedUser.status,
          planId: selectedUser.planId,
          limit: selectedUser.limit
        })
      });
      if (response.ok) {
        setShowEditModal(false);
        fetchUsers();
      }
    } catch (err) {
      console.error("Update User Error:", err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = data.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.phone?.includes(searchQuery) ||
                         user.businessName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50/30 h-full">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar bg-slate-50/30">
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-primary tracking-tight flex items-center gap-3">
              User Management
            </h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">
              Manage all user accounts and message plans
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="Total Users" value={data.stats.total} color="primary" icon={Users} />
          <StatCard label="Active Users" value={data.stats.active} color="secondary" icon={Activity} />
          <StatCard label="Expired Plans" value={data.stats.completed} color="slate" icon={ShieldCheck} />
        </div>

        {/* Action Bar - Filter cleaned up */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by name, business, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            {['all', 'active', 'suspended'].map(status => (
              <button 
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterStatus === status 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="pl-8 pr-4 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-100/50">User</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-100/50">Plan</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-100/50">Messages Used</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-100/50">Status</th>
                  <th className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest border-r border-slate-100/50 text-center">Dates</th>
                  <th className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center">
                       <div className="flex flex-col items-center gap-2 opacity-40">
                          <Search size={40} className="text-slate-300" />
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">No users found</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="pl-8 pr-4 py-5 border-r border-slate-50/50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-black text-sm border border-slate-200 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                               <Shield size={10} className="text-secondary" />
                               <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{user.businessName}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 border-r border-slate-50/50">
                        <div className="flex items-center gap-2">
                           <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                            user.plan.includes('Enterprise') ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                            user.plan.includes('Growth') ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {user.plan}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 border-r border-slate-50/50">
                        <div className="space-y-2 w-40">
                          <div className="flex items-center justify-between">
                             <p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{user.usage.toLocaleString()} / {user.limit.toLocaleString()}</p>
                             <p className="text-[10px] font-black text-primary">{user.usagePercentage}%</p>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                            <div 
                              className={`h-full transition-all duration-1000 ${
                                user.usagePercentage > 90 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 
                                user.usagePercentage > 70 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-primary shadow-[0_0_8px_rgba(0,66,119,0.4)]'
                              }`}
                              style={{ width: `${user.usagePercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 border-r border-slate-50/50">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`} />
                          <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${user.status === 'active' ? 'text-secondary' : 'text-slate-400'}`}>
                            {user.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 border-r border-slate-50/50 text-center">
                         <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2 text-slate-400">
                               <Calendar size={10} />
                               <span className="text-[10px] font-bold uppercase tracking-widest">
                                 {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                               </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400/60">
                               <Clock size={10} />
                               <span className="text-[9px] font-bold uppercase tracking-widest italic">
                                 {formatTimeAgo(user.lastActive)}
                               </span>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => { setSelectedUser(user); setShowViewModal(true); }}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl border border-transparent hover:border-primary/10 transition-all" title="View Details"
                          >
                            <Eye size={16} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => { setSelectedUser(user); setShowEditModal(true); }}
                            className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl border border-transparent hover:border-indigo-100 transition-all" title="Edit User"
                          >
                            <Edit2 size={16} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(user.id, user.status === 'active' ? 'suspended' : 'active')}
                            className={`p-2 rounded-xl border transition-all ${
                              user.status === 'active' 
                                ? 'text-rose-400 hover:text-rose-500 bg-rose-50/50 hover:bg-rose-50 border-rose-100/50' 
                                : 'text-emerald-400 hover:text-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 border-emerald-100/50'
                            }`}
                            title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                          >
                            {user.status === 'active' ? <SuspendIcon size={16} strokeWidth={2.5} /> : <CheckCircle2 size={16} strokeWidth={2.5} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-[500px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 bg-primary text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center font-black text-xl backdrop-blur-md">
                      {selectedUser.name.charAt(0)}
                   </div>
                   <div>
                      <h3 className="text-lg font-black">{selectedUser.name}</h3>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">User Details</p>
                   </div>
                </div>
                <button onClick={() => setShowViewModal(false)} className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <InfoTile label="Email" value={selectedUser.email} icon={Mail} />
                    <InfoTile label="Phone" value={selectedUser.phone} icon={Smartphone} />
                    <InfoTile label="Business" value={selectedUser.businessName} icon={Shield} />
                    <InfoTile label="Plan" value={selectedUser.plan} icon={CreditCard} />
                 </div>

                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</p>
                       <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${selectedUser.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {selectedUser.status}
                       </span>
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span>MESSAGES USED</span>
                          <span className="text-primary">{selectedUser.usage.toLocaleString()} / {selectedUser.limit.toLocaleString()} ({selectedUser.usagePercentage}%)</span>
                       </div>
                       <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              selectedUser.usagePercentage > 90 ? 'bg-rose-500' : 
                              selectedUser.usagePercentage > 70 ? 'bg-amber-500' : 'bg-primary'
                            }`}
                            style={{ width: `${selectedUser.usagePercentage}%` }}
                          ></div>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Date</p>
                       <p className="text-xs font-bold text-slate-800">{new Date(selectedUser.joinedDate).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                    </div>
                    <div className="flex flex-col items-end">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Seen</p>
                       <p className="text-xs font-bold text-slate-800">{formatTimeAgo(selectedUser.lastActive)}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
           <form onSubmit={handleUpdateUser} className="bg-white w-full max-w-[500px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                      <Edit2 size={24} />
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-slate-800">Edit User</h3>
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Change user plan and details</p>
                   </div>
                </div>
                <button type="button" onClick={() => setShowEditModal(false)} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                 <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                        <input 
                          type="text" 
                          value={selectedUser.name}
                          onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                        <input 
                          type="text" 
                          value={selectedUser.businessName}
                          onChange={(e) => setSelectedUser({...selectedUser, businessName: e.target.value})}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                        />
                    </div>
                 </div>

                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Choose Plan</label>
                        <select 
                          value={selectedUser.planId}
                          onChange={(e) => {
                            const plan = data.plans.find(p => p._id === e.target.value);
                            setSelectedUser({...selectedUser, planId: e.target.value, limit: plan?.message_limit || selectedUser.limit});
                          }}
                          className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 appearance-none cursor-pointer"
                        >
                           {data.plans.map(plan => (
                             <option key={plan._id} value={plan._id}>{plan.name}</option>
                           ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Message Limit</label>
                        <div className="relative">
                           <input 
                              type="number" 
                              value={selectedUser.limit}
                              onChange={(e) => setSelectedUser({...selectedUser, limit: parseInt(e.target.value)})}
                              className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5"
                           />
                           <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Limit</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-medium ml-1 italic">Note: This will override the plan limit.</p>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Status</label>
                    <select 
                      value={selectedUser.status}
                      onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none cursor-pointer"
                    >
                       <option value="active">Active</option>
                       <option value="suspended">Suspended</option>
                    </select>
                 </div>
              </div>

              <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center gap-3">
                 <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-4 bg-white text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all">
                    Cancel
                 </button>
                 <button type="submit" disabled={updating} className="flex-[2] py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-light transition-all flex items-center justify-center gap-2">
                    {updating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
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
      <div className="p-4 bg-white border border-slate-100 rounded-2xl flex flex-col gap-1.5 shadow-sm">
         <div className="flex items-center gap-2 text-slate-400">
            <Icon size={12} />
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
         </div>
         <p className="text-xs font-bold text-slate-800 truncate">{value || 'N/A'}</p>
      </div>
   );
}
