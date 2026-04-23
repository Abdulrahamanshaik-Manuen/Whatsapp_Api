import React, { useState } from 'react';
import {
  Search, Filter, MoreVertical, Paperclip, Smile, Settings, Code,
  Check, CheckCheck, Clock, Tag, Plus, ChevronDown, ChevronUp, Send,
  MessageSquare, Star, CheckCircle2, RotateCw, Image as ImageIcon
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const responseTimeData = [
  { val: 20 }, { val: 40 }, { val: 30 }, { val: 50 }, { val: 35 }, { val: 60 }, { val: 45 }
];

export default function InboxPage() {
  const [activeChat, setActiveChat] = useState('Rahul Sharma');
  const [messageText, setMessageText] = useState('');
  const [showSnippets, setShowSnippets] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = React.useRef(null);
  const imageInputRef = React.useRef(null);

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
      name: file.name
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
            <h3 className="text-2xl font-bold text-slate-800">1,248</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <MessageSquare size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-slate-500 text-xs font-semibold mb-1">Open</p>
            <h3 className="text-2xl font-bold text-slate-800">128</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-slate-500 text-xs font-semibold mb-1">Unread</p>
            <h3 className="text-2xl font-bold text-slate-800">12</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <span className="font-bold text-sm">12</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-slate-500 text-xs font-semibold mb-1">Pending</p>
            <h3 className="text-2xl font-bold text-slate-800">18</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
             <p className="text-slate-500 text-xs font-semibold mb-1">Response Time</p>
             <h3 className="text-xl font-bold text-slate-800 mb-0.5">2m 45s</h3>
             <p className="text-[10px] text-slate-400">Avg. response time</p>
          </div>
          <div className="h-8 w-20">
            <ResponsiveContainer width="100%" height="100%">
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
                placeholder="Search by name or number..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-green-200">
                All <span className="bg-green-500 text-white px-1.5 py-0.5 rounded-full text-[10px]">12</span>
              </button>
              <button className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-full flex items-center gap-1.5 border border-slate-200 hover:bg-slate-100">
                Unread <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px]">12</span>
              </button>
              <button className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-full flex items-center gap-1.5 border border-slate-200 hover:bg-slate-100">
                Open <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px]">128</span>
              </button>
              <button className="ml-auto w-7 h-7 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-md border border-slate-200">
                <Filter size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Active Chat Item */}
            <div className="flex items-start gap-3 p-4 bg-green-50/50 border-l-4 border-green-500 cursor-pointer">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                  R
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                   <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                   </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="font-semibold text-slate-800 text-sm truncate">Rahul Sharma</h4>
                  <span className="text-xs text-green-600 font-medium">11:30 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-600 truncate">Hi, I need help with my order</p>
                  <span className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</span>
                </div>
              </div>
            </div>

            {/* Chat Item */}
            <div className="flex items-start gap-3 p-4 hover:bg-slate-50 cursor-pointer border-l-4 border-transparent border-b border-slate-50">
              <div className="relative">
                <img src="https://i.pravatar.cc/150?img=32" alt="Priya" className="w-10 h-10 rounded-full object-cover" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                   <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                   </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="font-semibold text-slate-800 text-sm truncate">Priya Patel</h4>
                  <span className="text-xs text-slate-400">11:28 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500 truncate">When will my order be delivered?</p>
                  <span className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
                </div>
              </div>
            </div>

            {/* Chat Item */}
            <div className="flex items-start gap-3 p-4 hover:bg-slate-50 cursor-pointer border-l-4 border-transparent border-b border-slate-50">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-sm">
                  A
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                   <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                   </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="font-semibold text-slate-800 text-sm truncate">Amit Verma</h4>
                  <span className="text-xs text-slate-400">11:25 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500 truncate">Thank you so much! 🙏</p>
                </div>
              </div>
            </div>

            {/* Chat Item */}
            <div className="flex items-start gap-3 p-4 hover:bg-slate-50 cursor-pointer border-l-4 border-transparent border-b border-slate-50">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                  S
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                   <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                   </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="font-semibold text-slate-800 text-sm truncate">Sneha Reddy</h4>
                  <span className="text-xs text-slate-400">11:20 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500 truncate italic">I have a question about pricing</p>
                  <span className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</span>
                </div>
              </div>
            </div>
            
             {/* Chat Item */}
             <div className="flex items-start gap-3 p-4 hover:bg-slate-50 cursor-pointer border-l-4 border-transparent border-b border-slate-50">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                  V
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="font-semibold text-slate-800 text-sm truncate">Vikram Singh</h4>
                  <span className="text-xs text-slate-400">11:15 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500 truncate italic">Please call me back</p>
                </div>
              </div>
            </div>

            {/* Chat Item */}
            <div className="flex items-start gap-3 p-4 hover:bg-slate-50 cursor-pointer border-l-4 border-transparent border-b border-slate-50">
              <div className="relative">
                <img src="https://i.pravatar.cc/150?img=47" alt="Anjali" className="w-10 h-10 rounded-full object-cover" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                   <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                   </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="font-semibold text-slate-800 text-sm truncate">Anjali Mehta</h4>
                  <span className="text-xs text-slate-400">11:10 AM</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500 truncate">Thanks for the quick response</p>
                </div>
              </div>
            </div>

          </div>
          <div className="p-3 border-t border-slate-100 flex justify-center">
             <button className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1.5">
               Load more conversations <RotateCw size={12} />
             </button>
          </div>
        </div>

        {/* Middle Column - Chat Window */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col relative overflow-hidden">
           {/* WhatsApp Chat Background Pattern */}
           <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: '400px' }}></div>
           
           {/* Chat Header */}
           <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between relative z-10">
             <div className="flex items-center gap-3">
               <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                    R
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                     <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-2.5 h-2.5">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                     </svg>
                  </div>
               </div>
               <div>
                 <h3 className="font-bold text-slate-800 leading-tight">Rahul Sharma</h3>
                 <p className="text-xs text-slate-500">+91 98765 43210</p>
               </div>
             </div>
             <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full border border-slate-200 bg-white">
                  <Tag size={14} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full border border-slate-200 bg-white">
                  <Star size={14} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full border border-slate-200 bg-white">
                  <CheckCircle2 size={14} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full border border-transparent bg-white ml-1">
                  <MoreVertical size={18} />
                </button>
             </div>
           </div>

           {/* Chat Messages */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
              <div className="flex justify-center mb-6">
                <span className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-[11px] font-medium text-slate-500 shadow-sm">
                  Today
                </span>
              </div>

              {/* Inbound Message */}
              <div className="flex items-end gap-2 max-w-[80%]">
                 <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-3 shadow-sm text-sm text-slate-800">
                    Hi
                 </div>
                 <span className="text-[10px] text-slate-400 mb-1">11:28 AM</span>
              </div>

              {/* Inbound Message */}
              <div className="flex items-end gap-2 max-w-[80%]">
                 <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-3 shadow-sm text-sm text-slate-800">
                    I need help with my order
                 </div>
                 <span className="text-[10px] text-slate-400 mb-1">11:29 AM</span>
              </div>

              {/* Outbound Message */}
              <div className="flex items-end justify-end gap-2 max-w-[80%] ml-auto">
                 <span className="text-[10px] text-slate-400 mb-1">11:29 AM</span>
                 <div className="bg-[#dcf8c6] border border-[#c4ebb0] rounded-2xl rounded-br-sm p-3 shadow-sm text-sm text-slate-800 relative pr-8">
                    Hello Rahul! 👋
                    <span className="absolute bottom-1.5 right-1.5 text-blue-500">
                      <CheckCheck size={12} />
                    </span>
                 </div>
              </div>

              {/* Outbound Message */}
              <div className="flex items-end justify-end gap-2 max-w-[80%] ml-auto mt-1">
                 <span className="text-[10px] text-slate-400 mb-1">11:29 AM</span>
                 <div className="bg-[#dcf8c6] border border-[#c4ebb0] rounded-2xl rounded-br-sm p-3 shadow-sm text-sm text-slate-800 relative pr-8">
                    Sure, I'd be happy to help you.
                    <span className="absolute bottom-1.5 right-1.5 text-blue-500">
                      <CheckCheck size={12} />
                    </span>
                 </div>
              </div>

              {/* Inbound Message */}
              <div className="flex items-end gap-2 max-w-[80%] mt-4">
                 <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-3 shadow-sm text-sm text-slate-800">
                    I ordered a smart watch yesterday but haven't received any updates.
                 </div>
                 <span className="text-[10px] text-slate-400 mb-1">11:30 AM</span>
              </div>

              {/* Outbound Message */}
              <div className="flex items-end justify-end gap-2 max-w-[80%] ml-auto mt-4">
                 <span className="text-[10px] text-slate-400 mb-1">11:30 AM</span>
                 <div className="bg-[#dcf8c6] border border-[#c4ebb0] rounded-2xl rounded-br-sm p-3 shadow-sm text-sm text-slate-800 relative pr-8">
                    Let me check the status for you.
                    <span className="absolute bottom-1.5 right-1.5 text-blue-500">
                      <CheckCheck size={12} />
                    </span>
                 </div>
              </div>

              {/* Inbound Message */}
              <div className="flex items-end gap-2 max-w-[80%] mt-4">
                 <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm p-3 shadow-sm text-sm text-slate-800">
                    Sure, thank you!
                 </div>
                 <span className="text-[10px] text-slate-400 mb-1">11:30 AM</span>
              </div>
           </div>

           {/* Chat Input */}
           <div className="bg-white border-t border-slate-100 p-4 relative z-10">
              <div className="flex items-center gap-6 mb-3">
                 <button className="text-sm font-semibold text-green-600 border-b-2 border-green-600 pb-1">
                   Reply
                 </button>
                 <button className="text-sm font-medium text-slate-500 hover:text-slate-700 pb-1">
                   Note
                 </button>
              </div>
              <div className="flex items-end gap-3">
                 <div className="flex-1 bg-white border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-green-500/20 focus-within:border-green-500 transition-all relative flex flex-col">
                    {attachments.length > 0 && (
                      <div className="p-3 border-b border-slate-100 flex gap-2 flex-wrap bg-slate-50 rounded-t-xl">
                        {attachments.map((att, idx) => (
                          <div key={idx} className="relative group bg-white border border-slate-200 rounded-lg p-1.5 flex items-center gap-2 pr-6">
                            {att.type === 'image' ? (
                              <img src={att.url} alt="preview" className="w-8 h-8 object-cover rounded" />
                            ) : (
                              <div className="w-8 h-8 bg-blue-50 text-blue-500 flex items-center justify-center rounded">
                                <Paperclip size={16} />
                              </div>
                            )}
                            <span className="text-xs text-slate-600 max-w-[100px] truncate">{att.name}</span>
                            <button 
                              onClick={() => removeAttachment(idx)}
                              className="absolute top-1 right-1 w-4 h-4 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <textarea 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..." 
                      className={`w-full max-h-[120px] min-h-[44px] p-3 text-sm focus:outline-none resize-none ${attachments.length > 0 ? '' : 'rounded-t-xl'}`}
                      rows="1"
                    ></textarea>
                    {showSnippets && (
                      <div className="absolute bottom-[44px] left-3 mb-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-700">Quick Snippets</p>
                        </div>
                        <div className="max-h-48 overflow-y-auto p-1">
                          {snippets.map((snippet, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSnippetClick(snippet.text)}
                              className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <span className="font-bold text-slate-800 block">{snippet.label}</span>
                              <span className="text-xs text-slate-500 truncate block mt-0.5">{snippet.text}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between px-3 pb-2 pt-1 bg-slate-50 border-t border-slate-100 rounded-b-xl relative">
                       <input type="file" ref={fileInputRef} className="hidden" multiple accept="*/*" onChange={(e) => handleFileSelect(e, 'document')} />
                       <input type="file" ref={imageInputRef} className="hidden" multiple accept="image/*,video/*" onChange={(e) => handleFileSelect(e, 'image')} />
                       
                       {showEmojis && (
                         <div className="absolute bottom-[44px] left-3 mb-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-3 grid grid-cols-8 gap-1">
                           {emojis.map((emoji, idx) => (
                             <button key={idx} onClick={() => handleEmojiClick(emoji)} className="text-xl hover:bg-slate-100 rounded p-1 transition-colors">{emoji}</button>
                           ))}
                         </div>
                       )}

                       <div className="flex items-center gap-2">
                         <button 
                           onClick={() => { setShowEmojis(!showEmojis); setShowSnippets(false); }}
                           className={`p-2 rounded transition-all ${showEmojis ? 'bg-green-500 text-white shadow-md' : 'text-slate-500 hover:bg-green-500 hover:text-white'}`}
                         >
                           <Smile size={18} />
                         </button>
                         <button 
                           onClick={() => fileInputRef.current?.click()}
                           className="p-2 rounded text-slate-500 hover:bg-green-500 hover:text-white transition-all"
                         >
                           <Paperclip size={18} />
                         </button>
                         <button 
                           onClick={() => imageInputRef.current?.click()}
                           className="p-2 rounded text-slate-500 hover:bg-green-500 hover:text-white transition-all"
                         >
                           <ImageIcon size={18} />
                         </button>
                         <button 
                           onClick={() => { setShowSnippets(!showSnippets); setShowEmojis(false); }}
                           className={`p-2 rounded transition-all ${showSnippets ? 'bg-green-500 text-white shadow-md' : 'text-slate-500 hover:bg-green-500 hover:text-white'}`}
                         >
                           <Code size={18} />
                         </button>
                       </div>
                    </div>
                 </div>
                 <button onClick={handleSend} className="h-[44px] px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors flex-shrink-0 self-end mb-[42px]">
                   Send <ChevronDown size={14} />
                 </button>
              </div>
           </div>
        </div>

        {/* Right Column - Contact Details */}
        <div className="w-[300px] bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col flex-shrink-0 overflow-y-auto">
           {/* Header */}
           <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
             <h3 className="font-bold text-slate-800 text-sm">Contact Details</h3>
             <button className="text-slate-400 hover:text-slate-600">
               <ChevronUp size={16} />
             </button>
           </div>

           <div className="p-5 flex flex-col items-center border-b border-slate-100">
              <div className="w-16 h-16 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-2xl mb-3 shadow-md">
                R
              </div>
              <h4 className="font-bold text-slate-800 text-lg flex items-center gap-1.5">
                Rahul Sharma 
                <span className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px]">
                   <Check size={10} strokeWidth={3} />
                </span>
              </h4>
              <p className="text-slate-500 text-sm">+91 98765 43210</p>
           </div>

           <div className="p-4 border-b border-slate-100 text-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">First seen</span>
                <span className="text-slate-800 font-medium text-right">20 May 2025, 10:15 AM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Last seen</span>
                <span className="text-green-600 font-medium">Online</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Total conversations</span>
                <span className="text-slate-800 font-medium">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">User ID</span>
                <span className="text-slate-800 font-medium">USR_123456789</span>
              </div>
           </div>

           <div className="p-4 border-b border-slate-100">
             <div className="flex items-center justify-between mb-3">
               <h4 className="font-bold text-slate-800 text-sm">Tags</h4>
               <ChevronDown size={14} className="text-slate-400" />
             </div>
             <div className="flex flex-wrap gap-2">
               <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> VIP Customer
               </span>
               <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                  Repeat Buyer
               </span>
               <button className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-300 text-slate-400 hover:bg-slate-50">
                 <Plus size={12} />
               </button>
             </div>
           </div>

           <div className="p-4 border-b border-slate-100">
             <div className="flex items-center justify-between mb-3">
               <h4 className="font-bold text-slate-800 text-sm">Notes</h4>
               <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">Add Note</button>
             </div>
             <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <p className="text-sm text-slate-700 mb-2 leading-relaxed">
                  Interested in smart watches.<br/>
                  Prefers fast delivery.
                </p>
                <p className="text-[10px] text-slate-500">Added by Amit Kumar • 18 May 2025</p>
             </div>
           </div>

           <div className="p-4">
             <div className="flex items-center justify-between mb-4">
               <h4 className="font-bold text-slate-800 text-sm">Recent Orders</h4>
               <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
             </div>
             
             <div className="space-y-3">
               <div className="border border-slate-200 rounded-lg p-3">
                 <div className="flex justify-between items-start mb-1">
                   <span className="text-xs font-bold text-slate-800">#ORD-12345</span>
                   <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">.. Delivered</span>
                 </div>
                 <p className="text-xs text-slate-600 mb-2">Smart Watch X1</p>
                 <div className="flex justify-between items-end">
                   <span className="text-[10px] text-slate-500">20 May 2025</span>
                   <span className="text-xs font-bold text-slate-800">₹2,499</span>
                 </div>
               </div>

               <div className="border border-slate-200 rounded-lg p-3">
                 <div className="flex justify-between items-start mb-1">
                   <span className="text-xs font-bold text-slate-800">#ORD-12312</span>
                   <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Processing</span>
                 </div>
                 <p className="text-xs text-slate-600 mb-2">Wireless Earbuds</p>
                 <div className="flex justify-between items-end">
                   <span className="text-[10px] text-slate-500">18 May 2025</span>
                   <span className="text-xs font-bold text-slate-800">₹1,299</span>
                 </div>
               </div>
             </div>
           </div>

        </div>

      </div>
    </div>
  );
}
