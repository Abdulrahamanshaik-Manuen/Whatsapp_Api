import React, { useState, useEffect, useRef } from 'react';

import { 
  Search, 
  MoreVertical, 
  Phone, 
  MessageSquare, 
  MessageCircle, 
  Users, 
  CircleDashed,
  Zap,
  Smile,
  Paperclip,
  Send,
  Loader2,
  CheckCheck,
  ShieldCheck,
  Clock,
  Calendar,
  Tag,
  User,
  FileEdit,
  LayoutGrid,
  BookText,
  Plus,
  Camera,
  Sparkles
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const InboxPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
    }
  }, [activeChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/messages/contact/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Messages error:', err);
    }
  };

  const handleSend = async () => {
    if (!replyText.trim() || !activeChat) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/messages/send`, {
        to: activeChat._id,
        body: replyText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReplyText('');
      fetchMessages(activeChat._id);
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (days === 1) return 'Yesterday';
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 flex min-h-0 h-full bg-[#F8FAFC] overflow-hidden py-5 pr-5 pl-1 gap-5 font-['Inter',_sans-serif]">
      
      {/* Column 1: iPhone Mockup */}
      <div className="hidden xl:flex w-[350px] shrink-0 items-center justify-center min-h-0">
        <div className="relative w-[290px] h-[580px] bg-[#1a1a1a] rounded-[2.8rem] p-2 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] border-[3px] border-[#333] shrink-0">
          <div className="w-full h-full bg-white rounded-[2.3rem] overflow-hidden flex flex-col relative pt-4">

            {/* WhatsApp Header */}
            <div className="pt-2 pb-1 px-5 bg-white shrink-0">
              <div className="flex items-center justify-between mb-3">
                 <h1 className="text-xl font-bold text-[#25D366]">Maneun</h1>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 mb-2 px-1 overflow-x-hidden">
                <button className="whitespace-nowrap px-3 py-1.5 bg-[#E7F6EE] text-[#128C7E] rounded-full text-[10px] font-bold flex items-center gap-1 flex-shrink-0">
                  All <span className="bg-[#25D366] text-white px-1.5 py-0.5 rounded-full text-[9px]">{conversations.length}</span>
                </button>
                <button className="whitespace-nowrap text-slate-500 text-[10px] font-bold flex items-center gap-1 flex-shrink-0">
                  Unread <span className="text-slate-400 font-medium">{conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0)}</span>
                </button>
                <button className="whitespace-nowrap text-slate-500 text-[10px] font-bold flex-shrink-0">Groups</button>
                <button className="whitespace-nowrap text-slate-500 text-[10px] font-bold flex-shrink-0">Labels</button>
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="animate-spin text-[#25D366]" size={24} />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center mt-10">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare size={24} className="text-slate-200" />
                   </div>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No chats yet</p>
                </div>
              ) : (
                conversations.map((chat, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveChat({ 
                      _id: chat._id, 
                      name: chat.contactInfo?.name || chat._id,
                      contactInfo: chat.contactInfo,
                      lastMessage: chat.lastMessage
                    })} 
                    className={`w-full px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors ${activeChat?._id === chat._id ? 'bg-slate-50' : ''}`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                         {chat.contactInfo?.name ? (
                           <div className="w-full h-full bg-[#E7F6EE] text-[#128C7E] flex items-center justify-center text-sm font-bold">
                             {chat.contactInfo.name.charAt(0)}
                           </div>
                         ) : (
                           <User size={28} className="text-slate-300 mt-1.5" />
                         )}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#25D366] border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-[13px] font-bold text-slate-900 truncate">
                          {chat.contactInfo?.name || chat._id}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                          {formatTime(chat.lastMessage?.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-slate-500 truncate">
                          {chat.lastMessage?.direction === 'outgoing' && <CheckCheck size={14} className="inline mr-1 text-blue-400" />}
                          {chat.lastMessage?.body || chat.lastMessage?.template_name || 'No message'}
                        </p>
                        {chat.unreadCount > 0 && (
                          <div className="bg-[#25D366] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-black/10 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Column 2: Center Workspace */}
      <div className="flex-1 flex flex-col bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative">
         {!activeChat ? (
           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
              <div className="flex flex-col items-center justify-center relative z-10">
                 {/* Smaller, softer illustration */}
                 <div className="relative w-44 h-36 mb-8 flex items-center justify-center">
                    <div className="relative">
                       <div className="w-16 h-14 bg-[#25D366]/80 rounded-xl flex items-center justify-center rotate-[-12deg] translate-x-[-15px] shadow-md">
                          <MessageCircle size={24} className="text-white" fill="white" />
                       </div>
                       <div className="w-20 h-16 bg-[#0F2B46] rounded-2xl flex items-center justify-center absolute top-2 left-4 z-20 shadow-xl">
                          <MessageSquare size={32} className="text-white" fill="white" />
                       </div>
                       <div className="w-14 h-14 bg-[#E8F5E9] rounded-xl flex items-center justify-center rotate-[12deg] translate-x-[25px] translate-y-[15px] shadow-md absolute bottom-[-10px] right-[-15px]">
                          <Smile size={22} className="text-green-500" />
                       </div>
                       <div className="absolute -top-4 left-[-10px] text-[#25D366]">✦</div>
                       <div className="absolute -top-2 right-4 text-[#25D366]">✦</div>
                    </div>
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Select a conversation</h2>
                 <p className="text-sm text-slate-400 font-medium max-w-xs mb-10 leading-relaxed">
                   Choose a chat from the list on the left to view and manage your customer conversations.
                 </p>
                 <div className="flex items-center gap-12">
                    <div className="flex flex-col items-center gap-2.5">
                       <div className="w-11 h-11 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center"><MessageSquare size={18} /></div>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center leading-tight">Real-time<br/>Messaging</span>
                    </div>
                    <div className="flex flex-col items-center gap-2.5">
                       <div className="w-11 h-11 bg-green-50 text-green-500 rounded-full flex items-center justify-center"><ShieldCheck size={18} /></div>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center leading-tight">Secure &<br/>Reliable</span>
                    </div>
                    <div className="flex flex-col items-center gap-2.5">
                       <div className="w-11 h-11 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center"><Zap size={18} fill="currentColor" /></div>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center leading-tight">Fast<br/>Response</span>
                    </div>
                 </div>
              </div>
           </div>
         ) : (
           <div className="flex-1 flex flex-col min-h-0 bg-white">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#E7F6EE] text-[#128C7E] flex items-center justify-center font-bold text-sm">
                       {activeChat.name?.charAt(0)}
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-slate-900">{activeChat.name}</h3>
                       <p className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full"></span>
                          Online
                       </p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Phone size={18} /></button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><MoreVertical size={18} /></button>
                 </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F1F5F9]/30 custom-scrollbar">
                 {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[70%] p-3.5 rounded-2xl shadow-sm relative group ${msg.direction === 'outgoing' ? 'bg-[#25D366] text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.body || msg.template_name}</p>
                          <div className={`flex items-center gap-1 mt-1.5 justify-end ${msg.direction === 'outgoing' ? 'text-white/60' : 'text-slate-400'}`}>
                             <span className="text-[9px] font-medium">{formatTime(msg.createdAt)}</span>
                             {msg.direction === 'outgoing' && <CheckCheck size={12} />}
                          </div>
                       </div>
                    </div>
                 ))}
                 <div ref={chatEndRef} />
              </div>

              {/* Reply Area */}
              <div className="p-4 bg-white border-t border-slate-50">
                 <div className="bg-slate-50 rounded-2xl p-2.5 flex items-end gap-2 border border-slate-100 focus-within:bg-white focus-within:border-indigo-100 transition-all shadow-sm">
                    <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"><Paperclip size={20} /></button>
                    <textarea 
                       value={replyText}
                       onChange={(e) => setReplyText(e.target.value)}
                       onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                             e.preventDefault();
                             handleSend();
                          }
                       }}
                       placeholder="Type your message..."
                       className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-32 no-scrollbar"
                    />
                    <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"><Smile size={20} /></button>
                    <button 
                       onClick={handleSend}
                       disabled={sending || !replyText.trim()}
                       className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${sending || !replyText.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 active:scale-95'}`}
                    >
                       {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    </button>
                 </div>
                 <div className="mt-2.5 flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                       <button className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                          <BookText size={12} /> Templates
                       </button>
                       <button className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                          <LayoutGrid size={12} /> Quick Replies
                       </button>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                       <ShieldCheck size={10} /> End-to-end Encrypted
                    </p>
                 </div>
              </div>
           </div>
         )}
      </div>

      {/* Column 3: CRM Insights Sidebar */}
      <div className="hidden xl:flex w-[300px] flex-col bg-white rounded-[2rem] py-6 px-5 shadow-sm border border-slate-100 overflow-y-auto custom-scrollbar">
         {!activeChat ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mb-4">
                 <User size={32} />
              </div>
              <p className="text-sm font-bold text-slate-900 mb-1">No Contact Selected</p>
              <p className="text-xs text-slate-400">Select a conversation to view customer CRM insights and history.</p>
           </div>
         ) : (
           <>
             {/* Profile Header */}
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-[#E7F6EE] flex items-center justify-center border-2 border-white shadow-md text-[#128C7E] font-bold text-lg">
                       {activeChat.name?.charAt(0) || <User size={24} />}
                    </div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#25D366] border-2 border-white rounded-full"></div>
                  </div>
                  <div className="min-w-0">
                     <h3 className="text-base font-bold text-slate-900 truncate">{activeChat.name}</h3>
                     <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5 font-bold">
                        {activeChat.contactInfo?.status === 'online' ? (
                          <>
                            <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-pulse"></span>
                            <span className="text-[#25D366]">Online</span>
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                            <span>Last Active: {formatTime(activeChat.contactInfo?.updatedAt || activeChat.lastMessage?.createdAt)}</span>
                          </>
                        )}
                     </p>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-slate-500 transition-colors"><MoreVertical size={20} /></button>
             </div>

             {/* Contact Details Grid */}
             <div className="space-y-4 mb-8">
                <div>
                   <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Email Address</label>
                   <p className="text-xs text-slate-600 font-medium truncate">{activeChat.contactInfo?.email || 'No email provided'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Group</label>
                      <div className="inline-flex px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md border border-blue-100">
                         {activeChat.contactInfo?.details?.group || 'Unassigned'}
                      </div>
                   </div>
                   <div>
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Status</label>
                      <div className={`inline-flex px-2 py-1 ${activeChat.contactInfo?.consent ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'} text-[10px] font-bold rounded-md border`}>
                         {activeChat.contactInfo?.consent ? 'Verified' : 'Pending'}
                      </div>
                   </div>
                </div>

                <div>
                   <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Tags</label>
                   <div className="flex flex-wrap gap-1.5">
                      {activeChat.contactInfo?.tags?.length > 0 ? (
                        activeChat.contactInfo.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-full">#{tag}</span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">No tags added</span>
                      )}
                   </div>
                </div>
             </div>

             {/* Quick Actions Panel */}
             <div className="mb-6">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Quick Actions</label>
                <div className="flex gap-2">
                   <button className="flex-1 py-2 bg-[#25D366] text-white rounded-xl text-[10px] font-bold shadow-sm shadow-[#25D366]/20 hover:bg-[#1ebe5b] transition-all flex items-center justify-center gap-1.5">
                      <Plus size={14} /> Add Note
                   </button>
                   <button className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold shadow-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5">
                      <Tag size={14} /> Tag
                   </button>
                   <button className="w-10 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all">
                      <MoreVertical size={16} />
                   </button>
                </div>
             </div>

             {/* Activity Timeline */}
             <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Activity Timeline</label>
                <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
                   <div className="relative pl-7">
                      <div className="absolute left-0 top-1 w-[22px] h-[22px] bg-green-50 rounded-full border border-green-100 flex items-center justify-center z-10">
                         <CheckCheck size={10} className="text-green-500" />
                      </div>
                      <p className="text-[11px] font-bold text-slate-700">Latest Sync</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatTime(activeChat.contactInfo?.updatedAt || activeChat.lastMessage?.createdAt)}</p>
                   </div>

                   <div className="relative pl-7">
                      <div className="absolute left-0 top-1 w-[22px] h-[22px] bg-blue-50 rounded-full border border-blue-100 flex items-center justify-center z-10">
                         <Plus size={10} className="text-blue-500" />
                      </div>
                      <p className="text-[11px] font-bold text-slate-700">Contact Joined</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {activeChat.contactInfo?.createdAt ? new Date(activeChat.contactInfo.createdAt).toLocaleDateString() : 'N/A'} • Via {activeChat.contactInfo?.consent_source?.toUpperCase() || 'DIRECT'}
                      </p>
                   </div>
                </div>
             </div>
           </>
         )}
      </div>
    </div>
  );
};

export default InboxPage;
