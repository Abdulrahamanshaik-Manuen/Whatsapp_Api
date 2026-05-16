import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, AlertCircle, CheckCircle2, Info, BellRing } from 'lucide-react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null);
    const [toast, setToast] = useState(null);

    const showAlert = (message, type = 'info') => {
        if (message.toLowerCase().includes('copied')) {
            setToast(message);
            setTimeout(() => setToast(null), 2000);
        } else {
            setAlert({ message, type });
        }
    };

    const closeAlert = () => setAlert(null);

    // Monkey-patch window.alert
    useEffect(() => {
        const nativeAlert = window.alert;
        window.alert = (msg) => {
            let type = 'info';
            const msgLower = String(msg).toLowerCase();
            if (msgLower.includes('error') || msgLower.includes('failed') || msgLower.includes('not')) type = 'error';
            if (msgLower.includes('success') || msgLower.includes('updated') || msgLower.includes('saved')) type = 'success';
            
            showAlert(msg, type);
        };
        return () => {
            window.alert = nativeAlert;
        };
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert, closeAlert }}>
            {children}
            
            {/* Minimalist Toast for "Copied!" */}
            {toast && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-md">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{toast}</span>
                    </div>
                </div>
            )}

            {/* Premium Modal for other alerts */}
            {alert && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                        onClick={closeAlert}
                    ></div>
                    <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl shadow-slate-900/40 overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
                        <div className={`h-2 w-full ${
                            alert.type === 'error' ? 'bg-rose-500' : 
                            alert.type === 'success' ? 'bg-emerald-500' : 'bg-primary'
                        }`} />
                        
                        <div className="p-8">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                                    alert.type === 'error' ? 'bg-rose-50 text-rose-500' : 
                                    alert.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'
                                }`}>
                                    {alert.type === 'error' && <AlertCircle size={32} />}
                                    {alert.type === 'success' && <CheckCircle2 size={32} />}
                                    {alert.type === 'info' && <Info size={32} />}
                                </div>
                                
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">
                                        {alert.type === 'error' ? 'Attention' : 
                                         alert.type === 'success' ? 'Awesome' : 'Notice'}
                                    </h3>
                                    <p className="text-sm text-slate-500 font-bold leading-relaxed px-2">
                                        {alert.message}
                                    </p>
                                </div>

                                <button 
                                    onClick={closeAlert}
                                    className={`w-full py-4 mt-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                                        alert.type === 'error' ? 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600' : 
                                        alert.type === 'success' ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600' : 
                                        'bg-primary text-white shadow-primary/20 hover:brightness-110'
                                    }`}
                                >
                                    Got It
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={closeAlert}
                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-500 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}
        </AlertContext.Provider>
    );
};
