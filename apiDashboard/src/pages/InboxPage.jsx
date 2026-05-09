import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Send, User, MessageCircle,
  MoreVertical, Phone, Info, Clock, Check,
  CheckCheck, Loader2, Smile, Paperclip, Plus
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function InboxPage() {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeChat) {
      fetchThread(activeChat._id);
    }
  }, [activeChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setConversations(data);
      }
    } catch (err) {
      console.error("Fetch conversations failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchThread = async (phone) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/conversations/${phone}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Fetch thread failed:", err);
    }
  };

  const handleSend = async () => {
    if (!replyText.trim() || !activeChat) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          to: activeChat._id,
          text: replyText
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages([...messages, data]);
        setReplyText('');
        fetchConversations(); // Update last message in list
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error("Reply failed:", err);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c._id.includes(search) || (c.lastMessage?.to?.includes(search))
  );

  return (
    <div className="flex-1 flex min-h-0 bg-[#F7F9FC] overflow-hidden p-4 md:p-6 gap-6">
      {/* 1. Chat List Column - Wrapped in Card */}
      <div className="w-full md:w-[320px] flex flex-col bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 relative z-10 overflow-hidden">
        {/* Inbox Header */}
        <div className="p-6 space-y-6 bg-white border-b border-slate-50">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Messages</h1>
            <div className="flex items-center gap-2">
              <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-slate-100">
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Rounded Search UI */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-transparent rounded-full text-xs font-bold focus:bg-white focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 shadow-inner"
            />
          </div>
        </div>

        {/* Scrollable Conversations */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-2">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="p-4 rounded-3xl bg-slate-50/50 animate-pulse flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100"></div>
                <div className="flex-1 space-y-3 mt-1">
                  <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                  <div className="h-2 bg-slate-100 rounded w-full"></div>
                </div>
              </div>
            ))
          ) : filteredConversations.length === 0 ? (
            <div className="p-10 text-center space-y-3 opacity-30 mt-10">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                <MessageCircle size={20} className="text-slate-300" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No messages found</p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <button
                key={conv._id}
                onClick={() => setActiveChat(conv)}
                className={`w-full p-4 rounded-[2rem] flex items-center gap-4 transition-all group relative ${activeChat?._id === conv._id ? 'bg-indigo-50/50 border border-indigo-100/50' : 'hover:bg-slate-50'}`}
              >
                {/* Avatar with Status */}
                <div className="relative shrink-0">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black shadow-lg transition-transform group-hover:scale-105 ${activeChat?._id === conv._id ? 'bg-indigo-600 shadow-indigo-600/20' : 'bg-slate-300 shadow-slate-200'}`}>
                    {conv._id.slice(-2)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${conv.unreadCount > 0 ? 'bg-indigo-600' : 'bg-emerald-500'}`}></div>
                </div>

                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm font-black transition-colors ${activeChat?._id === conv._id ? 'text-indigo-600' : 'text-slate-800'}`}>{conv._id}</p>
                    <span className="text-[10px] font-bold text-slate-400">
                      {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-[12px] text-slate-500 truncate font-medium opacity-80 leading-relaxed">
                    {conv.lastMessage?.direction === 'outgoing' ? 'You: ' : ''}
                    {conv.lastMessage?.body || 'Attachment'}
                  </p>
                </div>

                {conv.unreadCount > 0 && (
                  <div className="px-2 py-1 bg-indigo-600 rounded-lg text-[10px] font-black text-white shrink-0 shadow-lg shadow-indigo-600/20">
                    {conv.unreadCount}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* 2. Main Conversation Column - Wrapped in Card */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {activeChat ? (
          <>
            {/* Professional Chat Header */}
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center font-black border border-slate-100 group hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer">
                  {activeChat._id.slice(-2)}
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">{activeChat._id}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Connection Active</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden lg:flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-emerald-100 shadow-sm">
                  Verified Contact
                </div>
                <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all border border-slate-100">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Conversation Area with Visual Depth */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[#F7F9FC]">
              {messages.map((msg, idx) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.direction === 'incoming' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div className="max-w-[75%] space-y-2">
                    <div className={`px-6 py-4 rounded-[2rem] text-sm font-bold shadow-sm relative leading-relaxed ${msg.direction === 'incoming' ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100' : 'bg-indigo-600 text-white rounded-tr-none'}`}>
                      {msg.type === 'template' ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 opacity-60">
                            <Zap size={12} />
                            <p className="text-[9px] font-black uppercase tracking-widest">Automation Template</p>
                          </div>
                          <p>{msg.body}</p>
                        </div>
                      ) : (
                        msg.body
                      )}

                      <div className={`flex items-center gap-2 mt-3 justify-end opacity-40 text-[10px]`}>
                        <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        {msg.direction === 'outgoing' && (
                          msg.status === 'read' ? <CheckCheck size={14} /> : <Check size={14} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Premium Chat Input */}
            <div className="p-8 border-t border-slate-50 bg-white">
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-[2.5rem] border border-slate-100 focus-within:bg-white focus-within:ring-8 focus-within:ring-indigo-600/5 focus-within:border-indigo-600 transition-all group">
                <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors">
                  <Smile size={24} />
                </button>
                <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors">
                  <Paperclip size={24} />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-800 placeholder:text-slate-300 px-2"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !replyText.trim()}
                  className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-90 disabled:opacity-50 disabled:grayscale"
                >
                  {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} fill="white" />}
                </button>
              </div>
              <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest mt-6 opacity-40">
                End-to-end encrypted • WhatsApp Cloud API
              </p>
            </div>
          </>
        ) : (
          /* Proper Centered Empty State Design */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-[#F7F9FC]">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 shadow-xl shadow-slate-200/50 mb-8 border border-slate-100 relative group animate-in zoom-in duration-700">
              <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl animate-pulse"></div>
              <MessageCircle size={32} className="relative z-10 text-slate-100 group-hover:text-indigo-600/20 transition-colors duration-500" />
            </div>
            <div className="space-y-4 max-w-sm">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">No Conversations Yet</h2>
              <p className="text-sm text-slate-400 font-bold leading-loose">
                Your inbox is waiting! Start a new chat to begin. Select a contact or wait for new incoming messages.
              </p>
              <div className="pt-6">
                <button className="px-10 py-5 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-3xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-95">
                  Start New Conversation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Details Column (Hidden on Small Screens) - Wrapped in Card */}
      <div className="hidden xl:flex w-[260px] flex-col bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 text-center space-y-6">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] mx-auto flex items-center justify-center text-slate-200 border border-slate-100">
            <User size={48} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">{activeChat ? activeChat._id : 'Select User'}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WhatsApp Business Contact</p>
          </div>

          <div className="h-[1px] bg-slate-50 w-full my-8"></div>

          <div className="space-y-6 text-left">
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Recent Activity</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <p className="text-xs font-bold text-slate-600">Last active 2m ago</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Shared Media</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square bg-slate-50 rounded-xl border border-slate-100"></div>
                <div className="aspect-square bg-slate-50 rounded-xl border border-slate-100"></div>
                <div className="aspect-square bg-slate-50 rounded-xl border border-slate-100"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
}
