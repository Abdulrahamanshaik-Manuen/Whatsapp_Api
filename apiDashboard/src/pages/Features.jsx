import React from 'react';
import NavBar from '../components/NavBar';

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

const FeatureCard = ({ title, description, icon }) => (
    <div className="relative flex flex-col rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl p-8 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-2xl hover:border-[#25D366]/50 hover:-translate-y-2">
        <div className="h-12 w-12 rounded-xl bg-[#25D366]/10 flex items-center justify-center mb-6 text-[#128C7E]">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
);

const Features = ({ activePath, onNavigate }) => {
    return (
        <div className="relative min-h-screen bg-[#e6f4ea] font-sans text-slate-900 selection:bg-green-200 selection:text-green-900 overflow-clip">
            {/* Global Decorative Glowing Backgrounds */}
            <div className="absolute top-0 left-0 -translate-y-1/4 -translate-x-1/4 w-[800px] h-[800px] bg-[#25D366]/20 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>
            <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-[#128C7E]/15 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <NavBar activePath={activePath} onNavigate={onNavigate} />
                
                {/* Header Section */}
                <div className="pt-20 pb-16 lg:pt-28 lg:pb-16 text-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                            Everything you need to <br className="hidden md:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#128C7E] to-[#25D366]">scale on WhatsApp.</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            A complete suite of tools designed to help you sell more, support better, and engage customers instantly.
                        </p>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard 
                            title="Bulk Messaging & Broadcasting" 
                            description="Send personalized messages, promotional offers, and critical alerts to thousands of opted-in contacts simultaneously with high deliverability."
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                        />
                        <FeatureCard 
                            title="Drag-and-Drop Chatbot Builder" 
                            description="Create intelligent, automated conversational flows without writing a single line of code. Capture leads and answer FAQs 24/7."
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                        />
                        <FeatureCard 
                            title="Multi-Agent Shared Inbox" 
                            description="Empower your entire team to manage customer conversations from a single dashboard. Route chats, leave internal notes, and monitor performance."
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        />
                        <FeatureCard 
                            title="Rich Media Templates" 
                            description="Go beyond text. Send interactive buttons, lists, images, PDFs, and location pins to create engaging customer experiences."
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                        />
                        <FeatureCard 
                            title="Detailed Analytics & Reporting" 
                            description="Track delivery rates, open rates, response times, and agent performance to continuously optimize your messaging strategy."
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                        />
                        <FeatureCard 
                            title="Contact Management & CRM" 
                            description="Organize your contacts with tags, custom attributes, and segments. Import lists easily or sync automatically via our API."
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                        />
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
};

export default Features;
