import React, { useState, useEffect } from 'react';
import { 
  Bell, X, Check, Trash2, CheckCircle, AlertTriangle, AlertCircle, Info 
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function NotificationDropdown({ onClose }) {
    const { socket } = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setNotifications(data);
            }
        } catch (err) {
            console.error("Fetch Notifications Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        
        if (socket) {
            socket.on('new_notification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                // Optional: Play a sound or show a toast
                if (window.Notification && window.Notification.permission === 'granted') {
                    new window.Notification(notification.title, { body: notification.message });
                }
            });
        }

        return () => {
            if (socket) socket.off('new_notification');
        };
    }, [socket]);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error("Mark Read Error:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Mark All Read Error:", err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_BASE_URL}/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (err) {
            console.error("Delete Notification Error:", err);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-emerald-500" size={16} />;
            case 'warning': return <AlertTriangle className="text-amber-500" size={16} />;
            case 'error': return <AlertCircle className="text-rose-500" size={16} />;
            default: return <Info className="text-blue-500" size={16} />;
        }
    };

    return (
        <div className="absolute right-4 left-4 sm:left-auto sm:right-0 mt-3 sm:w-96 bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-800 tracking-tight">Notifications</h3>
                    {notifications.filter(n => !n.isRead).length > 0 && (
                        <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-black rounded-full">
                            {notifications.filter(n => !n.isRead).length}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={markAllAsRead}
                        className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                    >
                        Mark all as read
                    </button>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Fetching alerts...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Bell className="text-slate-200" size={24} />
                        </div>
                        <p className="text-sm font-black text-slate-800">All caught up!</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">No new notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {notifications.map((notification) => (
                            <div 
                                key={notification._id}
                                className={`p-5 hover:bg-slate-50 transition-colors relative group ${!notification.isRead ? 'bg-primary/[0.02]' : ''}`}
                            >
                                {!notification.isRead && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                                )}
                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        notification.type === 'success' ? 'bg-emerald-50' :
                                        notification.type === 'warning' ? 'bg-amber-50' :
                                        notification.type === 'error' ? 'bg-rose-50' : 'bg-blue-50'
                                    }`}>
                                        {getTypeIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-xs font-black text-slate-900 truncate pr-4">{notification.title}</h4>
                                            <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-2">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!notification.isRead && (
                                                <button 
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="flex items-center gap-1.5 text-[9px] font-black text-primary uppercase tracking-widest"
                                                >
                                                    <Check size={12} /> Mark read
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => deleteNotification(notification._id)}
                                                className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 uppercase tracking-widest"
                                            >
                                                <Trash2 size={12} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
                <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">
                    View Activity Log
                </button>
            </div>
        </div>
    );
}
