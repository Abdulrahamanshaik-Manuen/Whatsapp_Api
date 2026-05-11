import React, { useState } from 'react';
import {
  CreditCard, Check, Crown, Zap,
  ArrowRight, Download, Receipt, ShieldCheck,
  AlertCircle, History, ExternalLink, Activity, MessageSquare, Users
} from 'lucide-react';

export default function BillingPage({ userData }) {
  const [isAnnual, setIsAnnual] = useState(true);

  const usageStats = [
    { label: 'Monthly Messages', value: (userData?.messages_used || 0).toLocaleString(), total: (userData?.message_limit || 1000).toLocaleString(), color: 'primary', icon: MessageSquare },
    { label: 'Active Contacts', value: (userData?.messages_used || 0).toLocaleString(), total: 'Unlimited', color: 'secondary', icon: Users },
    { label: 'Usage Percentage', value: `${userData?.message_limit > 0 ? Math.round((userData.messages_used / userData.message_limit) * 100) : 0}%`, total: '100%', color: 'amber', icon: Activity },
  ];

  const plans = [
    {
      name: 'Growth',
      price: isAnnual ? '49' : '59',
      desc: 'Perfect for small businesses starting with automation.',
      features: ['Up to 5,000 Contacts', '2,000 Messages / month', '3 Team Members', 'Standard Analytics', 'Email Support'],
      color: 'slate',
      icon: Zap
    },
    {
      name: 'Business',
      price: isAnnual ? '99' : '119',
      desc: 'Advanced features for scaling your sales & support.',
      features: ['Unlimited Contacts', '10,000 Messages / month', '10 Team Members', 'Pro Analytics Dashboard', 'Priority Support', 'Webhook Access'],
      color: 'primary',
      icon: Crown,
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      desc: 'Full-scale solution for large corporations & agencies.',
      features: ['Everything in Business', 'Unlimited Messages', 'Custom API Access', 'Dedicated Account Manager', 'SLA Guarantee', 'White-label Option'],
      color: 'amber',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="h-full bg-[#F8FAFC] flex flex-col p-8 lg:p-12 space-y-12 overflow-y-auto custom-scrollbar">
      {/* Header & Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Billing & <span className="text-primary">Plans</span></h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest pl-1">Manage your subscription and view invoices</p>
        </div>

        <div className="flex items-center gap-6 bg-white p-2 rounded-[1.5rem] shadow-xl shadow-slate-200/20 border border-slate-100">
          <span className={`text-[10px] font-black uppercase tracking-widest px-4 ${!isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-16 h-8 bg-slate-900 rounded-full relative p-1 transition-all"
          >
            <div className={`w-6 h-6 bg-primary rounded-full transition-all ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`}></div>
          </button>
          <div className="flex items-center gap-2 px-4">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>Yearly</span>
            <span className="bg-secondary text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Save 20%</span>
          </div>
        </div>
      </div>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {usageStats.map((stat, i) => (
          <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 space-y-6">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 ${stat.color === 'primary' ? 'bg-primary/10 text-primary' : stat.color === 'secondary' ? 'bg-secondary/10 text-secondary' : 'bg-amber-50 text-amber-600'} rounded-xl flex items-center justify-center`}>
                <stat.icon size={20} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value} <span className="text-xs text-slate-300 font-bold uppercase tracking-widest ml-1">/ {stat.total}</span></h3>
              </div>
              <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stat.color === 'primary' ? 'bg-primary' : stat.color === 'secondary' ? 'bg-secondary' : 'bg-amber-500'} rounded-full transition-all duration-1000`}
                  style={{ width: stat.total === 'Unlimited' ? '100%' : `${(parseInt(stat.value.replace(',', '')) / parseInt(stat.total.replace(',', ''))) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {plans.map((plan, i) => (
          <div key={i} className={`relative p-10 rounded-[3.5rem] border ${plan.popular ? 'bg-slate-900 text-white border-slate-800 shadow-2xl scale-105 z-10' : 'bg-white text-slate-900 border-slate-100 shadow-xl shadow-slate-200/20 hover:scale-[1.02] transition-all duration-500'}`}>
            {plan.popular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl shadow-primary/20">
                Most Popular
              </div>
            )}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${plan.popular ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-600'}`}>
                  <plan.icon size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight leading-none">{plan.name}</h3>
                  <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${plan.popular ? 'text-slate-400' : 'text-slate-300'}`}>For Teams & Startups</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black tracking-tighter">{plan.price === 'Custom' ? '' : '$'}{plan.price}</span>
                {plan.price !== 'Custom' && <span className={`text-xs font-bold uppercase tracking-widest ${plan.popular ? 'text-slate-500' : 'text-slate-400'}`}>/ month</span>}
              </div>

              <p className={`text-sm font-medium leading-relaxed ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>

              <div className={`w-full h-px ${plan.popular ? 'bg-white/10' : 'bg-slate-100'}`}></div>

              <ul className="space-y-5">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.popular ? 'bg-secondary/20 text-secondary' : 'bg-secondary/10 text-secondary'}`}>
                      <Check size={12} strokeWidth={4} />
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-widest ${plan.popular ? 'text-slate-300' : 'text-slate-500'}`}>{feat}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-5 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all ${plan.popular ? 'bg-white text-slate-900 hover:bg-primary hover:text-white' : 'bg-primary text-white hover:brightness-110 shadow-xl shadow-primary/10 active:scale-95'}`}>
                {plan.price === 'Custom' ? 'Contact Sales' : 'Upgrade Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* History & Payment Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Billing History */}
        <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <History size={20} />
              </div>
              <h4 className="text-xl font-black text-slate-800 tracking-tight">Billing History</h4>
            </div>
            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { date: 'May 01, 2026', amount: '$99.00', status: 'Paid', id: '#INV-3942' },
              { date: 'Apr 01, 2026', amount: '$99.00', status: 'Paid', id: '#INV-3821' },
              { date: 'Mar 01, 2026', amount: '$49.00', status: 'Paid', id: '#INV-3710' },
            ].map((inv, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-300">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 tracking-tight">{inv.date}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{inv.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs font-black text-slate-900">{inv.amount}</span>
                  <button className="w-10 h-10 bg-white text-slate-300 rounded-xl flex items-center justify-center hover:text-primary transition-all border border-slate-100">
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <CreditCard size={20} />
              </div>
              <h4 className="text-xl font-black text-slate-800 tracking-tight">Payment Method</h4>
            </div>
            <div className="p-8 bg-gradient-to-br from-slate-800 to-slate-950 rounded-[2.5rem] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all duration-700"></div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/5">
                    <span className="text-[10px] font-black tracking-widest">VISA</span>
                  </div>
                  <ShieldCheck size={24} className="text-secondary" />
                </div>
                <div>
                  <p className="text-lg font-black tracking-widest select-all opacity-80">•••• •••• •••• 4242</p>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Card Holder</p>
                      <p className="text-[10px] font-black uppercase tracking-widest">Manuen Shaik</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Expires</p>
                      <p className="text-[10px] font-black uppercase tracking-widest">12 / 28</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button className="mt-8 w-full py-5 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-3xl hover:bg-primary/10 hover:text-primary transition-all border border-slate-100 flex items-center justify-center gap-2">
            Change Payment Method <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
