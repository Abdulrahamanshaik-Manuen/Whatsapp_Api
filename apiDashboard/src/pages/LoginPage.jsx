import React, { useState, useEffect } from 'react';
import {
  Lock, Eye, EyeOff, ShieldCheck,
  BarChart3, Users, Loader2, MessageCircle, Tag, CheckCheck, Zap, BarChart2, TrendingUp, Smartphone, CheckCircle2, AlertCircle
} from 'lucide-react';
import { loginUser } from '../utils/api';
import { useSocket } from '../context/SocketContext';

export default function LoginPage({ onNavigate }) {
  const { joinRoom } = useSocket();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check for registration success message
    if (window.location.search.includes('reg_success=true')) {
      setSuccessMsg('Registration successful! Please login to continue.');
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Load remembered credentials
    const savedPhone = localStorage.getItem('remembered_phone');
    const savedRemember = localStorage.getItem('remember_me') === 'true';
    if (savedRemember && savedPhone) {
      setPhone(savedPhone);
      setRememberMe(true);
    }

    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@700;800;900&family=Manrope:wght@500;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.innerHTML = `
      .no-scrollbar::-webkit-scrollbar { display: none; } 
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      @keyframes pulse-soft {
        0% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.05); opacity: 1; }
        100% { transform: scale(1); opacity: 0.8; }
      }
      .animate-pulse-soft {
        animation: pulse-soft 2s infinite ease-in-out;
      }
    `;
    document.head.appendChild(style);

    return () => {
      try {
        document.head.removeChild(link);
        document.head.removeChild(style);
      } catch (e) { }
    };
  }, []);

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length > 10) return;
    if (val.length === 1 && !/^[6-9]/.test(val)) return;
    setPhone(val);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setErrorMsg('Phone number must be exactly 10 digits.');
      setLoading(false);
      return;
    }
    if (!/^[6-9]/.test(cleaned)) {
      setErrorMsg('Phone number must start with 6, 7, 8, or 9.');
      setLoading(false);
      return;
    }

    try {
      const data = await loginUser(phone, password);
      
      if (data.token) {
        // Save or clear remembered credentials
        if (rememberMe) {
          localStorage.setItem('remembered_phone', phone);
          localStorage.setItem('remember_me', 'true');
        } else {
          localStorage.removeItem('remembered_phone');
          localStorage.setItem('remember_me', 'false');
        }

        // Store Token and User Info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Join Socket Room
        joinRoom(data.user.id, data.user.role);

        setSuccessMsg('Login successful! Redirecting...');
        setTimeout(() => {
          if (data.user.role === 'admin') {
            onNavigate('/admin');
          } else {
            onNavigate('/dashboard');
          }
        }, 1000);
      } else {
        setErrorMsg(data.error || 'Invalid credentials. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error("Login Error:", err);
      setErrorMsg('Server error. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white font-['Inter',_sans-serif] overflow-hidden select-none">

      {/* ── LEFT PANEL ── */}
      <div
        className="hidden lg:flex lg:w-[45%] lg:min-w-[460px] h-screen flex-col relative overflow-hidden p-[36px_40px]"
        style={{
          background: 'linear-gradient(145deg, var(--color-primary-dark) 0%, var(--color-primary) 60%, var(--color-primary-light) 100%)',
        }}
      >
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '260px', height: '260px', background: 'rgba(99,193,50,0.09)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '240px', height: '240px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />

        {/* LOGO */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '14px', padding: '8px 14px', width: 'fit-content', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
          <img src="/manuen_square.png" alt="Manuen Icon" style={{ height: '40px', objectFit: 'contain' }} />
          <img src="/manuen_logo.png" alt="Manuen Infotech" style={{ height: '40px', objectFit: 'contain', marginLeft: '-10px' }} />
        </div>

        {/* TAGLINE */}
        <div style={{ flexShrink: 0, marginBottom: '20px', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '2rem', fontWeight: 900, lineHeight: 1.15, color: '#fff', margin: '0 0 8px 0' }}>
            Grow Your Business<br />
            With <span className="text-secondary">Smart Solutions</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.6, margin: 0, maxWidth: '300px', fontWeight: 500 }}>
            Manage customers, run campaigns, and analyze performance.
          </p>
        </div>

        {/* DASHBOARD UI */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0, position: 'relative', zIndex: 1 }}>
          <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center"><TrendingUp size={14} color="#fff" /></div>
                <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: '#fff' }}>Live Performance</p>
              </div>
              <span className="text-[8px] font-700 text-secondary bg-secondary/15 px-2 py-0.5 rounded-full">● ACTIVE</span>
            </div>

            <div style={{ padding: '0 16px 14px', height: '80px' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
                <path d="M0,50 Q25,45 50,30 T100,20 T150,35 T200,10" fill="none" className="stroke-secondary" strokeWidth="3" strokeLinecap="round" />
                <path d="M0,50 Q25,45 50,30 T100,20 T150,35 T200,10 L200,60 L0,60 Z" fill="url(#grad2)" opacity="0.15" />
                <defs>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" className="stop-secondary" stopOpacity="1" />
                    <stop offset="100%" className="stop-secondary" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {[['84%', 'Delivery'], ['12.8K', 'Sent'], ['94%', 'ROI']].map(([v, l]) => (
                <div key={l} style={{ padding: '16px 0', textAlign: 'center', background: 'rgba(0,0,0,0.15)' }}>
                  <p style={{ color: '#fff', fontWeight: 900, fontSize: '15px', margin: 0, lineHeight: 1 }}>{v}</p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', margin: '6px 0 0', letterSpacing: '0.05em' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '18px' }}>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>Active Leads</p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#fff' }}>4,281</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '18px' }}>
              <p style={{ margin: 0, fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>Conversion</p>
              <p style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#fff' }}>24.2%</p>
            </div>
          </div>
        </div>

        {/* TRUST BADGES */}
        <div style={{ flexShrink: 0, position: 'relative', zIndex: 1, marginTop: '20px' }}>
          <div style={{ display: 'flex', gap: '32px', marginBottom: '20px' }}>
            {[['Secure', ShieldCheck], ['Reliable', Zap], ['Scalable', BarChart3]].map(([label, Icon]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div className="w-10 h-10 rounded-full bg-secondary/12 border border-secondary/25 flex items-center justify-center">
                  <Icon size={16} className="text-secondary" />
                </div>
                <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Auth Form with Phone Number) ── */}
      <div className="flex-1 flex flex-col p-4 sm:p-8 md:p-12 xl:p-24 relative justify-center bg-[#FAFAFB] h-full overflow-y-auto no-scrollbar">
        <div className="absolute top-6 sm:top-10 right-6 sm:right-12 text-sm font-medium">
          <span className="text-slate-400">Don't have an account? </span>
          <button onClick={() => onNavigate('/register')} className="text-primary font-bold hover:underline ml-1">Sign up</button>
        </div>

        <div className="max-w-[400px] w-full mx-auto">
          {errorMsg && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-500">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          <div className="mb-10">
            <h3 className="text-[32px] font-black text-slate-900 mb-2 font-['Plus_Jakarta_Sans',_sans-serif] tracking-tight">Welcome Back</h3>
            <p className="text-slate-500 font-medium text-base">Login with your mobile number and password</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Mobile Number Field */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block ml-1">Mobile Number</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="tel"
                  required
                  placeholder="Enter mobile number"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-secondary focus:ring-[4px] focus:ring-secondary/5 transition-all placeholder:text-slate-300 text-slate-800 font-medium text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-slate-700 block">Password</label>
                <button type="button" onClick={() => onNavigate('/forgot-password')} className="text-xs font-bold text-primary hover:underline">Forgot Password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-secondary focus:ring-[4px] focus:ring-secondary/5 transition-all placeholder:text-slate-300 text-slate-800 font-medium text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-1">
              <div onClick={() => setRememberMe(!rememberMe)} className={`w-5 h-5 rounded-[6px] border-2 cursor-pointer transition-all flex items-center justify-center ${rememberMe ? 'bg-secondary border-secondary' : 'bg-white border-slate-200'}`}>
                {rememberMe && <ShieldCheck className="text-white" size={14} strokeWidth={3} />}
              </div>
              <span className="text-sm font-semibold text-slate-600 cursor-pointer select-none" onClick={() => setRememberMe(!rememberMe)}>Remember me</span>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-secondary text-white font-bold py-4 rounded-xl shadow-lg hover:brightness-110 transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 text-base mt-2">
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
