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

            <div className="relative w-full max-w-lg bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-5 sm:p-8 bg-gradient-to-br from-primary to-slate-900 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-center gap-3 sm:gap-4 mb-4 pr-10">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                            <Headphones size={28} className="text-secondary" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight">Technical Support</h2>
                            <p className="text-white/60 text-xs sm:text-sm font-medium">We're here to help you scale your business.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit">
                        <Clock size={12} className="text-secondary shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Average Response: 15 Mins</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-8 space-y-3 sm:space-y-4">
                    {supportChannels.map((channel, idx) => (
                        <a
                            key={idx}
                            href={channel.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all group"
                        >
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 ${channel.color} rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                {React.cloneElement(channel.icon, { size: 24 })}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-slate-800 tracking-tight text-sm">{channel.title}</h4>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">{channel.description}</p>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest shrink-0">
                                {channel.action}
                                <ExternalLink size={11} />
                            </div>
                        </a>
                    ))}
                </div>

                {/* Footer */}
                <div className="px-5 sm:px-8 py-4 sm:py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">Manuen Infotech Support</p>
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest whitespace-nowrap">Support Online</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
