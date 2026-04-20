import React, { useState } from 'react';
import NavBar from '../components/NavBar';

const CheckIcon = ({ className = '' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 6L9 17l-5-5" />
    </svg>
);

const Footer = () => (
    <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
                <div className="mb-6 flex justify-center md:justify-start">
                    <img
                        src="/company-logo.jpg"
                        alt="Manuen Infotech logo"
                        className="ml-20 h-12 w-auto rounded-xl object-contain"
                    />
                </div>
                <p className="max-w-md text-center text-slate-400 leading-relaxed  md:text-left">
                    The industry leader in premium WhatsApp Business API integration and fully managed account services. We ensure your communication never drops.
                </p>
            </div>
            <div>
                <h4 className="text-white font-bold text-lg mb-6">Solutions</h4>
                <ul className="space-y-3">
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">API Integration</a></li>
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">Account Management</a></li>
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">Green Tick Verification</a></li>
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">Chatbot Automation</a></li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold text-lg mb-6">Company</h4>
                <ul className="space-y-3">
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">Documentation</a></li>
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-[#25D366] transition-colors">Contact Support</a></li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} MANUEN INFOTECH. All rights reserved.</p>
        </div>
    </footer>
);

const Pricing = ({ activePath = '/pricing', onNavigate }) => {
    const [isAnnual, setIsAnnual] = useState(true);

    const pricingPlans = [
        {
            name: "Starter",
            description: "Perfect for small businesses getting started with WhatsApp API.",
            monthlyPrice: 59,
            annualPrice: 49,
            popular: false,
            features: [
                "Up to 10,000 messages/month",
                "Basic API Integration",
                "Shared Inbox (1 User)",
                "Standard Support",
                "Message Templates (Up to 50)",
            ],
            ctaText: "Start Free Trial",
            ctaStyle: "bg-[rgba(164,144,144,0.16)] hover:bg-[#25D366] text-slate-900 hover:text-white border-2 border-[rgba(164,144,144,0.16)] hover:border-transparent transition-colors shadow-sm"
        },
        {
            name: "Professional",
            description: "Ideal for growing businesses needing advanced automation.",
            monthlyPrice: 179,
            annualPrice: 149,
            popular: true,
            features: [
                "Up to 50,000 messages/month",
                "Green Tick Verification Assistance",
                "Shared Inbox (Up to 5 Users)",
                "Chatbot Builder & Automation",
                "Advanced Analytics Dashboard",
                "Priority Email Support"
            ],
            ctaText: "Get Started",
            ctaStyle: "bg-[rgba(164,144,144,0.16)] hover:bg-[#25D366] text-slate-900 hover:text-white border-2 border-[rgba(164,144,144,0.16)] hover:border-transparent transition-colors shadow-sm"
        },
        {
            name: "Enterprise",
            description: "Custom solutions for large scale operations and high volumes.",
            monthlyPrice: "Custom",
            annualPrice: "Custom",
            popular: false,
            features: [
                "Unlimited Messages",
                "Dedicated Account Manager",
                "99.99% Uptime SLA",
                "Custom API Integrations",
                "Dedicated IP Address",
                "24/7 Phone & Priority Support"
            ],
            ctaText: "Contact Sales",
            ctaStyle: "bg-[rgba(164,144,144,0.16)] hover:bg-[#25D366] text-slate-900 hover:text-white border-2 border-[rgba(164,144,144,0.16)] hover:border-transparent transition-colors shadow-sm"
        }
    ];

    // Main page background color (custom pale green matching user request)
    return (
        <div className="relative min-h-screen bg-[#e6f4ea] font-sans text-slate-900 selection:bg-green-200 selection:text-green-900 overflow-hidden">
            {/* Global Decorative Glowing Backgrounds */}
            <div className="absolute top-0 left-0 -translate-y-1/4 -translate-x-1/4 w-[800px] h-[800px] bg-[#25D366]/20 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>
            <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-[#128C7E]/15 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>

            {/* Content Wrapper */}
            <div className="relative z-10">
                <NavBar activePath={activePath} onNavigate={onNavigate} />

                {/* Header Section */}
                <div className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 text-center">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                            Scale smarter on WhatsApp—<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#128C7E] to-[#25D366]">spend less, achieve more</span>.
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Choose a plan that fits your business needs. No hidden fees. Save up to 20% with annual billing.
                        </p>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center gap-4">
                            <span className={`text-sm font-semibold ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
                            <button
                                onClick={() => setIsAnnual(!isAnnual)}
                                className="relative inline-flex h-8 w-16 items-center rounded-full bg-[#128C7E] transition-colors focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
                            >
                                <span className={`${isAnnual ? 'translate-x-9' : 'translate-x-1'} inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm`} />
                            </button>
                            <span className={`text-sm font-semibold ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                                Annually <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Save 20%</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards Area */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
                        {pricingPlans.map((plan, index) => (
                            <div
                                key={index}
                                className="relative flex flex-col rounded-3xl border-2 border-white/60 bg-white/60 backdrop-blur-xl p-6 xl:p-8 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-2xl hover:border-[#25D366] hover:bg-white/80 hover:-translate-y-4"
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <span className="bg-[#25D366] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                                    <p className="text-slate-500 text-sm">{plan.description}</p>
                                </div>
                                <div className="mb-6 flex-grow">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        {plan.monthlyPrice === "Custom" ? (
                                            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">Custom</span>
                                        ) : (
                                            <>
                                                <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                                                </span>
                                                <span className="text-slate-500 font-medium">/mo</span>
                                            </>
                                        )}
                                    </div>
                                    {plan.monthlyPrice !== "Custom" && (
                                        <p className="text-xs text-slate-500">
                                            {isAnnual ? `Billed annually ($${plan.annualPrice * 12}/yr)` : 'Billed monthly'}
                                        </p>
                                    )}
                                </div>
                                <ul className="space-y-3 mb-6 flex-grow">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-slate-700">
                                            <CheckIcon className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                                            <span className="text-sm font-medium leading-tight">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${plan.ctaStyle}`}>
                                    {plan.ctaText}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>



                <Footer />
            </div>
        </div>
    );
};

export default Pricing;
