import React, { useState, useEffect } from 'react';
import { CreditCard, Edit3, Users, Clock, ArrowUpRight, Download, Search, Smartphone, Zap, BarChart3, Loader2 } from 'lucide-react';

export default function AdminBilling() {
   const [billingData, setBillingData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');

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

   if (loading) {
      return (
         <div className="flex-1 flex items-center justify-center bg-[#F5F7FA]">
           <div className="flex flex-col items-center gap-4">
             <Loader2 className="animate-spin text-primary" size={40} />
             <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Calculating Financial Ledger...</p>
           </div>
         </div>
      );
   }

   const filteredSubscriptions = billingData?.subscriptions?.filter(sub => 
      sub.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
      sub.businessName.toLowerCase().includes(searchQuery.toLowerCase())
   ) || [];

   return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
         <div className="max-w-[1400px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Billing & Revenue</h1>
                  <p className="text-sm text-slate-500 font-medium mt-1">Manage platform pricing plans and monitor financial growth</p>
               </div>
               <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg flex items-center gap-2">
                     <BarChart3 size={16} className="text-secondary" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Revenue Optimizer Active</span>
                  </div>
               </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-10">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Gross Revenue</p>
                     <h3 className="text-2xl font-black text-slate-900">₹{billingData?.stats?.grossRevenue?.toLocaleString() || '0'}</h3>
                     <p className="text-[10px] text-emerald-500 font-bold mt-2">Current Cycle</p>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-10">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Meta API Costs</p>
                     <h3 className="text-2xl font-black text-slate-900">₹{billingData?.stats?.metaCosts?.toLocaleString() || '0'}</h3>
                     <p className="text-[10px] text-rose-500 font-bold mt-2">API Overhead</p>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-10">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Net Profit</p>
                     <h3 className="text-2xl font-black text-slate-900">₹{(billingData?.stats?.grossRevenue - billingData?.stats?.metaCosts)?.toLocaleString() || '0'}</h3>
                     <p className="text-[10px] text-blue-500 font-bold mt-2">After API Costs</p>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                  <div className="relative z-10">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Active Nodes</p>
                     <h3 className="text-2xl font-black text-slate-900">{billingData?.subscriptions?.filter(s => s.status === 'active').length || 0} Users</h3>
                     <p className="text-[10px] text-amber-500 font-bold mt-2">Billable Clients</p>
                  </div>
               </div>
            </div>

            {/* Client Subscriptions & API Costs */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Client Node Subscriptions</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Detailed breakdown of client plans and Meta API overhead</p>
                  </div>
                  <div className="relative w-full md:w-80">
                     <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                        type="text" 
                        placeholder="Search client node..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-primary transition-all" 
                     />
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-slate-50/50">
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Name</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Plan</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Messages</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-rose-500">Meta Cost</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-emerald-500">Platform Rev</th>
                           <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {filteredSubscriptions.map((sub, i) => (
                           <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-8 py-6">
                                 <p className="text-sm font-black text-slate-900">{sub.client}</p>
                                 <p className="text-[10px] text-slate-400 font-bold">{sub.businessName}</p>
                              </td>
                              <td className="px-8 py-6">
                                 <span className="px-3 py-1 bg-slate-100 text-[9px] font-black text-slate-600 uppercase tracking-widest rounded-lg">Managed Node</span>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="text-sm font-bold text-slate-700">{sub.messages?.toLocaleString()}</p>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="text-sm font-black text-rose-600">{sub.metaCost}</p>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="text-sm font-black text-emerald-600">{sub.platformRev}</p>
                              </td>
                              <td className="px-8 py-6">
                                 <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${sub.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {sub.status}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
   );
}
