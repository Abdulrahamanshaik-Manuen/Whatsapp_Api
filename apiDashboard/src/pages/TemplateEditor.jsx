import React, { useState, useRef } from 'react';
import {
    Image as ImageIcon,
    FileText,
    Video,
    Type,
    Plus,
    Trash2,
    Smartphone,
    PhoneCall,
    Globe,
    MessageSquare,
    ArrowLeft,
    MoreVertical,
    UploadCloud,
    PlayCircle,
    Music,
} from 'lucide-react';
import axios from 'axios';

export default function TemplateEditor() {
    const [templateName, setTemplateName] = useState('template_1');
    const [category, setCategory] = useState('Utility');
    const [language, setLanguage] = useState('English');

    const [headerType, setHeaderType] = useState('Image');
    const [headerFile, setHeaderFile] = useState(null);
    const [headerPreview, setHeaderPreview] = useState('https://images.unsplash.com/photo-1580828369062-850d9841f3e9?auto=format&fit=crop&q=80&w=400');

    const [bodyText, setBodyText] = useState('Hello {{1}}');
    const [footerText, setFooterText] = useState('1');

    const [buttons, setButtons] = useState([
        { id: 1, type: 'url', text: '1', url: 'https://example.com/1' },
        { id: 2, type: 'call', text: '1', phone: '+1' }
    ]);

    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setHeaderFile(file);
            setHeaderPreview(URL.createObjectURL(file));
        }
    };

    const handleAddButton = (type) => {
        if (buttons.length >= 3) return; // WhatsApp limit is usually 3
        const newBtn = { id: Date.now(), type, text: type === 'url' ? 'Visit Website' : type === 'call' ? 'Call Us' : 'Quick Reply' };
        setButtons([...buttons, newBtn]);
    };

    const removeButton = (id) => {
        setButtons(buttons.filter(b => b.id !== id));
    };

    // Helper to highlight variables in text
    const renderFormattedBody = (text) => {
        if (!text) return null;
        const parts = text.split(/(\{\{\d+\}\})/g);
        return parts.map((part, i) => {
            if (part.match(/\{\{\d+\}\}/)) {
                return <span key={i} className="bg-emerald-100 text-emerald-800 px-1 rounded font-mono text-xs">{part}</span>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto pb-12">
            {/* Left Column - Form */}
            <div className="flex-1 space-y-6">

                {/* Basic Info Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Template Details</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Template Name</label>
                            <input
                                type="text"
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                                placeholder="e.g. order_update_v1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
                                >
                                    <option>Utility</option>
                                    <option>Marketing</option>
                                    <option>Authentication</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Language</label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
                                >
                                    <option>English</option>
                                    <option>Spanish</option>
                                    <option>Hindi</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Configuration Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Message Content</h3>

                    {/* Header Type */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Header Type</label>
                        <div className="flex flex-wrap gap-2">
                            {['Text', 'Image', 'Video', 'Audio', 'Document'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        setHeaderType(type);
                                        if (type !== 'Image' && type !== 'Video' && type !== 'Audio') setHeaderPreview(null);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${headerType === type
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    {type === 'Text' && <Type size={16} />}
                                    {type === 'Image' && <ImageIcon size={16} />}
                                    {type === 'Video' && <Video size={16} />}
                                    {type === 'Audio' && <Music size={16} />}
                                    {type === 'Document' && <FileText size={16} />}
                                    {type}
                                </button>
                            ))}
                        </div>

                        {headerType !== 'Text' && (
                            <div className="mt-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept={
                                        headerType === 'Image' ? "image/*" :
                                            headerType === 'Video' ? "video/*" :
                                                headerType === 'Audio' ? "audio/*" :
                                                    ".pdf,.doc,.docx"
                                    }
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-emerald-400 hover:text-emerald-600 transition-colors"
                                >
                                    <UploadCloud size={24} className="mb-2" />
                                    <span className="text-sm font-medium">Click to upload {headerType.toLowerCase()}</span>
                                    <span className="text-xs text-slate-400 mt-1">{headerFile ? headerFile.name : 'No file chosen'}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Body */}
                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-1.5">
                            <label className="block text-sm font-semibold text-slate-700">Message Body</label>
                            <span className="text-xs text-slate-400">{bodyText.length} / 1024 Characters</span>
                        </div>
                        <textarea
                            value={bodyText}
                            onChange={(e) => setBodyText(e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[120px] resize-y"
                            placeholder="Enter message text... Use {{1}}, {{2}} for variables."
                        ></textarea>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <span className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-600">Tip:</span> Use {'{{1}}'}, {'{{2}}'} to insert dynamic variables.
                        </p>
                    </div>

                    {/* Footer */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Footer Text <span className="text-xs font-normal text-slate-400">(Optional)</span></label>
                        <input
                            type="text"
                            value={footerText}
                            onChange={(e) => setFooterText(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            placeholder="e.g. Thank you for shopping with us!"
                        />
                    </div>
                </div>

                {/* Buttons Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-800">Interactive Buttons</h3>
                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{buttons.length}/3 Added</span>
                    </div>

                    <div className="space-y-3 mb-4">
                        {buttons.map((btn, idx) => (
                            <div key={btn.id} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                                    {btn.type === 'url' ? <Globe size={16} /> : btn.type === 'call' ? <PhoneCall size={16} /> : <MessageSquare size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <input
                                        type="text"
                                        value={btn.text}
                                        onChange={(e) => {
                                            const newBtns = [...buttons];
                                            newBtns[idx].text = e.target.value;
                                            setButtons(newBtns);
                                        }}
                                        className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none placeholder-slate-400"
                                        placeholder="Button Text"
                                    />
                                    <p className="text-xs text-slate-500 truncate mt-0.5">{btn.type === 'url' ? btn.url : btn.type === 'call' ? btn.phone : 'Quick Reply Action'}</p>
                                </div>
                                <button onClick={() => removeButton(btn.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleAddButton('reply')}
                            disabled={buttons.length >= 3}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={16} /> Quick Reply
                        </button>
                        <button
                            onClick={() => handleAddButton('url')}
                            disabled={buttons.length >= 3}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={16} /> URL Button
                        </button>
                        <button
                            onClick={() => handleAddButton('call')}
                            disabled={buttons.length >= 3}
                            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={16} /> Call Button
                        </button>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-colors shadow-sm">
                        Save Draft
                    </button>
                    <button 
                        onClick={async () => {
                            const templateData = {
                                name: templateName,
                                category: category,
                                language: language,
                                components: [
                                    { type: 'HEADER', format: headerType.toUpperCase() },
                                    { type: 'BODY', text: bodyText },
                                    ...(footerText ? [{ type: 'FOOTER', text: footerText }] : []),
                                    ...(buttons.length > 0 ? [{ type: 'BUTTONS', buttons: buttons.map(b => ({ type: b.type.toUpperCase(), text: b.text, url: b.url, phoneNumber: b.phone })) }] : [])
                                ],
                                status: 'pending'
                            };
                            try {
                                await axios.post('http://localhost:5000/api/templates', templateData);
                                alert("Template submitted successfully!");
                            } catch (error) {
                                console.error("Failed to submit template:", error);
                                alert("Error submitting template.");
                            }
                        }}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm flex-1 sm:flex-none">
                        Submit for Approval
                    </button>
                </div>
            </div>

            {/* Right Column - Live Preview */}
            <div className="w-full lg:w-[400px] flex-shrink-0 -mt-8">
                <div className="sticky top-1">

                    {/* Phone Mockup Frame */}
                    <div className="relative w-[280px] h-[560px] mx-auto bg-slate-900 rounded-[2.5rem] border-[6px] border-slate-900 shadow-2xl overflow-hidden flex flex-col">
                        {/* Notch */}
                        <div className="absolute top-0 inset-x-0 h-5 bg-slate-900 rounded-b-xl w-24 mx-auto z-20"></div>

                        {/* WhatsApp Header */}
                        <div className="bg-[#075E54] text-white px-3 py-2 flex items-center gap-2 z-10 pt-6">
                            <ArrowLeft size={20} />
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=100" alt="Brand" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm leading-tight">YourBrand</h4>
                                <p className="text-[10px] text-emerald-100">Official Business Account</p>
                            </div>
                            <MoreVertical size={20} />
                        </div>

                        {/* Chat Background */}
                        <div className="flex-1 bg-[#ECE5DD] relative p-4 overflow-y-auto">
                            {/* Pattern overlay */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")', backgroundSize: '400px' }}></div>

                            {/* Message Bubble */}
                            <div className="bg-white rounded-lg rounded-tl-none shadow-sm max-w-[90%] relative z-10 overflow-hidden mt-2">

                                {/* Header Preview */}
                                {headerType === 'Image' && headerPreview && (
                                    <div className="p-1">
                                        <img src={headerPreview} alt="Header" className="w-full h-36 object-cover rounded shadow-sm" />
                                    </div>
                                )}
                                {headerType === 'Video' && (
                                    <div className="p-1">
                                        {headerPreview ? (
                                            <video
                                                src={headerPreview}
                                                className="w-full h-36 object-cover rounded shadow-sm"
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                            />
                                        ) : (
                                            <div className="w-full h-36 bg-slate-800 rounded shadow-sm flex items-center justify-center relative">
                                                <PlayCircle size={40} className="text-white opacity-80" />
                                            </div>
                                        )}
                                    </div>
                                )}
                                {headerType === 'Audio' && (
                                    <div className="p-2">
                                        {headerPreview ? (
                                            <div className="bg-emerald-50 p-3 rounded flex items-center gap-3 border border-emerald-100">
                                                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                                                    <PlayCircle size={18} />
                                                </div>
                                                <div className="flex-1 h-1 bg-emerald-200 rounded-full relative">
                                                    <div className="absolute left-0 top-0 h-full w-1/3 bg-emerald-500 rounded-full"></div>
                                                </div>
                                                <span className="text-[10px] font-medium text-emerald-600">0:12</span>
                                            </div>
                                        ) : (
                                            <div className="w-full h-12 bg-slate-100 rounded shadow-sm flex items-center justify-center relative border border-slate-200">
                                                <Music size={20} className="text-slate-400" />
                                            </div>
                                        )}
                                    </div>
                                )}
                                {headerType === 'Document' && (
                                    <div className="p-2 mx-1 mt-1 bg-slate-100 rounded flex items-center gap-3 border border-slate-200">
                                        <div className="w-8 h-8 bg-red-100 text-red-500 rounded flex items-center justify-center"><FileText size={16} /></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-700 truncate">document.pdf</p>
                                            <p className="text-xs text-slate-500">1.2 MB</p>
                                        </div>
                                    </div>
                                )}

                                {/* Body Text */}
                                <div className="px-3 py-2 text-[13px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                                    {renderFormattedBody(bodyText)}
                                </div>

                                {/* Footer Text */}
                                {footerText && (
                                    <div className="px-3 pb-2 text-[11px] text-slate-500">
                                        {footerText}
                                    </div>
                                )}

                                {/* Time */}
                                <div className="px-3 pb-2 text-[10px] text-slate-400 text-right w-full block">
                                    10:42 AM
                                </div>
                            </div>

                            {/* Buttons Preview */}
                            {buttons.length > 0 && (
                                <div className="flex flex-col gap-0.5 mt-1 max-w-[90%] relative z-10">
                                    {buttons.map((btn) => (
                                        <div key={btn.id} className="bg-white py-2.5 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 text-[13px] font-semibold text-[#00A884]">
                                            {btn.type === 'url' ? <Globe size={14} /> : btn.type === 'call' ? <PhoneCall size={14} /> : null}
                                            {btn.text}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
