import React from 'react';

const Footer = ({ onNavigate }) => {
    const year = new Date().getFullYear();

    const downloadDocs = (e) => {
        e.preventDefault();
        const docsContent = `# Maneun WhatsApp Business Platform
### A Complete & Simple Guide for Your Business

The Maneun WhatsApp Business Platform is an easy-to-use software that helps you talk to your customers, send mass announcements, and automate customer support using the official WhatsApp API from Meta (Facebook).

## 🛠️ Complete Feature Guide

1. 📊 Live Performance Dashboard (Analytics)
   - Real-Time Tracking: Clear graphs displaying Sent, Delivered, Read, and Failed message counts.
   - Activity Charts: Beautiful, clutter-free charts showing daily messaging trends.

2. 📢 High-Performance Broadcasts (Campaigns)
   - Mass Announcements: Set up, schedule, or instantly send customized templates to entire customer lists.
   - Excel Ingestion: Save customer lists in Excel, upload them, and send messages in seconds.

3. 📝 Pre-Approved Message Templates & Interactive Previews (Managed Setup)
   - Done-For-You Templates: The system administrator designs, registers, and submits templates to Meta on your behalf!
   - Easy Request Portal: Submit custom template requests directly to the administrator from your dashboard.

4. 🤖 Pre-Built Chat Auto-Replies (Managed Automation)
   - Done-For-You Setups: Administrator designs custom chat flows so you don't need any coding or design skills.
   - Custom Flow Requests: Submit custom flow requests directly from your panel.

5. 💬 Shared Team Live Chat Inbox
   - Shared Support: Multiple support agents can log in and reply to chats simultaneously from different devices.

6. 👥 Customer CRM & Group Directory
   - Target Categories: Group customers into segments (like "VIP Buyers") to send targeted promotions instead of mass spam.

7. 📲 Instant QR Code & Landing Page Lead Capture (Consent Portal)
   - Custom Consent Forms: Branded registration pages to capture Name, Phone, Email, and Location automatically.
   - Printable QR Codes: Generate codes ready to print on shop counters or banners.

8. 🛍️ Product Catalog & Inventory
   - Pricing & Variants: Set different pricing variants (such as a "1kg package" at ₹200 vs a "500g package" at ₹110) with simple stock toggles.

9. 🏢 Business Profile & Logo Customization
   - Customize identity details and upload your official logo to personalize your dashboard.

10. ⚙️ Simple 3-Step Setup Wizard
    - Guides you through copy-pasting your Meta Business credentials in minutes.

---
* Maneun Platform is 100% White-Label Customization ready.
* Fully Hosted Cloud Database. Zero technical infrastructure overhead.`;

        const element = document.createElement("a");
        const file = new Blob([docsContent], { type: 'text/markdown;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = "whatsapp_api_product_documentation.md";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleNavigation = (e, path, hash = '') => {
        e.preventDefault();
        if (hash) {
            window.location.hash = hash;
        } else {
            window.location.hash = '';
        }
        if (onNavigate) {
            onNavigate(path);
        } else {
            window.history.pushState({}, '', path);
            window.dispatchEvent(new Event('popstate'));
        }
    };

    return (
        <footer className="bg-white border-t border-slate-100 pt-12 pb-8 relative">
            <div className="max-w-7xl mx-auto px-8 flex flex-col lg:flex-row justify-between items-start gap-12 mb-10">
                <div className="space-y-4 max-w-xl">
                    <div className="flex items-center gap-3">
                        <img src="/manuen_square.png" alt="Manuen Icon" className="h-10 object-contain" />
                        <img src="/manuen_logo.png" alt="Manuen Infotech" className="h-8 object-contain" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">
                            The industry leader in premium WhatsApp Business API integration and fully managed account services.
                        </p>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium max-w-md">
                            Empowering modern enterprises with automated customer outreach, pre-approved Meta template registries, secure multi-tenant isolation, and interactive team inboxes. Built for conversion-focused marketing campaigns.
                        </p>
                    </div>
                    <div className="pt-3 space-y-1.5 border-t border-slate-100/60 max-w-sm">
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <span>Direct Line:</span>
                            <a href="tel:+919876543210" className="text-slate-500 hover:text-primary transition-colors font-medium">+91 98765 43210</a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                            <span>Operations Desk:</span>
                            <a href="mailto:connect@manuen.com" className="text-slate-500 hover:text-primary transition-colors font-medium">connect@manuen.com</a>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row gap-8 sm:gap-16 w-full lg:w-auto justify-start">
                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">Solutions</h4>
                        <ul className="space-y-2">
                            {['Retail', 'Healthcare', 'Services', 'Education'].map(item => (
                                <li key={item}>
                                    <a
                                        href="#solutions"
                                        onClick={(e) => handleNavigation(e, '/', '#solutions')}
                                        className="text-sm text-slate-500 hover:text-primary transition-colors"
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-4">Company & Support</h4>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="#features"
                                    onClick={(e) => handleNavigation(e, '/', '#features')}
                                    className="text-sm text-slate-500 hover:text-primary transition-colors"
                                >
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#pricing"
                                    onClick={(e) => handleNavigation(e, '/', '#pricing')}
                                    className="text-sm text-slate-500 hover:text-primary transition-colors"
                                >
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    onClick={downloadDocs}
                                    className="text-sm text-slate-500 hover:text-primary transition-colors font-bold text-secondary flex items-center gap-1"
                                    title="Click to instantly download product documentation"
                                >
                                    Documentation 📥
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 pt-6 border-t border-slate-100/60 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-xs text-slate-500 font-medium">
                    © {year} MANUEN Infotech (OPC) PRIVATE LIMITED. All rights reserved.
                </p>
                <div className="flex gap-8">
                    <a
                        href="https://twitter.com/ManuenInfotech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:text-primary font-medium transition-colors"
                    >
                        Twitter
                    </a>
                    <a
                        href="https://linkedin.com/company/manuen-infotech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:text-primary font-medium transition-colors"
                    >
                        LinkedIn
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
