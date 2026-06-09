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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#F8FAFC] h-full">
         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-3 shrink-0">
            <div>
               <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Billing & Revenue</h1>
               <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Global financial command center & subscription management</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
               <button
                  onClick={openCreateModal}
                  className="flex items-center justify-center gap-1.5 h-8 px-3.5 bg-[#003B6D] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all active:scale-95 shadow-sm"
               >
                  <Plus size={14} strokeWidth={2.5} />
                  <span>Create Plan</span>
               </button>
            </div>
         </div>

         {/* Stats Grid */}
         <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 shrink-0">
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
         <div className="space-y-4 border-t border-slate-100 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
               <div className="flex items-center gap-2">
                  <Zap size={16} className="text-[#003B6D] fill-[#003B6D]" />
                  <div>
                     <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Subscription Plans</h2>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Configure global pricing tiers</p>
                  </div>
               </div>

               {/* Interval Toggle */}
               <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 w-fit shrink-0">
                  <button
                     onClick={() => setPlanFilter('monthly')}
                     className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${planFilter === 'monthly'
                           ? 'bg-[#003B6D] text-white shadow-sm'
                           : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                  >
                     Monthly
                  </button>
                  <button
                     onClick={() => setPlanFilter('yearly')}
                     className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${planFilter === 'yearly'
                           ? 'bg-[#003B6D] text-white shadow-sm'
                           : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                        }`}
                  >
                     Yearly
                  </button>
               </div>
            </div>

            {/* Grid Layout for Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
               {billingData?.plans?.filter(p => p.interval === planFilter).length === 0 ? (
                  <div className="col-span-full h-36 bg-white rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-center p-4">
                     <Info className="text-slate-350" size={24} />
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No {planFilter} plans configured yet</p>
                  </div>
               ) : (
                  billingData?.plans?.filter(p => p.interval === planFilter).sort((a, b) => a.price - b.price).map(plan => (
                     <div
                        key={plan._id}
                        className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col relative overflow-hidden group hover:shadow-md hover:border-slate-300 transition-all duration-350"
                     >
                        {/* Plan Header */}
                        <div className="flex items-start justify-between mb-4">
                           <div className="space-y-1">
                              <h3 className="text-xs font-bold text-slate-800 tracking-tight leading-none">{plan.name}</h3>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                 <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${plan.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                    {plan.is_active ? 'Live' : 'Hidden'}
                                 </span>
                                 <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">{plan.interval}</span>
                              </div>
                           </div>
                           <div className="flex gap-1.5">
                              <button onClick={() => openEditModal(plan)} className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 hover:text-[#003B6D] hover:bg-blue-50 transition-all flex items-center justify-center border border-slate-200/40">
                                 <Edit2 size={12} />
                              </button>
                              <button onClick={() => handleDeletePlan(plan._id)} className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center border border-slate-200/40">
                                 <Trash2 size={12} />
                              </button>
                           </div>
                        </div>

                        {/* Pricing & Limits Section */}
                        <div className="bg-slate-50/50 rounded-lg p-3 mb-4 border border-slate-100">
                           <div className="flex items-baseline gap-0.5 mb-2.5">
                              <span className="text-lg font-bold text-slate-855 tracking-tight leading-none">₹{plan.price.toLocaleString()}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">/{plan.interval === 'monthly' ? 'mo' : 'yr'}</span>
                           </div>

                           <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-0.5">
                                 <div className="flex items-center gap-1 text-slate-700 leading-none">
                                    <Zap size={11} className="fill-[#63C132] text-[#63C132]" />
                                    <span className="text-[10px] font-bold">{plan.message_limit.toLocaleString()}</span>
                                 </div>
                                 <p className="text-[8px] text-slate-450 font-semibold uppercase tracking-wider ml-4">Messages</p>
                              </div>
                              <div className="space-y-0.5">
                                 <div className="flex items-center gap-1 text-slate-700 leading-none">
                                    <Users size={11} className="text-blue-500" />
                                    <span className="text-[10px] font-bold">{plan.contact_limit.toLocaleString()}</span>
                                 </div>
                                 <p className="text-[8px] text-slate-450 font-semibold uppercase tracking-wider ml-4">Contacts</p>
                              </div>
                           </div>
                        </div>

                        {/* Features List */}
                        <div className="flex-1 space-y-2 mb-2.5">
                           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-2">Core Capabilities</p>
                           <div className="grid grid-cols-1 gap-1.5">
                              {plan.features.map((f, i) => (
                                 <div key={i} className="flex items-center gap-2 group/feat">
                                    <div className="w-4 h-4 rounded-full bg-[#63C132]/10 flex items-center justify-center flex-shrink-0">
                                       <Check size={9} className="text-[#63C132]" strokeWidth={4} />
                                    </div>
                                    <span className="text-xs text-slate-600 font-semibold group-hover/feat:text-slate-850 transition-colors truncate">{f}</span>
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
         <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm shrink-0 mt-4">
            <div className="relative flex-1 w-full group">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
               <input
                  type="text"
                  placeholder="Search by client or business name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-400 outline-none transition-all placeholder:text-slate-400 shadow-sm"
               />
            </div>
         </div>

         {/* Subscriptions Table */}
         <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mt-4">
            <div className="overflow-x-auto custom-scrollbar">
               <table className="w-full min-w-[850px] text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-400">
                        <th className="pl-4 pr-3 py-3 text-[9px] font-black uppercase tracking-widest">Client Node</th>
                        <th className="px-3 py-3 text-[9px] font-black uppercase tracking-widest">Plan Details</th>
                        <th className="px-3 py-3 text-[9px] font-black uppercase tracking-widest">Usage</th>
                        <th className="px-3 py-3 text-[9px] font-black uppercase tracking-widest text-center">Meta Cost</th>
                        <th className="px-3 py-3 text-[9px] font-black uppercase tracking-widest text-center">Platform Rev</th>
                        <th className="pr-4 pl-3 py-3 text-[9px] font-black uppercase tracking-widest text-right">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredSubscriptions.length === 0 ? (
                        <tr>
                           <td colSpan="6" className="px-8 py-16 text-center">
                              <div className="flex flex-col items-center gap-2.5 opacity-30">
                                 <Smartphone size={36} className="text-slate-300" />
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No managed nodes found</p>
                              </div>
                           </td>
                        </tr>
                     ) : (
                        filteredSubscriptions.map((sub, i) => (
                           <tr key={i} className="group hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0">
                              <td className="pl-4 pr-3 py-2.5">
                                 <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 bg-blue-50 text-[#003B6D] rounded-lg flex items-center justify-center font-bold text-[10px] border border-blue-100/50">
                                       {sub.client.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                       <p className="text-xs font-bold text-slate-800 truncate">{sub.client}</p>
                                       <p className="text-[9px] text-slate-400 font-bold uppercase truncate mt-0.5">{sub.businessName}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-3 py-2.5">
                                 <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{sub.plan}</span>
                                 </div>
                              </td>
                              <td className="px-3 py-2.5">
                                 <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1 text-slate-650 leading-none">
                                       <Activity size={10} className="text-slate-400" />
                                       <span className="text-[10px] font-bold">{sub.messages?.toLocaleString()}</span>
                                    </div>
                                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                                       <div className="h-full bg-[#003B6D] w-[65%] rounded-full"></div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                 <p className="text-xs font-bold text-rose-600">{sub.metaCost}</p>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                 <p className="text-xs font-bold text-emerald-600">{sub.platformRev}</p>
                              </td>
                              <td className="pr-4 pl-3 py-2.5 text-right">
                                 <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${sub.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                    <span>{sub.status}</span>
                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Plan Modal */}
         {showPlanModal && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
               <form onSubmit={handleSavePlan} className="bg-white w-full max-w-[500px] rounded-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                     <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#003B6D] text-white rounded-lg flex items-center justify-center">
                           {isEditing ? <Edit2 size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={3} />}
                        </div>
                        <div>
                           <h3 className="text-sm font-bold text-slate-800 tracking-tight">{isEditing ? 'Edit Strategy' : 'Define New Strategy'}</h3>
                           <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-450">Subscription node architecture</p>
                        </div>
                     </div>
                     <button type="button" onClick={() => setShowPlanModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-all hover:rotate-90">
                        <X size={16} />
                     </button>
                  </div>

                  <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar flex-1 bg-white">
                     <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1 col-span-2">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Strategy Name</label>
                           <input
                              required
                              type="text"
                              placeholder="e.g. Enterprise Power"
                              value={planForm.name}
                              onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                              className="w-full h-8 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-400 focus:outline-none transition-all placeholder:text-slate-350"
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Price (INR)</label>
                           <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-800 font-bold text-xs">₹</span>
                              <input
                                 required
                                 type="number"
                                 value={planForm.price}
                                 onChange={e => setPlanForm({ ...planForm, price: parseInt(e.target.value) })}
                                 className="w-full h-8 pl-6 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-400 focus:outline-none"
                              />
                           </div>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Billing Cycle</label>
                           <select
                              value={planForm.interval}
                              onChange={e => setPlanForm({ ...planForm, interval: e.target.value })}
                              className="w-full h-8 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none cursor-pointer"
                           >
                              <option value="monthly">Monthly Cycle</option>
                              <option value="yearly">Yearly Cycle</option>
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Message Capacity</label>
                           <div className="relative">
                              <Zap size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#63C132]" />
                              <input
                                 required
                                 type="number"
                                 value={planForm.message_limit}
                                 onChange={e => setPlanForm({ ...planForm, message_limit: parseInt(e.target.value) })}
                                 className="w-full h-8 pl-7 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-400 focus:outline-none"
                              />
                           </div>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Contact Database</label>
                           <div className="relative">
                              <Users size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                              <input
                                 required
                                 type="number"
                                 value={planForm.contact_limit}
                                 onChange={e => setPlanForm({ ...planForm, contact_limit: parseInt(e.target.value) })}
                                 className="w-full h-8 pl-7 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-slate-400 focus:outline-none"
                              />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <div className="flex items-center justify-between ml-0.5">
                           <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tier Features</label>
                           <button
                              type="button"
                              onClick={() => setPlanForm({ ...planForm, features: [...planForm.features, ''] })}
                              className="px-2.5 py-1 bg-[#003B6D] text-white text-[8px] font-bold uppercase tracking-wider rounded-md shadow-sm hover:opacity-90 active:scale-95 transition-all"
                           >
                              Add Perk
                           </button>
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto pr-1.5 custom-scrollbar">
                           {planForm.features.map((feature, i) => (
                              <div key={i} className="flex gap-2 group/featitem items-center">
                                 <input
                                    type="text"
                                    placeholder="Feature detail..."
                                    value={feature}
                                    onChange={e => {
                                       const newFeatures = [...planForm.features];
                                       newFeatures[i] = e.target.value;
                                       setPlanForm({ ...planForm, features: newFeatures });
                                    }}
                                    className="flex-1 px-3 h-8 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-400"
                                 />
                                 {planForm.features.length > 1 && (
                                    <button
                                       type="button"
                                       onClick={() => {
                                          const newFeatures = planForm.features.filter((_, idx) => idx !== i);
                                          setPlanForm({ ...planForm, features: newFeatures });
                                       }}
                                       className="w-8 h-8 rounded-lg bg-rose-50 text-rose-450 hover:text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center flex-shrink-0 border border-rose-200/40"
                                    >
                                       <X size={14} />
                                    </button>
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-lg border border-white/10 shadow-md">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center">
                              <ShieldCheck size={16} />
                           </div>
                           <div className="flex flex-col leading-none">
                              <span className="text-xs font-bold text-white uppercase tracking-tight">Active Strategy</span>
                              <span className="text-[8px] font-semibold text-white/40 uppercase tracking-widest mt-0.5">Visible to clients</span>
                           </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                           <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={planForm.is_active}
                              onChange={e => setPlanForm({ ...planForm, is_active: e.target.checked })}
                           />
                           <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#63C132]"></div>
                        </label>
                     </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2 shrink-0">
                     <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 py-2 bg-white text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer">
                        Dismiss
                     </button>
                     <button type="submit" disabled={saving} className="flex-[2] py-2 bg-[#003B6D] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50">
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} strokeWidth={3} />}
                        <span>{isEditing ? 'Sync Strategy' : 'Initialize Strategy'}</span>
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
      primary: 'bg-blue-50 text-[#003B6D]',
      secondary: 'bg-emerald-50 text-[#63C132]',
      rose: 'bg-rose-50 text-rose-600',
      amber: 'bg-amber-50 text-amber-600',
   };

   return (
      <div className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer shadow-sm">
         <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bgColors[color] || bgColors.primary}`}>
            <Icon size={18} />
         </div>
         <div>
            <p className="text-[10px] text-slate-500 font-semibold leading-none mb-1">{label}</p>
            <h3 className="text-lg font-bold text-slate-900 leading-none">{value}</h3>
         </div>
      </div>
   );
}

function CheckCircle2(props) {
   return (
      <svg
         {...props}
         xmlns="http://www.w3.org/2000/svg"
         width="16"
         height="16"
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
