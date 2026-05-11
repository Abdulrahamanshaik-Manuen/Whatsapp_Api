import React from 'react';
import { ArrowLeft, Zap, CheckCircle2, Clock, AlertCircle, Image as ImageIcon } from 'lucide-react';

// Reusable MessagePreview Component (Mockup)
const MessagePreview = ({ template }) => {
  if (!template) return null;
  
  const bodyText = template.body?.text || template.content || '';
  const footerText = template.footer?.text || '';
  const buttons = template.buttons || [];
  const header = template.header || null;

  return (
    <div className="bg-white rounded-[2.5rem] p-4 shadow-2xl border-[8px] border-slate-900 w-full aspect-[9/18] flex flex-col overflow-hidden relative">
      {/* Phone Status Bar */}
      <div className="flex justify-between items-center px-4 pt-2 pb-4 text-[10px] font-bold text-slate-400">
        <span>9:41</span>
        <div className="flex gap-1.5">
          <div className="w-4 h-2 bg-slate-200 rounded-sm"></div>
          <div className="w-2 h-2 bg-slate-200 rounded-full"></div>
        </div>
      </div>

      <div className="flex-1 bg-[#E5DDD5] rounded-3xl p-3 overflow-hidden relative">
        {/* Chat Background Pattern (Simulated) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '10px 10px' }}></div>

        {/* WhatsApp Message Bubble */}
        <div className="bg-white rounded-2xl rounded-tl-none shadow-sm p-0 max-w-[90%] relative z-10 animate-in slide-in-from-left-2 duration-500">
          {/* Header */}
          {header && (
            <div className="p-3 pb-0">
              {header.type === 'IMAGE' ? (
                <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 overflow-hidden">
                  {(header.media_url || header.url || template.imageUrl || (header.example && header.example.header_handle && header.example.header_handle[0])) ? (
                    <img 
                      src={header.media_url || header.url || template.imageUrl || header.example.header_handle[0]} 
                      alt="Header Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Zap size={24} />
                  )}
                </div>
              ) : header.type === 'TEXT' ? (
                <p className="text-[11px] font-bold text-slate-800 border-b border-slate-50 pb-2 mb-2">{header.text}</p>
              ) : null}
            </div>
          )}

          {/* Body */}
          <div className="p-3 pt-2">
            <p className="text-[12px] text-slate-700 leading-relaxed whitespace-pre-wrap">
              {bodyText.replace(/{{[0-9]+}}/g, (match) => {
                return `<span class="text-blue-500 font-bold">${match}</span>`;
              }).split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </p>
          </div>

          {/* Footer */}
          {footerText && (
            <div className="px-3 pb-2">
              <p className="text-[10px] text-slate-400 font-medium">{footerText}</p>
            </div>
          )}

          {/* Buttons */}
          {buttons.length > 0 && (
            <div className="border-t border-slate-50">
              {buttons.map((btn, i) => (
                <div key={i} className="py-2.5 text-center text-[12px] font-bold text-blue-500 border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-center gap-2">
                  {btn.type === 'PHONE_NUMBER' && <Zap size={10} />}
                  {btn.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function TemplateDetailsPage({ template, onBack }) {
  if (!template) return (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 animate-bounce">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-800">Template Not Found</h2>
        <button onClick={onBack} className="mt-4 text-primary font-bold hover:underline">Go Back</button>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F9FAFB] overflow-hidden">
      {/* Detail Header */}
      <div className="px-8 py-6 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{template.name}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Template Insights & Preview</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
            template.status?.toUpperCase() === 'APPROVED' ? 'bg-emerald-50 text-emerald-500' :
            template.status?.toUpperCase() === 'REJECTED' ? 'bg-rose-50 text-rose-500' :
            'bg-orange-50 text-orange-500'
          }`}>
            {template.status}
          </span>
        </div>
      </div>

      {/* Detail Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Core Meta Card */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</p>
                  <p className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl inline-block">{template.category}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Language</p>
                  <p className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl inline-block">{template.language || 'English (US)'}</p>
                </div>
              </div>

              <div className="h-[1px] bg-slate-100 w-full"></div>

              {/* Content Breakdown */}
              <div className="space-y-6">
                  {template.header && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Header ({template.header.type})</h4>
                      </div>
                      <div className="p-1 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                        {template.header.type === 'IMAGE' ? (
                          <div className="aspect-video relative bg-slate-100 flex items-center justify-center">
                            {(template.header.media_url || template.header.url || template.imageUrl) ? (
                              <img 
                                src={template.header.media_url || template.header.url || template.imageUrl} 
                                alt="Template Header" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-slate-300">
                                <ImageIcon size={32} />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">Image Placeholder</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-5 italic text-slate-600 text-sm">
                            {template.header.text || 'Media Content'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-[#25D366] rounded-full"></div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Message Body</h4>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed font-medium">
                    {template.body?.text || template.content || 'No body content'}
                  </div>
                </div>

                {template.footer && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-slate-300 rounded-full"></div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Footer</h4>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-xs font-medium">
                      {template.footer.text}
                    </div>
                  </div>
                )}

                {template.buttons?.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Interactive Buttons</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {template.buttons.map((btn, i) => (
                        <div key={i} className="flex flex-col gap-1 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl group/btn">
                          <div className="flex items-center gap-3">
                            <Zap size={14} className="text-blue-500" />
                            <span className="text-sm font-bold text-blue-700">{btn.text}</span>
                            <span className="ml-auto text-[9px] font-black text-blue-300 uppercase tracking-widest opacity-50">{btn.type?.replace(/_/g, ' ')}</span>
                          </div>
                          {(btn.phone_number || btn.url) && (
                            <div className="ml-6.5 mt-1 px-3 py-1.5 bg-white/50 rounded-lg border border-blue-100/50">
                              <p className="text-[11px] font-mono font-medium text-blue-500 break-all">
                                {btn.phone_number || btn.url}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-0 w-full flex flex-col items-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 bg-white px-6 py-2 rounded-full border border-slate-100 shadow-sm">Real-time Visualization</p>
              <div className="w-full max-w-[340px]">
                <MessagePreview template={template} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
