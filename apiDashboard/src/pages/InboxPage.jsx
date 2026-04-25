import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Filter, MoreVertical, Paperclip, Smile, Settings, Code,
  Check, CheckCheck, Clock, Tag, Plus, ChevronDown, ChevronUp, Send,
  MessageSquare, Star, CheckCircle2, RotateCw, Image as ImageIcon,
  X, MapPin, Mail, Phone, ExternalLink, Calendar, ShieldCheck, Download
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const responseTimeData = [
  { val: 20 }, { val: 40 }, { val: 30 }, { val: 50 }, { val: 35 }, { val: 60 }, { val: 45 }
];

export default function InboxPage() {
  const [activeChatId, setActiveChatId] = useState(1);
  const [messageText, setMessageText] = useState('');
  const [showSnippets, setShowSnippets] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      status: 'online',
      initials: 'R',
      color: 'bg-purple-500',
      unread: 0,
      time: '11:30 AM',
      lastMessage: '',
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
      id: 2,
      name: 'Priya Patel',
      phone: '+91 88888 77777',
      status: 'online',
      initials: 'P',
      color: 'bg-rose-500',
      unread: 0,
      time: '11:28 AM',
      lastMessage: '',
      messages: [],
      details: {
        email: 'priya.p@outlook.com',
        location: 'Ahmedabad, India',
        joined: '15 June 2023',
        tags: ['New Customer'],
        orders: []
      }
    },
    {
      id: 3,
      name: 'Amit Verma',
      phone: '+91 77777 66666',
      status: 'online',
      initials: 'A',
      color: 'bg-teal-500',
      unread: 0,
      time: '11:25 AM',
      lastMessage: '',
      messages: [],
      details: {
        email: 'amit.v@yahoo.com',
        location: 'Delhi, India',
        joined: '02 Feb 2024',
        tags: ['Support Active'],
        orders: []
      }
    }
  ]);

  const activeChat = conversations.find(c => c.id === activeChatId) || conversations[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat.messages]);

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

  const handleSend = () => {
    if (!messageText.trim() && attachments.length === 0) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newOutboundMessage = {
      id: Date.now(),
      text: messageText,
      type: 'out',
      time: currentTime,
      status: 'sent',
      attachments: attachments.map(a => ({ name: a.name, url: a.url, type: a.type, size: a.size }))
    };

    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeChatId) {
        return {
          ...conv,
          messages: [...conv.messages, newOutboundMessage],
          lastMessage: messageText || (attachments.length > 0 ? 'Attachment' : ''),
          time: currentTime,
          unread: 0
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setMessageText('');
    setAttachments([]);
    setShowSnippets(false);
    setShowEmojis(false);
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
            <h3 className="text-2xl font-bold text-slate-800">{conversations.reduce((acc, curr) => acc + curr.unread, 0)}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <span className="font-bold text-sm">{conversations.reduce((acc, curr) => acc + curr.unread, 0)}</span>
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
          <div className="h-8 w-20">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={responseTimeData}>
                <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
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
                Unread <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px] ml-1">{conversations.filter(c => c.unread > 0).length}</span>
              </button>
              <button className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-full whitespace-nowrap border border-slate-200 hover:bg-slate-100">
                Open <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px] ml-1">1</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => setActiveChatId(conv.id)}
                className={`flex items-start gap-3 p-4 cursor-pointer transition-all border-b border-slate-50 ${activeChatId === conv.id ? 'bg-green-50/50 border-l-4 border-green-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
              >
                <div className="relative">
                  {conv.image ? (
                    <img src={conv.image} alt={conv.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full ${conv.color} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                      {conv.initials}
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
                    <span className={`text-[10px] font-medium ${conv.unread > 0 ? 'text-green-600' : 'text-slate-400'}`}>{conv.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs truncate ${conv.unread > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">
                        {conv.unread}
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
           <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between relative z-10 shadow-sm">
             <div className="flex items-center gap-3">
               <div className="relative">
                  {activeChat.image ? (
                    <img src={activeChat.image} alt={activeChat.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className={`w-10 h-10 rounded-full ${activeChat.color} text-white flex items-center justify-center font-bold text-sm shadow-md`}>
                      {activeChat.initials}
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${activeChat.status === 'online' ? 'bg-green-500' : 'bg-slate-300'} border-2 border-white rounded-full`}></div>
               </div>
               <div>
                 <h3 className="font-bold text-slate-800 leading-tight">{activeChat.name}</h3>
                 <p className="text-[10px] text-slate-500 font-medium tracking-tight uppercase flex items-center gap-1">
                   {activeChat.phone} • <span className={activeChat.status === 'online' ? 'text-green-600' : 'text-slate-400'}>{activeChat.status}</span>
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

              {activeChat.messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex items-end gap-2 max-w-[85%] ${msg.type === 'out' ? 'ml-auto flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div className={`p-3 rounded-2xl shadow-sm text-sm ${
                    msg.type === 'in' 
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
                        {msg.status === 'sent' ? <Check size={12} /> : <CheckCheck size={12} />}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mb-1 font-medium">{msg.time}</span>
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
        </div>

        {/* Right Column - Contact Details */}
        <div className="w-[300px] bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col flex-shrink-0 overflow-hidden">
           <div className="flex-1 overflow-y-auto">
             {/* Header */}
             <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 shadow-sm">
               <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Profile Insight</h3>
               <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><Settings size={16} /></button>
             </div>

             <div className="p-8 flex flex-col items-center text-center border-b border-slate-100 bg-slate-50/30">
                <div className="relative mb-4">
                  {activeChat.image ? (
                    <img src={activeChat.image} alt={activeChat.name} className="w-20 h-20 rounded-3xl object-cover shadow-xl border-2 border-white" />
                  ) : (
                    <div className={`w-20 h-20 rounded-3xl ${activeChat.color} text-white flex items-center justify-center font-bold text-3xl shadow-xl border-2 border-white`}>
                      {activeChat.initials}
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
                <p className="text-slate-500 text-sm font-medium mt-1">{activeChat.phone}</p>
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
                        <span className="text-[11px] font-bold text-slate-800 truncate max-w-[120px]">{activeChat.details.email}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[11px] text-slate-500 font-medium">Location</span>
                        <span className="text-[11px] font-bold text-slate-800">{activeChat.details.location}</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Tag size={14} className="text-purple-500" /> Active Tags
                   </h5>
                   <div className="flex flex-wrap gap-2">
                      {activeChat.details.tags.map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-lg border border-purple-100">{tag}</span>
                      ))}
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:bg-white hover:text-slate-600 transition-all">
                        <Plus size={14} />
                      </button>
                   </div>
                </div>

                {activeChat.details.orders.length > 0 && (
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
           
           <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <span className="text-[11px] font-medium">Session ends in 12h 45m</span>
              </div>
              <button className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300">Extend</button>
           </div>
        </div>

      </div>
    </div>
  );
}
