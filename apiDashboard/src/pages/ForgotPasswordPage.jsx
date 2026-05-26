import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, Eye, EyeOff, ShieldCheck, 
  Smartphone, Loader2, ArrowLeft, CheckCircle2, ChevronRight, AlertCircle, Zap, BarChart3, TrendingUp
} from 'lucide-react';

// Reuse the same UI components for consistency
export default function ForgotPasswordPage({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  const API = 'http://localhost:5000/api';

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@700;800;900&family=Manrope:wght@500;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch(e){} };
  }, []);

  const startTimer = () => {
    setTimer(60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer(t => { if(t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; }), 1000);
  };

  const handleSendOTP = async () => {
    if(!phone.trim()) return setError('Phone number is required');
    setLoading(true);
    setError('');
    try {
      const fullPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\s/g,'')}`;
      const r = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone })
      });
      const d = await r.json();
      if(!r.ok) throw new Error(d.error || 'Failed to send OTP');
      setPhone(fullPhone);
      startTimer();
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = () => {
    const code = otp.join('');
    if(code.length < 6) return setError('Enter the 6-digit code');
    setStep(3);
  };

  const handleResetPassword = async () => {
    if(newPassword.length < 8) return setError('Password must be at least 8 characters');
    if(newPassword !== confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    setError('');
    try {
      const code = otp.join('');
      const r = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: code, password: newPassword })
      });
      const d = await r.json();
      if(!r.ok) throw new Error(d.error || 'Failed to reset password');
      setStep(4);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // OTP Box Logic
  const otpRefs = [useRef(),useRef(),useRef(),useRef(),useRef(),useRef()];
  const onOtpChange = (i, v) => {
    if(!/^\d?$/.test(v)) return;
    const n = [...otp]; n[i] = v; setOtp(n);
    if(v && i < 5) otpRefs[i+1].current?.focus();
  };
  const onOtpKeyDown = (i, e) => { if(e.key === 'Backspace' && !otp[i] && i > 0) otpRefs[i-1].current?.focus(); };

  return (
    <div className="h-screen w-full flex bg-white font-['Inter',_sans-serif] overflow-hidden select-none">
      
      {/* ── LEFT PANEL (Branded UI) ── */}
      <div
        className="hidden lg:flex lg:w-[45%] lg:min-w-[460px] h-screen flex-col relative overflow-hidden p-[36px_40px]"
        style={{
          background: 'linear-gradient(145deg, var(--color-primary-dark) 0%, var(--color-primary) 60%, var(--color-primary-light) 100%)',
        }}
      >
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '260px', height: '260px', background: 'rgba(99,193,50,0.09)', borderRadius: '50%', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '240px', height: '240px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', filter: 'blur(50px)' }} />

        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '14px', padding: '8px 14px', width: 'fit-content', marginBottom: '28px', position: 'relative', zIndex: 1 }}>
          <img src="/manuen_square.png" alt="Manuen" style={{ height: '40px' }} />
          <img src="/manuen_logo.png" alt="Manuen" style={{ height: '40px', marginLeft: '-10px' }} />
        </div>

        {/* TAGLINE */}
         <div style={{ marginBottom: '24px', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.9rem', fontWeight: 900, lineHeight: 1.2, color: '#fff', margin: '0 0 8px 0' }}>
            Account <span className="text-secondary">Recovery</span><br />
            Secure & Simple
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', lineHeight: 1.6, margin: 0, maxWidth: '280px', fontWeight: 500 }}>
            Don't worry, it happens. Follow the simple steps to regain access to your business portal.
          </p>
        </div>

        {/* DASHBOARD CARD */}
        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', padding: '20px' }}>
             <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
               <ShieldCheck size={24} className="text-secondary" />
             </div>
             <p style={{ color: '#fff', fontSize: '16px', fontWeight: 800, margin: '0 0 8px 0' }}>Security Center</p>
             <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0, lineHeight: 1.5 }}>Multi-factor authentication protects your account from unauthorized access. Your data remains encrypted at all times.</p>
          </div>
        </div>

        {/* TRUST BADGES */}
        <div style={{ position: 'relative', zIndex: 1, shrink: 0 }}>
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

      {/* ── RIGHT PANEL (Forms) ── */}
      <div className="flex-1 flex flex-col p-4 sm:p-8 md:p-12 xl:p-24 relative justify-center bg-[#FAFAFB] h-full overflow-y-auto no-scrollbar">
         <div className="absolute top-6 sm:top-10 left-6 sm:left-12">
          <button onClick={() => onNavigate('/login')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary font-bold transition-colors">
            <ArrowLeft size={16} /> Back to Login
          </button>
        </div>

        <div className="max-w-[400px] w-full mx-auto">
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-bold">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* STEP 1: Phone */}
          {step === 1 && (
            <div className="space-y-6">
               <div>
                <h3 className="text-[32px] font-black text-primary mb-2 font-['Plus_Jakarta_Sans',_sans-serif] tracking-tight">Forgot Password?</h3>
                <p className="text-slate-500 font-medium text-base">Enter your registered mobile number to receive a verification code.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block ml-1">Mobile Number</label>
                 <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="tel" placeholder="Enter mobile number" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-secondary focus:ring-[4px] focus:ring-secondary/5 transition-all text-sm font-medium" />
                </div>
              </div>
               <button onClick={handleSendOTP} disabled={loading} className="w-full bg-secondary text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 mt-4 hover:brightness-105 active:scale-[0.98] transition-all">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Send OTP <ChevronRight size={18}/></>}
              </button>
            </div>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <div className="space-y-6">
               <div>
                <h3 className="text-[32px] font-black text-primary mb-2 font-['Plus_Jakarta_Sans',_sans-serif] tracking-tight">Verify Identity</h3>
                <p className="text-slate-500 font-medium text-base">Enter the 6-digit code sent to <span className="text-primary font-bold">{phone}</span></p>
              </div>
               <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                {otp.map((d, i) => (
                  <input key={i} ref={otpRefs[i]} value={d} maxLength={1} inputMode="numeric"
                    onChange={e => onOtpChange(i, e.target.value)} onKeyDown={e => onOtpKeyDown(i, e)}
                    className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-black border-2 border-slate-200 rounded-xl text-primary bg-white focus:outline-none focus:border-secondary transition-all" />
                ))}
              </div>
               <p className="text-center text-xs text-slate-400">
                Didn't receive the code? {' '}
                {timer > 0 ? <span className="text-secondary font-bold">Resend OTP ({timer}s)</span> : <button onClick={handleSendOTP} className="text-secondary font-bold hover:underline">Resend OTP</button>}
              </p>
               <button onClick={handleVerifyOTP} className="w-full bg-secondary text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 mt-4 transition-all hover:brightness-110">
                Verify Code <ChevronRight size={18}/>
              </button>
            </div>
          )}

          {/* STEP 3: Reset Password */}
          {step === 3 && (
            <div className="space-y-6">
               <div>
                <h3 className="text-[32px] font-black text-primary mb-2 font-['Plus_Jakarta_Sans',_sans-serif] tracking-tight">Set New Password</h3>
                <p className="text-slate-500 font-medium text-base">Choose a strong password to protect your account.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 block ml-1">New Password</label>
                   <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-secondary transition-all text-sm font-medium" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 block ml-1">Confirm Password</label>
                   <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="password" placeholder="Repeat your new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-secondary transition-all text-sm font-medium" />
                  </div>
                </div>
              </div>
               <button onClick={handleResetPassword} disabled={loading} className="w-full bg-secondary text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 mt-4 transition-all hover:brightness-110">
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Reset Password"}
              </button>
            </div>
          )}

          {/* STEP 4: Success */}
           {step === 4 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} className="text-secondary" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-primary mb-2">Password Reset Successful!</h3>
                <p className="text-slate-500 font-medium text-sm">Your password has been updated. You can now login with your new credentials.</p>
              </div>
              <button onClick={() => onNavigate('/login')} className="w-full bg-secondary text-white font-bold py-4 rounded-xl shadow-lg transition-all hover:brightness-110">
                Login Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
