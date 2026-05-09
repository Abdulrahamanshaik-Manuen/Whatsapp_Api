import React from 'react';
import { Users, Send, CheckCircle, BarChart3 } from 'lucide-react';

const features = [
    {
        title: "Contact Management",
        desc: "Centralize your customer data and segment your audience for targeted outreach.",
        icon: Users,
        color: "bg-primary/5 text-primary"
    },
    {
        title: "Bulk Messaging",
        desc: "Send high-volume campaigns efficiently while maintaining personal connection.",
        icon: Send,
        color: "bg-secondary/5 text-secondary"
    },
    {
        title: "Consent-Based",
        desc: "Manage opt-ins and ensure your communication follows global privacy standards.",
        icon: CheckCircle,
        color: "bg-primary/5 text-primary"
    },
    {
        title: "Campaign Analytics",
        desc: "Track delivery, open rates, and engagement with detailed real-time reporting.",
        icon: BarChart3,
        color: "bg-secondary/5 text-secondary"
    }
];

const FeatureGrid = () => {
    return (
        <section id="features" className="bg-[#f3f3f7] py-20">
            <div className="max-w-7xl mx-auto px-8">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="font-manrope text-xl md:text-2xl text-primary font-black mb-4">
                        Everything You Need to Manage WhatsApp Communication
                    </h2>
                    <div className="h-1 w-16 bg-secondary mx-auto rounded-full"></div>
                    <p className="mt-6 text-slate-500 text-sm font-medium leading-relaxed">
                        Powerful tools designed for scale, security, and simplicity.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <div 
                            key={i} 
                            className="bg-white p-7 rounded-2xl border border-slate-200 hover:border-secondary hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
                        >
                            <div className={`w-12 h-12 ${f.color} rounded-lg flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300`}>
                                <f.icon size={24} />
                            </div>
                            <h3 className="font-manrope text-sm font-bold mb-3 text-primary tracking-tight">{f.title}</h3>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureGrid;
