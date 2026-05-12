import React, { useState } from 'react';
import {
  CreditCard, Check, Crown, Zap,
  ArrowRight, Download, Receipt, ShieldCheck,
  AlertCircle, History, ExternalLink, Activity, MessageSquare, Users,
  ArrowUpRight, Plus, HelpCircle, Sparkles, TrendingUp
} from 'lucide-react';

export default function BillingPage({ userData }) {
  const [isAnnual, setIsAnnual] = useState(true);

  const usageStats = [
    { 
      label: 'Messages Sent', 
      value: (userData?.messages_used || 0).toLocaleString(), 
      limit: (userData?.message_limit || 1000).toLocaleString(), 
      icon: MessageSquare, 
      color: 'primary',
      bg: 'bg-primary/5',
      percentage: Math.min(100, (userData?.messages_used / userData?.message_limit) * 100) || 0
    },
    { 
      label: 'Audience Reach', 
      value: (userData?.contacts_count || 0).toLocaleString(), 
      limit: 'Unlimited', 
      icon: Users, 
      color: 'emerald-600',
      bg: 'bg-emerald-50',
      percentage: 100
    },
    { 
      label: 'API Status', 
      value: 'Live', 
      limit: 'Optimal', 
      icon: Activity, 
      color: 'amber-600',
      bg: 'bg-amber-50',
      percentage: 99.9
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* Header Section */}
        <div className="px-8 lg:px-12 pt-12 pb-6 shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-primary tracking-tight">
                Billing & Subscriptions
              </h1>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                Manage your enterprise plan and monitor resource consumption
              </p>
            </div>

            <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm self-start lg:self-center">
              <button 
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${!isAnnual ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${isAnnual ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Annual
                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black ${isAnnual ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>-20%</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 lg:px-12 pb-12 space-y-12">
          
          {/* Usage Dashboard - Dynamic Data Only */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {usageStats.map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-xl shadow-slate-200/10 hover:shadow-2xl transition-all group">
                <div className="flex items-center justify-between mb-8">
                  <div className={`w-12 h-12 ${stat.bg} text-${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                    <stat.icon size={22} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <div className="flex items-center gap-1.5 justify-end">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target: {stat.limit}</span>
                  </div>
                  <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className={`h-full bg-${stat.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dynamic Content Areas - Placeholders for Real Integration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Subscription Status - Empty State */}
            <div className="bg-white rounded-[2rem] p-10 border border-slate-200/60 shadow-xl shadow-slate-200/10 flex flex-col justify-between min-h-[300px]">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                    <Crown size={22} />
                  </div>
                  <h4 className="text-lg font-black text-slate-800 tracking-tight">Active Plan</h4>
                </div>
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 border-dashed text-center space-y-3">
                  <p className="text-sm font-black text-slate-800 uppercase tracking-tight">No Active Subscription</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                    Choose a plan that fits your business needs to unlock advanced features.
                  </p>
                </div>
              </div>
              <button className="w-full py-5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:brightness-110 shadow-xl shadow-primary/20 active:scale-95 transition-all">
                Browse Available Plans
              </button>
            </div>

            {/* Payment Method - Empty State */}
            <div className="bg-white rounded-[2rem] p-10 border border-slate-200/60 shadow-xl shadow-slate-200/10 flex flex-col justify-between min-h-[300px]">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10">
                    <CreditCard size={22} />
                  </div>
                  <h4 className="text-lg font-black text-slate-800 tracking-tight">Payment Node</h4>
                </div>
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 border-dashed text-center space-y-3">
                  <p className="text-sm font-black text-slate-800 uppercase tracking-tight">No Payment Method Linked</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">
                    Securely add a payment method to manage your node activations.
                  </p>
                </div>
              </div>
              <button className="w-full py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
                <Plus size={16} /> Link New Asset
              </button>
            </div>

            {/* Billing History - Empty State */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] p-10 border border-slate-200/60 shadow-xl shadow-slate-200/10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                    <History size={22} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-800 tracking-tight">Ledger History</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your transaction records will appear here</p>
                  </div>
                </div>
              </div>
              
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
                  <Receipt size={40} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-slate-800 uppercase tracking-tight">No Invoices Found</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Transaction history is currently empty.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
