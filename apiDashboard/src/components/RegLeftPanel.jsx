import React from 'react';
import { ShieldCheck, Zap, BarChart2, MessageCircle, Tag, CheckCheck, User } from 'lucide-react';

export default function RegLeftPanel() {
  return (
    <div
      style={{
        width: '45%',
        minWidth: '460px',
        background: 'linear-gradient(145deg, var(--color-primary-dark) 0%, var(--color-primary) 60%, var(--color-primary-light) 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '36px 40px',
        minHeight: '100vh',
      }}
    >
      {/* BG orbs */}
      <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'260px', height:'260px', background:'rgba(99,193,50,0.09)', borderRadius:'50%', filter:'blur(50px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-80px', left:'-40px', width:'240px', height:'240px', background:'rgba(255,255,255,0.04)', borderRadius:'50%', filter:'blur(50px)', pointerEvents:'none' }} />

      {/* ── LOGO ── */}
      <div style={{ display:'flex', alignItems:'center', background:'#fff', borderRadius:'14px', padding:'8px 14px', width:'fit-content', marginBottom:'32px', position:'relative', zIndex:1 }}>
        <img src="/manuen_square.png" alt="Manuen Icon" style={{ height:'40px', objectFit:'contain' }} />
        <img src="/manuen_logo.png" alt="Manuen Infotech" style={{ height:'40px', objectFit:'contain', marginLeft:'-10px' }} />
      </div>

      {/* ── TAGLINE ── */}
      <div style={{ marginBottom:'28px', position:'relative', zIndex:1 }}>
        <h1 style={{ fontFamily:'Manrope, sans-serif', fontSize:'2rem', fontWeight:900, lineHeight:1.2, color:'#fff', margin:'0 0 10px 0' }}>
          Grow Your Business<br />
          With <span className="text-secondary">Smart Solutions</span>
        </h1>
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:'13px', lineHeight:1.7, margin:0, maxWidth:'300px', fontWeight:500 }}>
          Manage customers, run campaigns, analyze performance and scale your business with our powerful platform.
        </p>
      </div>

      {/* ── WHATSAPP ACTIVITY CARD ── */}
      <div style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'16px', overflow:'hidden', marginBottom:'28px', position:'relative', zIndex:1 }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px 8px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'#25D366', display:'flex', alignItems:'center', justifyContent:'center' }}><MessageCircle size={14} color="#fff" /></div>
            <div>
              <p style={{ margin:0, fontSize:'11px', fontWeight:800, color:'#fff' }}>WhatsApp Activity</p>
              <p style={{ margin:0, fontSize:'9px', color:'rgba(255,255,255,0.4)', fontWeight:500 }}>Last 7 days</p>
            </div>
          </div>
          <span className="text-[9px] font-bold text-secondary bg-secondary/15 px-2 py-0.5 rounded-full ring-1 ring-secondary/30">● Active</span>
        </div>

        {/* Chat bubbles */}
        <div style={{ padding:'6px 14px 10px', display:'flex', flexDirection:'column', gap:'5px' }}>
          {[
            { from:'user', text:'Hi! What are your offers?', time:'10:21 AM' },
            { from:'bot',  text:'Get 20% off on all plans today!', time:'10:21 AM', ticks:true },
            { from:'user', text:'How do I get started?', time:'10:22 AM' },
          ].map((msg, i) => (
            <div key={i} style={{ display:'flex', justifyContent: msg.from==='bot' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth:'80%', padding:'5px 10px',
                borderRadius: msg.from==='bot' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: msg.from==='bot' ? 'rgba(99,193,50,0.22)' : 'rgba(255,255,255,0.11)',
                fontSize:'10px', color:'rgba(255,255,255,0.9)', fontWeight:500, lineHeight:1.4,
              }}>
                {msg.from==='bot' && <Tag size={9} className="inline mr-1 align-middle text-secondary" />}
                {msg.text}
                <span style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'2px', fontSize:'8px', color:'rgba(255,255,255,0.35)', marginTop:'2px' }}>
                  {msg.time} {msg.ticks && <CheckCheck size={10} className="text-secondary" />}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          {[['12.4K','Sent'],['98.2%','Delivered'],['4.1K','Replies']].map(([v,l]) => (
            <div key={l} style={{ padding:'9px 0', textAlign:'center', background:'rgba(0,0,0,0.12)' }}>
              <p style={{ color:'#fff', fontWeight:900, fontSize:'14px', margin:0 }}>{v}</p>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'8px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', margin:'2px 0 0' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>


      {/* ── Spacer pushes badges to bottom ── */}
      <div style={{ flex:1 }} />

      {/* ── TRUST BADGES ── */}
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', gap:'32px', marginBottom:'20px' }}>
          {[['Secure', ShieldCheck],['Reliable', Zap],['Scalable', BarChart2]].map(([label, Icon]) => (
            <div key={label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
              <div className="w-10 h-10 rounded-full bg-secondary/12 border border-secondary/25 flex items-center justify-center">
                <Icon size={16} className="text-secondary" />
              </div>
              <span style={{ fontSize:'9px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.12em', color:'rgba(255,255,255,0.45)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
