import React, { useState } from 'react';
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

const IntegrationCard = ({ title, category, description, icon }) => (
    <div className="relative flex flex-col rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl p-8 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-2xl hover:border-[#25D366]/50 hover:-translate-y-2 cursor-pointer group">
        <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#128C7E] shadow-sm group-hover:scale-105 transition-transform">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{title}</h3>
                <span className="text-sm font-medium text-slate-500">{category}</span>
            </div>
        </div>
        <p className="text-slate-600 leading-relaxed mb-6 flex-grow">{description}</p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200/60">
            <span className="text-sm font-bold text-slate-400 group-hover:text-[#25D366] transition-colors">View Details</span>
            <svg className="w-5 h-5 text-slate-300 group-hover:text-[#25D366] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </div>
    </div>
);

const integrationsData = [
    {
        title: "Salesforce",
        category: "CRM",
        filterCategory: "CRM",
        description: "Automatically log WhatsApp conversations as activities in Salesforce. Sync contacts and trigger messages based on lead status.",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
    },
    {
        title: "HubSpot",
        category: "CRM & Marketing",
        filterCategory: "CRM",
        description: "Use HubSpot workflows to trigger automated WhatsApp messages. View complete chat history directly inside the HubSpot contact timeline.",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
    },
    {
        title: "Shopify",
        category: "E-commerce",
        filterCategory: "E-commerce",
        description: "Send automated order confirmations, shipping updates, and highly converting abandoned cart recovery messages directly to WhatsApp.",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
    },
    {
        title: "WooCommerce",
        category: "E-commerce",
        filterCategory: "E-commerce",
        description: "Integrate your WordPress store to automatically update customers via WhatsApp and handle customer support tickets within the dashboard.",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    },
    {
        title: "Zendesk",
        category: "Customer Support",
        filterCategory: "Support",
        description: "Turn WhatsApp messages into Zendesk tickets. Allow agents to reply from Zendesk while the customer receives messages on WhatsApp.",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    },
    {
        title: "Zapier",
        category: "Automation",
        filterCategory: "Automation",
        description: "Connect our WhatsApp API to over 5,000+ apps. Create custom triggers and actions without writing any code.",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    }
];

const categories = ["All Integrations", "CRM", "E-commerce", "Support", "Automation"];

const Integrations = ({ activePath, onNavigate }) => {
    const [activeCategory, setActiveCategory] = useState("All Integrations");

    const filteredIntegrations = activeCategory === "All Integrations" 
        ? integrationsData 
        : integrationsData.filter(item => item.filterCategory === activeCategory);

    return (
        <div className="relative min-h-screen bg-[#e6f4ea] font-sans text-slate-900 selection:bg-green-200 selection:text-green-900 overflow-hidden">
            {/* Global Decorative Glowing Backgrounds */}
            <div className="absolute top-0 left-0 -translate-y-1/4 -translate-x-1/4 w-[800px] h-[800px] bg-[#25D366]/20 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>
            <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-[#128C7E]/15 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <NavBar activePath={activePath} onNavigate={onNavigate} />
                
                {/* Header Section */}
                <div className="pt-20 pb-16 lg:pt-28 lg:pb-16 text-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-white/60 border border-emerald-200 text-emerald-800 text-sm font-bold tracking-wide mb-6 backdrop-blur-md shadow-sm">
                            APP DIRECTORY
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                            Connect WhatsApp with <br className="hidden md:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#128C7E] to-[#25D366]">your favorite tools.</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            Sync contacts, automate messages from your CRM, and connect your e-commerce store with just a few clicks. No coding required.
                        </p>
                    </div>
                </div>

                {/* Categories Tab */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 flex justify-center">
                    <div className="inline-flex bg-white/60 backdrop-blur-md border border-white/60 rounded-full p-1 shadow-sm overflow-x-auto max-w-full">
                        {categories.map((cat) => (
                            <button 
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${
                                    activeCategory === cat 
                                    ? 'bg-[#25D366] text-white shadow-sm font-bold' 
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Integrations Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
                    {filteredIntegrations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredIntegrations.map((integration, index) => (
                                <IntegrationCard 
                                    key={index}
                                    title={integration.title}
                                    category={integration.category}
                                    description={integration.description}
                                    icon={integration.icon}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-500 text-lg">No integrations found in this category.</p>
                        </div>
                    )}
                    
                    {/* Custom API Block */}
                    <div className="mt-16 bg-slate-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-[#25D366]/20 rounded-full blur-3xl"></div>
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-3xl font-bold text-white mb-4">Need a custom integration?</h2>
                            <p className="text-slate-400 text-lg">Our RESTful API and Webhooks make it incredibly easy to connect WhatsApp to your bespoke internal tools and legacy systems. Read our documentation to get started.</p>
                        </div>
                        <div className="relative z-10 w-full md:w-auto shrink-0">
                            <button onClick={() => onNavigate('/resources')} className="w-full md:w-auto bg-white hover:bg-slate-100 text-slate-900 px-8 py-4 rounded-xl font-bold transition-colors">
                                View API Docs
                            </button>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
};

export default Integrations;
