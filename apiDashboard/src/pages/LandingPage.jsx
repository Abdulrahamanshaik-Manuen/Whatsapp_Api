import React from 'react';
import MainNavigation from '../components/MainNavigation';
import Hero from '../components/Hero';
import FeatureGrid from '../components/FeatureGrid';
import HowItWorks from '../components/HowItWorks';
import TrustSection from '../components/TrustSection';
import Footer from '../components/Footer';
import { ShoppingBag, Calendar, Rocket } from 'lucide-react';

const LandingPage = ({ activePath, onNavigate }) => {
    return (
        <div className="min-h-screen bg-[#f9f9fd]">
            <MainNavigation 
                activePath={activePath} 
                onNavigate={onNavigate} 
            />
            
            <main>
                <Hero onNavigate={onNavigate} />
                
                <FeatureGrid />

                {/* Industry Solutions Section */}
                <section id="solutions" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="text-center mb-12">
                            <h2 className="font-manrope text-xl md:text-2xl text-primary font-black mb-3">Solutions for Every Industry</h2>
                            <p className="text-slate-500 text-sm font-medium">Tailored tools to help your business grow wherever you are.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { title: 'Retail', desc: 'Streamline customer orders and inventory updates directly through chat interfaces.', icon: ShoppingBag },
                                { title: 'Services', desc: 'Manage appointments, bookings, and customer inquiries with automated scheduling tools.', icon: Calendar },
                                { title: 'Online Businesses', desc: 'Automated marketing funnels and drip campaigns to keep your users engaged 24/7.', icon: Rocket }
                            ].map((item, i) => (
                                <div key={i} className="p-7 rounded-2xl bg-[#f9f9fd] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group">
                                    <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <item.icon size={20} />
                                    </div>
                                    <h4 className="font-manrope text-sm font-bold mb-2 text-primary">{item.title}</h4>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <HowItWorks />

                <TrustSection />

                {/* Final CTA Section */}
                <section className="max-w-7xl mx-auto px-8 py-20">
                    <div className="bg-gradient-to-br from-primary via-[#1a3d5c] to-primary p-12 md:p-16 rounded-3xl text-center space-y-6 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]"></div>
                        
                        <h2 className="font-manrope text-2xl md:text-4xl text-white relative z-10 leading-tight max-w-3xl mx-auto font-black">
                            Scale Your Reach with the World's Favorite Messaging App
                        </h2>
                        <p className="text-sm md:text-base text-slate-200 opacity-90 max-w-xl mx-auto relative z-10 font-medium">
                            Join thousands of businesses scaling their engagement through our optimized WhatsApp CRM.
                        </p>
                        <div className="pt-4 relative z-10 flex flex-col items-center gap-4">
                            <button 
                                onClick={() => onNavigate('/login')}
                                className="bg-secondary text-white font-manrope text-sm font-bold px-9 py-4 rounded-xl shadow-xl hover:-translate-y-1 hover:brightness-110 transition-all duration-300"
                            >
                                Create Account Now
                            </button>
                            <div className="space-y-1">
                                <p className="text-white opacity-70 text-[10px] font-black uppercase tracking-widest mt-2">
                                    No setup required • Start in minutes
                                </p>
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
