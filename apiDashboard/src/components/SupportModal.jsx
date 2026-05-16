import React from 'react';
import { X, Headphones, MessageCircle, Mail, BookOpen, Clock, ExternalLink } from 'lucide-react';

export default function SupportModal({ onClose }) {
    const supportChannels = [
        {
            title: "WhatsApp Support",
            description: "Instant chat with our technical team",
            icon: <MessageCircle className="text-emerald-500" />,
            action: "Chat Now",
            link: "https://wa.me/918501920633", // Replace with real support number
            color: "bg-emerald-50"
        },
        {
            title: "Email Support",
            description: "Get help for complex issues",
            icon: <Mail className="text-blue-500" />,
            action: "Send Email",
            link: "mailto:connect@manuen.com",
            color: "bg-blue-50"
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 bg-gradient-to-br from-primary to-slate-900 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                            <Headphones size={32} className="text-secondary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Technical Support</h2>
                            <p className="text-white/60 text-sm font-medium">We're here to help you scale your business.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit">
                        <Clock size={12} className="text-secondary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Average Response: 15 Mins</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-4">
                    {supportChannels.map((channel, idx) => (
                        <a
                            key={idx}
                            href={channel.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-5 p-5 rounded-3xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all group"
                        >
                            <div className={`w-14 h-14 ${channel.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                {React.cloneElement(channel.icon, { size: 28 })}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-black text-slate-800 tracking-tight">{channel.title}</h4>
                                <p className="text-xs text-slate-500 font-medium">{channel.description}</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest">
                                {channel.action}
                                <ExternalLink size={12} />
                            </div>
                        </a>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manuen Infotech Support</p>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Support Online</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
