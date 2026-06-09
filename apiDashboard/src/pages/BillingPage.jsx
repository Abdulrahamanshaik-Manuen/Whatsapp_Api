import React, { useState, useEffect } from 'react';
import {
  Crown, Download, Receipt, ShieldCheck,
  History, ExternalLink, Activity, MessageSquare, Users,
  ArrowUpRight, Layers, CheckCircle2, Clock,
  Loader2, TrendingUp, FileText
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function BillingPage({ userData }) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [subStatus, setSubStatus] = useState(() => {
    const saved = localStorage.getItem('cached_sub_status');
    return saved ? JSON.parse(saved) : null;
  });
  const [availablePlans, setAvailablePlans] = useState(() => {
    const saved = localStorage.getItem('cached_plans');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(!subStatus);
  const [submitting, setSubmitting] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    if (!subStatus) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [statusRes, plansRes] = await Promise.all([
        fetch(`${API_BASE_URL}/subscription/status`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/subscription/plans`)
      ]);
      const statusData = await statusRes.json();
      const plansData = await plansRes.json();
      setSubStatus(statusData);
      setAvailablePlans(plansData);
      localStorage.setItem('cached_sub_status', JSON.stringify(statusData));
      localStorage.setItem('cached_plans', JSON.stringify(plansData));
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });
      if (res.ok) {
        alert("Subscription updated successfully!");
        fetchData();
        setShowUpgrade(false);
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch {
      alert("Failed to subscribe. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[#f8fafc] p-4 md:p-6 space-y-4 animate-pulse">
        <div className="h-16 bg-white rounded-lg border border-slate-100" />
        <div className="h-12 bg-white rounded-lg border border-slate-100" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-64 bg-white rounded-lg border border-slate-100" />
          <div className="h-64 bg-white rounded-lg border border-slate-100" />
        </div>
      </div>
    );
  }

  const currentPlan = subStatus?.plan;
  const usage = subStatus?.usage || { messages_used: 0, message_limit: 5000, contact_limit: 1000 };
  const msgPct = Math.min(100, ((usage.messages_used || 0) / (usage.message_limit || 1)) * 100);
  const contactPct = Math.min(100, ((userData?.contacts_count || 0) / (usage.contact_limit || 1)) * 100);
  const isActive = subStatus?.status === 'active';
  const nearLimit = msgPct >= 80 || contactPct >= 80;
  const expiryLabel = subStatus?.expiry
    ? new Date(subStatus.expiry).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  // Mock transaction history (replace with API data when available)
  const transactions = subStatus?.transactions || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Billing &amp; Plan</h1>
            <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Manage subscription and monitor usage</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowUpgrade(!showUpgrade)}
              className="flex items-center gap-1.5 h-8 px-3 bg-[#004277] hover:brightness-105 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
            >
              <Crown size={12} />
              {showUpgrade ? 'Hide Plans' : 'Upgrade Plan'}
            </button>
            <button
              onClick={fetchData}
              className="h-8 w-8 flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-400 rounded-lg transition-all cursor-pointer"
              title="Refresh"
            >
              <Activity size={13} />
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0">
          {/* Messages Used */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#004277] flex items-center justify-center shrink-0">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-none">
                {(usage.messages_used || 0).toLocaleString()}
                <span className="text-xs font-semibold text-slate-400 ml-1">/ {(usage.message_limit || 0).toLocaleString()}</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1.5">Messages Used</p>
              <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${msgPct >= 80 ? 'bg-rose-500' : 'bg-[#004277]'}`}
                  style={{ width: `${msgPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-none">
                {(userData?.contacts_count || 0).toLocaleString()}
                <span className="text-xs font-semibold text-slate-400 ml-1">/ {(usage.contact_limit || 0).toLocaleString()}</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1.5">Contacts</p>
              <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${contactPct >= 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${contactPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Infrastructure */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-none">Healthy</h3>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1.5">Infrastructure</p>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[9px] text-emerald-600 font-bold">All systems operational</span>
              </div>
            </div>
          </div>

          {/* Connectivity */}
          <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-none">Stable</h3>
              <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1.5">Connectivity</p>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-emerald-600 font-bold">WhatsApp API live</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── Left: Subscription + Upgrade + Transactions ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Active Subscription Card */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <Layers size={13} className="text-[#004277]" />
                <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex-1">Active Subscription</h3>
                {isActive ? (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Inactive</span>
                  </div>
                )}
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan Info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Plan</p>
                    <h3 className="text-xl font-bold text-[#004277] tracking-tight">{currentPlan?.name || 'Starter Monthly'}</h3>
                    {currentPlan?.price && (
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        ₹{currentPlan.price} / {currentPlan.interval === 'yearly' ? 'year' : 'month'}
                      </p>
                    )}
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Plan features — compact list */}
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Plan Includes</p>
                    <ul className="space-y-1.5">
                      {[
                        `${(usage.message_limit || 5000).toLocaleString()} Messages / month`,
                        `${(usage.contact_limit || 1000).toLocaleString()} Contacts`,
                        'Analytics Dashboard',
                        'WhatsApp API Integration',
                        'Priority Support'
                      ].map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#004277]/40 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Usage + Next Billing */}
                <div className="space-y-4">
                  {/* Message meter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Monthly Messages</p>
                      <span className={`text-[9px] font-bold ${msgPct >= 80 ? 'text-rose-500' : 'text-slate-500'}`}>{msgPct.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${msgPct >= 80 ? 'bg-rose-500' : 'bg-[#004277]'}`}
                        style={{ width: `${msgPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                      <span>{(usage.messages_used || 0).toLocaleString()} used</span>
                      <span>{(usage.message_limit || 0).toLocaleString()} limit</span>
                    </div>
                  </div>

                  {/* Contact meter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contacts</p>
                      <span className={`text-[9px] font-bold ${contactPct >= 80 ? 'text-rose-500' : 'text-slate-500'}`}>{contactPct.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${contactPct >= 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${contactPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                      <span>{(userData?.contacts_count || 0).toLocaleString()} used</span>
                      <span>{(usage.contact_limit || 0).toLocaleString()} limit</span>
                    </div>
                  </div>

                  {/* Next billing */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 border-dashed flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Next Billing</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{expiryLabel}</p>
                    </div>
                    <Clock size={14} className="text-slate-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade Plans (toggle) */}
            {showUpgrade && availablePlans.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Crown size={13} className="text-[#004277]" />
                    <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Choose a Plan</h3>
                  </div>
                  {/* Billing toggle */}
                  <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                    <button
                      onClick={() => setIsAnnual(false)}
                      className={`px-3 h-6 rounded-md text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${!isAnnual ? 'bg-white text-[#004277] shadow-sm' : 'text-slate-400'}`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setIsAnnual(true)}
                      className={`px-3 h-6 rounded-md text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${isAnnual ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      Annual
                      <span className="text-[7px] bg-emerald-100 text-emerald-600 px-1 rounded font-black">−20%</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {availablePlans
                    .filter(p => p.interval === (isAnnual ? 'yearly' : 'monthly'))
                    .map(plan => {
                      const isCurrent = plan._id === currentPlan?._id;
                      const priceNum = parseFloat(String(plan.price).replace(/,/g, ''));
                      const perDay = plan.interval === 'yearly'
                        ? Math.round(priceNum / 365)
                        : Math.round(priceNum / 30);
                      const planFeatures = plan.features || [
                        `${(plan.message_limit || 5000).toLocaleString()} Messages / month`,
                        `${(plan.contact_limit || 1000).toLocaleString()} Contacts`,
                        'Analytics Dashboard',
                        'WhatsApp API Integration',
                        'Priority Support'
                      ];
                      return (
                        <div
                          key={plan._id}
                          className={`flex flex-col rounded-lg border transition-all overflow-hidden ${
                            isCurrent
                              ? 'border-[#004277] shadow-md shadow-[#004277]/10'
                              : 'border-slate-200 hover:border-[#004277]/40 hover:shadow-sm'
                          }`}
                        >
                          {/* Plan header */}
                          <div className={`px-4 py-3 ${isCurrent ? 'bg-[#004277]' : 'bg-slate-50'}`}>
                            <div className="flex items-center justify-between">
                              <p className={`text-[9px] font-black uppercase tracking-widest ${isCurrent ? 'text-white/70' : 'text-slate-400'}`}>
                                {plan.name}
                              </p>
                              {isCurrent && (
                                <span className="text-[8px] bg-white/20 text-white px-2 py-0.5 rounded font-black uppercase">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className={`text-2xl font-bold ${isCurrent ? 'text-white' : 'text-slate-800'}`}>
                                ₹{plan.price}
                              </span>
                              <span className={`text-[9px] font-bold ${isCurrent ? 'text-white/60' : 'text-slate-400'}`}>
                                / {plan.interval === 'yearly' ? 'year' : 'month'}
                              </span>
                            </div>
                            <p className={`text-[9px] font-semibold mt-0.5 ${isCurrent ? 'text-white/50' : 'text-slate-400'}`}>
                              ≈ ₹{perDay} / day
                            </p>
                          </div>

                          {/* Features */}
                          <div className="flex-1 px-4 py-3 bg-white space-y-2">
                            {planFeatures.map((f, fi) => (
                              <div key={fi} className="flex items-center gap-2">
                                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                <span className="text-[11px] text-slate-600 font-medium">{f}</span>
                              </div>
                            ))}
                          </div>

                          {/* CTA */}
                          <div className="px-4 pb-4 pt-2 bg-white">
                            <button
                              disabled={submitting || isCurrent}
                              onClick={() => handleSubscribe(plan._id)}
                              className={`w-full h-9 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                isCurrent
                                  ? 'bg-slate-50 text-slate-300 border border-slate-200 cursor-not-allowed'
                                  : 'bg-[#004277] text-white hover:brightness-105 cursor-pointer active:scale-98 shadow-sm'
                              }`}
                            >
                              {submitting
                                ? <Loader2 size={12} className="animate-spin" />
                                : isCurrent
                                ? '✓ Current Plan'
                                : 'Select Plan →'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Transaction History */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <History size={13} className="text-[#004277]" />
                <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex-1">Recent Transactions</h3>
                <button
                  className="flex items-center gap-1 h-6 px-2 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <Download size={10} />
                  Export
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-200 border border-slate-100 mb-2">
                    <Receipt size={18} />
                  </div>
                  <p className="text-xs font-bold text-slate-500">No billing records found</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Transactions will appear here once your plan is active.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-4 py-2.5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-4 py-2.5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                        <th className="px-4 py-2.5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                        <th className="px-4 py-2.5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-4 py-2.5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((tx, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2.5 text-xs font-semibold text-slate-600 whitespace-nowrap">
                            {new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-2.5 text-xs font-semibold text-slate-700">{tx.description}</td>
                          <td className="px-4 py-2.5 text-xs font-bold text-slate-800 text-right">₹{tx.amount}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              tx.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {tx.invoiceUrl ? (
                              <a href={tx.invoiceUrl} target="_blank" rel="noreferrer" className="text-[#004277] hover:underline text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer">
                                <FileText size={11} />
                                PDF
                              </a>
                            ) : <span className="text-slate-300 text-[10px]">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Meta Billing + Billing Period ── */}
          <div className="space-y-4">

            {/* Meta Billing */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <ExternalLink size={13} className="text-[#004277]" />
                <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Meta Billing</h3>
              </div>
              <div className="p-3 space-y-1.5">
                <p className="text-[10px] text-slate-500 font-semibold px-1 pb-1 leading-relaxed">
                  Message charges billed directly by Meta via your WhatsApp Business Account.
                </p>
                {[
                  { label: 'Payment Methods', href: 'https://business.facebook.com/billing_hub/payment_methods' },
                  { label: 'WABA Settings', href: 'https://business.facebook.com/settings/whatsapp-business-accounts/' },
                  { label: 'Billing Documentation', href: 'https://developers.facebook.com/docs/whatsapp/pricing/' },
                ].map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-100 hover:border-[#004277]/20 hover:bg-slate-50 transition-all group cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-[#004277] transition-colors">{link.label}</span>
                    <ArrowUpRight size={12} className="text-slate-300 group-hover:text-[#004277] transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Billing Period Summary */}
            {currentPlan && (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <TrendingUp size={13} className="text-[#004277]" />
                  <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Billing Period</h3>
                </div>
                <div className="p-4 space-y-2.5">
                  {[
                    { label: 'Plan', value: currentPlan?.name || '—' },
                    { label: 'Status', value: isActive ? 'Active' : 'Inactive', badge: isActive },
                    { label: 'Amount', value: currentPlan?.price ? `₹${currentPlan.price}` : '—' },
                    { label: 'Renews', value: expiryLabel },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{row.label}</span>
                      {row.badge ? (
                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          {row.value}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-700">{row.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
