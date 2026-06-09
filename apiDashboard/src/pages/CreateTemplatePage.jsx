import React, { useState, useEffect } from 'react';
import {
   ChevronLeft, RefreshCcw, Zap, Target, CheckCheck, Globe, Upload as UploadIcon,
   Image as ImageIcon, FileText, Phone, Link2, X, Eye, EyeOff
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Refined WhatsApp Mockup (Extracted from TemplatesPage)
const MessagePreview = ({ template, variableSamples = {} }) => {
   let text = template.content || "Template message body content...";
   const matches = text.match(/\{\{(\d+)\}\}/g) || [];
   const vars = Array.from(new Set(matches.map(m => m.replace(/[\{\}]/g, ''))));
   
   vars.forEach(v => {
      const sample = variableSamples[v];
      if (sample) {
         text = text.replaceAll(`{{${v}}}`, sample);
      }
   });

   const parts = text.split(/(\{\{[^}]+\}\})/g);

   return (
      <div className="relative w-[260px] h-[520px] bg-slate-900 rounded-[2.8rem] p-1.5 border-[3px] border-slate-800 shadow-2xl shrink-0 overflow-hidden">
         <div className="w-full h-full bg-[#E5DDD5] rounded-[2.3rem] overflow-hidden flex flex-col relative">
            {/* Header Mockup */}
            <div className="h-14 bg-[#075E54] flex items-center px-4 gap-3 shrink-0">
               <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                  <div className="w-4 h-4 bg-slate-400 rounded-full"></div>
               </div>
               <div>
                  <p className="text-white text-[10px] font-bold leading-none">Maneun Business</p>
                  <p className="text-white/60 text-[7px] font-medium mt-1 uppercase tracking-widest leading-none">Official Account</p>
               </div>
            </div>

            <div className="flex-1 p-3 overflow-y-auto no-scrollbar space-y-2 relative">
               <div className="absolute inset-0 opacity-[0.06] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
               
               <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-none shadow-sm p-2.5 relative animate-in fade-in slide-in-from-left-2 duration-500 z-10 border border-slate-200/20">
                  {template.headerType !== 'NONE' && (
                     <div className="rounded-xl overflow-hidden mb-2 bg-slate-50 border border-slate-100 min-h-[60px] flex items-center justify-center">
                        {template.headerType === 'TEXT' ? (
                           <p className="text-[10px] font-black text-slate-800 p-2 leading-snug">{template.headerText || "Header Text"}</p>
                        ) : template.previewUrl ? (
                           template.headerType === 'IMAGE' ? <img src={template.previewUrl} className="w-full h-auto" alt="header" /> :
                              <div className="flex items-center gap-2 text-[#25D366] p-4"><FileText size={16} /><span className="text-[9px] font-bold uppercase">{template.headerType}</span></div>
                        ) : (
                           <div className="flex flex-col items-center gap-1 text-slate-350">
                              {template.headerType === 'IMAGE' ? <ImageIcon size={20} /> : <FileText size={20} />}
                              <span className="text-[7px] font-black uppercase tracking-tighter">{template.headerType} Sample</span>
                           </div>
                        )}
                     </div>
                  )}

                  <div className="text-[10px] text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
                     {parts.map((part, i) =>
                        part.startsWith('{{') ? (
                           <span key={i} className="px-1 py-0.5 bg-[#E7F6EE] text-[#128C7E] font-bold rounded border border-[#25D366]/20 mx-0.5 italic">{part}</span>
                        ) : part
                     )}
                  </div>

                  {template.footer && <p className="text-[8px] text-slate-400 mt-2 border-t border-slate-50 pt-1.5">{template.footer}</p>}

                  <div className="flex justify-end mt-1">
                     <span className="text-[7px] text-slate-300 font-bold flex items-center gap-0.5">10:45 AM <CheckCheck size={8} /></span>
                  </div>
               </div>

               {template.buttons?.length > 0 && (
                  <div className="flex flex-col gap-1.5 px-2 relative z-10">
                     {template.buttons.map((btn, i) => (
                        <div key={i} className="bg-white/90 backdrop-blur-sm rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 text-[#00a5f4] font-bold text-[9px] shadow-sm active:scale-95 transition-all border border-white/50">
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
};

export default function CreateTemplatePage({ onNavigate, prefillData }) {
   const [loading, setLoading] = useState(false);
   const [showPreview, setShowPreview] = useState(true);
   const [variableSamples, setVariableSamples] = useState({});
   const [newTemplate, setNewTemplate] = useState(() => {
      // Support editing — pre-fill from passed template data or localStorage fallback
      const edit = prefillData || (() => {
         try { return JSON.parse(localStorage.getItem('editTemplateData') || 'null'); } catch { return null; }
      })();
      if (edit) {
         localStorage.removeItem('editTemplateData');
         return {
            name: edit.name || '',
            category: (edit.category || 'marketing').toLowerCase(),
            language: edit.language || 'en_US',
            headerType: edit.header?.type || edit.headerType || 'NONE',
            headerText: edit.header?.text || edit.headerText || '',
            content: edit.body?.text || edit.content || '',
            footer: edit.footer?.text || (typeof edit.footer === 'string' ? edit.footer : '') || '',
            buttons: edit.buttons || [],
            mediaHandle: edit.header?.media_handle || edit.mediaHandle || '',
            previewUrl: edit.header?.media_url || edit.header?.url || edit.previewUrl || ''
         };
      }
      return {
         name: '',
         category: 'marketing',
         language: 'en_US',
         headerType: 'NONE',
         headerText: '',
         content: '',
         footer: '',
         buttons: [],
         mediaHandle: '',
         previewUrl: ''
      };
   });

   const handleCreateSubmit = async (direct = true) => {
      setLoading(true);
      try {
         const token = localStorage.getItem('token');
         const response = await fetch(`${API_BASE_URL}/templates/request`, {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               ...newTemplate,
               directSubmit: direct
            })
         });
         const data = await response.json();
         if (response.ok) {
            alert(direct ? "Template submitted to Meta successfully!" : "Template saved as draft!");
            onNavigate('/templates');
         } else {
            alert(data.error || "Failed to submit template");
         }
      } catch (error) {
         console.error("Submission failed:", error);
         alert("An error occurred. Please try again.");
      } finally {
         setLoading(false);
      }
   };

   const getVariables = (text) => {
      const matches = text.match(/\{\{(\d+)\}\}/g) || [];
      return Array.from(new Set(matches.map(m => m.replace(/[\{\}]/g, '')))).sort((a, b) => Number(a) - Number(b));
   };

   const getValidationErrors = () => {
      const errors = [];
      const text = newTemplate.content || '';
      
      // Length check
      if (text.length > 1024) {
         errors.push({ type: 'error', text: 'Message body exceeds 1024 characters limit.' });
      } else if (text.length === 0) {
         errors.push({ type: 'warning', text: 'Message body cannot be empty.' });
      }
      
      // Variable check
      const vars = getVariables(text).map(Number);
      if (vars.length > 0) {
         const min = Math.min(...vars);
         if (min !== 1) {
            errors.push({ type: 'error', text: 'Variables must start with {{1}}.' });
         }
         
         // Check sequential
         const expected = Array.from({ length: vars.length }, (_, i) => i + 1);
         const isSequential = expected.every(val => vars.includes(val));
         if (!isSequential) {
            errors.push({ type: 'error', text: 'Variables are not sequential (e.g. {{1}}, {{2}}). Do not skip numbers.' });
         }
      }
      
      // Media check
      if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(newTemplate.headerType) && !newTemplate.mediaHandle) {
         errors.push({ type: 'warning', text: `Please upload a sample file for the ${newTemplate.headerType.toLowerCase()} header.` });
      }
      
      // Buttons text check
      newTemplate.buttons.forEach((btn, idx) => {
         if (!btn.text) {
            errors.push({ type: 'warning', text: `Button #${idx + 1} is missing label text.` });
         }
      });
      
      return errors;
   };

   const insertVariable = () => {
      const text = newTemplate.content;
      const vars = getVariables(text);
      const nextVarNum = vars.length > 0 ? Math.max(...vars.map(Number)) + 1 : 1;
      
      const textarea = document.getElementById('body-textarea');
      if (textarea) {
         const start = textarea.selectionStart;
         const end = textarea.selectionEnd;
         const newText = text.substring(0, start) + `{{${nextVarNum}}}` + text.substring(end);
         setNewTemplate({ ...newTemplate, content: newText });
         setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + `{{${nextVarNum}}}`.length, start + `{{${nextVarNum}}}`.length);
         }, 50);
      } else {
         setNewTemplate({ ...newTemplate, content: text + `{{${nextVarNum}}}` });
      }
   };

   const addButton = (type) => {
      if (newTemplate.buttons.length >= 10) return;
      
      let defaultBtn = { type, text: '' };
      if (type === 'URL') {
         defaultBtn.url = 'https://';
      } else if (type === 'PHONE_NUMBER') {
         defaultBtn.phone_number = '+';
      } else {
         defaultBtn.type = 'QUICK_REPLY';
      }
      
      setNewTemplate({
         ...newTemplate,
         buttons: [...newTemplate.buttons, defaultBtn]
      });
   };

   const vars = getVariables(newTemplate.content);
   const validationList = getValidationErrors();

   return (
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar relative z-10 bg-[#F8FAFC]">
         <div className="max-w-[1200px] mx-auto space-y-6">
            
            {/* Header / Title Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-3.5 border-b border-slate-200 gap-4">
               <div>
                  <div className="flex items-center gap-2">
                     <button
                        onClick={() => onNavigate('/templates')}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                     >
                        <ChevronLeft size={20} />
                     </button>
                     <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Create Template</h1>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-1 pl-7">Create and submit WhatsApp message templates</p>
               </div>

               <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  {/* Toggle Preview Button */}
                  <button
                     type="button"
                     onClick={() => setShowPreview(!showPreview)}
                     className="flex items-center justify-center gap-1.5 h-9 px-3.5 bg-white border border-slate-205 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer active:scale-98"
                  >
                     {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                     <span>{showPreview ? "Hide Preview" : "Show Preview"}</span>
                  </button>
                  
                  <button
                     onClick={() => handleCreateSubmit(false)}
                     disabled={loading || !newTemplate.name || !newTemplate.content}
                     className="px-4 py-2 bg-white border border-slate-200 text-slate-750 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                     Save Draft
                  </button>
                  
                  <button
                     onClick={() => handleCreateSubmit(true)}
                     disabled={loading || !newTemplate.name || !newTemplate.content || validationList.some(e => e.type === 'error')}
                     className="flex items-center gap-1.5 px-4 py-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                     {loading ? <RefreshCcw size={14} className="animate-spin" /> : <Zap size={14} />}
                     <span>Submit for Review</span>
                  </button>
               </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
               {/* Left Column: Form Editor */}
               <div className={`${showPreview ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-5 transition-all duration-300`}>
                  {/* Card 1: Template Details */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                     <h3 className="text-sm font-bold text-slate-850 border-b border-slate-100 pb-2">Template Details</h3>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Template Name</label>
                           <input
                              type="text"
                              placeholder="e.g., welcome_message"
                              value={newTemplate.name}
                              onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-slate-350 focus:border-slate-400 outline-none transition-all"
                           />
                        </div>
                        
                        {/* Category */}
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                           <select
                              value={newTemplate.category}
                              onChange={e => setNewTemplate({ ...newTemplate, category: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-slate-350 focus:border-slate-400 outline-none transition-all cursor-pointer"
                           >
                              <option value="marketing">Marketing</option>
                              <option value="utility">Utility</option>
                              <option value="authentication">Authentication</option>
                           </select>
                        </div>
                     </div>
                  </div>

                  {/* Card 2: Header Type */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Header Type</label>
                        <div className="flex flex-wrap gap-2">
                           {['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'].map(type => (
                              <button
                                 key={type}
                                 type="button"
                                 onClick={() => setNewTemplate({ ...newTemplate, headerType: type })}
                                 className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                    newTemplate.headerType === type 
                                       ? 'bg-slate-905 text-white border-slate-905 bg-slate-800' 
                                       : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                 }`}
                              >
                                 {type === 'NONE' ? 'None' : type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                              </button>
                           ))}
                        </div>
                     </div>

                     {newTemplate.headerType === 'TEXT' && (
                        <div className="pt-2 animate-in fade-in duration-200">
                           <input
                              type="text"
                              placeholder="Add a catchy header text..."
                              value={newTemplate.headerText}
                              onChange={e => setNewTemplate({ ...newTemplate, headerText: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-slate-400 outline-none"
                           />
                        </div>
                     )}

                     {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(newTemplate.headerType) && (
                        <div className="pt-2 animate-in fade-in duration-200">
                           <div
                              onClick={() => document.getElementById('media-upload').click()}
                              className="w-full py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-slate-400 hover:bg-slate-100/30 transition-all group"
                           >
                              <input
                                 id="media-upload"
                                 type="file"
                                 className="hidden"
                                 accept={newTemplate.headerType === 'IMAGE' ? "image/*" : newTemplate.headerType === 'VIDEO' ? "video/*" : ".pdf,.doc,.docx"}
                                 onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    setLoading(true);
                                    try {
                                       const formData = new FormData();
                                       formData.append('file', file);
                                       const response = await fetch(`${API_BASE_URL}/templates/upload-sample`, {
                                          method: 'POST',
                                          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                          body: formData
                                       });
                                       const data = await response.json();
                                       if (response.ok) {
                                          setNewTemplate({ ...newTemplate, mediaHandle: data.handle, previewUrl: data.previewUrl });
                                       }
                                    } catch (err) { } finally { setLoading(false); }
                                 }}
                              />
                              {newTemplate.previewUrl ? (
                                 <div className="relative w-full h-16 flex items-center justify-center">
                                    {newTemplate.headerType === 'IMAGE' ? (
                                       <img src={newTemplate.previewUrl} className="h-full rounded-lg shadow-md" alt="uploaded header" />
                                    ) : (
                                       <div className="flex flex-col items-center gap-1 text-[#22C55E]">
                                          <CheckCheck size={20} />
                                          <span className="text-[9px] font-bold uppercase tracking-widest">Media Ready</span>
                                       </div>
                                    )}
                                 </div>
                              ) : (
                                 <>
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-slate-655 transition-colors shadow-sm"><UploadIcon size={16} /></div>
                                    <p className="text-xs font-bold text-slate-500">Select {newTemplate.headerType.toLowerCase()} to upload sample</p>
                                 </>
                              )}
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Card 3: Message Body */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                     <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h3 className="text-sm font-bold text-slate-855">Message Content</h3>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-105 px-2 py-0.5 rounded-full">
                           {newTemplate.content?.length || 0} / 1024
                        </span>
                     </div>
                     
                     <div className="space-y-3">
                        {/* Text Editor Toolbar */}
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200/50">
                           <button
                              type="button"
                              onClick={insertVariable}
                              className="px-2.5 py-1 bg-white border border-slate-205 hover:bg-slate-100 rounded text-[10px] font-bold text-slate-700 transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                           >
                              <span>+</span>
                              <span>Variable</span>
                           </button>
                           <button
                              type="button"
                              onClick={() => setNewTemplate({ ...newTemplate, content: (newTemplate.content || '') + ' ☀️' })}
                              className="px-2.5 py-1 bg-white border border-slate-205 hover:bg-slate-100 rounded text-[10px] font-bold text-slate-700 transition-colors shadow-sm cursor-pointer"
                           >
                              ☀️
                           </button>
                           <button
                              type="button"
                              onClick={() => setNewTemplate({ ...newTemplate, content: (newTemplate.content || '') + ' 🔥' })}
                              className="px-2.5 py-1 bg-white border border-slate-205 hover:bg-slate-100 rounded text-[10px] font-bold text-slate-700 transition-colors shadow-sm cursor-pointer"
                           >
                              🔥
                           </button>
                           <button
                              type="button"
                              onClick={() => setNewTemplate({ ...newTemplate, content: (newTemplate.content || '') + ' 👇' })}
                              className="px-2.5 py-1 bg-white border border-slate-205 hover:bg-slate-100 rounded text-[10px] font-bold text-slate-700 transition-colors shadow-sm cursor-pointer"
                           >
                              👇
                           </button>
                        </div>

                        <textarea
                           id="body-textarea"
                           placeholder="Define your message narrative here. Use {{1}} for dynamic fields..."
                           value={newTemplate.content}
                           onChange={e => setNewTemplate({ ...newTemplate, content: e.target.value })}
                           rows={5}
                           className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold leading-relaxed focus:border-slate-450 outline-none resize-none placeholder:text-slate-350"
                        />
                     </div>

                     {/* Footer Input */}
                     <div className="pt-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Footer Context (Optional)</label>
                        <input
                           type="text"
                           placeholder="Add a subtle footnote (e.g. Terms apply)"
                           value={newTemplate.footer}
                           onChange={e => setNewTemplate({ ...newTemplate, footer: e.target.value })}
                           className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-slate-400 outline-none"
                        />
                     </div>
                  </div>

                  {/* Card 4: Buttons Builder */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                     <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                           <h3 className="text-sm font-bold text-slate-855">Action Buttons (Optional)</h3>
                           <span className="text-[10px] text-slate-400 font-semibold">{newTemplate.buttons.length} / 10</span>
                        </div>
                        
                        {/* Button Types Add Toolbar */}
                        <div className="flex gap-2">
                           <button
                              type="button"
                              onClick={() => addButton('QUICK_REPLY')}
                              className="px-3 py-1.5 bg-slate-55 border border-slate-205 rounded-lg text-[10px] font-bold text-slate-655 hover:bg-slate-100 transition-colors cursor-pointer"
                           >
                              + Quick Reply
                           </button>
                           <button
                              type="button"
                              onClick={() => addButton('URL')}
                              className="px-3 py-1.5 bg-slate-55 border border-slate-205 rounded-lg text-[10px] font-bold text-slate-655 hover:bg-slate-100 transition-colors cursor-pointer"
                           >
                              + Visit Website
                           </button>
                           <button
                              type="button"
                              onClick={() => addButton('PHONE_NUMBER')}
                              className="px-3 py-1.5 bg-slate-55 border border-slate-205 rounded-lg text-[10px] font-bold text-slate-655 hover:bg-slate-100 transition-colors cursor-pointer"
                           >
                              + Call Phone
                           </button>
                        </div>

                        {/* Configure Buttons List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
                           {newTemplate.buttons.map((btn, idx) => (
                              <div key={idx} className="bg-slate-50/40 border border-slate-200 rounded-xl p-3 relative group">
                                 {/* Remove button */}
                                 <button
                                    type="button"
                                    onClick={() => setNewTemplate({
                                       ...newTemplate,
                                       buttons: newTemplate.buttons.filter((_, i) => i !== idx)
                                    })}
                                    className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                 >
                                    <X size={14} />
                                 </button>
                                 
                                 <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#22C55E]">
                                    {btn.type === 'QUICK_REPLY' ? 'Quick Reply' : btn.type === 'URL' ? 'Visit Website' : 'Call Phone'}
                                 </span>
                                 
                                 <div className="space-y-2 mt-2">
                                    <input
                                       type="text"
                                       placeholder="Button text..."
                                       value={btn.text}
                                       onChange={(e) => {
                                          const newButtons = [...newTemplate.buttons];
                                          newButtons[idx].text = e.target.value;
                                          setNewTemplate({ ...newTemplate, buttons: newButtons });
                                       }}
                                       className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-[#25D366] outline-none"
                                    />
                                    
                                    {btn.type === 'URL' && (
                                       <input
                                          type="text"
                                          placeholder="https://example.com"
                                          value={btn.url || ''}
                                          onChange={(e) => {
                                             const newButtons = [...newTemplate.buttons];
                                             newButtons[idx].url = e.target.value;
                                             setNewTemplate({ ...newTemplate, buttons: newButtons });
                                          }}
                                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-[#25D366] outline-none font-mono"
                                       />
                                    )}
                                    {btn.type === 'PHONE_NUMBER' && (
                                       <input
                                          type="text"
                                          placeholder="+123456789"
                                          value={btn.phone_number || ''}
                                          onChange={(e) => {
                                             const newButtons = [...newTemplate.buttons];
                                             newButtons[idx].phone_number = e.target.value;
                                             setNewTemplate({ ...newTemplate, buttons: newButtons });
                                          }}
                                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-[#25D366] outline-none font-mono"
                                       />
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Optimization tips alert */}
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 flex items-start gap-2.5">
                     <span className="text-sm">💡</span>
                     <p className="text-xs font-semibold text-amber-800 leading-normal">
                        Templates with variables have <strong>45% higher engagement</strong>. Ensure your variables are sequential and have representative sample values.
                     </p>
                  </div>
               </div>

               {/* Right Column: Preview & Validation */}
               {showPreview && (
                  <div className="lg:col-span-4 space-y-4 flex flex-col items-center animate-in slide-in-from-right duration-300">
                     {/* WhatsApp Preview */}
                     <div className="w-full flex justify-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                        <MessagePreview template={newTemplate} variableSamples={variableSamples} />
                     </div>

                     {/* Variables Panel */}
                     {vars.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 w-full animate-in fade-in duration-200">
                           <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                              <h4 className="text-xs font-bold text-slate-800">Variable Samples</h4>
                              <span className="text-[10px] text-slate-400 font-semibold">(Injects values in preview)</span>
                           </div>
                           <div className="space-y-3">
                              {vars.map(v => (
                                 <div key={v} className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-xs font-mono shrink-0">
                                       {`{{${v}}}`}
                                    </span>
                                    <input
                                       type="text"
                                       placeholder={`Sample for {{${v}}}...`}
                                       value={variableSamples[v] || ''}
                                       onChange={(e) => setVariableSamples({
                                          ...variableSamples,
                                          [v]: e.target.value
                                       })}
                                       className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-[#25D366] outline-none"
                                    />
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Validation Panel */}
                     <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 w-full">
                        <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                           <h4 className="text-xs font-bold text-slate-800">Template Validation</h4>
                        </div>
                        
                        {validationList.length === 0 ? (
                           <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
                              <CheckCheck size={16} />
                              <span>All validations passed! Ready to submit.</span>
                           </div>
                        ) : (
                           <div className="space-y-2">
                              {validationList.map((err, i) => (
                                 <div 
                                    key={i} 
                                    className={`flex items-start gap-2 text-[11px] font-semibold p-2 rounded-lg border ${
                                       err.type === 'error' 
                                          ? 'bg-rose-50 border-rose-100 text-rose-700' 
                                          : 'bg-amber-50 border-amber-100 text-amber-700'
                                    }`}
                                 >
                                    <span className="text-sm leading-none">{err.type === 'error' ? '❌' : '⚠️'}</span>
                                    <span className="leading-tight">{err.text}</span>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
               )}
            </div>
         </div>
      </main>
   );
}
