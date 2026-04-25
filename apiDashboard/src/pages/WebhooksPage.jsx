import React, { useState } from 'react';
import {
  Webhook,
  Settings,
  ExternalLink,
  Copy,
  Check,
  Shield,
  Activity,
  Zap,
  RefreshCcw,
  Code,
  Terminal,
  AlertCircle,
  Clock,
  ChevronRight,
  ShieldCheck,
  Globe
} from 'lucide-react';

export default function WebhooksPage() {
  const [webhookUrl, setWebhookUrl] = useState('https://api.example.com/webhooks/whatsapp');
  const [secretToken, setSecretToken] = useState('whsec_5f8a2b3c4d5e6f7g8h9i0j1k2l3m4n5o');
  const [isCopied, setIsCopied] = useState(false);
  const [activeEvents, setActiveEvents] = useState(['message.received', 'message.delivered']);
  const [isLive, setIsLive] = useState(true);

  const events = [
    { id: 'message.received', label: 'Message Received', desc: 'Triggered when a customer sends a message to your number.' },
    { id: 'message.sent', label: 'Message Sent', desc: 'Triggered when a message is successfully sent from your account.' },
    { id: 'message.delivered', label: 'Message Delivered', desc: 'Triggered when the recipient receives the message.' },
    { id: 'message.read', label: 'Message Read', desc: 'Triggered when the recipient opens/reads the message.' },
    { id: 'message.failed', label: 'Message Failed', desc: 'Triggered when a message fails to deliver.' },
  ];

  const recentDeliveries = [
    { id: 'evt_123', event: 'message.received', status: 'Success', code: 200, time: '2 mins ago', latency: '124ms' },
    { id: 'evt_124', event: 'message.read', status: 'Success', code: 200, time: '15 mins ago', latency: '89ms' },
    { id: 'evt_125', event: 'message.delivered', status: 'Failed', code: 500, time: '1 hour ago', latency: '3.4s' },
    { id: 'evt_126', event: 'message.received', status: 'Success', code: 200, time: '3 hours ago', latency: '156ms' },
  ];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleEvent = (id) => {
    setActiveEvents(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">API & Webhooks</h1>
          <p className="text-slate-500">Manage your endpoint configurations and monitor real-time event deliveries.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold border border-emerald-100">
          <Activity size={16} className="animate-pulse" />
          System Status: Operational
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Webhook Configuration */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Webhook size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Endpoint Configuration</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase ${isLive ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {isLive ? 'Active' : 'Disabled'}
                </span>
                <button
                  onClick={() => setIsLive(!isLive)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isLive ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isLive ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* URL Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Payload URL</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 group focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                    <Globe size={18} className="text-slate-400" />
                    <input
                      type="text"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-sm font-medium text-slate-600"
                    />
                  </div>
                  <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-200">
                    Update URL
                  </button>
                </div>
                <p className="text-xs text-slate-400">The URL where we will send HTTP POST requests for every event.</p>
              </div>

              {/* Secret Token */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Secret Token</label>
                <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Shield size={18} className="text-blue-400" />
                    <code className="text-blue-100 font-mono text-sm truncate">
                      {secretToken}
                    </code>
                  </div>
                  <button
                    onClick={() => handleCopy(secretToken)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    {isCopied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-xs text-slate-400">Used to sign payloads so you can verify they came from us. <a href="#" className="text-blue-500 hover:underline">Learn how to verify signatures.</a></p>
              </div>

              {/* Event Subscriptions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">Events to Subscribe To</label>
                  <button
                    onClick={() => setActiveEvents(events.map(e => e.id))}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Select All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => toggleEvent(event.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${activeEvents.includes(event.id)
                          ? 'border-emerald-500 bg-emerald-50/30'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-800">{event.label}</span>
                        {activeEvents.includes(event.id) && <ShieldCheck size={16} className="text-emerald-500" />}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{event.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <AlertCircle size={14} />
                <span className="text-xs font-medium">HTTPS is required for production endpoints.</span>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
                <RefreshCcw size={16} />
                Test Endpoint
              </button>
            </div>
          </div>

          {/* Delivery Logs */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Recent Deliveries</h3>
              </div>
              <button className="text-blue-600 text-sm font-bold hover:underline">Clear Logs</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                    <th className="px-6 py-4">Delivery ID</th>
                    <th className="px-6 py-4">Event</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Latency</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentDeliveries.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                      <td className="px-6 py-4 text-xs font-mono font-bold text-slate-500">{log.id}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{log.event}</td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold ${log.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                          <div className={`w-1 h-1 rounded-full ${log.status === 'Success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                          {log.code} {log.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-400 flex items-center gap-1.5 mt-2">
                        <Clock size={12} /> {log.time}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">{log.latency}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar / Resources */}
        <div className="lg:col-span-4 space-y-6">
          {/* SDKs & Docs */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Code size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Developer Resources</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Check out our comprehensive API documentation and official SDKs for Node.js, Python, and Go.
              </p>
            </div>
            <div className="space-y-3">
              <a href="#" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group">
                <div className="flex items-center gap-3">
                  <Terminal size={18} className="text-blue-400" />
                  <span className="text-sm font-bold">API Reference</span>
                </div>
                <ExternalLink size={14} className="text-slate-500 group-hover:text-white transition-all" />
              </a>
              <a href="#" className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group">
                <div className="flex items-center gap-3">
                  <Zap size={18} className="text-amber-400" />
                  <span className="text-sm font-bold">Quickstart Guide</span>
                </div>
                <ExternalLink size={14} className="text-slate-500 group-hover:text-white transition-all" />
              </a>
            </div>
          </div>

          {/* Code Snippet */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Example Verification (Node.js)</h4>
            <div className="bg-slate-50 rounded-2xl p-4 overflow-hidden relative group">
              <pre className="text-[10px] font-mono text-slate-600 overflow-x-auto">
                {`const crypto = require('crypto');

const verifySignature = (payload, signature, secret) => {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return hash === signature;
};`}
              </pre>
              <button
                onClick={() => handleCopy(`const crypto = require('crypto');\n\nconst verifySignature = (payload, signature, secret) => {\n  const hash = crypto\n    .createHmac('sha256', secret)\n    .update(payload)\n    .digest('hex');\n  return hash === signature;\n};`)}
                className="absolute top-2 right-2 p-2 bg-white border border-slate-200 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>

          {/* Need Help */}
          <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
              <Zap size={120} />
            </div>
            <h3 className="text-lg font-bold mb-2 relative z-10">Integration Help?</h3>
            <p className="text-blue-100 text-xs mb-6 relative z-10">Our developer support team is available 24/7 to help you with your webhook setup.</p>
            <button className="w-full py-3 bg-white text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all relative z-10">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
