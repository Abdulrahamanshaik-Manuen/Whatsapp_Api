import React, { useState, useRef } from 'react';
import {
  Plus,
  Save,
  Rocket,
  Search,
  Filter,
  MoreVertical,
  Play,
  FileEdit,
  Copy,
  Trash2,
  ChevronRight,
  MousePointer2,
  MessageSquare,
  GitBranch,
  Split,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Settings2,
  Clock,
  Image as ImageIcon,
  Video,
  FileText,
  Code2,
  CheckCircle2,
  Zap,
  Phone,
  Send,
  X,
  ChevronDown,
  Info,
  ExternalLink,
  Trash,
  Upload
} from 'lucide-react';

export default function AutomationPage() {
  const [activeView, setActiveView] = useState('list'); // 'list' or 'builder'
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  
  // Media States
  const [selectedMediaType, setSelectedMediaType] = useState(null); // 'image', 'video', 'pdf'
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFileName, setMediaFileName] = useState('');
  const [mediaFileSize, setMediaFileSize] = useState('');
  const [messageText, setMessageText] = useState("Hello! Welcome to our service. How can we help you today?");
  
  const fileInputRef = useRef(null);

  const flows = [
    { id: 1, name: 'Welcome Flow', status: 'active', updated: 'Just now', triggers: ['Keyword: Hi'] },
  ];

  const handleMediaClick = (type) => {
    setSelectedMediaType(type);
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMediaFileName(file.name);
    setMediaFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');

    if (selectedMediaType === 'image' || selectedMediaType === 'video') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMediaPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(file.name);
    }
  };

  const removeMedia = () => {
    setSelectedMediaType(null);
    setMediaPreview(null);
    setMediaFileName('');
    setMediaFileSize('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredFlows = flows.filter(flow => {
    if (filterTab === 'active') return flow.status === 'active';
    if (filterTab === 'draft') return flow.status === 'draft';
    return true;
  }).filter(flow => flow.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (activeView === 'builder') {
    return (
      <div className="flex flex-col h-[calc(100vh-140px)] -m-8 overflow-hidden bg-slate-50">
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept={selectedMediaType === 'image' ? "image/*" : selectedMediaType === 'video' ? "video/*" : ".pdf"}
          onChange={handleFileChange}
        />

        {/* Builder Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView('list')}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ChevronRight className="rotate-180" size={20} />
            </button>
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                Welcome Flow Builder
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">Draft</span>
              </h3>
              <p className="text-xs text-slate-500">Last saved: Just now</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 transition-all">
              <Save size={18} /> Save
            </button>
            <button className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-200 flex items-center gap-2 transition-all">
              <Rocket size={18} /> Publish Flow
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Node Toolbar (Left) */}
          <div className="w-16 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-6 z-10">
            <div className="group relative">
              <button className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all shadow-sm">
                <Zap size={20} />
              </button>
              <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Start Node</span>
            </div>
            <div className="group relative">
              <button className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all shadow-sm">
                <MessageSquare size={20} />
              </button>
              <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Send Message</span>
            </div>
            <div className="group relative">
              <button className="p-3 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 transition-all shadow-sm">
                <Split size={20} />
              </button>
              <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Condition</span>
            </div>
            <div className="group relative">
              <button className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-all shadow-sm">
                <LayoutGrid size={20} />
              </button>
              <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Buttons</span>
            </div>
            <div className="mt-auto group relative">
              <button className="p-3 text-slate-400 hover:text-slate-600 transition-all">
                <Settings2 size={20} />
              </button>
            </div>
          </div>

          {/* Builder Canvas */}
          <div className="flex-1 relative overflow-hidden bg-slate-50" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            {/* Canvas Controls */}
            <div className="absolute bottom-6 left-6 flex items-center gap-2 z-10 bg-white p-1 rounded-xl border border-slate-200 shadow-lg">
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Maximize2 size={18} /></button>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Minimize2 size={18} /></button>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              <span className="text-xs font-bold text-slate-500 px-2">100%</span>
            </div>

            {/* Sample Nodes */}
            <div className="absolute top-20 left-20">
              {/* Start Node */}
              <div
                onClick={() => setSelectedNode('start')}
                className={`w-64 bg-white border-2 rounded-2xl shadow-xl overflow-hidden cursor-pointer transition-all ${selectedNode === 'start' ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-emerald-100 hover:border-emerald-300'}`}
              >
                <div className="bg-emerald-500 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <Zap size={14} fill="white" />
                    <span className="text-xs font-bold uppercase tracking-wider">Start Trigger</span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Keywords</p>
                    <p className="text-sm font-medium text-slate-700">"Hi", "Hello", "Start"</p>
                  </div>
                </div>
                <div className="h-4 bg-emerald-50 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
              </div>

              {/* Arrow Line (Simulated) */}
              <div className="w-0.5 h-12 bg-slate-300 mx-auto"></div>

              {/* Message Node */}
              <div
                onClick={() => setSelectedNode('message')}
                className={`w-64 bg-white border-2 rounded-2xl shadow-xl overflow-hidden cursor-pointer transition-all ${selectedNode === 'message' ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-blue-100 hover:border-blue-300'}`}
              >
                <div className="bg-blue-500 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <MessageSquare size={14} />
                    <span className="text-xs font-bold uppercase tracking-wider">Send Message</span>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {selectedMediaType === 'image' && mediaPreview && (
                    <div className="w-full h-24 bg-slate-100 rounded-lg overflow-hidden mb-2">
                      <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {selectedMediaType === 'video' && mediaPreview && (
                    <div className="w-full h-24 bg-slate-900 rounded-lg flex items-center justify-center text-white mb-2">
                      <Video size={24} />
                    </div>
                  )}
                  {selectedMediaType === 'pdf' && mediaPreview && (
                    <div className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-red-500" />
                      <span className="text-[10px] font-medium truncate">{mediaFileName}</span>
                    </div>
                  )}
                  <p className="text-sm text-slate-600 line-clamp-3 italic">"{messageText}"</p>
                </div>
                <div className="flex justify-between px-4 pb-2">
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Node Settings (Right) */}
          <div className={`w-80 bg-white border-l border-slate-200 flex flex-col transition-all duration-300 ${selectedNode ? 'translate-x-0' : 'translate-x-full absolute right-0 h-full'}`}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <Settings2 size={18} className="text-slate-400" />
                Node Settings
              </h4>
              <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedNode === 'message' ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Message Content</label>
                      <span className="text-[10px] text-slate-400">{messageText.length}/1024</span>
                    </div>
                    <textarea
                      className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 transition-all resize-none font-medium text-slate-700"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Add Media</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => handleMediaClick('image')}
                        className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl transition-all gap-1 ${selectedMediaType === 'image' ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm' : 'border-slate-200 text-slate-400 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
                      >
                        <ImageIcon size={18} />
                        <span className="text-[10px] font-bold">Image</span>
                      </button>
                      <button 
                        onClick={() => handleMediaClick('video')}
                        className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl transition-all gap-1 ${selectedMediaType === 'video' ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm' : 'border-slate-200 text-slate-400 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
                      >
                        <Video size={18} />
                        <span className="text-[10px] font-bold">Video</span>
                      </button>
                      <button 
                        onClick={() => handleMediaClick('pdf')}
                        className={`flex flex-col items-center justify-center p-3 border-2 border-dashed rounded-xl transition-all gap-1 ${selectedMediaType === 'pdf' ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm' : 'border-slate-200 text-slate-400 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600'}`}
                      >
                        <FileText size={18} />
                        <span className="text-[10px] font-bold">PDF</span>
                      </button>
                    </div>

                    {selectedMediaType && mediaPreview && (
                      <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-emerald-500" /> {selectedMediaType} Selected
                          </p>
                          <button onClick={removeMedia} className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash size={14} />
                          </button>
                        </div>
                        {selectedMediaType === 'image' && (
                          <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                            <img src={mediaPreview} alt="Media" className="w-full h-full object-cover" />
                          </div>
                        )}
                        {(selectedMediaType === 'video' || selectedMediaType === 'pdf') && (
                          <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                              {selectedMediaType === 'video' ? <Video size={20} /> : <FileText size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{mediaFileName}</p>
                              <p className="text-[10px] text-slate-400">{mediaFileSize}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">Interactive Elements</label>
                    <button className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-black transition-all">
                      <Plus size={16} /> Add Buttons
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">Wait Delay</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">2 Seconds</span>
                    </div>
                    <input type="range" className="w-full accent-emerald-500" />
                  </div>
                </>
              ) : selectedNode === 'start' ? (
                <>
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <h5 className="text-sm font-bold text-emerald-900 mb-1">Trigger Type</h5>
                      <p className="text-xs text-emerald-700">Choose what starts this flow</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Specific Keywords</label>
                      <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1">
                          Hi <X size={12} className="text-slate-400" />
                        </span>
                        <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium flex items-center gap-1">
                          Hello <X size={12} className="text-slate-400" />
                        </span>
                        <button className="p-1 text-emerald-600"><Plus size={14} /></button>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-emerald-500 transition-all group">
                      <input type="checkbox" className="w-4 h-4 accent-emerald-500" />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-600 transition-colors">Apply for New Users only</span>
                    </label>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-40">
                  <MousePointer2 size={40} className="text-slate-300" />
                  <p className="text-sm font-medium text-slate-400 px-6">Select a node on the canvas to configure its settings</p>
                </div>
              )}
            </div>

            {/* Preview Preview Toggle */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 mt-auto">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Phone size={14} /> {showPreview ? 'Hide Live Preview' : 'Show Live Preview'}
              </button>
            </div>
          </div>

          {/* WhatsApp Preview (Floating/Fixed) */}
          {showPreview && (
            <div className="w-72 bg-white border-l border-slate-200 h-full flex flex-col z-20 shadow-2xl animate-in slide-in-from-right duration-300">
              <div className="bg-[#075E54] p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-500">
                  <Zap size={20} fill="#64748b" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white leading-none">Flow Simulation</h5>
                  <p className="text-[10px] text-emerald-100/70 mt-1">Testing Welcome Flow</p>
                </div>
              </div>

              <div className="flex-1 bg-[#E5DDD5] p-4 space-y-4 overflow-y-auto relative" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat', backgroundOpacity: 0.1 }}>
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-[#DCF8C6] p-2.5 rounded-lg rounded-tr-none shadow-sm relative">
                    <p className="text-xs text-slate-800 font-medium">Hi</p>
                    <p className="text-[9px] text-slate-400 text-right mt-1 font-medium">10:30 AM</p>
                  </div>
                </div>

                {/* Bot Message with Dynamic Media */}
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-white p-2 rounded-lg rounded-tl-none shadow-sm relative animate-in fade-in slide-in-from-left-2 duration-500">
                    {selectedMediaType === 'image' && mediaPreview && (
                      <div className="w-full h-32 bg-slate-100 rounded-lg overflow-hidden mb-2">
                        <img src={mediaPreview} alt="WhatsApp Media" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {selectedMediaType === 'video' && mediaPreview && (
                      <div className="w-full aspect-video bg-black rounded-lg flex flex-col items-center justify-center text-white mb-2 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={24} className="fill-white" />
                        </div>
                        <Video size={32} className="opacity-50" />
                        <span className="text-[10px] mt-2 font-bold tracking-widest">{mediaFileName}</span>
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-[8px] font-bold">0:12</div>
                      </div>
                    )}
                    {selectedMediaType === 'pdf' && mediaPreview && (
                      <div className="w-full p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-3 mb-2 hover:bg-slate-100 transition-all cursor-pointer">
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500 shadow-sm">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-slate-800 truncate">{mediaFileName}</p>
                          <p className="text-[9px] text-slate-400">{mediaFileSize} • PDF</p>
                        </div>
                        <button className="p-1.5 bg-white border border-slate-100 rounded-lg text-blue-500 shadow-sm"><Download size={14} /></button>
                      </div>
                    )}
                    <p className="text-[13px] leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">{messageText}</p>
                    <p className="text-[9px] text-slate-400 text-right mt-1 font-medium">10:31 AM</p>
                  </div>
                </div>
              </div>

              {/* Bot Input Bar (Mock) */}
              <div className="p-3 bg-[#F0F0F0] flex items-center gap-2 border-t border-slate-200">
                <div className="flex-1 bg-white h-9 rounded-full px-4 flex items-center text-slate-400 text-xs shadow-sm">
                  Type a message...
                </div>
                <div className="w-9 h-9 rounded-full bg-[#075E54] flex items-center justify-center text-white shadow-md">
                  <Send size={16} fill="white" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-slate-50 -m-8 min-h-[calc(100vh-80px)] overflow-hidden">
      {/* List View Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Automation Flows</h2>
            <p className="text-slate-500 mt-1 font-medium">Build and manage your WhatsApp chatbot logic in one place.</p>
          </div>
          <button
            onClick={() => setActiveView('builder')}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            Create New Flow
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Stats Quick View */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Flows', value: '1', icon: GitBranch, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active', value: '1', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Avg. Response', value: '1s', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Daily Interactions', value: '1', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-lg font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main List Area */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
              {['all', 'active', 'draft'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${filterTab === tab ? 'bg-white text-emerald-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {tab === 'all' ? 'All Flows' : tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search flows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 transition-all"
                />
              </div>
              <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition-all">
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-6 gap-6">
            {filteredFlows.map((flow) => (
              <div
                key={flow.id}
                className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${flow.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                    <GitBranch size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${flow.status === 'active' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                      {flow.status}
                    </span>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 text-lg group-hover:text-emerald-600 transition-colors">{flow.name}</h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Clock size={12} /> Last updated {flow.updated}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {flow.triggers.map((trigger, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100">
                      {trigger}
                    </span>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold">AS</div>
                    <div className="w-7 h-7 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-600">+2</div>
                  </div>
                  <button
                    onClick={() => setActiveView('builder')}
                    className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <FileEdit size={12} /> Edit Flow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
