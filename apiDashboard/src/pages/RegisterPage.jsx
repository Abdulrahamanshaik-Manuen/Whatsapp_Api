import React, { useState, useRef } from 'react';
import RegLeftPanel from '../components/RegLeftPanel';
import {
  Phone, Lock, User, Building2, Link2, ChevronRight,
  ArrowLeft, Eye, EyeOff, ShieldCheck, Loader2,
  AlertCircle, Mail, Briefcase, Smartphone, CheckCircle2, Plus
} from 'lucide-react';

// ── Progress Dots ────────────────────────────────────────────────────────────
function StepDots({ current }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {[1, 2, 3, 4, 5].map((n, i) => {
        const done = current > n, active = current === n;
        return (
          <React.Fragment key={n}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all ${done ? 'bg-[#63C132] border-[#63C132] text-white' :
                active ? 'bg-[#63C132] border-[#63C132] text-white shadow-lg shadow-[#63C132]/40' :
                  'bg-white border-slate-300 text-slate-400'
              }`}>
              {done ? <CheckCircle2 size={15} /> : n}
            </div>
            {i < 4 && <div className={`h-0.5 flex-1 min-w-[32px] sm:min-w-[48px] transition-all ${current > n ? 'bg-[#63C132]' : 'bg-slate-200'}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Text Input ───────────────────────────────────────────────────────────────
function Field({ label, id, icon: Icon, type = 'text', placeholder, value, onChange, hint, optional }) {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
        {label}
        {optional && <span className="text-slate-400 font-normal">(Optional)</span>}
      </label>
      <div className="relative">
        {Icon && <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
          id={id} type={isPass ? (show ? 'text' : 'password') : type}
          placeholder={placeholder} value={value} onChange={onChange}
          className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:border-[#63C132] focus:ring-2 focus:ring-[#63C132]/10 transition-all"
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

// ── OTP Boxes ────────────────────────────────────────────────────────────────
function OtpBoxes({ otp, setOtp }) {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const change = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const n = [...otp]; n[i] = v; setOtp(n);
    if (v && i < 5) refs[i + 1].current?.focus();
  };
  const keydown = (i, e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus(); };
  return (
    <div className="flex gap-2 justify-center my-2">
      {otp.map((d, i) => (
        <input key={i} ref={refs[i]} value={d} maxLength={1} inputMode="numeric"
          onChange={e => change(i, e.target.value)} onKeyDown={e => keydown(i, e)}
          className="w-11 h-13 text-center text-lg font-black border-2 border-slate-200 rounded-xl text-[#003B6D] bg-white focus:outline-none focus:border-[#63C132] focus:ring-2 focus:ring-[#63C132]/20 transition-all"
        />
      ))}
    </div>
  );
}

// ── Primary Button ───────────────────────────────────────────────────────────
function PrimaryBtn({ onClick, loading, label, loadLabel }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="w-full bg-[#63C132] text-white font-manrope font-bold text-sm py-3 rounded-xl shadow-lg shadow-[#63C132]/30 hover:brightness-110 hover:-translate-y-0.5 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
      {loading ? <><Loader2 size={15} className="animate-spin" />{loadLabel}</> : <>{label}<ChevronRight size={15} /></>}
    </button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#003B6D] font-bold transition-colors mt-1">
      <ArrowLeft size={14} /> Back
    </button>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
const API = 'http://localhost:5000/api';
const CATS = ['Retail', 'E-commerce', 'Healthcare', 'Education', 'Finance', 'Real Estate', 'Technology', 'Logistics', 'Other'];

export default function RegisterPage({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  const [f, setF] = useState({
    phone: '', name: '', password: '', confirmPassword: '',
    business_name: '', business_category: '', business_description: '', email: '',
    city: '', country: '', logo_url: '',
    waba_id: '', phone_number_id: '', access_token: '',
  });
  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }));

  const startTimer = () => {
    setTimer(45);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; }), 1000);
  };

  const next = () => { setError(''); setStep(s => s + 1); };
  const back = () => { setError(''); setStep(s => s - 1); };

  const withLoad = async (fn) => { setLoading(true); setError(''); try { await fn(); } catch (e) { setError(e.message); } finally { setLoading(false); } };

  const sendOtp = () => withLoad(async () => {
    if (!f.phone.trim()) throw new Error('Phone number is required.');
    const fullPhone = f.phone.startsWith('+') ? f.phone : `+91${f.phone.replace(/\s/g, '')}`;
    const r = await fetch(`${API}/auth/send-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: fullPhone }) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error || d.message || 'Failed to send OTP');
    setF(p => ({ ...p, phone: fullPhone }));
    startTimer(); next();
  });

  const verifyOtp = () => withLoad(async () => {
    const code = otp.join('');
    if (code.length < 6) throw new Error('Enter the complete 6-digit code.');
    const r = await fetch(`${API}/auth/verify-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: f.phone, otp: code }) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error || d.message || 'Invalid OTP');
    next();
  });

  const register = () => withLoad(async () => {
    if (!f.name.trim()) throw new Error('Full name is required.');
    if (f.password.length < 8) throw new Error('Password must be at least 8 characters.');
    if (f.password !== f.confirmPassword) throw new Error('Passwords do not match.');
    const r = await fetch(`${API}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: f.name, phone: f.phone, password: f.password }) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error || d.message || 'Registration failed');
    if (d.token) localStorage.setItem('token', d.token);
    next();
  });

  const logoRef = useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setF(p => ({ ...p, logo_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const saveBusiness = () => withLoad(async () => {
    if (!f.business_name.trim()) throw new Error('Business name is required.');
    if (!f.business_category) throw new Error('Please select a category.');
    const token = localStorage.getItem('token');
    const r = await fetch(`${API}/business/profile`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ business_name: f.business_name, business_category: f.business_category, business_description: f.business_description, email: f.email, city: f.city, country: f.country, logo_url: f.logo_url }) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error || d.message || 'Failed to save profile');
    next();
  });

  const connectWA = () => withLoad(async () => {
    if (!f.waba_id.trim() || !f.phone_number_id.trim() || !f.access_token.trim()) throw new Error('All WhatsApp credentials are required.');
    const token = localStorage.getItem('token');
    const r = await fetch(`${API}/whatsapp/connect`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ waba_id: f.waba_id, phone_number_id: f.phone_number_id, access_token: f.access_token }) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error || d.message || 'Connection failed');
    onNavigate('/login?reg_success=true');
  });

  const skipStep5 = () => {
    onNavigate('/login?reg_success=true');
  };

  // ── Success Screen ────────────────────────────────────────────────────────
  if (step === 6) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f9fd]">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center space-y-5">
        <div className="w-20 h-20 bg-[#63C132]/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={40} className="text-[#63C132]" />
        </div>
        <div>
          <h2 className="font-manrope text-2xl font-black text-[#003B6D]">You're All Set! 🎉</h2>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">Your WhatsApp CRM is fully configured and ready to use.</p>
        </div>
        <div className="bg-[#63C132]/5 border border-[#63C132]/20 rounded-xl p-4 flex items-center gap-3 text-left">
          <ShieldCheck size={18} className="text-[#63C132] shrink-0" />
          <p className="text-xs text-slate-600"><span className="font-bold text-[#003B6D]">WhatsApp Connected</span> — You can now send campaigns and messages.</p>
        </div>
        <button onClick={() => onNavigate('/dashboard')}
          className="w-full bg-[#63C132] text-white font-manrope font-bold py-3 rounded-xl shadow-lg shadow-[#63C132]/30 hover:brightness-110 transition-all">
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  // ── Two-panel Shell ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#f9f9fd]">
      <RegLeftPanel />

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-md">
          <p className="text-xs font-bold mb-3" style={{ color: '#003B6D' }}>Step {step} of 5</p>
          <StepDots current={step} />

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-xs font-medium mb-5">
              <AlertCircle size={14} className="shrink-0" /> {error}
            </div>
          )}

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-manrope text-xl font-black text-[#003B6D]">Enter Your Phone Number</h2>
                <p className="text-slate-500 text-sm mt-1">We will send you a verification code to this number.</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Phone Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 bg-white text-sm font-bold text-slate-700 shrink-0">
                    🇮🇳 +91
                  </div>
                  <div className="relative flex-1">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="tel" placeholder="Enter your phone number" value={f.phone} onChange={set('phone')}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#63C132] focus:ring-2 focus:ring-[#63C132]/10 transition-all" />
                  </div>
                </div>
              </div>
              <div className="bg-[#63C132]/5 border border-[#63C132]/20 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-600">
                <ShieldCheck size={14} className="text-[#63C132] shrink-0 mt-0.5" /> Make sure your phone number is active. Standard SMS charges may apply.
              </div>
              <PrimaryBtn onClick={sendOtp} loading={loading} label="Send OTP" loadLabel="Sending…" />
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-manrope text-xl font-black text-[#003B6D]">Verify OTP</h2>
                <p className="text-slate-500 text-sm mt-1">Enter the 6-digit code sent to <span className="font-bold text-[#003B6D]">{f.phone}</span></p>
              </div>
              <OtpBoxes otp={otp} setOtp={setOtp} />
              <p className="text-center text-xs text-slate-400">
                Didn't receive the code?{' '}
                {timer > 0
                  ? <span className="text-[#63C132] font-bold">Resend OTP ({String(Math.floor(timer / 60)).padStart(2, '0')}:{String(timer % 60).padStart(2, '0')})</span>
                  : <button onClick={sendOtp} className="text-[#63C132] font-bold hover:underline">Resend OTP</button>
                }
              </p>
              <PrimaryBtn onClick={verifyOtp} loading={loading} label="Verify & Continue" loadLabel="Verifying…" />
              <div className="text-center"><BackBtn onClick={back} /></div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-manrope text-xl font-black text-[#003B6D]">Create Your Account</h2>
                <p className="text-slate-500 text-sm mt-1">Set up your login credentials to continue.</p>
              </div>
              <Field label="Full Name" id="name" icon={User} placeholder="Enter your full name" value={f.name} onChange={set('name')} />
              <Field label="Password" id="pw" icon={Lock} type="password" placeholder="Enter your password" value={f.password} onChange={set('password')} hint="Min. 8 characters • 1 Number • 1 Special Character" />
              <Field label="Confirm Password" id="cpw" icon={Lock} type="password" placeholder="Confirm your password" value={f.confirmPassword} onChange={set('confirmPassword')} />
              <PrimaryBtn onClick={register} loading={loading} label="Continue" loadLabel="Creating…" />
              <div className="text-center"><BackBtn onClick={back} /></div>
            </div>
          )}

          {/* ── Step 4 ── */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-manrope text-xl font-black text-[#003B6D]">Business Profile</h2>
                <p className="text-slate-500 text-sm mt-1">Tell us about your business.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Business Name" id="bname" icon={Briefcase} placeholder="Enter business name" value={f.business_name} onChange={set('business_name')} />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Business Category</label>
                  <div className="relative">
                    <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select value={f.business_category} onChange={set('business_category')}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#63C132] focus:ring-2 focus:ring-[#63C132]/10 appearance-none transition-all">
                      <option value="">Select category</option>
                      {CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <Field label="Business Email" id="bemail" icon={Mail} type="email" placeholder="Enter business email" value={f.email} onChange={set('email')} optional />
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Business Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                <textarea rows={2} placeholder="Briefly describe your business" value={f.business_description} onChange={set('business_description')}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#63C132] focus:ring-2 focus:ring-[#63C132]/10 resize-none transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Business Logo <span className="text-slate-400 font-normal">(Optional)</span></label>
                <div 
                  onClick={() => logoRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center space-y-2 hover:border-[#63C132] transition-colors cursor-pointer overflow-hidden group"
                >
                  <input type="file" ref={logoRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                  {f.logo_url && f.logo_url.startsWith('data:') ? (
                    <div className="relative w-16 h-16 mx-auto">
                      <img src={f.logo_url} alt="Logo preview" className="w-full h-full object-cover rounded-lg shadow-sm" />
                      <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={16} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto group-hover:bg-[#63C132]/10 transition-colors">
                      <Briefcase size={18} className="text-slate-400 group-hover:text-[#63C132]" />
                    </div>
                  )}
                  <p className="text-xs font-bold text-[#63C132]">Click to Upload Logo</p>
                  <p className="text-[11px] text-slate-400">PNG, JPG up to 2MB</p>
                  <input type="text" placeholder="Or paste image URL…" value={f.logo_url} onChange={set('logo_url')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#63C132] transition-all" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <BackBtn onClick={back} />
                <button onClick={saveBusiness} disabled={loading}
                  className="bg-[#63C132] text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-[#63C132]/30 hover:brightness-110 transition-all disabled:opacity-60 flex items-center gap-2">
                  {loading ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <>Save &amp; Continue<ChevronRight size={14} /></>}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 5 ── */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-manrope text-xl font-black text-[#003B6D]">Connect Your Platform <span className="text-slate-400 text-sm font-normal">(Optional)</span></h2>
                <p className="text-slate-500 text-sm mt-1">Connect your platform to start managing your communication and campaigns.</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#003B6D]/5 rounded-xl flex items-center justify-center">
                    <Link2 size={18} className="text-[#003B6D]" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#003B6D]">Connect Your Account</p>
                    <p className="text-xs text-slate-500">Securely connect your account to unlock all features and start using the platform.</p>
                  </div>
                </div>
                <Field label="WABA ID" id="waba" icon={Briefcase} placeholder="WhatsApp Business Account ID" value={f.waba_id} onChange={set('waba_id')} />
                <Field label="Phone Number ID" id="pnid" icon={Smartphone} placeholder="Meta Phone Number ID" value={f.phone_number_id} onChange={set('phone_number_id')} />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Access Token</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                    <textarea rows={2} placeholder="Paste your Meta System User Token…" value={f.access_token} onChange={set('access_token')}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-xs font-mono bg-white focus:outline-none focus:border-[#63C132] focus:ring-2 focus:ring-[#63C132]/10 resize-none transition-all" />
                  </div>
                </div>
              </div>
              <PrimaryBtn onClick={connectWA} loading={loading} label="Connect Now" loadLabel="Connecting…" />
              <p className="text-center text-xs text-slate-400">or</p>
              <button onClick={skipStep5} className="w-full border border-slate-200 text-slate-600 font-bold text-sm py-3 rounded-xl hover:bg-slate-50 transition-all">
                Setup later in Dashboard
              </button>
              <div className="text-center"><BackBtn onClick={back} /></div>
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">
            Already have an account?{' '}
            <button onClick={() => onNavigate('/login')} className="text-[#003B6D] font-bold hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}
