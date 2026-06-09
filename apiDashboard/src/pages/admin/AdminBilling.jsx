import React, { useState, useEffect } from 'react';
import {
   CreditCard, IndianRupee, Users, Clock, ArrowUpRight,
   Download, Search, Smartphone, Zap, BarChart3, Loader2,
   TrendingUp, TrendingDown, Activity, ShieldCheck, ArrowDownLeft,
   Plus, Edit2, Trash2, X, Check, AlertCircle, Info, Settings,
   ChevronRight
} from 'lucide-react';

export default function AdminBilling() {
   const [loading, setLoading] = useState(false);
   const [billingData, setBillingData] = useState(() => {
      const cached = localStorage.getItem('admin_billing_data');
      return cached ? JSON.parse(cached) : {
         mrr: 0,
         activeSubscriptions: 0,
         metaCostTotal: 0,
         profit: 0,
         plans: [],
         subscriptions: []
      };
   });
   const [searchQuery, setSearchQuery] = useState('');
   const [planFilter, setPlanFilter] = useState('monthly');
   const [showPlanModal, setShowPlanModal] = useState(false);
   const [selectedPlan, setSelectedPlan] = useState(null);
   const [isEditing, setIsEditing] = useState(false);
   const [saving, setSaving] = useState(false);

   const [planForm, setPlanForm] = useState({
      name: '',
      price: 0,
      interval: 'monthly',
      message_limit: 1000,
      contact_limit: 1000,
      features: [''],
      is_active: true
   });

   const fetchBilling = async () => {
      try {
         const token = localStorage.getItem('token');
         const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
         const response = await fetch(`${API_BASE_URL}/admin/billing`, {
            headers: { 'Authorization': `Bearer ${token}` }
         });
         const data = await response.json();
         if (response.ok) {
            setBillingData(data);
            localStorage.setItem('admin_billing_data', JSON.stringify(data));
         }
      } catch (err) {
         console.error("Fetch Billing Error:", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchBilling();
   }, []);

   const handleSavePlan = async (e) => {
      e.preventDefault();
      setSaving(true);
      try {
         const token = localStorage.getItem('token');
         const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
         const url = isEditing
            ? `${API_BASE_URL}/admin/plans/${selectedPlan._id}`
            : `${API_BASE_URL}/admin/plans`;

         const response = await fetch(url, {
            method: isEditing ? 'PUT' : 'POST',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               ...planForm,
               features: planForm.features.filter(f => f.trim() !== '')
            })
         });

         if (response.ok) {
            setShowPlanModal(false);
            fetchBilling();
         } else {
            const err = await response.json();
            alert(err.error || "Failed to save plan");
         }
      } catch (err) {
         console.error("Save Plan Error:", err);
      } finally {
         setSaving(false);
      }
   };

   const handleDeletePlan = async (id) => {
      if (!window.confirm("Are you sure you want to delete this plan?")) return;
      try {
         const token = localStorage.getItem('token');
         const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
         const response = await fetch(`${API_BASE_URL}/admin/plans/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
         });
         if (response.ok) {
            fetchBilling();
         } else {
            const err = await response.json();
            alert(err.error || "Failed to delete plan");
         }
      } catch (err) {
         console.error("Delete Plan Error:", err);
      }
   };

   const openCreateModal = () => {
      setIsEditing(false);
      setPlanForm({
         name: '',
         price: 0,
         interval: 'monthly',
         message_limit: 1000,
         contact_limit: 1000,
         features: [''],
         is_active: true
      });
      setShowPlanModal(true);
   };

   const openEditModal = (plan) => {
      setIsEditing(true);
      setSelectedPlan(plan);
      setPlanForm({
         name: plan.name,
         price: plan.price,
         interval: plan.interval,
         message_limit: plan.message_limit,
         contact_limit: plan.contact_limit,
         features: plan.features.length > 0 ? [...plan.features] : [''],
         is_active: plan.is_active
      });
      setShowPlanModal(true);
   };

   const filteredSubscriptions = billingData?.subscriptions?.filter(sub =>
      sub.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.businessName.toLowerCase().includes(searchQuery.toLowerCase())
   ) || [];

   return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-10 custom-scrollbar bg-slate-50/30 h-full">
         <div className="max-w-[1600px] mx-auto space-y-12 pb-24">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
               <div className="space-y-1">
                  <h1 className="text-2xl md:text-4xl font-black text-primary tracking-tight flex items-center gap-3">
                     Billing & Revenue
                  </h1>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-70">
                     Global financial command center & subscription management
                  </p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                     Live Revenue Stream
                  </div>
                  <button
                     onClick={openCreateModal}
                     className="flex items-center gap-2 px-5 sm:px-8 py-3 sm:py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                  >
                     <Plus size={16} strokeWidth={4} /> Create Plan
                  </button>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
               <StatCard
                  label="Gross Revenue"
                  value={`₹${billingData?.stats?.grossRevenue?.toLocaleString() || '0'}`}
                  color="primary"
                  icon={TrendingUp}
               />
               <StatCard
                  label="Meta API Costs"
                  value={`₹${billingData?.stats?.metaCosts?.toLocaleString() || '0'}`}
                  color="rose"
                  icon={ArrowDownLeft}
               />
               <StatCard
                  label="Active Clients"
                  value={billingData?.subscriptions?.filter(s => s.status === 'active').length || 0}
                  color="amber"
                  icon={Users}
               />
            </div>

            {/* Plan Management Section */}
            <div className="space-y-8">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                        <Zap size={22} fill="currentColor" />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-primary tracking-tight uppercase">Subscription Plans</h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Configure global pricing tiers</p>
                     </div>
                  </div>

                  {/* Interval Toggle - Premium Design */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 w-fit">
                     <button
                        onClick={() => setPlanFilter('monthly')}
                        className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${planFilter === 'monthly'
                              ? 'bg-white text-primary shadow-lg ring-1 ring-slate-200'
                              : 'text-slate-400 hover:text-slate-600'
                           }`}
                     >
                        Monthly
                     </button>
                     <button
                        onClick={() => setPlanFilter('yearly')}
                        className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${planFilter === 'yearly'
                              ? 'bg-white text-primary shadow-lg ring-1 ring-slate-200'
                              : 'text-slate-400 hover:text-slate-600'
                           }`}
                     >
                        Yearly
                     </button>
                  </div>
               </div>

               {/* Grid Layout for Plans */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                  {billingData?.plans?.filter(p => p.interval === planFilter).length === 0 ? (
                     <div className="w-full h-48 bg-white/40 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-3">
                        <Info className="text-slate-300" size={32} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No {planFilter} plans configured yet</p>
                     </div>
                  ) : (
                     billingData?.plans?.filter(p => p.interval === planFilter).sort((a, b) => a.price - b.price).map(plan => (
                        <div
                           key={plan._id}
                           className="w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-8 flex flex-col relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                        >
                           {/* Plan Header */}
                           <div className="flex items-start justify-between mb-8">
                              <div className="space-y-1">
                                 <h3 className="text-lg font-black text-primary tracking-tight leading-none">{plan.name}</h3>
                                 <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${plan.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                       {plan.is_active ? 'Live' : 'Hidden'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{plan.interval}</span>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button onClick={() => openEditModal(plan)} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center">
                                    <Edit2 size={14} />
                                 </button>
                                 <button onClick={() => handleDeletePlan(plan._id)} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center">
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           </div>

                           {/* Pricing & Limits Section - Compact & Highlighted */}
                           <div className="bg-slate-50/50 rounded-3xl p-6 mb-8 border border-slate-100/50">
                              <div className="flex items-baseline gap-1 mb-6">
                                 <span className="text-2xl font-black text-primary tracking-tight leading-none">₹{plan.price.toLocaleString()}</span>
                                 <span className="text-xs font-black text-slate-400 uppercase tracking-widest">/{plan.interval === 'monthly' ? 'mo' : 'yr'}</span>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-primary">
                                       <Zap size={14} className="fill-secondary text-secondary" />
                                       <span className="text-[11px] font-black uppercase tracking-tight">{plan.message_limit.toLocaleString()}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase ml-5">Messages</p>
                                 </div>
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 text-primary">
                                       <Users size={14} className="text-blue-500" />
                                       <span className="text-[11px] font-black uppercase tracking-tight">{plan.contact_limit.toLocaleString()}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase ml-5">Contacts</p>
                                 </div>
                              </div>
                           </div>

                           {/* Features List */}
                           <div className="flex-1 space-y-3 mb-6">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Capabilities</p>
                              <div className="grid grid-cols-1 gap-2.5">
                                 {plan.features.map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 group/feat">
                                       <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center group-hover/feat:bg-secondary/20 transition-colors flex-shrink-0">
                                          <Check size={10} className="text-secondary" strokeWidth={4} />
                                       </div>
                                       <span className="text-xs text-slate-600 font-bold group-hover/feat:text-primary transition-colors truncate">{f}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4 pt-4">
               <div className="relative flex-1 w-full group">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <input
                     type="text"
                     placeholder="Search by client or business name..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-slate-400 shadow-sm"
                  />
               </div>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
               <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full min-w-[850px] text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                           <th className="pl-8 pr-4 py-6 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] border-r border-slate-100/50">Client Node</th>
                           <th className="px-6 py-6 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] border-r border-slate-100/50">Plan Details</th>
                           <th className="px-6 py-6 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] border-r border-slate-100/50">Usage</th>
                           <th className="px-6 py-6 text-[11px] font-bold text-rose-500 uppercase tracking-[0.2em] border-r border-slate-100/50 text-center">Meta Cost</th>
                           <th className="px-6 py-6 text-[11px] font-bold text-secondary uppercase tracking-[0.2em] border-r border-slate-100/50 text-center">Platform Rev</th>
                           <th className="px-8 py-6 text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] text-right">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {filteredSubscriptions.length === 0 ? (
                           <tr>
                              <td colSpan="6" className="px-8 py-24 text-center">
                                 <div className="flex flex-col items-center gap-4 opacity-30">
                                    <Smartphone size={56} className="text-slate-300" />
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">No managed nodes found</p>
                                 </div>
                              </td>
                           </tr>
                        ) : (
                           filteredSubscriptions.map((sub, i) => (
                              <tr key={i} className="group hover:bg-slate-50/80 transition-colors">
                                 <td className="pl-8 pr-4 py-6 border-r border-slate-50/50">
                                    <div className="flex items-center gap-4">
                                       <div className="w-11 h-11 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center font-black text-sm border border-slate-200 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                          {sub.client.charAt(0)}
                                       </div>
                                       <div className="min-w-0">
                                          <p className="text-sm font-black text-slate-900 truncate">{sub.client}</p>
                                          <p className="text-[10px] text-slate-400 font-black uppercase truncate mt-0.5 tracking-tighter">{sub.businessName}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-6 border-r border-slate-50/50">
                                    <div className="flex items-center gap-2">
                                       <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{sub.plan}</span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-6 border-r border-slate-50/50">
                                    <div className="flex flex-col gap-1">
                                       <div className="flex items-center gap-2 text-slate-600">
                                          <Activity size={12} className="text-slate-400" />
                                          <span className="text-[11px] font-black">{sub.messages?.toLocaleString()}</span>
                                       </div>
                                       <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                                          <div className="h-full bg-primary w-[65%] rounded-full"></div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-6 border-r border-slate-50/50 text-center">
                                    <p className="text-sm font-black text-rose-600">{sub.metaCost}</p>
                                 </td>
                                 <td className="px-6 py-6 border-r border-slate-50/50 text-center">
                                    <p className="text-sm font-black text-secondary">{sub.platformRev}</p>
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border ${sub.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                       <div className={`w-1.5 h-1.5 rounded-full ${sub.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                       <span className="text-[10px] font-black uppercase tracking-widest">{sub.status}</span>
                                    </div>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Plan Modal - Redesigned */}
         {showPlanModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
               <form onSubmit={handleSavePlan} className="bg-white w-full max-w-[650px] rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                  <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 relative">
                     <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-primary text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40">
                           {isEditing ? <Edit2 size={24} strokeWidth={3} /> : <Plus size={24} strokeWidth={4} />}
                        </div>
                        <div>
                           <h3 className="text-2xl font-black text-slate-900 tracking-tight">{isEditing ? 'Edit Strategy' : 'Define New Strategy'}</h3>
                           <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Subscription node architecture</p>
                        </div>
                     </div>
                     <button type="button" onClick={() => setShowPlanModal(false)} className="w-12 h-12 rounded-2xl hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-all hover:rotate-90">
                        <X size={24} />
                     </button>
                  </div>

                  <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2.5 col-span-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Strategy Name</label>
                           <input
                              required
                              type="text"
                              placeholder="e.g. Enterprise Power"
                              value={planForm.name}
                              onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-black text-primary focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all placeholder:text-slate-300"
                           />
                        </div>
                        <div className="space-y-2.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Price (INR)</label>
                           <div className="relative">
                              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black">₹</span>
                              <input
                                 required
                                 type="number"
                                 value={planForm.price}
                                 onChange={e => setPlanForm({ ...planForm, price: parseInt(e.target.value) })}
                                 className="w-full pl-10 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-black text-primary focus:outline-none"
                              />
                           </div>
                        </div>
                        <div className="space-y-2.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Billing Cycle</label>
                           <select
                              value={planFilter}
                              onChange={e => setPlanForm({ ...planForm, interval: e.target.value })}
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-black text-primary focus:outline-none cursor-pointer appearance-none"
                           >
                              <option value="monthly">Monthly Cycle</option>
                              <option value="yearly">Yearly Cycle</option>
                           </select>
                        </div>
                        <div className="space-y-2.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Message Capacity</label>
                           <div className="relative">
                              <Zap size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-secondary" />
                              <input
                                 required
                                 type="number"
                                 value={planForm.message_limit}
                                 onChange={e => setPlanForm({ ...planForm, message_limit: parseInt(e.target.value) })}
                                 className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-black text-primary focus:outline-none"
                              />
                           </div>
                        </div>
                        <div className="space-y-2.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Contact Database</label>
                           <div className="relative">
                              <Users size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" />
                              <input
                                 required
                                 type="number"
                                 value={planForm.contact_limit}
                                 onChange={e => setPlanForm({ ...planForm, contact_limit: parseInt(e.target.value) })}
                                 className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-black text-primary focus:outline-none"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tier Features</label>
                           <button
                              type="button"
                              onClick={() => setPlanForm({ ...planForm, features: [...planForm.features, ''] })}
                              className="px-4 py-1.5 bg-secondary text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-secondary/20 hover:scale-105 transition-all"
                           >
                              Add Perk
                           </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                           {planForm.features.map((feature, i) => (
                              <div key={i} className="flex gap-3 group/featitem animate-in slide-in-from-left-4 duration-300">
                                 <input
                                    type="text"
                                    placeholder="Feature detail..."
                                    value={feature}
                                    onChange={e => {
                                       const newFeatures = [...planForm.features];
                                       newFeatures[i] = e.target.value;
                                       setPlanForm({ ...planForm, features: newFeatures });
                                    }}
                                    className="flex-1 px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:border-secondary transition-all"
                                 />
                                 {planForm.features.length > 1 && (
                                    <button
                                       type="button"
                                       onClick={() => {
                                          const newFeatures = planForm.features.filter((_, idx) => idx !== i);
                                          setPlanForm({ ...planForm, features: newFeatures });
                                       }}
                                       className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-300 hover:text-rose-500 hover:bg-rose-100 transition-all flex items-center justify-center flex-shrink-0"
                                    >
                                       <X size={18} />
                                    </button>
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="flex items-center justify-between p-6 bg-slate-900 rounded-[2rem] border border-white/10 shadow-2xl">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-secondary/20 text-secondary rounded-xl flex items-center justify-center">
                              <ShieldCheck size={20} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-xs font-black text-white uppercase tracking-tight">Active Strategy</span>
                              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Publicly visible to clients</span>
                           </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                           <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={planForm.is_active}
                              onChange={e => setPlanForm({ ...planForm, is_active: e.target.checked })}
                           />
                           <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-secondary shadow-inner"></div>
                        </label>
                     </div>
                  </div>

                  <div className="p-10 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
                     <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 py-5 bg-white text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl border border-slate-200 hover:bg-slate-100 transition-all shadow-sm">
                        Dismiss
                     </button>
                     <button type="submit" disabled={saving} className="flex-[2] py-5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-primary/40 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 active:scale-95">
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} strokeWidth={3} />}
                        {isEditing ? 'Sync Strategy' : 'Initialize Strategy'}
                     </button>
                  </div>
               </form>
            </div>
         )}
      </div>
   );
}

function StatCard({ label, value, color, icon: Icon }) {
   const bgColors = {
      primary: 'bg-primary/10 text-primary',
      secondary: 'bg-secondary text-white shadow-lg shadow-secondary/20',
      rose: 'bg-rose-500/10 text-rose-600',
      amber: 'bg-amber-500/10 text-amber-600',
   };
   const lineColors = {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      rose: 'bg-rose-500',
      amber: 'bg-amber-500',
   };

   return (
      <div className="bg-white p-4 md:p-5 rounded-[1.25rem] border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden group">
         <div className="flex items-center gap-4">
            <div className={`w-12 h-12 flex-shrink-0 ${bgColors[color]} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
               <Icon size={24} strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5 min-w-0">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
               <h3 className="text-xl font-black text-primary truncate">{value}</h3>
            </div>
         </div>
         <div className={`absolute bottom-0 left-0 h-1 w-0 ${lineColors[color]} opacity-20 group-hover:w-full transition-all duration-500`}></div>
      </div>
   );
}

function CheckCircle2(props) {
   return (
      <svg
         {...props}
         xmlns="http://www.w3.org/2000/svg"
         width="24"
         height="24"
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         strokeWidth="2"
         strokeLinecap="round"
         strokeLinejoin="round"
      >
         <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
         <path d="m9 12 2 2 4-4" />
      </svg>
   );
}
