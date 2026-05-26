import React, { useState, useEffect } from 'react';
import { 
  User, Phone, MapPin, Mail, 
  CheckCircle2, Loader2, Smartphone,
  ShieldCheck, ArrowRight
} from 'lucide-react';

export default function LeadCapturePage() {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Extract userId from URL /lead/USER_ID
  const userId = window.location.pathname.split('/').pop();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phoneNumber) {
      setError('Name and Phone Number are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/contacts/consent/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          userId: userId,
          consent_source: 'qr'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to submit details');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 font-['Inter',_sans-serif]">
        <div className="w-full max-w-md bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-emerald-500/10 border border-emerald-100 text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
            <CheckCircle2 size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Thank You!</h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest opacity-70">Details Captured</p>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your details have been successfully submitted. You will now receive updates and communications from us via WhatsApp.
          </p>
          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
              <ShieldCheck size={14} />
              Consent Verified
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Inter',_sans-serif]">
      {/* Official Branding Header */}
      <div className="bg-[#075E54] px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 shadow-lg shrink-0">
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10">
          <Smartphone size={20} />
        </div>
        <div>
          <p className="text-white text-sm font-black leading-none">Manuen Business</p>
          <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mt-1">Official Verification Portal</p>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-6 sm:space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Join Our Community</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Fill details to get started</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-3">
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-primary transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Number *</label>
              <div className="relative group flex">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors z-10">
                  <Phone size={18} />
                </div>
                <div className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm border-r border-slate-200 pr-2 h-5 flex items-center z-10">
                  +91
                </div>
                <input
                  type="tel"
                  required
                  placeholder="XXXXXXXXXX"
                  value={formData.phoneNumber.replace(/^(\+91|91)/, '')}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({...formData, phoneNumber: `91${val}`});
                  }}
                  className="w-full pl-24 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-primary transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-primary transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                  <MapPin size={18} />
                </div>
                <input
                  type="text"
                  placeholder="City, State"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-primary transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-light transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Submit & Give Consent
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            By submitting, you agree to receive automated marketing and transactional messages on WhatsApp. You can opt-out at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
