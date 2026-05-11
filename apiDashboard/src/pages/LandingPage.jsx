import React from 'react';
import MainNavigation from '../components/MainNavigation';
import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import HowItWorks from '../components/HowItWorks';
import TrustSection from '../components/TrustSection';
import Footer from '../components/Footer';
import { ShoppingBag, Calendar, Rocket, ArrowRight } from 'lucide-react';

const LandingPage = ({ activePath, onNavigate }) => {
    return (
        <div className="min-h-screen bg-background">
            <MainNavigation 
                activePath={activePath} 
                onNavigate={onNavigate} 
            />
            
            <main>
                <Hero onNavigate={onNavigate} />
                
                <FeatureGrid />

                {/* Industry Solutions Section */}
                <section id="solutions" className="py-24 bg-white relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <div className="max-w-2xl">
                                <p className="text-secondary font-display font-black text-[11px] uppercase tracking-[0.2em] mb-4">Vertical Excellence</p>
                                <h2 className="h2-display text-primary">Tailored Solutions for <span className="text-secondary">Every Industry</span></h2>
                            </div>
                            <button className="flex items-center gap-2 text-primary font-display font-black text-xs uppercase tracking-widest group">
                                View Case Studies
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: 'Dynamic Retail', desc: 'Streamline customer orders and inventory updates directly through intuitive chat interfaces.', icon: ShoppingBag },
                                { title: 'Professional Services', desc: 'Manage appointments, bookings, and customer inquiries with automated enterprise tools.', icon: Calendar },
                                { title: 'SaaS & Tech', desc: 'Automated marketing funnels and high-conversion drip campaigns to keep users engaged.', icon: Rocket }
                            ].map((item, i) => (
                                <div key={i} className="p-10 rounded-3xl bg-background border border-slate-100 hover:shadow-premium hover:-translate-y-2 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-secondary/10 transition-colors"></div>
                                    <div className="w-14 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-8 text-primary group-hover:bg-secondary group-hover:text-white transition-all">
                                        <item.icon size={24} />
                                    </div>
                                    <h4 className="font-display text-lg font-black mb-4 text-primary">{item.title}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <HowItWorks />

                <TrustSection />

                {/* Final CTA Section */}
                <section className="max-w-7xl mx-auto px-6 py-24">
                    <div className="bg-primary p-12 md:p-20 rounded-[3rem] text-center space-y-8 relative overflow-hidden shadow-2xl">
                        {/* Ambient Background */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[120px]"></div>
                        
                        <div className="relative z-10 space-y-6">
                            <h2 className="font-display text-3xl md:text-5xl text-white leading-[1.1] max-w-3xl mx-auto font-black">
                                Ready to Transform Your <span className="text-secondary">Communication?</span>
                            </h2>
                            <p className="text-sm md:text-lg text-white/70 max-w-xl mx-auto font-medium">
                                Join the elite circle of businesses scaling their engagement through our optimized WhatsApp ecosystem.
                            </p>
                        </div>
                        
                        <div className="pt-6 relative z-10 flex flex-col items-center gap-6">
                            <button 
                                onClick={() => onNavigate('/login')}
                                className="btn-secondary px-12 py-5 text-base shadow-[0_20px_50px_rgba(99,193,50,0.3)]"
                            >
                                Start Your Growth Journey
                            </button>
                            <div className="flex items-center gap-6 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                                <span>No Credit Card</span>
                                <div className="w-1 h-1 rounded-full bg-white/20"></div>
                                <span>Instant Activation</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default LandingPage;
