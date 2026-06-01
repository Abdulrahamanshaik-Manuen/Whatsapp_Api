import React, { useState, useEffect } from 'react';
import {
  Zap, X, ArrowLeft, Send, Loader2, Calendar, Target, Users, Search,
  CheckCircle2, Upload, FileText, MessageCircle, User, Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useSubscriptionGate } from '../context/SubscriptionGateContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function CreateCampaignPage({ onNavigate }) {
  const { requireSub } = useSubscriptionGate();
  const [formData, setFormData] = useState({
    campaign_name: '',
    template_id: '',
    scheduled_at: '',
    audienceMode: 'groups', // 'groups', 'contacts', 'excel'
    group_ids: [],
    contacts: [],
    excelData: null
  });

  const [templates, setTemplates] = useState([]);
  const [groups, setGroups] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [contactSearch, setContactSearch] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [tRes, gRes, cRes] = await Promise.all([
        fetch(`${API_BASE_URL}/templates`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/groups`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/contacts`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const tData = await tRes.json();
      const gData = await gRes.json();
      const cData = await cRes.json();
      setTemplates(Array.isArray(tData) ? tData : []);
      setGroups(Array.isArray(gData) ? gData : []);
      setAllContacts(Array.isArray(cData) ? cData : []);
    } catch (err) {
      console.error("Data Fetch Error:", err);
    } finally {
      setFetchingData(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
      setFormData({ ...formData, excelData: { headers: data[0], rows: data.slice(1) } });
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    if (!formData.campaign_name || !formData.template_id) return alert("Please provide a name and select a template.");
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const result = await requireSub(() =>
        fetch(`${API_BASE_URL}/campaigns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(formData)
        }).then(r => r.json().then(d => ({ ...d, _ok: r.ok })))
      );

      if (!result) return;

      if (result._ok) {
        onNavigate('/campaigns');
      } else {
        alert(result.error || "Failed to create campaign");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find(t => t._id === formData.template_id);

  if (fetchingData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Designer...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 lg:space-y-8 custom-scrollbar pb-20">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1 min-w-0 flex-1">
            <button
              onClick={() => onNavigate('/campaigns')}
              className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-wider mb-2"
            >
              <ArrowLeft size={14} /> Back to Campaigns
            </button>
            <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">Create Campaign</h1>
            <p className="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-wider">Design and schedule your message broadcast</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => onNavigate('/campaigns')}
              className="px-5 py-3 bg-white border border-slate-200 text-slate-600 text-xs md:text-sm font-bold rounded-xl hover:bg-slate-50 transition-all text-center"
            >
              Discard
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.campaign_name || !formData.template_id}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs md:text-sm font-bold transition-all shadow-lg active:scale-95 text-center ${loading || !formData.campaign_name || !formData.template_id
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-primary text-white shadow-primary/20 hover:brightness-110'
                }`}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              {formData.scheduled_at ? 'Schedule Campaign' : 'Launch Campaign'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Config */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-5 md:p-8 space-y-8 md:space-y-10">

              {/* Step 1: Identity */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black tracking-widest">01</div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Basics & Schedule</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Campaign Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Summer Sale 2024"
                      value={formData.campaign_name}
                      onChange={e => setFormData({ ...formData, campaign_name: e.target.value })}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Schedule Time (Optional)</label>
                    <div className="relative group">
                      <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
                      <input
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={e => setFormData({ ...formData, scheduled_at: e.target.value })}
                        className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Step 2: Audience */}
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black tracking-widest shrink-0">02</div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Target Audience</h3>
                  </div>
                  <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-100 w-full sm:w-auto shrink-0 overflow-x-auto justify-between sm:justify-start">
                    {['groups', 'contacts', 'excel'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setFormData({ ...formData, audienceMode: mode })}
                        className={`shrink-0 flex-1 sm:flex-none text-center px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${formData.audienceMode === mode ? 'bg-white text-primary shadow-sm' : 'text-slate-400'
                          }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-h-[200px]">
                  {formData.audienceMode === 'groups' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar p-1">
                      {groups.map(g => (
                        <button
                          key={g._id}
                          onClick={() => {
                            const newGroups = formData.group_ids.includes(g._id)
                              ? formData.group_ids.filter(id => id !== g._id)
                              : [...formData.group_ids, g._id];
                            setFormData({ ...formData, group_ids: newGroups });
                          }}
                          className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${formData.group_ids.includes(g._id) ? 'border-secondary bg-secondary/5' : 'border-slate-50 bg-slate-50/50 hover:bg-white'
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.group_ids.includes(g._id) ? 'bg-secondary text-white' : 'bg-white text-slate-300 shadow-sm border border-slate-100'}`}>
                              <Users size={18} />
                            </div>
                            <div>
                              <p className={`text-sm font-black ${formData.group_ids.includes(g._id) ? 'text-primary' : 'text-slate-800'}`}>{g.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{g.contacts?.length || 0} Contacts</p>
                            </div>
                          </div>
                          {formData.group_ids.includes(g._id) && <CheckCircle2 size={16} className="text-secondary" />}
                        </button>
                      ))}
                    </div>
                  ) : formData.audienceMode === 'contacts' ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search contacts..."
                          value={contactSearch}
                          onChange={e => setContactSearch(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {allContacts.filter(c => (c.name || '').toLowerCase().includes(contactSearch.toLowerCase()) || (c.phoneNumber || '').includes(contactSearch)).map(c => (
                          <button
                            key={c._id}
                            onClick={() => {
                              const isSelected = formData.contacts.includes(c.phoneNumber);
                              setFormData({ ...formData, contacts: isSelected ? formData.contacts.filter(p => p !== c.phoneNumber) : [...formData.contacts, c.phoneNumber] });
                            }}
                            className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${formData.contacts.includes(c.phoneNumber) ? 'border-primary bg-primary/5' : 'border-slate-50 bg-slate-50/50 hover:bg-white'
                              }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${formData.contacts.includes(c.phoneNumber) ? 'bg-primary text-white' : 'bg-white text-slate-300'}`}>
                              {c.name?.[0] || '#'}
                            </div>
                            <div className="text-left min-w-0 flex-1">
                              <p className="text-[11px] font-black text-slate-800 truncate">{c.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold">{c.phoneNumber}</p>
                            </div>
                            {formData.contacts.includes(c.phoneNumber) && <CheckCircle2 size={14} className="text-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => document.getElementById('page-excel-upload').click()}
                      className="w-full py-12 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all group"
                    >
                      <input type="file" id="page-excel-upload" className="hidden" onChange={handleFileUpload} />
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${formData.excelData ? 'bg-secondary text-white' : 'bg-white text-slate-300 shadow-sm border border-slate-100'}`}>
                        {formData.excelData ? <CheckCircle2 size={32} /> : <Upload size={32} />}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black text-slate-800 uppercase tracking-widest">{formData.excelData ? `${formData.excelData.rows.length} Contacts Ready` : 'Import Spreadsheet'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">XLSX, CSV or XLS supported</p>
                      </div>
                      {formData.excelData && <button className="text-[10px] font-black text-primary uppercase underline">Replace File</button>}
                    </div>
                  )}
                </div>
              </section>

              {/* Step 3: Template */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black tracking-widest">03</div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Choose Template</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
                  {templates.map(t => (
                    <button
                      key={t._id}
                      onClick={() => setFormData({ ...formData, template_id: t._id })}
                      className={`p-5 rounded-2xl border-2 text-left transition-all relative ${formData.template_id === t._id ? 'border-primary bg-primary/5' : 'border-slate-50 bg-slate-50/50 hover:bg-white'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.template_id === t._id ? 'bg-primary text-white' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
                          <FileText size={18} />
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${t.status === 'APPROVED' ? 'bg-secondary/10 text-secondary border-secondary/10' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                          {t.status}
                        </span>
                      </div>
                      <h4 className={`text-sm font-black truncate ${formData.template_id === t._id ? 'text-primary' : 'text-slate-800'}`}>{t.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">{t.category}</p>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-8 space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center text-xs font-black tracking-widest">04</div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Live Preview</h3>
              </div>

              <div className="relative w-[260px] h-[520px] bg-slate-900 rounded-[2.8rem] p-1.5 border-[3px] border-slate-800 shadow-2xl shrink-0 overflow-hidden mx-auto">
                <div className="w-full h-full bg-[#E5DDD5] rounded-[2.3rem] overflow-hidden flex flex-col relative">
                  <div className="bg-[#075e54] px-4 py-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white/80"><User size={16} /></div>
                    <div>
                      <p className="text-[10px] font-bold text-white leading-none">Business Official</p>
                      <p className="text-[8px] text-white/60 mt-1 uppercase tracking-widest">Verified Account</p>
                    </div>
                  </div>

                  <div className="flex-1 p-4 space-y-3">
                    {selectedTemplate ? (
                      <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm relative animate-in slide-in-from-left-4 duration-300">
                        <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent"></div>
                        <p className="text-[11px] text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {selectedTemplate.content?.body || selectedTemplate.content || "Template content preview..."}
                        </p>
                        <div className="flex justify-end mt-1">
                          <span className="text-[8px] text-slate-400">11:00 AM</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center opacity-10">
                        <MessageCircle size={64} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Reach</span>
                  <span className="text-xs font-black text-slate-800">
                    {formData.audienceMode === 'excel' ? (formData.excelData?.rows.length || 0) :
                      formData.audienceMode === 'contacts' ? formData.contacts.length :
                        formData.group_ids.length > 0 ? 'Multiple Groups' : '0'} Recipients
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                  <Info size={14} className="text-primary" />
                  <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                    Campaigns are processed instantly unless scheduled for later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
