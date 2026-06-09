import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSubscriptionGate } from '../context/SubscriptionGateContext';

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
  Search,
  SlidersHorizontal,
  Star,
  Edit,
  MoreVertical,
  Copy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronRight,
  ChevronDown,
  FileText,
  Users
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const COMMON_EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🫣', '🤭', '🫢', '🫡', '🤫', '🫠', '🤥', '😶', '🫥',
  '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱',
  '😴', '🤤', '😪', '😵', '😵‍💫', '🤐', '🥴', '🤢', '🤮', '🤧',
  '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡',
  '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
  '👆', '🖕', '👇', '☝️', '💪', '🦾', '👊', '✊', '🤛',
  '🤝', '🙏', '👏', '🙌', '👐', '🤲', '✍️', '💅', '🤳', '👑',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '🔥', '✨', '🌟', '⭐', '💥', '💯', '💢', '💬', '💭', '🔔',
  '🎉', '🎁', '🎂', '🎈', '🎨', '🚀', '✈️', '🚗', '🏠', '💼'
];

import { useSocket } from '../context/SocketContext';

const InboxPage = ({ onNavigate }) => {
  const { socket } = useSocket();
  const { requireSub } = useSubscriptionGate();
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('cached_conversations');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeChat, setActiveChat] = useState(() => {
    const savedId = localStorage.getItem('inbox_active_chat_id');
    if (!savedId) return null;
    const savedConvs = localStorage.getItem('cached_conversations');
    if (savedConvs) {
      try {
        const convs = JSON.parse(savedConvs);
        const chat = convs.find(c => c._id === savedId);
        if (chat) {
          return {
            _id: chat._id,
            name: chat.contactInfo?.name || chat._id,
            contactInfo: chat.contactInfo,
            lastMessage: chat.lastMessage,
            lastIncomingMessageAt: chat.lastIncomingMessageAt
          };
        }
      } catch (e) {
        console.error('Error parsing cached conversations:', e);
      }
    }
    return null;
  });
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (activeChat) {
      localStorage.setItem('inbox_active_chat_id', activeChat._id);
    } else {
      localStorage.removeItem('inbox_active_chat_id');
    }
  }, [activeChat]);

  useEffect(() => {
    isChatSwitching.current = true;
  }, [activeChat]);

  useEffect(() => {
    const savedId = localStorage.getItem('inbox_active_chat_id');
    if (savedId && !activeChat) {
      const chat = conversations.find(c => c._id === savedId);
      if (chat) {
        setActiveChat({
          _id: chat._id,
          name: chat.contactInfo?.name || chat._id,
          contactInfo: chat.contactInfo,
          lastMessage: chat.lastMessage,
          lastIncomingMessageAt: chat.lastIncomingMessageAt
        });
      }
    }
  }, [conversations, activeChat]);
  const [loading, setLoading] = useState(!conversations.length);
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);
  const isChatSwitching = useRef(true);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filter, setFilter] = useState('all');
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('cached_contact_groups');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCrmPanel, setShowCrmPanel] = useState(true);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSendDropdown, setShowSendDropdown] = useState(false);
  const sendDropdownRef = useRef(null);
  const [pinnedConvs, setPinnedConvs] = useState(() => {
    const saved = localStorage.getItem('inbox_pinned_conversations');
    return saved ? JSON.parse(saved) : [];
  });

  const togglePin = (id) => {
    setPinnedConvs(prev => {
      const next = prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id];
      localStorage.setItem('inbox_pinned_conversations', JSON.stringify(next));
      return next;
    });
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard: ' + text);
  };

  useEffect(() => {
    fetchConversations();
    fetchGroups();

    if (socket) {
      socket.on('new_message', (data) => {
        const { message, contact } = data;

        // Update messages if this is the active chat
        if (activeChat && activeChat._id === message.to) {
          setMessages(prev => [...prev, message]);
        }

        // Update conversations list
        setConversations(prev => {
          const exists = prev.find(c => c._id === message.to);
          if (exists) {
            return prev.map(c => c._id === message.to ? {
              ...c,
              lastMessage: message,
              lastIncomingMessageAt: message.direction === 'incoming' ? message.created_at : c.lastIncomingMessageAt,
              unreadCount: (activeChat && activeChat._id === message.to) ? 0 : (c.unreadCount + 1)
            } : c).sort((a, b) => new Date(b.lastMessage?.created_at) - new Date(a.lastMessage?.created_at));
          } else {
            // New conversation
            return [{
              _id: message.to,
              contactInfo: contact,
              lastMessage: message,
              lastIncomingMessageAt: message.direction === 'incoming' ? message.created_at : null,
              unreadCount: 1
            }, ...prev];
          }
        });
      });

      socket.on('message_status_update', (data) => {
        const { meta_message_id, status } = data;
        setMessages(prev => prev.map(m => m.meta_message_id === meta_message_id ? { ...m, status } : m));

        // Update in conversations as well if it's the last message
        setConversations(prev => prev.map(c => {
          if (c.lastMessage?.meta_message_id === meta_message_id) {
            return { ...c, lastMessage: { ...c.lastMessage, status } };
          }
          return c;
        }));
      });
    }

    return () => {
      if (socket) {
        socket.off('new_message');
        socket.off('message_status_update');
      }
    };
  }, [socket, activeChat]);

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
    if (messages.length > 0) {
      const behavior = isChatSwitching.current ? 'auto' : 'smooth';
      const timer = setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior, block: 'nearest' });
        isChatSwitching.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
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

  const handleAssignGroup = async (groupName) => {
    if (!activeChat) return;
    const contactId = activeChat.contactInfo?._id || activeChat._id;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_BASE_URL}/contacts/${contactId}`, {
        details: {
          ...activeChat.contactInfo?.details,
          group: groupName
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setActiveChat(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          details: {
            ...prev.contactInfo?.details,
            group: groupName
          }
        }
      }));
      
      setShowAssignDropdown(false);
      fetchConversations();
    } catch (err) {
      console.error('Assign group error:', err);
      alert('Failed to assign group');
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

      const result = await requireSub(() =>
        axios.post(`${API_BASE_URL}/messages/reply`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.data)
          .catch(err => err.response?.data || { error: err.message })
      );

      if (!result) return false;

      if (!result.error) {
        setReplyText('');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchMessages(activeChat._id);
        return true;
      } else {
        alert('Failed to send: ' + result.error);
        return false;
      }
    } catch (err) {
      console.error('Send error:', err);
      alert('Failed to send message: ' + (err.response?.data?.error || err.message));
      return false;
    } finally {
      setSending(false);
    }
  };

  const handleSendMessage = async () => {
    setShowSendDropdown(false);
    await handleSend();
  };

  const handleSendAndClose = async () => {
    setShowSendDropdown(false);
    const success = await handleSend();
    if (success) {
      setActiveChat(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sendDropdownRef.current && !sendDropdownRef.current.contains(event.target)) {
        setShowSendDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = (c.contactInfo?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          c._id.includes(search);
    if (!matchesSearch) return false;

    if (selectedGroup && c.contactInfo?.details?.group !== selectedGroup) return false;

    if (filter === 'unread') return (c.unreadCount || 0) > 0;
    if (filter === 'groups') return !!c.contactInfo?.details?.group;
    return true;
  });

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const aPinned = pinnedConvs.includes(a._id);
    const bPinned = pinnedConvs.includes(b._id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;

    const aTime = new Date(a.lastMessage?.created_at || a.lastMessage?.createdAt || 0);
    const bTime = new Date(b.lastMessage?.created_at || b.lastMessage?.createdAt || 0);
    return bTime - aTime;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F5F7FA] overflow-hidden font-sans select-none">

      {/* ── Page Header ── */}
      <div className="hidden lg:flex items-center justify-between px-5 pb-3.5 pt-4 border-b border-slate-100 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-none">Inbox</h1>
          <p className="text-xs text-slate-400 font-semibold mt-2 leading-none">Respond to customer conversations in real-time</p>
        </div>
      </div>

      {/* ── Two-column chat layout ── */}
      <div className="flex flex-1 gap-0 lg:gap-5 lg:px-5 lg:pb-5 overflow-hidden min-h-0">
      
      {/* Column 1: Conversations List Card */}
      <div className={`w-full lg:w-[24%] lg:min-w-[270px] lg:max-w-[340px] shrink-0 bg-white border-0 lg:border lg:border-slate-200 rounded-none lg:rounded-2xl flex flex-col min-h-0 overflow-hidden lg:shadow-sm ${activeChat ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Search & Filter Section */}
        <div className="p-4 pb-3 shrink-0 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl py-2 pl-10 pr-3.5 text-xs outline-none focus:ring-1 focus:ring-emerald-500/20 focus:bg-white transition-all font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <button 
              type="button" 
              onClick={() => setSelectedGroup(selectedGroup ? null : (groups[0] || null))}
              className={`p-2.5 border rounded-xl transition-all cursor-pointer ${
                selectedGroup 
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-600' 
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-500'
              }`}
              title="Filter by group"
            >
              <SlidersHorizontal size={15} />
            </button>
          </div>

          {selectedGroup && (
            <div className="flex items-center justify-between px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-lg text-[10px] text-emerald-700 font-bold leading-none shrink-0">
              <span>Filtered: {selectedGroup}</span>
              <button type="button" onClick={() => setSelectedGroup(null)} className="hover:text-emerald-950 font-black">✕</button>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-slate-100 shrink-0 select-none pb-0.5">
            {['all', 'unread', 'groups'].map((tab) => {
              const isActive = filter === tab;
              const count = tab === 'all' ? conversations.length :
                            tab === 'unread' ? conversations.filter(c => (c.unreadCount || 0) > 0).length :
                            conversations.filter(c => !!c.contactInfo?.details?.group).length;
              
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setFilter(tab);
                    setSelectedGroup(null);
                  }}
                  className={`whitespace-nowrap px-3 py-2 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border-b-2 ${
                    isActive 
                      ? 'bg-emerald-50/40 border-emerald-500 text-emerald-700 rounded-t-xl' 
                      : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="capitalize">{tab}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#25D366] text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation List Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 min-h-0 bg-white">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="animate-spin text-emerald-500" size={24} />
            </div>
          ) : filter === 'groups' && !selectedGroup ? (
            groups.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No groups created</p>
              </div>
            ) : (
              groups.map((groupName, idx) => {
                const groupConvsCount = conversations.filter(c => c.contactInfo?.details?.group === groupName).length;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedGroup(groupName)}
                    className="w-full h-[68px] px-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100/50 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#E8F0FE] text-blue-600 flex items-center justify-center shadow-sm shrink-0">
                      <Users size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800 truncate leading-none">{groupName}</p>
                        <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full leading-none">
                          {groupConvsCount} {groupConvsCount === 1 ? 'chat' : 'chats'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5 leading-none">Click to view contacts</p>
                    </div>
                  </button>
                );
              })
            )
          ) : (
            <>
              {filter === 'groups' && selectedGroup && (
                <button 
                  type="button" 
                  onClick={() => setSelectedGroup(null)}
                  className="w-full px-3.5 py-3 flex items-center gap-2 hover:bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-600 cursor-pointer transition-colors"
                >
                  <ChevronLeft size={16} /> Back to Groups List
                </button>
              )}
              {sortedConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No conversations</p>
                </div>
              ) : (
                sortedConversations.map((chat) => {
                  const isActive = activeChat?._id === chat._id;
                  const isPinned = pinnedConvs.includes(chat._id);
                  const winStatus = getWindowStatus(chat);
                  const hasUnread = chat.unreadCount > 0;
                  
                  return (
                    <div
                      key={chat._id}
                      className={`relative group border-l-3 transition-colors ${
                        isActive 
                          ? 'bg-[#EBF8F2]/60 border-[#128C7E]' 
                          : 'border-transparent hover:bg-slate-50/50'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveChat({
                          _id: chat._id,
                          name: chat.contactInfo?.name || chat._id,
                          contactInfo: chat.contactInfo,
                          lastMessage: chat.lastMessage,
                          lastIncomingMessageAt: chat.lastIncomingMessageAt
                        })}
                        className="w-full h-[68px] px-3.5 flex items-center gap-3 text-left shrink-0 cursor-pointer"
                      >
                        <div className="relative shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors ${
                            isActive ? 'bg-emerald-100 text-[#128C7E]' : 'bg-[#F1F5F9] text-slate-600'
                          }`}>
                            {chat.contactInfo?.name ? chat.contactInfo.name.charAt(0).toUpperCase() : <User size={16} />}
                          </div>
                          {winStatus.active && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-white rounded-full"></span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-800 truncate leading-none">
                              {chat.contactInfo?.name || chat._id}
                            </p>
                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap leading-none ml-2">
                              {formatTime(chat.lastMessage?.created_at || chat.lastMessage?.createdAt)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1.5 leading-none">
                            <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 max-w-[85%] font-medium">
                              {chat.lastMessage?.direction === 'outgoing' && (
                                <CheckCheck size={13} className="text-blue-400 shrink-0" />
                              )}
                              <span className="truncate">
                                {chat.lastMessage?.body || chat.lastMessage?.template_name || 'No messages'}
                              </span>
                            </p>
                            
                            <div className="flex items-center gap-1 shrink-0">
                              {isPinned && (
                                <Star size={12} className="text-amber-500 fill-amber-500" />
                              )}
                              {hasUnread && (
                                <span className="bg-[#25D366] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 min-w-4 text-center leading-none">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Conversation List Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-[#F8FAFC]/50 shrink-0 select-none">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
            {filter === 'groups' && !selectedGroup
              ? `Showing ${groups.length} groups`
              : `Showing 1 to ${sortedConversations.length} of ${conversations.length} conversations`
            }
          </p>
        </div>
      </div>

      {/* Column 2: Chat Workspace Card */}
      <div className={`flex-1 bg-white border-0 lg:border lg:border-slate-200 rounded-none lg:rounded-2xl flex flex-col min-h-0 overflow-hidden lg:shadow-sm relative ${activeChat ? 'flex' : 'hidden lg:flex'}`}>
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFC]/40">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100 shadow-sm">
              <MessageCircle size={28} className="text-slate-455 text-slate-400" />
            </div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">Select a conversation</h2>
            <p className="text-xs text-slate-455 text-slate-400 font-bold max-w-xs mt-1 leading-relaxed">
              Choose a chat from the left panel to access the live messaging workspace.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            
            {/* Active Chat Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white shrink-0 z-10 select-none">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveChat(null)}
                  className="lg:hidden p-1.5 -ml-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#128C7E] flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                    {activeChat.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-white rounded-full"></span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-sm font-bold text-slate-800 leading-none truncate max-w-[120px] sm:max-w-[200px]" title={activeChat.name}>{activeChat.name}</h3>
                    {(() => {
                      const status = getWindowStatus(activeChat);
                      return (
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border leading-none shrink-0 ${
                          status.active 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {status.active ? 'Active' : 'Expired'}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1.5 font-bold leading-none truncate">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getWindowStatus(activeChat).active ? 'bg-[#25D366]' : 'bg-slate-300'}`}></span>
                    <span className="truncate">{activeChat.lastIncomingMessageAt ? `Last active: ${formatTime(activeChat.lastIncomingMessageAt)}` : 'No recent activity'}</span>
                  </p>
                </div>
              </div>

              {/* Active Chat Header Actions */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => togglePin(activeChat._id)}
                  className={`p-2 hover:bg-slate-50 border rounded-xl cursor-pointer transition-all ${
                    pinnedConvs.includes(activeChat._id)
                      ? 'border-amber-300 bg-amber-50 text-amber-500'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                  title="Pin Conversation"
                >
                  <Star size={14} className={pinnedConvs.includes(activeChat._id) ? 'fill-amber-500' : ''} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowCrmPanel(!showCrmPanel)}
                  className={`p-2 hover:bg-slate-50 border rounded-xl cursor-pointer transition-all ${
                    showCrmPanel 
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-600' 
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                  title="Customer Profile Details"
                >
                  <Edit size={14} />
                </button>

              </div>
            </div>

            {/* Chat Messages Scrolling Body */}
            <div className="flex-1 overflow-y-auto p-5 bg-white custom-scrollbar flex flex-col min-h-0 space-y-4">
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
                    <div key={dateStr} className="space-y-4">
                      <div className="flex items-center my-4">
                        <div className="flex-grow border-t border-slate-100"></div>
                        <span className="flex-shrink mx-4 text-[9px] font-black text-slate-400 bg-white px-2.5 py-0.5 rounded shadow-sm border border-slate-100 uppercase tracking-widest select-none">
                          {getDayLabel(dateStr)}
                        </span>
                        <div className="flex-grow border-t border-slate-100"></div>
                      </div>
                      
                      {grouped[dateStr].map((msg, idx) => {
                        const isOutgoing = msg.direction === 'outgoing';
                        if (isOutgoing) {
                          return (
                            <div key={idx} className="flex justify-end">
                              <div className="bg-[#25D366] text-white rounded-2xl rounded-tr-none px-4 py-2.5 shadow-sm max-w-[65%] leading-relaxed whitespace-pre-wrap font-medium">
                                <p className="text-[12px]">{msg.body || msg.template_name}</p>
                                <div className="flex items-center justify-end gap-1 mt-1 text-[8px] text-emerald-100 font-bold leading-none select-none">
                                  <span>{formatMessageTime(msg.created_at || msg.createdAt)}</span>
                                  <CheckCheck size={12} className="text-emerald-200 shrink-0" />
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          return (
                            <div key={idx} className="flex flex-col items-start gap-1">
                              <div className="flex items-center gap-1.5 ml-2">
                                <span className="text-[10px] font-bold text-slate-800">{activeChat.name}</span>
                                <span className="text-[9px] text-slate-400 font-semibold">{formatMessageTime(msg.created_at || msg.createdAt)}</span>
                              </div>
                              <div className="bg-[#F8FAFC] text-slate-800 border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-sm max-w-[65%] leading-relaxed whitespace-pre-wrap font-medium">
                                <p className="text-[12px]">{msg.body || msg.template_name}</p>
                                <span className="text-[8px] text-slate-400 mt-1 block text-right font-bold leading-none">{formatMessageTime(msg.created_at || msg.createdAt)}</span>
                              </div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  ));
              })()}
              <div ref={chatEndRef} />
            </div>

            {/* Expired Warning Banner */}
            {(() => {
              const winStatus = getWindowStatus(activeChat);
              if (!winStatus.active) {
                return (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm mx-5 my-3 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-amber-900 leading-none">Customer service window expired.</h4>
                        <p className="text-[10px] text-amber-600 font-bold mt-1">You can only send template messages now.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate && onNavigate('/campaigns')}
                      className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm shrink-0"
                    >
                      Send Template
                    </button>
                  </div>
                );
              }
              return null;
            })()}

            {/* Chat Composer Footer */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <div className="bg-[#F8FAFC] rounded-2xl p-2.5 flex flex-col gap-2.5 border border-slate-200 focus-within:bg-white focus-within:border-emerald-500/30 transition-all shadow-sm">
                
                {selectedFile && (
                  <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-bold shrink-0">
                    <span className="truncate">📎 {selectedFile.name}</span>
                    <button type="button" onClick={() => setSelectedFile(null)} className="hover:text-emerald-950 font-black">✕</button>
                  </div>
                )}
                
                {/* Actions Toolbar Row */}
                <div className="flex items-center gap-2 border-b border-slate-100/60 pb-2 select-none shrink-0">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-1.5 hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                      title="Emoji"
                    >
                      <Smile size={18} />
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute left-0 bottom-full mb-2.5 z-40 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 w-64">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Emoji</span>
                          <button 
                            type="button" 
                            onClick={() => setShowEmojiPicker(false)}
                            className="text-xs text-slate-400 hover:text-slate-700 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="grid grid-cols-8 gap-1.5 max-h-40 overflow-y-auto custom-scrollbar p-0.5">
                          {COMMON_EMOJIS.map((emoji, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setReplyText(prev => prev + emoji);
                              }}
                              className="w-7 h-7 flex items-center justify-center text-lg hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer ${
                      selectedFile ? 'text-emerald-500 bg-emerald-50' : ''
                    }`}
                    title="Attach File"
                  >
                    <Paperclip size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('/campaigns')}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    title="Use Message Template"
                  >
                    <FileText size={12} className="text-slate-500" />
                    <span>Use Template</span>
                  </button>
                </div>

                {/* Input & Send button Row */}
                <div className="flex items-end gap-2">
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
                    rows={1}
                    disabled={!getWindowStatus(activeChat).active}
                    className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-xs py-2 px-1 resize-none max-h-24 no-scrollbar text-slate-700 font-semibold disabled:cursor-not-allowed disabled:text-slate-400"
                  />

                  {/* Split Send button */}
                  <div ref={sendDropdownRef} className="relative flex items-center bg-[#25D366] text-white rounded-xl shadow-sm shrink-0">
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={sending || (!replyText.trim() && !selectedFile)}
                      className="h-9 px-3 flex items-center justify-center border-r border-emerald-600/30 transition-all hover:bg-[#20ba59] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer rounded-l-xl"
                    >
                      {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSendDropdown(!showSendDropdown)}
                      className="h-9 px-2 flex items-center justify-center hover:bg-[#20ba59] transition-all cursor-pointer rounded-r-xl"
                    >
                      <ChevronDown size={14} />
                    </button>

                    {showSendDropdown && (
                      <div className="absolute bottom-full right-0 mb-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <button
                          type="button"
                          onClick={handleSendMessage}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 font-semibold"
                        >
                          <Send size={12} className="text-slate-400" />
                          Send Message
                        </button>
                        <button
                          type="button"
                          onClick={handleSendAndClose}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 font-semibold border-t border-slate-100"
                        >
                          <XCircle size={12} className="text-slate-400" />
                          Send & Close
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Column 3: Customer Details Sidebar Card */}
      {activeChat && showCrmPanel && (
        <>
          {/* Mobile CRM Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
            onClick={() => setShowCrmPanel(false)}
          />
          <div className="fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-white z-50 shadow-2xl p-5 space-y-5 flex flex-col min-h-0 overflow-y-auto custom-scrollbar lg:static lg:h-auto lg:w-[25%] lg:min-w-[270px] lg:max-w-[340px] lg:shrink-0 lg:border lg:border-slate-200 lg:rounded-2xl lg:shadow-sm lg:z-auto lg:p-5">
            {/* Mobile close button */}
            <div className="flex justify-end lg:hidden -mb-3">
              <button 
                type="button" 
                onClick={() => setShowCrmPanel(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <XCircle size={18} />
              </button>
            </div>
          
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-xl font-bold shadow-sm">
                {activeChat.name?.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#25D366] border-2 border-white rounded-full"></span>
            </div>
            <h3 className="text-base font-bold text-slate-800 leading-none">{activeChat.name}</h3>
            {activeChat.contactInfo?.consent && (
              <span className="mt-2 inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black uppercase rounded">
                Verified
              </span>
            )}
            <p className="text-[10px] text-slate-400 font-bold mt-1.5">
              Last Active: {activeChat.lastIncomingMessageAt ? formatTime(activeChat.lastIncomingMessageAt) : 'N/A'}
            </p>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Email</label>
              <div className="flex items-center justify-between gap-2 bg-[#F8FAFC] border border-slate-100 rounded-xl px-3 py-2">
                <span className="text-xs text-slate-700 font-semibold truncate">
                  {activeChat.contactInfo?.email || 'abdulrahamanshaik@manuen.com'}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(activeChat.contactInfo?.email || 'abdulrahamanshaik@manuen.com')}
                  className="p-1 text-slate-455 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Copy Email"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Group</label>
                <span className="w-full inline-flex justify-center px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-lg border border-blue-100">
                  {activeChat.contactInfo?.details?.group || 'Customer'}
                </span>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status</label>
                <span className="w-full inline-flex justify-center px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-lg border border-emerald-100">
                  {activeChat.contactInfo?.consent ? 'Verified' : 'Verified'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Service Window</label>
              {(() => {
                const expired = !getWindowStatus(activeChat).active;
                return (
                  <div className={`border rounded-xl p-2.5 flex items-center gap-2 ${
                    expired 
                      ? 'bg-red-50/50 border-red-100 text-red-600' 
                      : 'bg-emerald-50/50 border-emerald-100 text-emerald-600'
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${expired ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                    <span className="text-xs font-bold leading-none capitalize">
                      {expired ? 'Window Expired' : 'Window Active'}
                    </span>
                  </div>
                );
              })()}
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Tags</label>
              <div className="flex flex-wrap gap-1.5 items-center">
                {activeChat.contactInfo?.tags?.map((tag, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg leading-none">
                    #{tag}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => setShowTagModal(true)}
                  className="px-2.5 py-1 bg-white border border-dashed border-slate-300 hover:border-slate-400 text-slate-500 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-all leading-none"
                >
                  <Plus size={12} /> Add Tag
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Toolbar */}
          <div className="pt-4 border-t border-slate-100 shrink-0">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Quick Actions</label>
            
            <div className="grid grid-cols-4 gap-1.5 select-none">
              <button
                type="button"
                onClick={() => setShowTagModal(true)}
                className="flex flex-col items-center justify-center gap-1 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 rounded-xl text-[10px] font-semibold transition-all cursor-pointer"
              >
                <Tag size={12} className="text-slate-500" />
                <span className="leading-none mt-1">Tag</span>
              </button>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                  className="w-full flex flex-col items-center justify-center gap-1 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 rounded-xl text-[10px] font-semibold transition-all cursor-pointer"
                >
                  <User size={12} className="text-slate-500" />
                  <span className="leading-none mt-1">Assign</span>
                </button>
                {showAssignDropdown && (
                  <div className="absolute left-[-30px] bottom-full mb-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-44 text-[10px] max-h-36 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => handleAssignGroup(null)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 font-bold text-slate-400 border-b border-slate-100"
                    >
                      Unassign Group
                    </button>
                    {groups.map((g, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAssignGroup(g)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 font-bold"
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveChat(null)}
                className="flex flex-col items-center justify-center gap-1 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 rounded-xl text-[10px] font-semibold transition-all cursor-pointer"
              >
                <XCircle size={12} className="text-slate-500" />
                <span className="leading-none mt-1">Close</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/campaigns')}
                className="flex flex-col items-center justify-center gap-1 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-700 rounded-xl text-[10px] font-semibold transition-all cursor-pointer"
              >
                <Send size={12} className="text-slate-500" />
                <span className="leading-none mt-1">Campaign</span>
              </button>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="pt-4 border-t border-slate-100 flex-1 flex flex-col justify-between">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Activity Timeline</label>
              <div className="relative pl-5 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-100 space-y-4">
                
                <div className="relative">
                  <div className="absolute left-[-24px] top-0 w-3.5 h-3.5 bg-blue-100 rounded-full border border-blue-400 shadow-sm flex items-center justify-center">
                    <span className="text-[8px] font-bold text-blue-600 leading-none">+</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 leading-none">Contact Joined</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">
                    {activeChat.contactInfo?.createdAt 
                      ? `${new Date(activeChat.contactInfo.createdAt).toLocaleDateString()} • ${new Date(activeChat.contactInfo.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                      : 'N/A'}
                  </p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                    Via {activeChat.contactInfo?.consent_source?.toUpperCase() || 'WEB'}
                  </p>
                </div>

                {messages.length > 0 && (
                  <div className="relative">
                    <div className="absolute left-[-24px] top-0 w-3.5 h-3.5 bg-slate-100 rounded-full border border-slate-300 shadow-sm flex items-center justify-center">
                      <span className="text-[8px] text-slate-600 leading-none">-</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 leading-none">First Message</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">
                      {new Date(messages[0].created_at || messages[0].createdAt).toLocaleDateString()} • {new Date(messages[0].created_at || messages[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[9px] text-slate-500 font-semibold truncate mt-0.5 italic">
                      "{messages[0].body || messages[0].template_name}"
                    </p>
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
        </>
      )}

      {/* Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-slate-900 text-white rounded-lg flex items-center justify-center">
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none">Add Customer Tag</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Categorize this customer</p>
                </div>
              </div>

              <input
                type="text"
                autoFocus
                placeholder="Enter tag name (e.g. Lead)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-slate-800 transition-all outline-none mb-5"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowTagModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="flex-1 py-2 bg-[#25D366] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:brightness-105 active:scale-98 transition-all"
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
