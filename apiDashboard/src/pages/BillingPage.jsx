import React, { useState, useEffect } from 'react';
import {
  Crown, Zap,
  ArrowRight, Download, Receipt, ShieldCheck,
  AlertCircle, History, ExternalLink, Activity, MessageSquare, Users,
  ArrowUpRight, Plus, HelpCircle, Sparkles, TrendingUp, Loader2,
  Calendar, CheckCircle2, Clock, Layers
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Reusable StatCard (Matching Templates Page Style)
const StatCard = ({ label, value, color, icon: Icon, target }) => {
  const colorMap = {
    emerald: 'text-emerald-500 bg-emerald-50',
    blue: 'text-blue-500 bg-blue-50',
    orange: 'text-orange-500 bg-orange-50',
    rose: 'text-rose-500 bg-rose-50',
    indigo: 'text-indigo-500 bg-indigo-50',
  };

  return (
    <div className="bg-white p-5 rounded-2xl md:rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
      <div className={`w-12 h-12 rounded-xl ${colorMap[color] || 'text-primary bg-primary/5'} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</span>
          {target && <span className="text-[8px] font-bold text-slate-300 uppercase">Limit: {target}</span>}
        </div>
        <h3 className="text-2xl font-black text-[#003B6D] tracking-tight leading-none">{value}</h3>
      </div>
    </div>
  );
};

export default function BillingPage({ userData }) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [loading, setLoading] = useState(true);
  const [subStatus, setSubStatus] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [statusRes, plansRes] = await Promise.all([
        fetch(`${API_BASE_URL}/subscription/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/subscription/plans`)
      ]);

      const statusData = await statusRes.json();
      const plansData = await plansRes.json();

      setSubStatus(statusData);
      setAvailablePlans(plansData);
    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/subscription/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId })
      });

      if (res.ok) {
        alert("Subscription updated successfully!");
        fetchData();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (error) {
      alert("Failed to subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F9FAFB]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Billing Details...</p>
        </div>
      </div>
    );
  }

  const currentPlan = subStatus?.plan;
  const usage = subStatus?.usage || { messages_used: 0, message_limit: 1000, contact_limit: 1000 };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB] custom-scrollbar">
      {/* 🎨 Header Section (Matching Templates Page) */}
      <div className="px-8 pt-8 pb-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-primary tracking-tight">
              Billing & Plan
            </h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Manage your subscription and monitor resource usage</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isAnnual ? 'bg-[#003B6D] text-white shadow-lg shadow-[#003B6D]/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isAnnual ? 'bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Annual
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${isAnnual ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'}`}>SAVE 20%</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 pt-4 pb-12">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Messages Used"
              value={(usage.messages_used || 0).toLocaleString()}
              target={(usage.message_limit || 0).toLocaleString()}
              color="blue"
              icon={MessageSquare}
            />
            <StatCard
              label="Contacts"
              value={(userData?.contacts_count || 0).toLocaleString()}
              target={(usage.contact_limit || 0).toLocaleString()}
              color="emerald"
              icon={Users}
            />
            <StatCard 
              label="Infrastructure" 
              value="Optimized" 
              color="indigo" 
              icon={ShieldCheck} 
            />
            <StatCard 
              label="Connectivity" 
              value="Stable" 
              color="orange" 
              icon={Activity} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Plan Card */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-primary tracking-tight">Active Subscription</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Details of your current enterprise node</p>
                  </div>
                  {subStatus?.status === 'active' && (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                    </div>
                  )}
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="p-6 bg-[#F9FAFB] rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Package</p>
                      <h3 className="text-3xl font-black text-primary tracking-tighter">{currentPlan?.name || 'Starter Plan'}</h3>
                      <p className="text-sm font-bold text-slate-500 mt-2">Perfect for growing businesses and engagement.</p>
                    </div>

                    <ul className="space-y-4">
                      {[
                        `Up to ${usage.message_limit?.toLocaleString()} Messages / Month`,
                        `Up to ${usage.contact_limit?.toLocaleString()} Contacts`,
                        'Real-time Analytics Dashboard',
                        'Official WhatsApp API Integration',
                        'Priority Support Infrastructure'
                      ].map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                          <CheckCircle2 size={18} className="text-[#25D366] shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col justify-between space-y-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usage Meter</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>Monthly Messages</span>
                          <span>{((usage.messages_used / usage.message_limit) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                          <div
                            className="h-full bg-primary transition-all duration-1000"
                            style={{ width: `${Math.min(100, (usage.messages_used / usage.message_limit) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Next Billing Cycle</p>
                      <p className="text-center font-black text-slate-800 tracking-tight">
                        {subStatus?.expiry ? new Date(subStatus.expiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '---'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Cards - Conditional Display based on usage completion (Messages or Contacts) */}
              {(usage.messages_used >= usage.message_limit * 0.9 || (userData?.contacts_count || 0) >= (usage.contact_limit || 1000) * 0.9) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {availablePlans
                    .filter(p => p.interval === (isAnnual ? 'yearly' : 'monthly'))
                    .map(plan => {
                      const isCurrent = plan._id === currentPlan?._id;
                      return (
                        <div key={plan._id} className={`bg-white rounded-[1.5rem] p-8 border ${isCurrent ? 'border-primary' : 'border-slate-100'} shadow-sm relative overflow-hidden group`}>
                          {isCurrent && (
                            <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-lg">Current</div>
                          )}
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.15em]">{plan.name}</h4>
                              <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{plan.price}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">/ {plan.interval === 'yearly' ? 'year' : 'month'}</span>
                              </div>
                            </div>

                            <button
                              disabled={submitting || isCurrent}
                              onClick={() => handleSubscribe(plan._id)}
                              className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isCurrent
                                  ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                                  : 'bg-primary text-white shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95'
                                }`}
                            >
                              {submitting ? 'Processing...' : isCurrent ? 'Active Plan' : 'Select Blueprint'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : null}
            </div>

            {/* Side Column: History & Support */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-sm font-black text-primary tracking-tight uppercase">Ledger History</h3>
                  <History size={16} className="text-slate-300" />
                </div>
                <div className="p-8">
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
                      <Receipt size={32} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight">No Transactions</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">No billing records found for this node.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
