import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Search, Filter, MoreVertical, Paperclip, Smile, Settings, Code,
  Check, CheckCheck, Clock, Tag, Plus, ChevronDown, ChevronUp, Send,
  MessageSquare, Star, CheckCircle2, RotateCw, Image as ImageIcon,
  X, MapPin, Mail, Phone, ExternalLink, Calendar, ShieldCheck, Download
} from 'lucide-react';
import { LineChart, Line } from 'recharts';

const responseTimeData = [
  { val: 20 }, { val: 40 }, { val: 30 }, { val: 50 }, { val: 35 }, { val: 60 }, { val: 45 }
];

const dummyConversations = [
  {
    _id: "dummy1",
    name: 'Rahul Sharma',
    phoneNumber: '+91 98765 43210',
    status: 'online',
    profilePicture: '',
    unreadCount: 0,
    lastMessageAt: new Date().toISOString(),
    messages: [],
    details: {
      email: 'rahul.s@gmail.com',
      location: 'Mumbai, India',
      joined: '20 May 2025',
      tags: ['VIP Customer', 'Repeat Buyer'],
      orders: [
        { id: 'ORD-12345', item: 'Smart Watch X1', status: 'Delivered', price: '₹2,499', date: '20 May 2025' },
        { id: 'ORD-12312', item: 'Wireless Earbuds', status: 'Processing', price: '₹1,299', date: '18 May 2025' }
      ]
    }
  },
  {
    _id: "dummy2",
    name: 'Priya Patel',
    phoneNumber: '+91 88888 77777',
    status: 'online',
    profilePicture: '',
    unreadCount: 0,
    lastMessageAt: new Date(Date.now() - 100000).toISOString(),
    messages: [],
    details: {
      email: 'priya.p@outlook.com',
      location: 'Ahmedabad, India',
      joined: '15 June 2023',
      tags: ['New Customer'],
      orders: []
    }
  }
];

