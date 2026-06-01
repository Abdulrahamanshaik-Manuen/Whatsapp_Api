import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const MainNavigation = ({ activePath, onNavigate }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { label: 'Features', path: '#features' },
        { label: 'Solutions', path: '#solutions' },
        { label: 'Subscriptions', path: '#pricing' },
    ];

    return (
        <header className="fixed top-0 w-full z-50 bg-white border-b border-slate-100 shadow-sm transition-all duration-300">
            <nav className="flex justify-between items-center h-16 sm:h-20 px-4 sm:px-8 max-w-7xl mx-auto relative">
                {/* Logo Section */}
                <div className="flex items-center gap-4 relative z-10">
                    <div 
                        className="flex items-center gap-3 cursor-pointer" 
                        onClick={() => onNavigate('/')}
                    >
                        <img src="/manuen_square.png" alt="Manuen Icon" className="h-10 md:h-12 object-contain" />
                        <img src="/manuen_logo.png" alt="Manuen Infotech" className="h-8 md:h-10 object-contain" />
                    </div>
                </div>

                {/* Desktop Nav Items - Centered */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => {
                                if (item.path.startsWith('#')) {
                                    if (window.location.pathname !== '/') {
                                        onNavigate('/');
                                        setTimeout(() => {
                                            document.querySelector(item.path)?.scrollIntoView({ behavior: 'smooth' });
                                        }, 100);
                                    } else {
                                        document.querySelector(item.path)?.scrollIntoView({ behavior: 'smooth' });
                                    }
                                } else {
                                    onNavigate(item.path);
                                }
                            }}
                            className="text-xs font-black tracking-widest uppercase text-slate-500 hover:text-primary transition-colors relative group"
                        >
                            {item.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all group-hover:w-full"></span>
                        </button>
                    ))}
                </div>

                {/* Auth Actions */}
                <div className="flex items-center gap-3 relative z-10">
                    <button 
                        onClick={() => onNavigate('/login')}
                        className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-primary px-4 py-2 transition-all"
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => onNavigate('/register')}
                        className="hidden sm:block bg-secondary text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-secondary/20 hover:-translate-y-0.5 hover:brightness-110 transition-all active:scale-95"
                    >
                        Get Started
                    </button>
                    
                    {/* Mobile Menu Toggle */}
                    <button 
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-slate-200 p-6 duration-300">
                    <div className="flex flex-col gap-4">
                        {navItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    if (item.path.startsWith('#')) {
                                        if (window.location.pathname !== '/') {
                                            onNavigate('/');
                                            setTimeout(() => {
                                                document.querySelector(item.path)?.scrollIntoView({ behavior: 'smooth' });
                                            }, 100);
                                        } else {
                                            document.querySelector(item.path)?.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    } else {
                                        onNavigate(item.path);
                                    }
                                }}
                                className="text-left text-sm font-bold text-slate-700"
                            >
                                {item.label}
                            </button>
                        ))}
                        <hr className="border-slate-100" />
                        <button 
                            onClick={() => onNavigate('/login')}
                            className="text-left text-sm font-bold text-primary"
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => { setIsMobileMenuOpen(false); onNavigate('/register'); }}
                            className="w-full bg-secondary text-white text-[11px] font-black uppercase tracking-[0.15em] px-6 py-3 rounded-xl shadow-lg shadow-secondary/20 transition-all active:scale-95 text-center"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default MainNavigation;
