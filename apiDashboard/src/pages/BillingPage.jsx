import React, { useState } from 'react';
import { 
  Wallet, 
  CreditCard, 
  History, 
  Download, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight,
  TrendingUp,
  Package,
  Calendar,
  FileText,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function BillingPage() {
  const [balance, setBalance] = useState(1.00);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  const billingHistory = [
    { id: 'INV-2025-001', date: 'May 24, 2025', amount: '₹1.00', status: 'Paid', method: 'Visa •••• 4242' },
    { id: 'INV-2025-002', date: 'May 10, 2025', amount: '₹1.00', status: 'Paid', method: 'Wallet' },
    { id: 'INV-2025-003', date: 'Apr 24, 2025', amount: '₹1.00', status: 'Paid', method: 'Visa •••• 4242' },
    { id: 'INV-2025-004', date: 'Apr 01, 2025', amount: '₹1.00', status: 'Refunded', method: 'Mastercard •••• 5555' },
  ];

  const pricingModels = [
    { type: 'Service', rate: '₹0.35', desc: 'User-initiated conversations' },
    { type: 'Marketing', rate: '₹0.72', desc: 'Business-initiated templates' },
    { type: 'Utility', rate: '₹0.30', desc: 'Transactional messages' },
    { type: 'Authentication', rate: '₹0.25', desc: 'OTP & Verification' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Balance */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Available Balance</span>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="text-5xl font-black tracking-tight">₹{balance.toFixed(2)}</h2>
              <p className="text-slate-400 text-xs mt-2 font-medium flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-400" /> Next auto-topup at ₹0.50
              </p>
            </div>
            <button 
              onClick={() => setIsTopUpModalOpen(true)}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Funds to Wallet
            </button>
          </div>
        </div>

        {/* Current Plan */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Package size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Business Pro</h3>
              </div>
              <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-blue-100">ANNUAL</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              You are currently on the Enterprise plan with unlimited team members.
            </p>
          </div>
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Next Billing Date</p>
              <p className="text-sm font-bold text-slate-800">June 12, 2025</p>
            </div>
            <button className="text-blue-600 text-sm font-bold hover:underline">Manage Plan</button>
          </div>
        </div>

        {/* Usage Overview */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Zap size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Monthly Usage</h3>
              </div>
              <span className="text-xs font-bold text-slate-400">MAY 2025</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-500 uppercase">Free Tier Messages</span>
                <span className="text-xs font-bold text-slate-800">1,000 / 1,000</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
          <div className="pt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100 mt-4">
            <AlertCircle size={14} />
            You've used all 1,000 free monthly conversations.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Billing History */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                <History size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Billing History</h3>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all">
              <Download size={16} /> Export All
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-widest border-b border-slate-100">
                  <th className="px-8 py-4">Invoice ID</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4">Amount</th>
                  <th className="px-8 py-4">Method</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {billingHistory.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-4 text-sm font-bold text-slate-800">{invoice.id}</td>
                    <td className="px-8 py-4 text-sm font-medium text-slate-500">{invoice.date}</td>
                    <td className="px-8 py-4 text-sm font-black text-slate-800">{invoice.amount}</td>
                    <td className="px-8 py-4 text-xs font-medium text-slate-600">{invoice.method}</td>
                    <td className="px-8 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
            <button className="text-sm font-bold text-blue-600 hover:underline">Load More Transactions</button>
          </div>
        </div>

        {/* Pricing & Cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Payment Methods */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Payment Methods</h3>
              <Plus size={20} className="text-blue-600 cursor-pointer" />
            </div>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 flex items-center gap-4 relative overflow-hidden">
                <div className="w-12 h-8 bg-slate-800 rounded-md flex items-center justify-center text-white text-[10px] font-bold italic">VISA</div>
                <div>
                  <p className="text-sm font-bold text-slate-800">•••• 4242</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Expires 12/28</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex items-center gap-4 cursor-pointer group">
                <div className="w-12 h-8 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 text-[10px] font-bold italic group-hover:bg-slate-200 transition-all">MC</div>
                <div>
                  <p className="text-sm font-bold text-slate-800">•••• 5555</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Expires 08/26</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Model */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6">
            <div>
              <h3 className="text-lg font-bold">Pricing Rates</h3>
              <p className="text-xs text-slate-400 mt-1">Cost per 24-hour conversation window</p>
            </div>
            <div className="space-y-4">
              {pricingModels.map((model, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div>
                    <p className="text-sm font-bold">{model.type}</p>
                    <p className="text-[10px] text-slate-500">{model.desc}</p>
                  </div>
                  <span className="text-sm font-black text-emerald-400">{model.rate}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-white/10">
              <a href="#" className="text-xs font-bold text-blue-400 flex items-center justify-center gap-1.5 hover:text-blue-300">
                Full Pricing Documentation <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Top Up Modal */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Add Funds to Wallet</h3>
              <button onClick={() => setIsTopUpModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
                <AlertCircle size={20} className="rotate-180" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2 text-center pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Balance</span>
                <h4 className="text-4xl font-black text-slate-800">₹{balance.toFixed(2)}</h4>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[500, 1000, 2000, 5000, 10000, 25000].map((amt) => (
                  <button 
                    key={amt}
                    className="p-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase px-1">Custom Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input type="number" placeholder="Enter amount" className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" />
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setIsTopUpModalOpen(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all">Cancel</button>
              <button 
                onClick={() => { setIsTopUpModalOpen(false); alert('Payment gateway simulation started...'); }}
                className="px-8 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-lg shadow-slate-900/10 hover:bg-black transition-all"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
