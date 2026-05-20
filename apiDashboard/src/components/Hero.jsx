import React from 'react';
import { ShieldCheck, MessageSquare, TrendingUp, CheckCircle2, Zap } from 'lucide-react';

const Hero = ({ onNavigate }) => {
    return (
        <section className="relative bg-white overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-secondary/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary font-display font-bold text-[11px] uppercase tracking-widest">
                        <Zap size={14} className="text-secondary" />
                        Next-Gen WhatsApp CRM Solutions
                    </div>
                    
                    <h1 className="h1-display text-primary">
                        Elevate Your Customer <span className="text-secondary italic">Experience</span> on WhatsApp
                    </h1>
                    
                    <p className="text-base md:text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
                        Seamlessly manage communications, broadcast powerful campaigns, and automate growth with MANUEN's enterprise-grade platform.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button 
                            className="btn-secondary px-10 py-4 text-sm"
                        >
                            Live Demo
                        </button>
                        <button 
                            onClick={() => {
                                const el = document.getElementById('solutions');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-10 py-4 rounded-xl border-2 border-primary text-primary font-display font-bold text-sm hover:bg-primary/5 transition-all shadow-sm"
                        >
                            Explore Solutions
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-3 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            <CheckCircle2 size={16} className="text-secondary" /> 
                            No Setup Fee
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            <CheckCircle2 size={16} className="text-secondary" /> 
                            Official Meta API
                        </div>
                    </div>
                </div>

                <div className="relative lg:ml-4">
                    {/* Floating UI Elements */}
                    <div className="absolute top-4 -left-10 z-30 glass-panel p-5 rounded-2xl animate-bounce-slow">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white shadow-glow">
                                <MessageSquare size={20} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Live Chat</p>
                                <p className="text-xs font-black text-primary">Active Customer Session</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-1/2 -right-12 z-30 glass-panel p-6 rounded-2xl shadow-2xl hidden xl:block">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Performance</p>
                                <p className="text-sm font-black text-primary">+38% Conversion</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-[2.5rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden ring-1 ring-black/5">
                            <img 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnoa4b6WrJ89lK0gsGfnKE0AN5jbIGQpDLht9U1mMssyGvUVlXX-Eh0_EuPZv7p_zFyRfWsOU6aLvc2eGNyupWy4sgp0ff0sbSHvbdPzk8sYHpXqBXpxxAQRX0IY99FTgRI3Q_--0aWeGZxyMFBa9t5pKDjxglRN58JOkdT5TsszB1ETvg8KfOerseZgt0OeULXVLWgeg0IW9lGNyF1ThUbfdL2oNn-6dGo15n6Rm73ybwdclpKe59_N3Kvb5EwxPt5XThE9i85kTh" 
                                alt="Dashboard Visualization" 
                                className="w-full h-auto scale-105 group-hover:scale-100 transition-transform duration-700"
                            />
                        </div>
                    </div>

                    <div className="absolute -bottom-8 left-10 glass-panel p-6 rounded-2xl flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Compliance</p>
                            <p className="text-sm font-black text-primary">End-to-End Encrypted</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
