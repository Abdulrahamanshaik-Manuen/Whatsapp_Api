import React from 'react';

const steps = [
    { id: 1, title: "Register Business", desc: "Create your secure profile on the MANUEN Infotech platform." },
    { id: 2, title: "Connect WhatsApp", desc: "Sync your official WhatsApp API with our CRM dashboard seamlessly." },
    { id: 3, title: "Add Customers", desc: "Import your contacts or capture new leads via automated flows." },
    { id: 4, title: "Send Campaigns", desc: "Launch your first bulk campaign or set up automated triggers." }
];

const HowItWorks = () => {
    return (
        <section className="py-20 bg-[#f3f3f7]">
            <div className="max-w-7xl mx-auto px-8">
                <div className="text-center mb-16">
                    <h2 className="font-manrope text-xl md:text-2xl text-primary font-black">Get started in minutes</h2>
                    <p className="text-slate-500 mt-3 text-sm font-medium">Four simple steps to transform your customer engagement.</p>
                </div>
                
                <div className="relative">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
                        {steps.map((step) => (
                            <div key={step.id} className="text-center space-y-4 group">
                                <div className="w-16 h-16 bg-white border-4 border-primary/10 rounded-full flex items-center justify-center mx-auto text-lg text-primary shadow-lg font-black group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                    {step.id}
                                </div>
                                <h4 className="font-bold text-sm text-primary pt-2">{step.title}</h4>
                                <p className="text-[11px] text-slate-500 px-4 leading-relaxed font-medium">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
