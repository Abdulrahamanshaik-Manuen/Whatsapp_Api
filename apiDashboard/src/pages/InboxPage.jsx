import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import {
  MessageSquare,
  MessageCircle,
  Zap,
  Smile,
  Paperclip,
  Send,
  Loader2,
  CheckCheck,
  ShieldCheck,
  Tag,
  User,
  Plus,
  ChevronLeft,
  Search
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const InboxPage = () => {
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('cached_conversations');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(!conversations.length);
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filter, setFilter] = useState('all');
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('cached_contact_groups');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    fetchConversations();
    fetchGroups();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/contacts/groups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(res.data);
      localStorage.setItem('cached_contact_groups', JSON.stringify(res.data));
    } catch (err) {
      console.error('Groups error:', err);
    }
  };

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);

      // Auto-clear unread if conversations refresh while chat is open
      const currentChat = conversations.find(c => c._id === activeChat._id);
      if (currentChat?.unreadCount > 0) {
        markAsRead(activeChat._id);
      }
    }
  }, [activeChat, conversations]); // Using full conversations list for live updates

  const markAsRead = async (contactId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE_URL}/messages/read/${contactId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Locally update counts
      setConversations(prev => prev.map(c =>
        c._id === contactId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (err) {
      console.error('Read error:', err);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    if (conversations.length === 0) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
      localStorage.setItem('cached_conversations', JSON.stringify(res.data));
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/messages/conversations/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Messages error:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
  };

  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const handleAddTag = async () => {
    if (!activeChat || !newTagName.trim()) return;
    const tag = newTagName.trim();

    const currentTags = activeChat.contactInfo?.tags || [];
    if (currentTags.includes(tag)) {
      alert('Tag already exists');
      return;
    }

    const contactId = activeChat.contactInfo?._id || activeChat._id;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/contacts/${contactId}`, {
        tags: [...currentTags, tag]
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state immediately
      setActiveChat(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          tags: [...currentTags, tag]
        }
      }));

      setNewTagName('');
      setShowTagModal(false);
      fetchConversations();
    } catch (err) {
      console.error('Tag error:', err);
      alert('Failed to add tag');
    }
  };

  const handleSend = async () => {
    if ((!replyText.trim() && !selectedFile) || !activeChat || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');

      let payload = {
        to: activeChat._id,
        text: replyText,
        type: 'text'
      };

      if (selectedFile) {
        try {
          const formData = new FormData();
          formData.append('file', selectedFile);

          const uploadRes = await axios.post(`${API_BASE_URL}/messages/upload`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });

          if (uploadRes.data?.url) {
            payload.mediaUrl = uploadRes.data.url;
            payload.type = selectedFile.type.startsWith('image/') ? 'image' : 'document';
          }
        } catch (uploadErr) {
          console.error('Attachment upload failed:', uploadErr);
        }
      }

      await axios.post(`${API_BASE_URL}/messages/reply`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReplyText('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchMessages(activeChat._id);
    } catch (err) {
      console.error('Send error:', err);
      alert('Failed to send message: ' + (err.response?.data?.error || err.message));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getDayLabel = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getWindowStatus = (chat) => {
    if (!chat) return { active: false, label: 'Window Expired' };

    const contact = chat.contactInfo;
    const now = new Date();

    // Priority 1: Use window_expires_at from Contact if available and valid
    let expiresAt = contact?.window_expires_at ? new Date(contact.window_expires_at) : null;

    // Priority 2: Fallback to lastIncomingMessageAt + 24h
    if ((!expiresAt || expiresAt < now) && chat.lastIncomingMessageAt) {
      const lastIn = new Date(chat.lastIncomingMessageAt);
      const calculatedExpiry = new Date(lastIn.getTime() + 24 * 60 * 60 * 1000);

      // If the calculated one is better/active, use it
      if (!expiresAt || calculatedExpiry > expiresAt) {
        expiresAt = calculatedExpiry;
      }
    }

    if (!expiresAt || expiresAt < now) return { active: false, label: 'Window Expired' };

    const diff = expiresAt - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return {
      active: true,
      label: `Active (${hours}h ${minutes}m left)`,
      remainingMs: diff
    };
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] custom-scrollbar">

      {/* Standardized Page Header */}
      <div className="px-8 lg:px-12 pt-10 pb-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-primary tracking-tight">Messages</h1>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
              Real-time customer conversation center
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-h-[600px] h-[calc(100vh-180px)] px-8 lg:px-12 pb-8 gap-5 font-['Inter',_sans-serif]">

        {/* Column 1: iPhone Mockup (Mobile View) */}
        <div className="flex w-[310px] shrink-0 items-center justify-start min-h-0">
          <div className="relative w-[290px] h-[580px] bg-[#1a1a1a] rounded-[2.8rem] p-2 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] border-[3px] border-[#333] shrink-0">
            <div className="w-full h-full bg-white rounded-[2.3rem] overflow-hidden flex flex-col relative pt-4">

              {/* WhatsApp Header */}
              <div className="pt-2 pb-1 px-5 bg-white shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-lg font-bold text-[#25D366]">Manuen Infotech</h1>
                </div>

                {/* Search Bar */}
                <div className="mb-3 px-1">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#25D366] transition-colors" size={14} />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full bg-slate-100 border-none rounded-xl py-2 pl-9 pr-4 text-[11px] focus:ring-1 focus:ring-[#25D366]/20 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mb-2 px-1 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setFilter('all')}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 flex-shrink-0 transition-all ${filter === 'all' ? 'bg-[#E7F6EE] text-[#128C7E]' : 'text-slate-500'}`}
                  >
                    All <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${filter === 'all' ? 'bg-[#25D366] text-white' : 'bg-slate-100 text-slate-400'}`}>{conversations.length}</span>
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 flex-shrink-0 transition-all ${filter === 'unread' ? 'bg-[#E7F6EE] text-[#128C7E]' : 'text-slate-500'}`}
                  >
                    Unread <span className={`px-1.5 py-0.5 rounded-full text-[9px] ${filter === 'unread' ? 'bg-[#25D366] text-white' : 'bg-slate-100 text-slate-400'}`}>{conversations.filter(c => (c.unreadCount || 0) > 0).length}</span>
                  </button>
                  <button
                    onClick={() => setFilter('groups')}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1 flex-shrink-0 transition-all ${filter === 'groups' ? 'bg-[#E7F6EE] text-[#128C7E]' : 'text-slate-500'}`}
                  >
                    Groups
                  </button>
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="animate-spin text-[#25D366]" size={24} />
                  </div>
                ) : (filter === 'groups' && !selectedGroup) ? (
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar bg-slate-50/50">
                    <div className="grid grid-cols-1 gap-3">
                      {groups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                            <Users size={28} className="text-slate-200" />
                          </div>
                          <p className="text-sm font-bold text-slate-900">No Groups Found</p>
                          <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">Create groups in the Contacts section to see them here.</p>
                        </div>
                      ) : (
                        groups.map((g, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedGroup(g)}
                            className="w-full px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 bg-white active:bg-slate-100"
                          >
                            <div className="relative shrink-0">
                              <div className="w-12 h-12 rounded-full bg-[#E7F6EE] text-[#128C7E] flex items-center justify-center text-sm font-bold shadow-sm">
                                {g.charAt(0).toUpperCase()}
                              </div>
                              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#25D366] border-2 border-white rounded-full"></div>
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <p className="text-[13px] font-bold text-slate-900 truncate">
                                  {g}
                                </p>
                                <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                                  Today
                                </span >
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                                  <CheckCheck size={14} className="inline text-blue-400" />
                                  <span className="bg-slate-100 text-slate-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0">CRM GROUP</span>
                                  <span className="truncate text-slate-400">View conversations in this group...</span>
                                </p>
                                <ChevronLeft size={14} className="text-slate-200 rotate-180" />
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ) : (conversations.filter(c => {
                  if (filter === 'unread') return (c.unreadCount || 0) > 0;
                  if (filter === 'groups') return (c.contactInfo?.details?.group === selectedGroup);
                  return true;
                }).length === 0) ? (
                  <div className="p-8 text-center mt-10">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users size={24} className="text-slate-200" />
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No {filter} found</p>
                    {filter === 'groups' && (
                      <button onClick={() => setSelectedGroup(null)} className="mt-4 text-[11px] font-bold text-indigo-500 hover:underline">Back to groups</button>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    {filter === 'groups' && (
                      <div className="px-5 py-2 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <span className="text-[10px] font-bold text-indigo-600">Showing: #{selectedGroup}</span>
                        <button onClick={() => setSelectedGroup(null)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">Change</button>
                      </div>
                    )}
                    {conversations
                      .filter(c => {
                        if (filter === 'unread') return (c.unreadCount || 0) > 0;
                        if (filter === 'groups') return (c.contactInfo?.details?.group === selectedGroup);
                        return true;
                      })
                      .map((chat, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveChat({
                            _id: chat._id,
                            name: chat.contactInfo?.name || chat._id,
                            contactInfo: chat.contactInfo,
                            lastMessage: chat.lastMessage,
                            lastIncomingMessageAt: chat.lastIncomingMessageAt
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
                                {formatTime(chat.lastMessage?.created_at || chat.lastMessage?.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                                {chat.lastMessage?.direction === 'outgoing' && <CheckCheck size={14} className="inline text-blue-400" />}
                                <span className="truncate">{chat.lastMessage?.body || chat.lastMessage?.template_name || 'No message'}</span>
                              </p>
                              {chat.unreadCount > 0 && (
                                <div className="bg-[#25D366] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {chat.unreadCount}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                )}

                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-black/10 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Center Workspace (Main Chat Area) */}
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
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center leading-tight">Real-time<br />Messaging</span>
                  </div>
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="w-11 h-11 bg-green-50 text-green-500 rounded-full flex items-center justify-center"><ShieldCheck size={18} /></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center leading-tight">Secure &<br />Reliable</span>
                  </div>
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="w-11 h-11 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center"><Zap size={18} fill="currentColor" /></div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center leading-tight">Fast<br />Response</span>
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
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{activeChat.name}</h3>
                      {(() => {
                        const status = getWindowStatus(activeChat);
                        return (
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${status.active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            {status.label}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
                      <span className={`w-1.5 h-1.5 rounded-full ${getWindowStatus(activeChat).active ? 'bg-[#25D366]' : 'bg-slate-300'}`}></span>
                      {activeChat.lastIncomingMessageAt ? `Last active ${formatTime(activeChat.lastIncomingMessageAt)}` : 'No recent activity'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-[#F1F5F9]/30 custom-scrollbar flex flex-col">
                {(() => {
                  const grouped = {};
                  messages.forEach(msg => {
                    const d = new Date(msg.created_at || msg.createdAt);
                    const dateStr = d.toDateString();
                    if (!grouped[dateStr]) grouped[dateStr] = [];
                    grouped[dateStr].push(msg);
                  });

                  return Object.keys(grouped)
                    .sort((a, b) => new Date(a) - new Date(b))
                    .map((dateStr) => (
                      <div key={dateStr} className="space-y-4 mb-6">
                        <div className="flex justify-center">
                          <span className="bg-white/80 backdrop-blur-sm text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm border border-slate-100 uppercase tracking-wider">
                            {getDayLabel(dateStr)}
                          </span>
                        </div>
                        {grouped[dateStr].map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm relative group ${msg.direction === 'outgoing' ? 'bg-[#25D366] text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
                              <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.body || msg.template_name}</p>
                              <div className={`flex items-center gap-1 mt-1 justify-end ${msg.direction === 'outgoing' ? 'text-white/70' : 'text-slate-400'}`}>
                                <span className="text-[9px] font-medium">{formatMessageTime(msg.created_at || msg.createdAt)}</span>
                                {msg.direction === 'outgoing' && <CheckCheck size={12} />}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ));
                })()}
                <div ref={chatEndRef} />
              </div>

              {/* Reply Area */}
              <div className="p-4 bg-white border-t border-slate-50">
                {(() => {
                  const status = getWindowStatus(activeChat);
                  if (!status.active) {
                    return (
                      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex flex-col items-center text-center">
                        <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">Customer Service Window Expired</p>
                        <p className="text-[10px] text-amber-600 font-medium">You can only send free-form messages within 24 hours of the customer's last message. Please use the <b>Campaigns</b> or <b>Messaging</b> module to send an approved template.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="bg-slate-50 rounded-2xl p-2.5 flex items-end gap-2 border border-slate-100 focus-within:bg-white focus-within:border-indigo-100 transition-all shadow-sm">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2 transition-colors ${selectedFile ? 'text-[#25D366]' : 'text-slate-400 hover:text-indigo-500'}`}
                      >
                        <Paperclip size={20} />
                      </button>
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
                        className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm py-2 resize-none max-h-32 no-scrollbar"
                      />
                      <button
                        onClick={handleSend}
                        disabled={sending || (!replyText.trim() && !selectedFile)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${sending || (!replyText.trim() && !selectedFile) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 active:scale-95'}`}
                      >
                        {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Column 3: CRM Insights Sidebar */}
        <div className="hidden xl:flex w-[260px] flex-col bg-white rounded-[2rem] py-6 px-4 shadow-sm border border-slate-100 overflow-y-auto no-scrollbar">
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
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Service Window</label>
                  {(() => {
                    const status = getWindowStatus(activeChat);
                    return (
                      <div className={`px-3 py-2 rounded-xl border flex items-center gap-2 ${status.active ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                        <div className={`w-2 h-2 rounded-full ${status.active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className={`text-[11px] font-bold ${status.active ? 'text-emerald-700' : 'text-red-700'}`}>{status.label}</span>
                      </div>
                    );
                  })()}
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
                  <button
                    onClick={() => setShowTagModal(true)}
                    className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold shadow-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Tag size={14} /> Tag
                  </button>
                  <button className="w-10 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Activity Timeline */}
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Activity Timeline</label>
                <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">

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

        {/* Tag Modal */}
        {showTagModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                    <Tag size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Add New Tag</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Categorize this customer</p>
                  </div>
                </div>

                <input
                  type="text"
                  autoFocus
                  placeholder="Enter tag name (e.g. Priority, Lead)..."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:border-slate-900 transition-all outline-none mb-6"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowTagModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTag}
                    className="flex-1 py-4 bg-[#25D366] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#25D366]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Add Tag
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
