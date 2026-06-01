import React, { createContext, useContext, useState, useCallback } from 'react';
import { Crown, X, Zap, Lock } from 'lucide-react';

const SubscriptionGateContext = createContext(null);

export const useSubscriptionGate = () => useContext(SubscriptionGateContext);

export function SubscriptionGateProvider({ children, onNavigateToBilling }) {
    const [visible, setVisible] = useState(false);

    const showGate = useCallback(() => setVisible(true), []);
    const hideGate = useCallback(() => setVisible(false), []);

    const requireSub = useCallback(async (asyncFn) => {
        const result = await asyncFn();
        if (result && result.subscription_required) {
            showGate();
            return null;
        }
        return result;
    }, [showGate]);

    const handleGoToBilling = () => {
        hideGate();
        if (onNavigateToBilling) onNavigateToBilling('/billing');
    };

    return (
        <SubscriptionGateContext.Provider value={{ requireSub, showGate }}>
            {children}

            {visible && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
                        onClick={hideGate}
                    />

                    {/* Modal */}
                    <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-slate-900/50 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        {/* Top accent bar */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-[#003B6D] via-[#25D366] to-[#003B6D]" />

                        {/* Close button */}
                        <button
                            onClick={hideGate}
                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-500 transition-colors rounded-lg hover:bg-slate-50"
                        >
                            <X size={18} />
                        </button>

                        <div className="p-8 pt-7 flex flex-col items-center text-center gap-5">
                            {/* Icon */}
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#003B6D]/10 to-[#25D366]/10 flex items-center justify-center border border-[#003B6D]/10">
                                    <Lock size={36} className="text-[#003B6D]" />
                                </div>
                                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/30">
                                    <Crown size={14} className="text-white" />
                                </div>
                            </div>

                            {/* Text */}
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-[#003B6D] tracking-tight">
                                    Subscription Required
                                </h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                                    Please subscribe to a plan to send messages, campaigns, or automations to your customers.
                                </p>
                            </div>

                            {/* Features teaser */}
                            <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-left">
                                {[
                                    'Send messages & bulk campaigns',
                                    'Run automated workflows',
                                    'Full WhatsApp API access',
                                ].map((f, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
                                            <Zap size={11} className="text-[#25D366]" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-600">{f}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA buttons */}
                            <div className="w-full space-y-3">
                                <button
                                    onClick={handleGoToBilling}
                                    className="w-full py-4 bg-[#003B6D] text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 transition-all active:scale-95 shadow-xl shadow-[#003B6D]/25 flex items-center justify-center gap-2"
                                >
                                    <Crown size={16} />
                                    View Plans & Subscribe
                                </button>
                                <button
                                    onClick={hideGate}
                                    className="w-full py-3 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </SubscriptionGateContext.Provider>
    );
}
