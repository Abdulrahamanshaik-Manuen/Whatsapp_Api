import React, { useState, useEffect } from 'react';
import {
  Zap, X, ArrowLeft, Send, Loader2, Calendar, Target, Users, Search,
  CheckCircle2, Upload, FileText, MessageCircle, User, Info, Eye, EyeOff,
  Paperclip, Camera, Mic
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
  const [groupSearch, setGroupSearch] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPreview, setShowPreview] = useState(true);

  // States for template variables mapping and personalization
  const [variableValues, setVariableValues] = useState({}); // for groups/contacts: { "1": "static or {{contact.name}}" }
  const [excelMapping, setExcelMapping] = useState({
    phoneColumn: '',
    variables: {}, // { "1": "Column Header Name" }
    staticVariables: {} // { "1": "Static text" }
  });

  useEffect(() => {
    fetchInitialData();
    // Parse pre-selected contacts from bulk actions on Contacts page
    const preselected = localStorage.getItem('preselected_contacts');
    if (preselected) {
      try {
        const phones = JSON.parse(preselected);
        if (Array.isArray(phones) && phones.length > 0) {
          setFormData(prev => ({
            ...prev,
            audienceMode: 'contacts',
            contacts: phones
          }));
        }
      } catch (err) {
        console.error("Failed to parse pre-selected contacts:", err);
      }
      localStorage.removeItem('preselected_contacts');
    }
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

  const getTemplateVariables = (template) => {
    if (!template) return [];
    if (template.variables && template.variables.length > 0) {
      return template.variables;
    }
    const bodyText = template.content?.body || template.content || '';
    const matches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
    return [...new Set(matches.map(m => m.replace(/\{\{|\}\}/g, '')))].sort((a, b) => Number(a) - Number(b));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
      if (!data || data.length === 0) {
        return alert("The uploaded Excel file appears to be empty.");
      }
      const headers = data[0] || [];
      const rows = data.slice(1).filter(r => r && r.length > 0);
      if (headers.length === 0) {
        return alert("Could not find any columns in the Excel file.");
      }
      setFormData({ ...formData, excelData: { headers, rows } });
    };
    reader.readAsBinaryString(file);
  };

  // Sync variables and auto-detect columns when template changes
  useEffect(() => {
    const template = templates.find(t => t._id === formData.template_id);
    if (template) {
      const vars = getTemplateVariables(template);
      
      // Setup default variables for Groups/Contacts
      const initialVars = {};
      vars.forEach(v => {
        initialVars[v] = '';
      });
      setVariableValues(initialVars);

      // Setup default Excel mapping
      const initialExcelMapping = {
        phoneColumn: '',
        variables: {},
        staticVariables: {}
      };
      vars.forEach(v => {
        initialExcelMapping.variables[v] = '';
        initialExcelMapping.staticVariables[v] = '';
      });

      if (formData.excelData && formData.excelData.headers) {
        const headers = formData.excelData.headers;
        const phoneHeader = headers.find(h => {
          const lower = h.toString().toLowerCase();
          return lower.includes('phone') || lower.includes('mobile') || lower.includes('number') || lower.includes('contact');
        }) || headers[0] || '';
        initialExcelMapping.phoneColumn = phoneHeader;
      }
      setExcelMapping(initialExcelMapping);
    } else {
      setVariableValues({});
      setExcelMapping({ phoneColumn: '', variables: {}, staticVariables: {} });
    }
  }, [formData.template_id, templates]);

  // Auto-detect phone column when spreadsheet data is updated
  useEffect(() => {
    if (formData.excelData && formData.excelData.headers) {
      const headers = formData.excelData.headers;
      const phoneHeader = headers.find(h => {
        const lower = h.toString().toLowerCase();
        return lower.includes('phone') || lower.includes('mobile') || lower.includes('number') || lower.includes('contact');
      }) || headers[0] || '';
      
      setExcelMapping(prev => ({
        ...prev,
        phoneColumn: phoneHeader
      }));
    }
  }, [formData.excelData]);

  // Helper to construct dynamic message preview
  const renderPreviewBody = () => {
    if (!selectedTemplate) return '';
    let body = selectedTemplate.content?.body || selectedTemplate.content || '';
    const vars = getTemplateVariables(selectedTemplate);

    if (formData.audienceMode === 'excel') {
      if (formData.excelData && formData.excelData.rows && formData.excelData.rows.length > 0) {
        const firstRow = formData.excelData.rows[0];
        const headers = formData.excelData.headers;
        vars.forEach(v => {
          const colName = excelMapping.variables[v];
          if (colName === '__STATIC__') {
            const staticVal = excelMapping.staticVariables[v] || `{{${v}}}`;
            body = body.replace(new RegExp(`\\{\\{${v}\\}\\}`, 'g'), staticVal);
          } else if (colName) {
            const colIdx = headers.indexOf(colName);
            const val = colIdx !== -1 ? firstRow[colIdx] : `{{${v}}}`;
            body = body.replace(new RegExp(`\\{\\{${v}\\}\\}`, 'g'), val || `[Empty ${colName}]`);
          }
        });
      }
    } else {
      vars.forEach(v => {
        const val = variableValues[v];
        body = body.replace(new RegExp(`\\{\\{${v}\\}\\}`, 'g'), val || `{{${v}}}`);
      });
    }
    return body;
  };

  const handleSubmit = async () => {
    if (!formData.campaign_name || !formData.template_id) return alert("Please provide a name and select a template.");

    const template = templates.find(t => t._id === formData.template_id);
    const vars = getTemplateVariables(template);

    let submitPayload = {
      campaign_name: formData.campaign_name,
      template_id: formData.template_id,
      scheduled_at: formData.scheduled_at,
      audienceMode: formData.audienceMode
    };

    if (formData.audienceMode === 'excel') {
      if (!formData.excelData) {
        return alert("Please upload an Excel spreadsheet.");
      }
      if (!excelMapping.phoneColumn) {
        return alert("Please select the recipient Phone Number column.");
      }

      // Check if all template variables are mapped
      const unmapped = vars.find(v => !excelMapping.variables[v]);
      if (unmapped) {
        return alert(`Please map template variable {{${unmapped}}} to an Excel column or static value.`);
      }

      const headers = formData.excelData.headers;
      const phoneColIdx = headers.indexOf(excelMapping.phoneColumn);
      if (phoneColIdx === -1) {
        return alert("Selected Phone Number column was not found in sheet.");
      }

      // Construct rich_contacts
      const richContacts = [];
      formData.excelData.rows.forEach(row => {
        const rawPhone = row[phoneColIdx];
        if (!rawPhone) return;

        const phone = rawPhone.toString().replace(/\D/g, '');
        if (!phone) return;

        const contactVars = vars.map(v => {
          const mapping = excelMapping.variables[v];
          if (mapping === '__STATIC__') {
            return excelMapping.staticVariables[v] || '';
          } else {
            const colIdx = headers.indexOf(mapping);
            return colIdx !== -1 ? (row[colIdx]?.toString() || '') : '';
          }
        });

        richContacts.push({ phone, variables: contactVars });
      });

      if (richContacts.length === 0) {
        return alert("No valid phone numbers found in the selected Excel column.");
      }

      submitPayload.rich_contacts = richContacts;
      submitPayload.contacts = [];
      submitPayload.group_ids = [];
    } else {
      if (formData.audienceMode === 'groups' && formData.group_ids.length === 0) {
        return alert("Please select at least one contact group.");
      }
      if (formData.audienceMode === 'contacts' && formData.contacts.length === 0) {
        return alert("Please select at least one contact.");
      }

      // Collect variables sequential values
      const globalVars = vars.map(v => variableValues[v] || '');

      submitPayload.variable_values = globalVars;
      submitPayload.contacts = formData.contacts;
      submitPayload.group_ids = formData.group_ids;
      submitPayload.rich_contacts = [];
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const result = await requireSub(() =>
        fetch(`${API_BASE_URL}/campaigns`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(submitPayload)
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

  // Computed values
  const categories = ['All', ...new Set(templates.map(t => t.category).filter(Boolean))];

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = (t.name || '').toLowerCase().includes(templateSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredGroups = groups.filter(g => 
    (g.name || '').toLowerCase().includes(groupSearch.toLowerCase())
  );

  const filteredContacts = allContacts.filter(c => 
    (c.name || '').toLowerCase().includes(contactSearch.toLowerCase()) || 
    (c.phoneNumber || '').includes(contactSearch)
  );

  const totalContacts = formData.audienceMode === 'excel' 
    ? (formData.excelData?.rows.length || 0) 
    : formData.audienceMode === 'contacts' 
    ? formData.contacts.length 
    : groups
        .filter(g => formData.group_ids.includes(g._id))
        .reduce((acc, curr) => acc + (curr.contacts?.length || 0), 0);

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
      {/* Main Workspace Body */}
      <main className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Breadcrumbs & Page Header directly on canvas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div>
              <button 
                onClick={() => onNavigate('/campaigns')} 
                className="flex items-center gap-1 text-[11px] text-blue-600 font-bold hover:underline mb-1 cursor-pointer transition-colors"
              >
                &lt; Campaigns
              </button>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Create Campaign</h1>
              <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Design and schedule your message broadcast</p>
            </div>

            <div className="flex items-center gap-2">
              {!showPreview && (
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center gap-1.5 h-9 px-3 text-xs text-slate-600 font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 cursor-pointer transition-all active:scale-98"
                >
                  <Eye size={14} />
                  Show Preview
                </button>
              )}
              <button
                onClick={() => onNavigate('/campaigns')}
                className="h-9 px-4 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 cursor-pointer active:scale-98 transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.campaign_name || !formData.template_id}
                className={`flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-98 cursor-pointer ${
                  loading || !formData.campaign_name || !formData.template_id
                    ? 'bg-slate-100 text-slate-350 cursor-not-allowed border border-slate-200'
                    : 'bg-[#25D366] text-white hover:bg-[#20ba59]'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                {formData.scheduled_at ? 'Schedule Campaign' : 'Launch Campaign'}
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* Left Config Panel */}
            <div className={`${showPreview ? 'lg:col-span-8' : 'lg:col-span-12'} grid grid-cols-1 md:grid-cols-2 gap-5`}>
              
              {/* 1. Campaign Details (Spans 2 columns) */}
              <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Campaign Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Campaign Title *</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Summer Sale 2024"
                        value={formData.campaign_name}
                        maxLength={100}
                        onChange={e => setFormData({ ...formData, campaign_name: e.target.value })}
                        className="w-full pl-3 pr-14 h-9 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold font-mono">
                        {formData.campaign_name.length}/100
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Schedule Time (Optional)</label>
                    <div className="relative">
                      <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={e => setFormData({ ...formData, scheduled_at: e.target.value })}
                        className="w-full pl-9 pr-3 h-9 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary/20 outline-none transition-all cursor-pointer text-slate-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Target Audience (Spans 1 column) */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col justify-between min-h-[360px] gap-4">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Audience</h3>
                  
                  {/* Mode Selector Tabs */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Source</label>
                    <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200 gap-1">
                      {['groups', 'contacts', 'excel'].map(mode => {
                        const isActive = formData.audienceMode === mode;
                        return (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setFormData({ ...formData, audienceMode: mode })}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer border ${
                              isActive 
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm' 
                                : 'bg-white border-transparent hover:bg-slate-100/70 text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            {mode === 'groups' && <Users size={12} />}
                            {mode === 'contacts' && <User size={12} />}
                            {mode === 'excel' && <Upload size={12} />}
                            {mode === 'excel' ? 'Excel Upload' : mode}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selection Panel */}
                  <div className="space-y-2">
                    {formData.audienceMode === 'groups' ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Select Groups *</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search groups..."
                            value={groupSearch}
                            onChange={e => setGroupSearch(e.target.value)}
                            className="w-full pl-3 pr-8 h-8 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
                          />
                          <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        <div className="max-h-[140px] overflow-y-auto pr-1.5 custom-scrollbar space-y-1">
                          {filteredGroups.length === 0 ? (
                            <p className="text-center text-slate-400 text-xs py-4 font-semibold">No groups found.</p>
                          ) : (
                            filteredGroups.map(g => {
                              const isSelected = formData.group_ids.includes(g._id);
                              return (
                                <label
                                  key={g._id}
                                  className="flex items-center justify-between py-1.5 px-2 hover:bg-slate-50 rounded cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {
                                        const newGroups = isSelected
                                          ? formData.group_ids.filter(id => id !== g._id)
                                          : [...formData.group_ids, g._id];
                                        setFormData({ ...formData, group_ids: newGroups });
                                      }}
                                      className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 accent-emerald-500 cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-slate-700">{g.name}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                    {g.contacts?.length || 0} contacts
                                  </span>
                                </label>
                              );
                            })
                          )}
                        </div>
                        <div className="flex justify-center pt-1">
                          <button
                            type="button"
                            onClick={() => onNavigate('/groups')}
                            className="flex items-center gap-1 text-[11px] text-blue-600 font-bold hover:text-blue-800 hover:underline cursor-pointer bg-transparent border-none"
                          >
                            + Create New Group
                          </button>
                        </div>
                      </div>
                    ) : formData.audienceMode === 'contacts' ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Select Contacts *</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search contacts by name or phone..."
                            value={contactSearch}
                            onChange={e => setContactSearch(e.target.value)}
                            className="w-full pl-3 pr-8 h-8 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
                          />
                          <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        <div className="max-h-[160px] overflow-y-auto pr-1.5 custom-scrollbar space-y-1">
                          {filteredContacts.length === 0 ? (
                            <p className="text-center text-slate-400 text-xs py-4 font-semibold">No contacts found.</p>
                          ) : (
                            filteredContacts.map(c => {
                              const isSelected = formData.contacts.includes(c.phoneNumber);
                              return (
                                <label
                                  key={c._id}
                                  className="flex items-center justify-between py-1.5 px-2 hover:bg-slate-50 rounded cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {
                                        setFormData({ 
                                          ...formData, 
                                          contacts: isSelected 
                                            ? formData.contacts.filter(p => p !== c.phoneNumber) 
                                            : [...formData.contacts, c.phoneNumber] 
                                        });
                                      }}
                                      className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 accent-emerald-500 cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{c.name}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{c.phoneNumber}</span>
                                </label>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-0.5">Spreadsheet Upload</label>
                        <div
                          onClick={() => document.getElementById('page-excel-upload').click()}
                          className="w-full py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center gap-3.5 cursor-pointer hover:border-primary/20 hover:bg-primary/5 transition-all group"
                        >
                          <input type="file" id="page-excel-upload" className="hidden" onChange={handleFileUpload} />
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${formData.excelData ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-md' : 'bg-white text-slate-300 shadow-sm border border-slate-200'}`}>
                            {formData.excelData ? <CheckCircle2 size={24} /> : <Upload size={24} />}
                          </div>
                          <div className="text-center">
                            <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">{formData.excelData ? `${formData.excelData.rows.length} Contacts Imported` : 'Click to Upload Excel / CSV file'}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Drag spreadsheet file here</p>
                          </div>
                          {formData.excelData && <button type="button" className="text-[9px] font-bold text-primary uppercase underline bg-transparent border-none">Replace File</button>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Audience Footer */}
                <div className="grid grid-cols-3 bg-slate-50 border border-slate-200 rounded-lg p-3 text-center divide-x divide-slate-200 shadow-inner mt-2 shrink-0">
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Selected</p>
                    <p className="text-xs font-extrabold text-slate-700 mt-0.5">
                      {formData.audienceMode === 'excel' ? 'Spreadsheet' :
                       formData.audienceMode === 'contacts' ? `${formData.contacts.length} Contacts` :
                       `${formData.group_ids.length} Groups`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Contacts</p>
                    <p className="text-xs font-extrabold text-slate-700 mt-0.5">{totalContacts}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                      Est. Reach 
                      <span className="text-slate-400 cursor-help" title="Personalized broadcast unique reach">
                        <Info size={11} />
                      </span>
                    </p>
                    <p className="text-xs font-extrabold text-emerald-600 mt-0.5">{totalContacts} Recipients</p>
                  </div>
                </div>
              </div>

              {/* 3. Template Selection Table (Spans 1 column) */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col justify-between min-h-[360px] gap-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Template</h3>
                    
                    {/* Search & Category Filter */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-initial">
                        <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={templateSearch}
                          onChange={(e) => setTemplateSearch(e.target.value)}
                          className="w-full sm:w-28 pl-6 pr-2 h-7 bg-white border border-slate-200 rounded-md text-[10px] font-semibold focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-7 px-1.5 bg-white border border-slate-200 rounded-md text-[10px] font-bold focus:ring-1 focus:ring-emerald-500/20 outline-none cursor-pointer text-slate-600"
                      >
                        <option value="All">All Categories</option>
                        {categories.filter(c => c !== 'All').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dense List Table */}
                  <div className="overflow-auto border border-slate-200 rounded-lg max-h-[200px] custom-scrollbar shadow-inner bg-slate-50/20">
                    <table className="w-full min-w-[360px] text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[9px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 select-none">
                          <th className="py-2.5 px-3">Template Name</th>
                          <th className="py-2.5 px-2 w-24">Category</th>
                          <th className="py-2.5 px-2 w-32 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredTemplates.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-8 text-center text-slate-400 font-semibold text-[11px]">
                              No templates found.
                            </td>
                          </tr>
                        ) : (
                          filteredTemplates.map(t => {
                            const isSelected = formData.template_id === t._id;
                            return (
                              <tr
                                key={t._id}
                                onClick={() => setFormData({ ...formData, template_id: t._id })}
                                className={`cursor-pointer hover:bg-slate-50/70 transition-colors ${
                                  isSelected ? 'bg-emerald-50/30' : ''
                                }`}
                              >
                                <td className="py-2 px-3">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <input 
                                      type="radio" 
                                      name="selectedTemplate" 
                                      checked={isSelected}
                                      onChange={() => setFormData({ ...formData, template_id: t._id })}
                                      className="accent-emerald-500 cursor-pointer w-3.5 h-3.5 shrink-0" 
                                    />
                                    <span className="text-[11px] text-slate-700 font-bold truncate max-w-[110px]" title={t.name}>{t.name}</span>
                                  </div>
                                </td>
                                <td className="py-2 px-2">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border whitespace-nowrap ${
                                    t.category?.toLowerCase() === 'utility' 
                                      ? 'bg-blue-50 text-blue-650 border-blue-100' 
                                      : t.category?.toLowerCase() === 'marketing'
                                      ? 'bg-purple-50 text-purple-650 border-purple-100'
                                      : 'bg-amber-50 text-amber-650 border-amber-100'
                                  }`}>
                                    {t.category || 'Utility'}
                                  </span>
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border whitespace-nowrap ${
                                    t.status === 'APPROVED' 
                                      ? 'bg-emerald-50 text-emerald-650 border-emerald-100' 
                                      : 'bg-slate-50 text-slate-400 border-slate-200'
                                  }`}>
                                    {t.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Table Footer Action */}
                <div className="flex justify-center pt-1 border-t border-slate-100 mt-2 shrink-0">
                  <button 
                    type="button"
                    onClick={() => {
                      if (formData.template_id) {
                        onNavigate('/templates/view', selectedTemplate);
                      } else {
                        alert("Please select a template to preview details.");
                      }
                    }}
                    className="flex items-center gap-1.5 text-[11px] text-blue-600 font-bold hover:text-blue-800 hover:underline cursor-pointer bg-transparent border-none"
                  >
                    <Eye size={12} />
                    Preview Template
                  </button>
                </div>
              </div>

              {/* 4. Dynamic Personalization & Column Mapping Section */}
              {formData.audienceMode === 'excel' && (
                <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Upload size={14} className="text-emerald-500" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Excel Data Mapping</h3>
                  </div>

                  {formData.excelData ? (
                    <div className="space-y-4">
                      {/* Recipient Phone Column */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50/50 p-3 rounded-lg border border-slate-150">
                        <div>
                          <span className="text-[11px] font-bold text-slate-700">Recipient Phone Number Column *</span>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Select the column containing WhatsApp numbers</p>
                        </div>
                        <select
                          value={excelMapping.phoneColumn}
                          onChange={e => setExcelMapping({ ...excelMapping, phoneColumn: e.target.value })}
                          className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-emerald-500/20 outline-none cursor-pointer text-slate-600"
                        >
                          <option value="">-- Select Column --</option>
                          {formData.excelData.headers.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      {/* Dynamic variables mapping if template has variables */}
                      {selectedTemplate && getTemplateVariables(selectedTemplate).length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-0.5">Template Variables Mapping</h4>
                          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                            {getTemplateVariables(selectedTemplate).map((v) => {
                              const isStatic = excelMapping.variables[v] === '__STATIC__';
                              return (
                                <div key={v} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/20 transition-colors">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-50 font-mono text-[10px] font-bold text-emerald-700 select-none">
                                      {`{{${v}}}`}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700">Variable {v}</span>
                                  </div>

                                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0 sm:items-center">
                                    <select
                                      value={excelMapping.variables[v] || ''}
                                      onChange={e => {
                                        const newVars = { ...excelMapping.variables, [v]: e.target.value };
                                        setExcelMapping({ ...excelMapping, variables: newVars });
                                      }}
                                      className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-bold focus:ring-1 focus:ring-emerald-500/20 outline-none cursor-pointer text-slate-600 min-w-[140px]"
                                    >
                                      <option value="">-- Choose Column --</option>
                                      <option value="__STATIC__">(Custom Static Value)</option>
                                      {formData.excelData.headers.map(h => (
                                        <option key={h} value={h}>{h}</option>
                                      ))}
                                    </select>

                                    {isStatic && (
                                      <input
                                        type="text"
                                        placeholder="Type static text..."
                                        value={excelMapping.staticVariables[v] || ''}
                                        onChange={e => {
                                          const newStatics = { ...excelMapping.staticVariables, [v]: e.target.value };
                                          setExcelMapping({ ...excelMapping, staticVariables: newStatics });
                                        }}
                                        className="h-8 px-2.5 bg-white border border-slate-200 rounded-md text-[11px] font-semibold focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400 w-full sm:w-40"
                                      />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 border-dashed rounded-lg text-center gap-2">
                      <Upload size={20} className="text-slate-350" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upload your spreadsheet file in the audience section first</p>
                    </div>
                  )}
                </div>
              )}

              {/* Group/Contact Variables inputs */}
              {formData.audienceMode !== 'excel' && selectedTemplate && getTemplateVariables(selectedTemplate).length > 0 && (
                <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Zap size={14} className="text-[#25D366] animate-pulse" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Template Variables Personalization</h3>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Provide static text or dynamic tags like {"{{contact.name}}"} for each template variable</p>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                      {getTemplateVariables(selectedTemplate).map((v) => (
                        <div key={v} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-emerald-50 font-mono text-[10px] font-bold text-emerald-700 select-none">
                              {`{{${v}}}`}
                            </span>
                            <span className="text-xs font-bold text-slate-700">Variable {v}</span>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-[60%] shrink-0">
                            <input
                              type="text"
                              placeholder="e.g. Valued Customer, or {{contact.name}}"
                              id={`var-input-${v}`}
                              value={variableValues[v] || ''}
                              onChange={e => setVariableValues({ ...variableValues, [v]: e.target.value })}
                              className="flex-1 h-8 px-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-md text-[11px] font-semibold focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400"
                            />

                            <div className="flex gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById(`var-input-${v}`);
                                  if (input) {
                                    const start = input.selectionStart || 0;
                                    const end = input.selectionEnd || 0;
                                    const currentText = variableValues[v] || '';
                                    const tag = '{{contact.name}}';
                                    const newText = currentText.slice(0, start) + tag + currentText.slice(end);
                                    setVariableValues({ ...variableValues, [v]: newText });
                                    setTimeout(() => {
                                      input.focus();
                                      input.setSelectionRange(start + tag.length, start + tag.length);
                                    }, 0);
                                  }
                                }}
                                className="h-8 px-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-[9px] font-bold text-slate-600 transition-colors cursor-pointer select-none"
                              >
                                + Name
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const input = document.getElementById(`var-input-${v}`);
                                  if (input) {
                                    const start = input.selectionStart || 0;
                                    const end = input.selectionEnd || 0;
                                    const currentText = variableValues[v] || '';
                                    const tag = '{{contact.phone}}';
                                    const newText = currentText.slice(0, start) + tag + currentText.slice(end);
                                    setVariableValues({ ...variableValues, [v]: newText });
                                    setTimeout(() => {
                                      input.focus();
                                      input.setSelectionRange(start + tag.length, start + tag.length);
                                    }, 0);
                                  }
                                }}
                                className="h-8 px-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-md text-[9px] font-bold text-slate-650 transition-colors cursor-pointer select-none"
                              >
                                + Phone
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Right Live Phone Preview (Collapsible) */}
            {showPreview && (
              <div className="lg:col-span-4 space-y-4">
                <div className="sticky top-4 space-y-4">
                  
                  {/* Card wrapper for WhatsApp mockup */}
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Message Preview</h3>
                      <button 
                        type="button"
                        onClick={() => setShowPreview(false)}
                        className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase hover:text-slate-800 hover:underline cursor-pointer bg-transparent border-none"
                      >
                        Hide Preview
                        <EyeOff size={11} />
                      </button>
                    </div>

                    {/* Phone mockup */}
                    <div className="relative w-[240px] h-[450px] bg-slate-900 rounded-[2.5rem] p-1.5 border-[2px] border-slate-800 shadow-lg shrink-0 overflow-hidden mx-auto">
                      <div className="w-full h-full bg-[#E5DDD5] rounded-[2.1rem] overflow-hidden flex flex-col relative">
                        {/* WhatsApp Header */}
                        <div className="bg-[#075e54] px-3.5 py-3.5 flex items-center gap-2 text-white">
                          <button type="button" className="text-white/85" disabled><ArrowLeft size={13} /></button>
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white/80 shrink-0">
                            <User size={13} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-black leading-none truncate flex items-center gap-1">
                              Business Official
                              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full inline-block border-[1px] border-[#075e54] shadow-sm"></span>
                            </p>
                            <p className="text-[7px] text-white/70 mt-0.5 font-bold uppercase tracking-wider leading-none">Online</p>
                          </div>
                        </div>

                        {/* WhatsApp Chat Body */}
                        <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto custom-scrollbar bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                          {selectedTemplate ? (
                            <div className="bg-white rounded-lg rounded-tl-none p-2.5 shadow-sm relative max-w-[85%] animate-in slide-in-from-left-4 duration-300">
                              <div className="absolute top-0 -left-1.5 w-0 h-0 border-t-[8px] border-t-white border-l-[8px] border-l-transparent"></div>
                              <p className="text-[10px] text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                                {renderPreviewBody() || "Template content preview..."}
                              </p>
                              <div className="flex justify-end mt-1">
                                <span className="text-[7px] text-slate-400 font-bold">11:30 AM</span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-15 gap-2 pt-16">
                              <MessageCircle size={32} className="text-slate-400 animate-pulse" />
                              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">No template selected</span>
                            </div>
                          )}
                        </div>

                        {/* WhatsApp Input Footer Mockup */}
                        <div className="bg-[#f4f4f4] p-1.5 flex items-center gap-1.5 border-t border-slate-200/50">
                          <div className="flex-1 bg-white rounded-full h-6 px-2 flex items-center justify-between text-slate-400">
                            <span className="truncate pl-1 text-[9px] font-medium font-sans">Type a message</span>
                            <div className="flex items-center gap-2 pr-1 text-slate-400 shrink-0">
                              <Paperclip size={10} className="cursor-pointer hover:text-slate-600 transition-colors" />
                              <Camera size={10} className="cursor-pointer hover:text-slate-600 transition-colors" />
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-[#075e54] flex items-center justify-center text-white shrink-0 hover:bg-[#065047] transition-all cursor-pointer">
                            <Mic size={11} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom personalization variables hint banner */}
                    <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-[10px] shadow-sm">
                      <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-slate-500 font-bold leading-relaxed">
                        Variables shown as {"{{1}}"}, {"{{2}}"}, etc. Actual values will be personalized.
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}
