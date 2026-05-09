import React from 'react';
import { ShieldCheck, Zap, Globe, CheckCircle2 } from 'lucide-react';

const TrustSection = () => {
    const points = [
        {
            title: "Reliable Platform",
            desc: "99.9% uptime guaranteed for your critical messaging needs.",
            icon: Zap
        },
        {
            title: "Secure Integrations",
            desc: "End-to-end encryption and enterprise-grade security.",
            icon: ShieldCheck
        },
        {
            title: "Scalable for Growth",
            desc: "Built to handle millions of messages as your business expands.",
            icon: Globe
        }
    ];

    return (
        <section className="bg-primary text-white py-20 overflow-hidden">
            <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-5">
                    <h2 className="font-manrope text-2xl md:text-3xl font-black leading-tight tracking-tight">
                        Built by <br />
                        <span className="text-secondary">MANUEN Infotech</span>
                    </h2>
                    <p className="text-sm opacity-90 leading-relaxed font-medium text-slate-200 max-w-md">
                        We engineer reliability and digital maturity into every line of code, ensuring your enterprise communication never stops.
                    </p>
                    
                    <ul className="space-y-5 pt-2">
                        {points.map((p, i) => (
                            <li key={i} className="flex items-start gap-4">
                                <div className="p-1.5 bg-secondary/15 rounded-full text-secondary-container">
                                    <CheckCircle2 size={18} />
                                </div>
                                <div>
                                    <span className="font-bold block text-sm mb-1">{p.title}</span>
                                    <span className="text-[11px] opacity-70 leading-relaxed block">{p.desc}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative scale-95 origin-right">
                    <div className="rounded-2xl overflow-hidden shadow-2xl relative z-10">
                        <img 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuADUdfOkjFWi4tqbpCcyUopGzC77a_jQSTdSg7BgcEyEus0MTPU4ddxBR-5sdYipcU28zC6G9vs5R2HIsqY1bNh9me5OqH2oEi_MuqBqJ7jRfg9rEhDm4dy3s2PR3wX9a4mAhJ03y1C2JYLoukvkshrycRGWXp8e6n2crsO8xwuUiU6JwsJyKEMKziPRHAV7IloD0KbzU75fno6yEN6-8qbR3K1NBcuVGvVXZvNCIPbcxh-XeHN8xvNXfrIBNgxWzSVM2FvQ3Ju06MF" 
                            alt="MANUEN Engineering Team" 
                            className="w-full h-full object-cover aspect-[4/3]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustSection;
