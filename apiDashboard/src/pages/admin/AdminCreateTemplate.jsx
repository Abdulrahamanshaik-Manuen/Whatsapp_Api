import React, { useState, useEffect } from 'react';
import {
   ArrowLeft, Save, Zap, Target, CheckCheck, Globe, Upload as UploadIcon,
   Image as ImageIcon, FileText, Phone, Link2, Smartphone, Layout, Plus, Trash2, Loader2, User, ChevronRight, RefreshCcw
} from 'lucide-react';

const CATEGORIES = [
   { id: 'marketing', label: 'Marketing', desc: 'Promotions, offers, and brand awareness' },
   { id: 'utility', label: 'Utility', desc: 'Order updates, alerts, and account info' },
   { id: 'authentication', label: 'Authentication', desc: 'One-time passwords and security codes' }
];

const LANGUAGES = [
   { code: 'en_US', name: 'English (US)' },
   { code: 'en_GB', name: 'English (UK)' },
   { code: 'hi', name: 'Hindi' },
   { code: 'es', name: 'Spanish' }
];

// Replicated WhatsApp Mockup from Client UI
const MessagePreview = ({ template }) => (
   <div className="relative w-[260px] h-[520px] bg-slate-900 rounded-[2.8rem] p-1.5 border-[3px] border-slate-800 shadow-2xl shrink-0 overflow-hidden">
      <div className="w-full h-full bg-[#E5DDD5] rounded-[2.3rem] overflow-hidden flex flex-col relative">
         {/* Header Mockup */}
         <div className="h-16 bg-[#075E54] flex items-center px-4 gap-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
               <div className="w-4 h-4 bg-slate-400 rounded-full"></div>
            </div>
            <div>
               <p className="text-white text-[11px] font-bold leading-none">Maneun Business</p>
               <p className="text-white/60 text-[8px] font-medium mt-1 uppercase tracking-widest">Official Account</p>
            </div>
         </div>

         <div className="flex-1 p-3 overflow-y-auto no-scrollbar space-y-2">
            <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-none shadow-sm p-2.5 relative animate-in fade-in slide-in-from-left-2 duration-500">
               {template.headerType !== 'NONE' && (
                  <div className="rounded-xl overflow-hidden mb-2 bg-slate-50 border border-slate-100 min-h-[60px] flex items-center justify-center">
                     {template.headerType === 'TEXT' ? (
                        <p className="text-[10px] font-black text-slate-800 p-2">{template.headerText || "Header Text"}</p>
                     ) : template.previewUrl ? (
                        template.headerType === 'IMAGE' ? <img src={template.previewUrl} className="w-full h-auto" /> :
                           <div className="flex items-center gap-2 text-[#25D366] p-4"><FileText size={16} /><span className="text-[9px] font-bold uppercase">{template.headerType}</span></div>
                     ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-200">
                           {template.headerType === 'IMAGE' ? <ImageIcon size={20} /> : <FileText size={20} />}
                           <span className="text-[7px] font-black uppercase tracking-tighter">{template.headerType} Sample</span>
                        </div>
                     )}
                  </div>
               )}

               <div className="text-[10px] text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
                  {(() => {
                     const text = template.body || "Template message body content...";
                     const parts = text.split(/(\{\{[^}]+\}\})/g);
                     return parts.map((part, i) =>
                        part.startsWith('{{') ? (
                           <span key={i} className="px-1 py-0.5 bg-[#E7F6EE] text-[#128C7E] font-bold rounded border border-[#25D366]/20 mx-0.5 italic">{part}</span>
                        ) : part
                     );
                  })()}
               </div>

               {template.footer && <p className="text-[9px] text-slate-400 mt-2 border-t border-slate-50 pt-1.5">{template.footer}</p>}

               <div className="flex justify-end mt-1">
                  <span className="text-[7px] text-slate-300 font-bold flex items-center gap-1">10:45 AM <CheckCheck size={10} /></span>
               </div>
            </div>

            {template.buttons?.length > 0 && (
               <div className="flex flex-col gap-1.5 px-2">
                  {template.buttons.map((btn, i) => (
                     <div key={i} className="bg-white/90 backdrop-blur-sm rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-[#00a5f4] font-bold text-[10px] shadow-sm active:scale-95 transition-all border border-white/50">
                        {btn.type === 'PHONE_NUMBER' ? <Phone size={10} /> : (btn.type === 'URL' ? <Link2 size={10} /> : null)}
                        <span>{btn.text || 'Action Button'}</span>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-black/10 rounded-full"></div>
   </div>
);

export default function AdminCreateTemplate({ onBack }) {
   const [loading, setLoading] = useState(false);
   const [clients, setClients] = useState([]);
   const [formData, setFormData] = useState({
      name: '',
      category: 'marketing',
      language: 'en_US',
      clientId: '',
      headerType: 'NONE',
      headerText: '',
      body: '',
      footer: '',
      buttons: [],
      previewUrl: ''
   });

   useEffect(() => {
      const fetchClients = async () => {
         try {
            const token = localStorage.getItem('token');
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
               headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (response.ok) setClients(result.users);
         } catch (err) {
            console.error("Fetch Clients Error:", err);
         }
      };
      fetchClients();
   }, []);

   const handleAddButton = () => {
      if (formData.buttons.length < 3) {
         setFormData({
            ...formData,
            buttons: [...formData.buttons, { type: 'QUICK_REPLY', text: '' }]
         });
      }
   };

   const handleRemoveButton = (index) => {
      const newButtons = formData.buttons.filter((_, i) => i !== index);
      setFormData({ ...formData, buttons: newButtons });
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
   };

   return (
      <div className="flex-1 h-full overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar pb-10 relative z-10 bg-slate-50/30">
         <div className="max-w-[1300px] mx-auto relative z-10">

            {/* Title Row - Replicated from Client UI */}
            <div className="flex items-center justify-between mb-8">
               <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-1">
                     <button
                        onClick={onBack}
                        className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary hover:border-primary/30 transition-all active:scale-95 shadow-sm"
                     >
                        <ArrowLeft size={18} />
                     </button>
                     <div className="flex items-baseline gap-3">
                        <h1 className="text-3xl font-black text-primary tracking-tight">Create Template</h1>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest px-3 py-1 bg-slate-100 rounded-lg">Admin Design Studio</span>
                     </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Design and push professional Meta templates for clients</p>
               </div>

               <div className="flex items-center gap-3">
                  <button className="px-6 py-3.5 bg-white border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm">
                     Save Draft
                  </button>
                  <button
                     onClick={handleSubmit}
                     disabled={loading || !formData.name || !formData.body}
                     className="group flex items-center gap-3 px-8 py-3.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                  >
                     {loading ? <Loader2 size={16} className="animate-spin text-[#25D366]" /> : <Zap size={16} className="text-[#25D366] group-hover:animate-pulse" />}
                     Submit to Meta
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
               <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.03)] p-10 space-y-10">
                     
                     {/* 01: Client Assignment (Admin Exclusive) */}
                     <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">01</div>
                           <h3 className="text-base font-black text-slate-900 tracking-tight">Client Assignment</h3>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Target Account</label>
                           <div className="relative group">
                              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#25D366] transition-colors">
                                 <User size={16} />
                              </div>
                              <select
                                 value={formData.clientId}
                                 onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                 className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-[#25D366]/5 focus:border-[#25D366] focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                              >
                                 <option value="">Select a Client Account...</option>
                                 {clients.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name} ({c.businessName || 'No Business'})</option>)}
                              </select>
                           </div>
                        </div>
                     </div>

                     <div className="h-[1px] bg-slate-100 w-full opacity-50"></div>

                     {/* 02: Template Identity */}
                     <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">02</div>
                           <h3 className="text-base font-black text-slate-900 tracking-tight">Template Identity</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Template Name</label>
                              <div className="relative group">
                                 <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#25D366] transition-colors">
                                    <Target size={16} />
                                 </div>
                                 <input
                                    type="text"
                                    placeholder="e.g. order_confirmation"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-[#25D366]/5 focus:border-[#25D366] focus:bg-white transition-all outline-none"
                                 />
                              </div>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Category</label>
                              <select
                                 value={formData.category}
                                 onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                 className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-bold focus:border-[#25D366] transition-all outline-none appearance-none"
                              >
                                 {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                              </select>
                           </div>
                        </div>
                     </div>

                     <div className="h-[1px] bg-slate-100 w-full opacity-50"></div>

                     {/* 03: Message Design */}
                     <div className="space-y-8">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">03</div>
                           <h3 className="text-base font-black text-slate-900 tracking-tight">Message Design</h3>
                        </div>

                        {/* Header Section */}
                        <div className="space-y-5">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Header (Optional)</label>
                           <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                              {['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'].map(type => (
                                 <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, headerType: type })}
                                    className={`group relative flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all overflow-hidden ${formData.headerType === type ? 'border-[#25D366] bg-[#25D366]/5' : 'border-slate-100 bg-slate-50/30 hover:border-slate-200 hover:bg-slate-50'}`}
                                 >
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${formData.headerType === type ? 'text-[#25D366]' : 'text-slate-400'}`}>{type}</span>
                                    {formData.headerType === type && (
                                       <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#25D366] rounded-tl-xl flex items-center justify-center text-white">
                                          <CheckCheck size={12} />
                                       </div>
                                    )}
                                 </button>
                              ))}
                           </div>
                           {formData.headerType === 'TEXT' && (
                              <input
                                 type="text"
                                 placeholder="Add a catchy header text..."
                                 value={formData.headerText}
                                 onChange={e => setFormData({ ...formData, headerText: e.target.value })}
                                 className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold focus:border-[#25D366] transition-all outline-none"
                              />
                           )}
                        </div>

                        {/* Body Section */}
                        <div className="space-y-5">
                           <div className="flex items-center justify-between px-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Message Body</label>
                              <span className="text-[8px] font-black text-[#25D366] bg-[#25D366]/10 px-2.5 py-1 rounded-full uppercase tracking-widest">{formData.body.length} / 1024</span>
                           </div>
                           <textarea
                              placeholder="Define your message narrative here. Use {{1}} for dynamic fields..."
                              value={formData.body}
                              onChange={e => setFormData({ ...formData, body: e.target.value })}
                              rows={6}
                              className="w-full px-8 py-8 bg-slate-50/50 border border-slate-100 rounded-[2rem] text-[14px] font-medium leading-relaxed focus:border-[#25D366] focus:bg-white transition-all outline-none resize-none placeholder:text-slate-300"
                           />
                        </div>

                        {/* Footer Section */}
                        <div className="space-y-4">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Footer Context</label>
                           <input
                              type="text"
                              placeholder="Add a subtle footnote (e.g. Terms apply)"
                              value={formData.footer}
                              onChange={e => setFormData({ ...formData, footer: e.target.value })}
                              className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-[#25D366]/5 focus:border-[#25D366] focus:bg-white transition-all outline-none"
                           />
                        </div>

                        {/* Interactive Buttons */}
                        <div className="space-y-5">
                           <div className="flex items-center justify-between px-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Interactive Buttons</label>
                              <button onClick={handleAddButton} className="text-[8px] font-black text-[#25D366] hover:underline uppercase tracking-widest">+ Add New Button</button>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {formData.buttons.map((btn, idx) => (
                                 <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3 relative group/btn">
                                    <div className="flex items-center justify-between">
                                       <select value={btn.type} onChange={(e) => { const newButtons = [...formData.buttons]; newButtons[idx].type = e.target.value; setFormData({ ...formData, buttons: newButtons }); }} className="bg-transparent text-[10px] font-black text-slate-400 uppercase tracking-widest outline-none cursor-pointer">
                                          <option value="QUICK_REPLY">Quick Reply</option>
                                          <option value="URL">Visit Website</option>
                                          <option value="PHONE_NUMBER">Call Number</option>
                                       </select>
                                       <button onClick={() => handleRemoveButton(idx)} className="opacity-0 group-hover/btn:opacity-100 text-rose-400 hover:text-rose-500 transition-all"><RefreshCcw size={12} className="rotate-45" /></button>
                                    </div>
                                    <input type="text" placeholder="Button label..." value={btn.text} onChange={(e) => { const newButtons = [...formData.buttons]; newButtons[idx].text = e.target.value; setFormData({ ...formData, buttons: newButtons }); }} className="w-full px-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-bold focus:border-[#25D366] outline-none" />
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Optimization Insight - Replicated from Client */}
                  <div className="bg-[#0F172A] rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-6 text-white relative overflow-hidden">
                     <div className="absolute top-[-50%] right-[-10%] w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]"></div>
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10"><Globe size={20} className="text-[#25D366]" /></div>
                     <div><h4 className="text-base font-black tracking-tight mb-0.5">Optimization Insight</h4><p className="text-slate-400 text-[10px] font-medium leading-relaxed">Templates with personalized variables have a 45% higher conversion rate.</p></div>
                  </div>
               </div>

               {/* Preview Side - Sticky from Client UI */}
               <div className="lg:col-span-4 sticky top-8 flex flex-col items-center">
                  <div className="scale-[1.1] origin-top pt-4">
                     <MessagePreview template={formData} />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
