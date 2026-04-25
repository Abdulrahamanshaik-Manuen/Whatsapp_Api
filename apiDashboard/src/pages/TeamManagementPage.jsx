import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  MoreVertical, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Search,
  Filter,
  X
} from 'lucide-react';

export default function TeamManagementPage() {
  const [members, setMembers] = useState([
    { id: 1, name: 'Rahul Sharma', email: 'rahul.s@example.com', role: 'Owner', status: 'Active', joined: 'Oct 12, 2024', avatar: 'RS' },
    { id: 2, name: 'Priya Patel', email: 'priya.p@example.com', role: 'Admin', status: 'Active', joined: 'Nov 05, 2024', avatar: 'PP' },
    { id: 3, name: 'Amit Verma', email: 'amit.v@example.com', role: 'Editor', status: 'Pending', joined: 'Dec 01, 2024', avatar: 'AV' },
  ]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');

  const roles = [
    { name: 'Admin', desc: 'Full access to all settings and team management.', icon: ShieldCheck, color: 'text-purple-600' },
    { name: 'Editor', desc: 'Can manage campaigns, templates and automation.', icon: UserCheck, color: 'text-blue-600' },
    { name: 'Viewer', desc: 'Read-only access to analytics and logs.', icon: Clock, color: 'text-slate-500' },
  ];

  const handleInvite = () => {
    if (!inviteEmail) return;
    const newMember = {
      id: Date.now(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'Pending',
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      avatar: inviteEmail.charAt(0).toUpperCase()
    };
    setMembers([...members, newMember]);
    setInviteEmail('');
    setIsInviteModalOpen(false);
  };

  const removeMember = (id) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-200"
        >
          <UserPlus size={18} /> Invite New Member
        </button>
      </div>

      {/* Stats/Filter Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" />
              </div>
              <button className="p-2 text-slate-500 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
                <Filter size={18} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold border border-slate-200">
                            {member.avatar}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{member.name}</span>
                            <span className="text-xs text-slate-500">{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className={member.role === 'Owner' ? 'text-amber-500' : 'text-slate-400'} />
                          <span className="text-sm font-semibold text-slate-700">{member.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          member.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {member.joined}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            disabled={member.role === 'Owner'}
                            onClick={() => removeMember(member.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-0"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-all">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Roles Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-lg font-bold">Role Permissions</h3>
            </div>
            <div className="space-y-6">
              {roles.map((role, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <role.icon size={16} className={role.color} />
                    <span className="text-sm font-bold">{role.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{role.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Removed Need more seats? section */}
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Invite Team Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Assign Role</label>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div 
                      key={role.name}
                      onClick={() => setInviteRole(role.name)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                        inviteRole === role.name 
                        ? 'border-blue-500 bg-blue-50/30' 
                        : 'border-slate-100 bg-white hover:border-slate-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        inviteRole === role.name ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-slate-400'
                      }`}>
                        <role.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-800">{role.name}</span>
                          {inviteRole === role.name && <CheckCircle2 size={16} className="text-blue-500" />}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">{role.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setIsInviteModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all">Cancel</button>
              <button 
                onClick={handleInvite}
                className="px-8 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:bg-black transition-all"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
