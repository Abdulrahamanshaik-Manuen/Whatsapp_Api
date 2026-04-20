import React from 'react';
import NavBar from '../components/NavBar';

const CheckIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const Footer = () => (
    <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
                <div className="mb-6 flex justify-center md:justify-start">
                    <img
                        src="/company-logo.jpg"
                        alt="Manuen Infotech logo"
                        className="ml-20 h-12 w-auto rounded-xl object-contain"
                    />
                </div>
                <p className="max-w-md text-center text-slate-400 leading-relaxed md:text-left">
                    The industry leader in premium WhatsApp Business API integration and fully managed account services. We ensure your communication never drops.
                </p>
            </div>
            <div>
                <h4 className="text-white font-bold text-lg mb-6">Solutions</h4>
                <ul className="space-y-3">
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">API Integration</a></li>
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">Shared Inbox</a></li>
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">Automations</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold text-lg mb-6">Company</h4>
                <ul className="space-y-3">
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">Contact</a></li>
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">Privacy Policy</a></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Manuen Infotech. All rights reserved.
        </div>
    </footer>
);

const Product = ({ activePath, onNavigate }) => {
    return (
        <div className="relative min-h-screen bg-[#e6f4ea] font-sans text-slate-900 selection:bg-green-200 selection:text-green-900 overflow-hidden">
            {/* Global Decorative Glowing Backgrounds */}
            <div className="absolute top-0 left-0 -translate-y-1/4 -translate-x-1/4 w-[800px] h-[800px] bg-[#25D366]/20 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>
            <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-[#128C7E]/15 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <NavBar activePath={activePath} onNavigate={onNavigate} />
                
                {/* Hero Section */}
                <div className="pt-20 pb-16 lg:pt-28 lg:pb-24 text-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-white/60 border border-emerald-200 text-emerald-800 text-sm font-bold tracking-wide mb-6 backdrop-blur-md shadow-sm">
                            THE ULTIMATE WHATSAPP PLATFORM
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
                            Transform how you <br className="hidden md:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#128C7E] to-[#25D366]">connect with customers.</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                            Stop losing leads in standard WhatsApp. Graduate to the official WhatsApp Business API with shared team inboxes, automated broadcast campaigns, and powerful AI chatbots.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button 
                                onClick={() => onNavigate('/pricing')}
                                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                Start Free Trial
                            </button>
                            <button 
                                className="w-full sm:w-auto bg-white/60 hover:bg-white/80 backdrop-blur-md text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
                            >
                                Book a Demo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Core Pillars Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Pillar 1 */}
                        <div className="relative flex flex-col rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl p-8 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-2xl hover:border-[#25D366]/50 hover:-translate-y-2">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center mb-6 shadow-md text-white">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Shared Team Inbox</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Collaborate with your entire team on a single WhatsApp number. Assign chats, add internal notes, and never miss a customer message again.
                            </p>
                            <ul className="space-y-2 mt-auto">
                                <li className="flex items-center gap-2 text-sm text-slate-700 font-medium"><CheckIcon className="w-4 h-4 text-[#25D366]" /> Unlimited Agents</li>
                                <li className="flex items-center gap-2 text-sm text-slate-700 font-medium"><CheckIcon className="w-4 h-4 text-[#25D366]" /> Smart Routing</li>
                            </ul>
                        </div>

                        {/* Pillar 2 */}
                        <div className="relative flex flex-col rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl p-8 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-2xl hover:border-[#25D366]/50 hover:-translate-y-2">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center mb-6 shadow-md text-white">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Broadcast Campaigns</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Send highly targeted promotional messages, alerts, and updates to thousands of opted-in customers with a 98% open rate.
                            </p>
                            <ul className="space-y-2 mt-auto">
                                <li className="flex items-center gap-2 text-sm text-slate-700 font-medium"><CheckIcon className="w-4 h-4 text-[#25D366]" /> Rich Media Templates</li>
                                <li className="flex items-center gap-2 text-sm text-slate-700 font-medium"><CheckIcon className="w-4 h-4 text-[#25D366]" /> Campaign Analytics</li>
                            </ul>
                        </div>

                        {/* Pillar 3 */}
                        <div className="relative flex flex-col rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl p-8 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-2xl hover:border-[#25D366]/50 hover:-translate-y-2">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center mb-6 shadow-md text-white">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">No-Code Automations</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Build intelligent chatbots in minutes. Automate FAQ responses, lead qualification, and appointment scheduling 24/7.
                            </p>
                            <ul className="space-y-2 mt-auto">
                                <li className="flex items-center gap-2 text-sm text-slate-700 font-medium"><CheckIcon className="w-4 h-4 text-[#25D366]" /> Drag-and-Drop Builder</li>
                                <li className="flex items-center gap-2 text-sm text-slate-700 font-medium"><CheckIcon className="w-4 h-4 text-[#25D366]" /> AI/NLP Integration</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* How it works */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200/50">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">How it works</h2>
                        <p className="text-lg text-slate-600">Get up and running in three simple steps.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <div className="w-16 h-16 mx-auto bg-white border border-slate-200 rounded-full flex items-center justify-center text-2xl font-bold text-[#25D366] shadow-sm mb-6">1</div>
                            <h4 className="text-xl font-bold text-slate-900 mb-3">Connect Number</h4>
                            <p className="text-slate-600">Link your existing phone number or purchase a new one to use strictly for the API.</p>
                        </div>
                        <div>
                            <div className="w-16 h-16 mx-auto bg-white border border-slate-200 rounded-full flex items-center justify-center text-2xl font-bold text-[#25D366] shadow-sm mb-6">2</div>
                            <h4 className="text-xl font-bold text-slate-900 mb-3">Get Verified</h4>
                            <p className="text-slate-600">We assist you through the Meta Business verification process to secure your Official Business status.</p>
                        </div>
                        <div>
                            <div className="w-16 h-16 mx-auto bg-white border border-slate-200 rounded-full flex items-center justify-center text-2xl font-bold text-[#25D366] shadow-sm mb-6">3</div>
                            <h4 className="text-xl font-bold text-slate-900 mb-3">Start Scaling</h4>
                            <p className="text-slate-600">Invite your team, set up your inbox, and launch your first automated broadcast campaign.</p>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
};

export default Product;
