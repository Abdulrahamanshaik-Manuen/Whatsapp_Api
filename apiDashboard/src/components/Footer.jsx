import React from 'react';

const Footer = () => {
    const year = new Date().getFullYear();
    
    return (
        <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <img src="/manuen_square.png" alt="Manuen Icon" className="h-10 object-contain" />
                        <img src="/manuen_logo.png" alt="Manuen Infotech" className="h-8 object-contain" />
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                        The industry leader in premium WhatsApp Business API integration and fully managed account services.
                    </p>
                </div>

                <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6">Solutions</h4>
                    <ul className="space-y-4">
                        {['Retail', 'Healthcare', 'Services', 'Education'].map(item => (
                            <li key={item}>
                                <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">{item}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6">Company</h4>
                    <ul className="space-y-4">
                        {['About Us', 'Contact', 'Privacy Policy', 'Terms'].map(item => (
                            <li key={item}>
                                <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">{item}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6">Support</h4>
                    <ul className="space-y-4">
                        {['Documentation', 'API Reference', 'Status Page', 'Support Center'].map(item => (
                            <li key={item}>
                                <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors">{item}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    © {year} MANUEN Infotech (OPC) PRIVATE LIMITED. All rights reserved.
                </p>
                <div className="flex gap-8">
                    <a href="#" className="text-xs text-slate-400 hover:text-primary font-bold uppercase tracking-widest transition-colors">Twitter</a>
                    <a href="#" className="text-xs text-slate-400 hover:text-primary font-bold uppercase tracking-widest transition-colors">LinkedIn</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
