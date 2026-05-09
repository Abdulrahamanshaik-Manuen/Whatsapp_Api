import React from 'react';
import { ShieldCheck, MessageSquare, TrendingUp, CheckCircle2 } from 'lucide-react';

const Hero = ({ onNavigate }) => {
    return (
        <section className="relative bg-gradient-to-b from-blue-50 to-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                <div className="space-y-5">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 text-primary font-bold text-[10px] uppercase tracking-wider mb-2 border border-primary/10">
                        <ShieldCheck size={12} />
                        Trusted by 100+ Global Enterprises
                    </div>
                    
                    <h1 className="font-manrope text-3xl md:text-4xl xl:text-5xl text-primary leading-[1.1] font-black tracking-tight">
                        Power Your Business Communication with WhatsApp
                    </h1>
                    
                    <p className="text-sm md:text-base text-slate-500 max-w-md leading-relaxed font-medium">
                        Manage customers, send bulk campaigns, and automate communication using our secure WhatsApp CRM platform.
                    </p>
                    
                    <div className="flex flex-col gap-5 pt-2">
                        <div className="flex flex-wrap gap-3">
                            <button 
                                onClick={() => onNavigate('/login')}
                                className="bg-secondary text-white font-manrope text-xs font-bold px-7 py-3.5 rounded-lg shadow-lg hover:-translate-y-1 hover:brightness-110 transition-all duration-300"
                            >
                                Get Started
                            </button>
                            <button 
                                className="border-2 border-primary text-primary font-manrope text-xs font-bold px-7 py-3.5 rounded-lg hover:bg-primary/5 transition-all duration-300"
                            >
                                Request Demo
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-secondary" /> No coding required</span>
                            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-secondary" /> Setup in minutes</span>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    {/* Floating Elements - Now Static */}
                    <div className="absolute -top-8 -left-8 z-30 bg-white p-3 rounded-xl shadow-xl border border-slate-100 flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                            <MessageSquare size={16} />
                        </div>
                        <div>
                            <p className="text-[8px] text-slate-500 font-black uppercase">New Inquiry</p>
                            <p className="text-[11px] font-bold">How can we help?</p>
                        </div>
                    </div>

                    <div className="absolute top-1/2 -right-10 z-30 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Engagement</p>
                            <p className="text-xs font-bold">+24% Open Rate</p>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
                        <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnoa4b6WrJ89lK0gsGfnKE0AN5jbIGQpDLht9U1mMssyGvUVlXX-Eh0_EuPZv7p_zFyRfWsOU6aLvc2eGNyupWy4sgp0ff0sbSHvbdPzk8sYHpXqBXpxxAQRX0IY99FTgRI3Q_--0aWeGZxyMFBa9t5pKDjxglRN58JOkdT5TsszB1ETvg8KfOerseZgt0OeULXVLWgeg0IW9lGNyF1ThUbfdL2oNn-6dGo15n6Rm73ybwdclpKe59_N3Kvb5EwxPt5XThE9i85kTh" 
                            alt="WhatsApp Dashboard" 
                            className="w-full h-auto"
                        />
                    </div>

                    <div className="absolute -bottom-6 -left-6 bg-secondary text-white p-5 rounded-xl shadow-2xl hidden md:block z-20">
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={24} />
                            <div>
                                <p className="text-[10px] uppercase tracking-wider opacity-80 font-bold">Encryption</p>
                                <p className="text-sm font-black">Enterprise Secure</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
