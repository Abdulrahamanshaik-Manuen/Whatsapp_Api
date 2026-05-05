import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, Copy, Plus, Trash2, ExternalLink, User, AlertTriangle, Wifi } from 'lucide-react';
import axios from 'axios';

export default function QRCapturePage() {
    const [qrs, setQrs] = useState([
        { id: '1', name: 'Main Office', refId: 'main-office', createdAt: new Date().toISOString() },
        { id: '2', name: 'Event - May 2026', refId: 'event-may', createdAt: new Date().toISOString() }
    ]);
    const [newName, setNewName] = useState('');
    const [userId, setUserId] = useState('amit_sharma');
    const [serverIp, setServerIp] = useState(window.location.origin);
    const [detectedIp, setDetectedIp] = useState('');
    const [showNewModal, setShowNewModal] = useState(false);

    useEffect(() => {
        const fetchIp = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/system/ip');
                if (response.data.ip && response.data.ip !== '127.0.0.1') {
                    setDetectedIp(`http://${response.data.ip}:3000`);
                    // If current serverIp is localhost, suggest the detected one
                    if (serverIp.includes('localhost')) {
                        console.log('Detected local IP:', response.data.ip);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch system IP:', err);
            }
        };
        fetchIp();
    }, []);

    const handleCreate = () => {
        if (!newName) return;
        const refId = newName.toLowerCase().replace(/\s+/g, '-');
        const newQR = {
            id: Date.now().toString(),
            name: newName,
            refId: refId,
            createdAt: new Date().toISOString()
        };
        setQrs([newQR, ...qrs]);
        setNewName('');
        setShowNewModal(false);
    };

    const handleDelete = (id) => {
        setQrs(qrs.filter(qr => qr.id !== id));
    };

    const downloadQR = (refId, name) => {
        const svg = document.getElementById(`qr-canvas-${refId}`);
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `QR_${name.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    const copyUrl = (url) => {
        navigator.clipboard.writeText(url);
        alert('URL copied to clipboard!');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Actions */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                        <QrCode size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Your QR Codes</h3>
                        <p className="text-sm text-slate-500">Generate unique codes for different agents or locations</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowNewModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-slate-200"
                >
                    <Plus size={20} />
                    Create New QR
                </button>
            </div>

            {/* Network Warning */}
            {serverIp.includes('localhost') && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-pulse">
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={32} />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-1">
                        <h4 className="text-lg font-bold text-amber-900 tracking-tight">Mobile Scanning Warning</h4>
                        <p className="text-amber-700 text-sm font-medium leading-relaxed">
                            Your current address is set to <code className="bg-amber-200 px-2 py-0.5 rounded font-black">localhost</code>. 
                            QR codes generated with this address <strong>will NOT work</strong> when scanned from a mobile phone.
                        </p>
                    </div>
                    {detectedIp && (
                        <button 
                            onClick={() => setServerIp(detectedIp)}
                            className="w-full md:w-auto px-6 py-3 bg-amber-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-amber-700 transition-all shadow-lg shadow-amber-200"
                        >
                            <Wifi size={18} />
                            Apply Network IP: {detectedIp.split('//')[1]}
                        </button>
                    )}
                </div>
            )}

            {/* Configuration Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your User ID (Owner)</label>
                    <input 
                        type="text" 
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Server IP / Base URL (for Mobile Scanning)</label>
                    <input 
                        type="text" 
                        value={serverIp}
                        onChange={(e) => setServerIp(e.target.value)}
                        placeholder="e.g. http://192.168.1.5:3000"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                    <p className="text-[10px] text-slate-400 ml-1 italic">* Use your PC IP to scan from mobile on same Wi-Fi</p>
                </div>
            </div>

            {/* QR Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {qrs.map((qr) => {
                    const captureUrl = `${serverIp}/capture/${userId}/${qr.refId}`;
                    return (
                        <div key={qr.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:border-emerald-500 transition-all duration-300">
                            <div className="p-8 flex flex-col items-center border-b border-slate-50">
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-emerald-50 transition-colors">
                                    <QRCodeSVG 
                                        id={`qr-canvas-${qr.refId}`}
                                        value={captureUrl}
                                        size={180}
                                        level={"H"}
                                        includeMargin={true}
                                    />
                                </div>
                                <h4 className="mt-6 text-lg font-bold text-slate-800">{qr.name}</h4>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Ref: {qr.refId}</p>
                            </div>
                            
                            <div className="p-4 bg-slate-50 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => downloadQR(qr.refId, qr.name)}
                                        className="p-2.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all"
                                        title="Download PNG"
                                    >
                                        <Download size={18} />
                                    </button>
                                    <button 
                                        onClick={() => copyUrl(captureUrl)}
                                        className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                                        title="Copy Link"
                                    >
                                        <Copy size={18} />
                                    </button>
                                    <button 
                                        onClick={() => window.open(captureUrl, '_blank')}
                                        className="p-2.5 text-slate-500 hover:text-purple-600 hover:bg-purple-100 rounded-xl transition-all"
                                        title="Open Form"
                                    >
                                        <ExternalLink size={18} />
                                    </button>
                                </div>
                                <button 
                                    onClick={() => handleDelete(qr.id)}
                                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {qrs.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
                        <QrCode size={64} className="opacity-20 mb-4" />
                        <p className="font-bold">No QR codes generated yet</p>
                        <p className="text-sm">Click the button above to create your first one</p>
                    </div>
                )}
            </div>

            {/* New QR Modal */}
            {showNewModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                                    <Plus size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">New QR Code</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">QR Purpose / Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input 
                                            autoFocus
                                            type="text" 
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            placeholder="e.g. Reception Desk"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-medium"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 ml-1 italic">* This will be used to generate a unique tracking ID</p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button 
                                        onClick={() => setShowNewModal(false)}
                                        className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleCreate}
                                        disabled={!newName}
                                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                                    >
                                        Generate
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
