import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function QRRegisterPage({ userId, refId }) {
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        email: '',
        location: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const apiBase = window.location.hostname;
            const response = await axios.post(`http://${apiBase}:5000/api/contacts/consent/qr`, {
                ...formData,
                userId: userId,
                details: {
                    source: 'QR Scan',
                    location: refId
                }
            });
            setStatus('success');
            setMessage(response.data.message || 'Registration successful!');
        } catch (error) {
            console.error('Registration error:', error);
            setStatus('error');
            setMessage(error.response?.data?.error || 'Something went wrong. Please try again.');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-10 text-center space-y-6 border border-emerald-100">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">You're All Set!</h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Thank you for registering. We've received your details and you'll hear from us soon via WhatsApp.
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200"
                    >
                        Back to Form
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -ml-48 -mb-48 animate-pulse delay-700"></div>

            <div className="max-w-xl w-full space-y-8 relative z-10">
                <div className="text-center space-y-4 mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
                        <ShieldCheck size={14} /> Secure Registration
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                        Connect with <span className="text-emerald-500">Us</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-md mx-auto">
                        Fill in your details below to get started and receive updates directly on your WhatsApp.
                    </p>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-100 relative group transition-all duration-500 hover:shadow-emerald-500/10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                <input 
                                    required
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. John Doe"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                <input 
                                    required
                                    type="tel" 
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="e.g. +91 9876543210"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                <input 
                                    required
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="e.g. john@example.com"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                <input 
                                    type="text" 
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="e.g. New York, USA"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-300"
                                />
                            </div>
                        </div>

                        {status === 'error' && (
                            <p className="text-red-500 text-xs font-bold text-center animate-shake">{message}</p>
                        )}

                        <button 
                            disabled={status === 'loading'}
                            type="submit"
                            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {status === 'loading' ? (
                                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Register Now</span>
                                    <Send size={20} className="rotate-12" />
                                </>
                            )}
                        </button>

                        <p className="text-[10px] text-slate-400 text-center font-medium leading-relaxed px-8">
                            By clicking Register, you agree to receive WhatsApp messages from us for updates and marketing purposes.
                        </p>
                    </form>
                </div>

                <div className="text-center pt-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Powered by <span className="text-slate-900">WhatsApp API Dashboard</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
