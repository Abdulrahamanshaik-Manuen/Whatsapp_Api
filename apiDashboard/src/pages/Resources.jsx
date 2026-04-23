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

const ResourceCard = ({ title, description, type, icon }) => (
    <a href="#" className="group relative flex flex-col rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl p-8 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-2xl hover:border-[#25D366]/50 hover:-translate-y-2">
        <div className="flex items-center justify-between mb-6">
            <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#128C7E] shadow-sm group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-3 py-1 rounded-full">{type}</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#128C7E] transition-colors">{title}</h3>
        <p className="text-slate-600 leading-relaxed flex-grow">{description}</p>
    </a>
);

const Resources = ({ activePath, onNavigate }) => {
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
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                            Learn, build, and <br className="hidden md:block"/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#128C7E] to-[#25D366]">grow your business.</span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                            Everything you need to master the WhatsApp Business API. From developer documentation to marketing best practices.
                        </p>
                        
                        {/* Search Bar */}
                        <div className="relative max-w-2xl mx-auto shadow-lg rounded-2xl overflow-hidden">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input 
                                type="text" 
                                className="block w-full pl-12 pr-4 py-5 bg-white border-0 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#25D366] text-lg outline-none" 
                                placeholder="Search documentation, guides, and articles..."
                            />
                            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                                <button className="bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-xl font-bold transition-colors">
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resources Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ResourceCard 
                            type="Documentation"
                            title="API Reference Guide" 
                            description="Complete technical documentation for our REST API. Endpoints, authentication, webhooks, and error codes."
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
                        />
                        <ResourceCard 
                            type="Tutorial"
                            title="Setting up your first Chatbot" 
                            description="A step-by-step visual guide to using our drag-and-drop builder to create an automated FAQ responder."
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <ResourceCard 
                            type="Case Study"
                            title="How RetailX increased sales by 40%" 
                            description="Learn how a leading e-commerce brand used our abandoned cart recovery templates to drive massive ROI."
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                        />
                        <ResourceCard 
                            type="Guide"
                            title="Meta Green Tick Best Practices" 
                            description="The ultimate checklist to ensure your Official Business Account application gets approved on the first try."
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <ResourceCard 
                            type="Community"
                            title="Developer Forum" 
                            description="Join thousands of developers building on our platform. Ask questions, share snippets, and get support."
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>}
                        />
                        <ResourceCard 
                            type="Webinar"
                            title="Mastering Broadcast Campaigns" 
                            description="Register for our upcoming live session on writing highly engaging WhatsApp promotional messages."
                            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                        />
                    </div>
                </div>

                <Footer />
            </div>
        </div>
    );
};

export default Resources;