export default function InboxPage() {
  const [activeChatId, setActiveChatId] = useState(dummyConversations[0]._id);
  const [messageText, setMessageText] = useState('');
  const [showSnippets, setShowSnippets] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const [conversations, setConversations] = useState(dummyConversations);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize Socket
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Fetch Contacts from API
    axios.get('http://localhost:5000/api/contacts').then(res => {
      if (res.data && res.data.length > 0) {
        setConversations(res.data);
        setActiveChatId(res.data[0]._id);
      }
    }).catch(err => console.error("Error fetching contacts:", err));

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (activeChatId) {
      if (activeChatId.startsWith('dummy')) {
        setMessages([]);
      } else {
        axios.get(`http://localhost:5000/api/messages/${activeChatId}`).then(res => {
          setMessages(res.data);
        }).catch(err => console.error("Error fetching messages:", err));

        // Clear unread count locally
        setConversations(prev => prev.map(c => c._id === activeChatId ? { ...c, unreadCount: 0 } : c));
      }
    }
  }, [activeChatId]);

  useEffect(() => {
    if (socket) {
      socket.on('new_message', ({ contact, message }) => {
        setConversations(prev => {
          const filteredPrev = prev.filter(c => !c._id.startsWith('dummy'));
          const existing = filteredPrev.find(c => c._id === contact._id);
          if (existing) {
            return filteredPrev.map(c => c._id === contact._id ? contact : c).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
          } else {
            return [contact, ...filteredPrev];
          }
        });

        if (activeChatId === contact._id) {
          setMessages(prev => [...prev, message]);
          axios.get(`http://localhost:5000/api/messages/${activeChatId}`); // To reset unread on backend
        }
      });

      socket.on('message_status', ({ messageId, status }) => {
        setMessages(prev => prev.map(m => m.messageId === messageId ? { ...m, status } : m));
      });
    }
  }, [socket, activeChatId]);

  const activeChat = conversations.find(c => c._id === activeChatId) || conversations[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const emojis = ['😀', '😂', '🥰', '😎', '🤔', '👍', '🙏', '🔥', '🎉', '💔', '🥺', '✨', '✅', '❌', '❤️', '🙌'];

  const snippets = [
    { label: 'Greeting', text: 'Hello! How can we help you today?' },
    { label: 'Order Update', text: 'Your order #{{order_id}} has been shipped and is on its way.' },
    { label: 'Payment Link', text: 'Please complete your payment using this link: {{payment_link}}' },
    { label: 'Sign-off', text: 'Thanks for reaching out! Have a great day.' },
  ];

  const handleSnippetClick = (text) => {
    setMessageText(prev => prev + (prev.length > 0 ? '\n' : '') + text);
    setShowSnippets(false);
  };

  const handleEmojiClick = (emoji) => {
    setMessageText(prev => prev + emoji);
  };

  const handleFileSelect = (e, type) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      file,
      type,
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB'
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = null;
  };

  const removeAttachment = (index) => {
    setAttachments(prev => {
      const newArr = [...prev];
      URL.revokeObjectURL(newArr[index].url);
      newArr.splice(index, 1);
      return newArr;
    });
  };

  const handleSend = async () => {
    if (!messageText.trim() && attachments.length === 0) return;
    if (!activeChatId || !activeChat) return;

    const textToSend = messageText;
    const currentAttachments = [...attachments];

    setMessageText('');
    setAttachments([]);
    setShowSnippets(false);
    setShowEmojis(false);

    if (activeChatId.startsWith('dummy')) {
      const dummyMessage = {
        _id: Date.now().toString(),
        text: textToSend,
        type: 'out',
        timestamp: new Date().toISOString(),
        status: 'sent',
        attachments: currentAttachments.map(a => ({ name: a.name, url: a.url, type: a.type, size: a.size }))
      };
      setMessages(prev => [...prev, dummyMessage]);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/messages/send', {
        contactId: activeChatId,
        phoneNumber: activeChat.phoneNumber,
        text: textToSend
      });
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6 min-h-[800px]">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 flex-shrink-0">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-slate-500 text-xs font-semibold mb-1">All Conversations</p>
            <h3 className="text-2xl font-bold text-slate-800">{conversations.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <MessageSquare size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-slate-500 text-xs font-semibold mb-1">Open</p>
            <h3 className="text-2xl font-bold text-slate-800">1</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-slate-500 text-xs font-semibold mb-1">Unread</p>
            <h3 className="text-2xl font-bold text-slate-800">{conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0)}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <span className="font-bold text-sm">{conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-slate-500 text-xs font-semibold mb-1">Pending</p>
            <h3 className="text-2xl font-bold text-slate-800">1</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-xs font-semibold mb-1">Response Time</p>
            <h3 className="text-xl font-bold text-slate-800 mb-0.5">0s</h3>
            <p className="text-[10px] text-slate-400">Avg. response time</p>
          </div>
          <div className="h-8 w-20 flex items-center justify-center overflow-hidden">
            <LineChart width={80} height={32} data={responseTimeData}>
              <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </div>
        </div>
      </div>

      {/* Main 3 Columns */}
      <div className="flex-1 flex gap-6 h-[calc(100vh-250px)] min-h-[600px]">

        {/* Left Column - Conversations List */}
        <div className="w-[320px] bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Conversations</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full whitespace-nowrap border border-green-200">
                All <span className="bg-green-500 text-white px-1.5 py-0.5 rounded-full text-[10px] ml-1">{conversations.length}</span>
              </button>
              <button className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-full whitespace-nowrap border border-slate-200 hover:bg-slate-100">
                Unread <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px] ml-1">{conversations.filter(c => c.unreadCount > 0).length}</span>
              </button>
              <button className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-full whitespace-nowrap border border-slate-200 hover:bg-slate-100">
                Open <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px] ml-1">1</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => setActiveChatId(conv._id)}
                className={`flex items-start gap-3 p-4 cursor-pointer transition-all border-b border-slate-50 ${activeChatId === conv._id ? 'bg-green-50/50 border-l-4 border-green-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
              >
                <div className="relative">
                  {conv.profilePicture ? (
                    <img src={conv.profilePicture} alt={conv.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shadow-sm`}>
                      {conv.name ? conv.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  {conv.status === 'online' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                      <Check size={10} strokeWidth={3} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className="font-semibold text-slate-800 text-sm truncate">{conv.name}</h4>
                    <span className={`text-[10px] font-medium ${conv.unreadCount > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                      {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100 flex justify-center">
            <button className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1.5">
              Load more <RotateCw size={12} />
            </button>
          </div>
        </div>

        {/* Middle Column - Chat Window */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col relative overflow-hidden">
          {/* WhatsApp Chat Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }}></div>

          {/* Chat Header */}
          {activeChat ? (
            <>
              <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between relative z-10 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {activeChat.profilePicture ? (
                      <img src={activeChat.profilePicture} alt={activeChat.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shadow-md`}>
                        {activeChat.name ? activeChat.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${activeChat.status === 'online' ? 'bg-green-500' : 'bg-slate-300'} border-2 border-white rounded-full`}></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-tight">{activeChat.name}</h3>
                    <p className="text-[10px] text-slate-500 font-medium tracking-tight uppercase flex items-center gap-1">
                      {activeChat.phoneNumber} • <span className={activeChat.status === 'online' ? 'text-green-600' : 'text-slate-400'}>{activeChat.status}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all"><Tag size={16} /></button>
                  <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all"><Star size={16} /></button>
                  <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all"><CheckCircle2 size={16} /></button>
                  <div className="w-px h-4 bg-slate-200 mx-1"></div>
                  <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all"><MoreVertical size={18} /></button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10 scroll-smooth">
                <div className="flex justify-center mb-6">
                  <span className="bg-white border border-slate-200 px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-500 shadow-sm uppercase tracking-widest">
                    Today
                  </span>
                </div>

                {messages.map((msg) => (
                  <div
                    key={msg._id || msg.messageId || Math.random()}
                    className={`flex items-end gap-2 max-w-[85%] ${msg.type === 'out' ? 'ml-auto flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                  >
                    <div className={`p-3 rounded-2xl shadow-sm text-sm ${msg.type === 'in'
                      ? 'bg-white border border-slate-100 rounded-bl-sm text-slate-800'
                      : 'bg-[#dcf8c6] border border-[#c4ebb0] rounded-br-sm text-slate-800 pr-8 relative'
                      }`}>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-2 space-y-2">
                          {msg.attachments.map((att, i) => (
                            <div key={i} className="rounded-lg overflow-hidden border border-black/5 bg-white/50 p-1">
                              {att.type === 'image' ? (
                                <img src={att.url} alt="att" className="w-full max-h-48 object-cover rounded-md" />
                              ) : (
                                <div className="flex items-center gap-3 p-2">
                                  <div className="w-8 h-8 rounded bg-blue-500 text-white flex items-center justify-center">
                                    <ImageIcon size={16} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold truncate">{att.name}</p>
                                    <p className="text-[8px] opacity-60">{att.size}</p>
                                  </div>
                                  <Download size={14} className="text-slate-400" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {msg.type === 'out' && (
                        <span className={`absolute bottom-1.5 right-1.5 ${msg.status === 'read' ? 'text-blue-500' : 'text-slate-400'}`}>
                          {msg.status === 'sent' || msg.status === 'pending' ? <Check size={12} /> : <CheckCheck size={12} />}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 mb-1 font-medium">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Area */}
              <div className="bg-white border-t border-slate-200 p-4 relative z-20 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-6 mb-3 px-2">
                  <button className="text-xs font-bold text-green-600 border-b-2 border-green-600 pb-1.5">Reply</button>
                  <button className="text-xs font-bold text-slate-400 hover:text-slate-600 pb-1.5">Internal Note</button>
                </div>

                <div className="flex items-end gap-3">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-green-500/10 focus-within:border-green-500 transition-all flex flex-col overflow-hidden">
                    {attachments.length > 0 && (
                      <div className="p-3 border-b border-slate-200 flex gap-2 flex-wrap bg-white/80 backdrop-blur-sm">
                        {attachments.map((att, idx) => (
                          <div key={idx} className="relative group bg-white border border-slate-200 rounded-xl p-2 flex items-center gap-2 pr-8 shadow-sm">
                            {att.type === 'image' ? (
                              <img src={att.url} alt="p" className="w-10 h-10 object-cover rounded-lg" />
                            ) : (
                              <div className="w-10 h-10 bg-blue-50 text-blue-500 flex items-center justify-center rounded-lg"><ImageIcon size={18} /></div>
                            )}
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-slate-700 truncate max-w-[80px]">{att.name}</p>
                              <p className="text-[8px] text-slate-400">{att.size}</p>
                            </div>
                            <button onClick={() => removeAttachment(idx)} className="absolute top-1 right-1 p-1 text-slate-400 hover:text-red-500 transition-colors"><X size={14} /></button>
                          </div>
                        ))}
                      </div>
                    )}

                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Type your message here..."
                      className="w-full max-h-[150px] min-h-[50px] p-4 text-sm bg-transparent outline-none resize-none font-medium text-slate-700"
                      rows="1"
                    ></textarea>

                    <div className="flex items-center justify-between px-4 pb-3 pt-1 relative">
                      <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => handleFileSelect(e, 'document')} />
                      <input type="file" ref={imageInputRef} className="hidden" multiple accept="image/*,video/*" onChange={(e) => handleFileSelect(e, 'image')} />

                      <div className="flex items-center gap-1.5">
                        <div className="relative">
                          <button
                            onClick={() => { setShowEmojis(!showEmojis); setShowSnippets(false); }}
                            className={`p-2 rounded-xl transition-all ${showEmojis ? 'bg-green-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-700'}`}
                          >
                            <Smile size={20} />
                          </button>
                          {showEmojis && (
                            <div className="absolute bottom-full left-0 mb-4 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-3 grid grid-cols-6 gap-2 animate-in slide-in-from-bottom-2">
                              {emojis.map((emoji, idx) => (
                                <button key={idx} onClick={() => handleEmojiClick(emoji)} className="text-xl hover:scale-125 transition-transform p-1">{emoji}</button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button onClick={() => imageInputRef.current?.click()} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 transition-all"><ImageIcon size={20} /></button>
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 transition-all"><Paperclip size={20} /></button>

                        <div className="relative">
                          <button
                            onClick={() => { setShowSnippets(!showSnippets); setShowEmojis(false); }}
                            className={`p-2 rounded-xl transition-all ${showSnippets ? 'bg-green-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-200'}`}
                          >
                            <Code size={20} />
                          </button>
                          {showSnippets && (
                            <div className="absolute bottom-full left-0 mb-4 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-2">
                              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Quick Snippets</p>
                                <button onClick={() => setShowSnippets(false)}><X size={14} /></button>
                              </div>
                              <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                                {snippets.map((snip, i) => (
                                  <button key={i} onClick={() => handleSnippetClick(snip.text)} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-200">
                                    <p className="text-xs font-bold text-slate-800 mb-0.5">{snip.label}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{snip.text}</p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <button onClick={handleSend} className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center gap-2 group">
                        Send <Send size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 font-medium bg-slate-50">
              Select a conversation to start chatting
            </div>
          )}
        </div>

        {/* Right Column - Contact Details */}
        <div className="w-[300px] bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col flex-shrink-0 overflow-hidden">
          {activeChat ? (
            <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 shadow-sm">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Profile Insight</h3>
                <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><Settings size={16} /></button>
              </div>

              <div className="p-8 flex flex-col items-center text-center border-b border-slate-100 bg-slate-50/30">
                <div className="relative mb-4">
                  {activeChat.profilePicture ? (
                    <img src={activeChat.profilePicture} alt={activeChat.name} className="w-20 h-20 rounded-3xl object-cover shadow-xl border-2 border-white" />
                  ) : (
                    <div className={`w-20 h-20 rounded-3xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-3xl shadow-xl border-2 border-white`}>
                      {activeChat.name ? activeChat.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-lg">
                    <div className={`w-4 h-4 rounded-full ${activeChat.status === 'online' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  </div>
                </div>
                <h4 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
                  {activeChat.name}
                  <CheckCircle2 size={16} className="text-blue-500" />
                </h4>
                <p className="text-slate-500 text-sm font-medium mt-1">{activeChat.phoneNumber}</p>
                <div className="flex gap-2 mt-4">
                  <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"><Phone size={16} /></button>
                  <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"><Mail size={16} /></button>
                  <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"><ExternalLink size={16} /></button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Information Sections */}
                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" /> Core Identity
                  </h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 font-medium">Email</span>
                      <span className="text-[11px] font-bold text-slate-800 truncate max-w-[120px]">{activeChat.details?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 font-medium">Location</span>
                      <span className="text-[11px] font-bold text-slate-800">{activeChat.details?.location || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Tag size={14} className="text-purple-500" /> Active Tags
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {(activeChat.tags || activeChat.details?.tags || []).map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-lg border border-purple-100">{tag}</span>
                    ))}
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-600 transition-all">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {(activeChat.details?.orders || []).length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Commerce</h5>
                      <button className="text-[10px] font-bold text-blue-600">All</button>
                    </div>
                    <div className="space-y-3">
                      {activeChat.details.orders.map((order) => (
                        <div key={order.id} className="p-3 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white transition-all cursor-pointer group">
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[10px] font-bold text-slate-800">{order.id}</span>
                            <span className="text-[9px] font-bold text-emerald-600 px-1.5 py-0.5 bg-emerald-50 rounded-md border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-colors">{order.status}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 font-medium mb-2">{order.item}</p>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400 font-medium">{order.date}</span>
                            <span className="font-bold text-slate-800">{order.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-slate-50"></div>
          )}
        </div>

      </div>
    </div>
  );
}
