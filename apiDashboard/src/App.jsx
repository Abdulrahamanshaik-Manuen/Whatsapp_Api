import React, { useState, useEffect } from 'react';
import { AlertProvider } from './context/AlertContext';

import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import LeadCapturePage from './pages/LeadCapturePage';
import AdminPanel from './pages/admin/AdminPanel';

// Simple Router Hook
function getCurrentPath() {
    let path = window.location.pathname || '/';
    if (path.length > 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
    }
    return path;
}

import { SocketProvider } from './context/SocketContext';

export default function App() {
    return (
        <SocketProvider>
            <AlertProvider>
                <AppContent />
            </AlertProvider>
        </SocketProvider>
    );
}

function AppContent() {

    const [activePath, setActivePath] = useState(getCurrentPath);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';

    useEffect(() => {
        const handlePopState = () => setActivePath(getCurrentPath());
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigateTo = (path) => {
        if (path === activePath) return;
        window.history.pushState({}, '', path);
        setActivePath(path);
        window.scrollTo(0, 0);
    };

    if (activePath === '/register') return <RegisterPage onNavigate={navigateTo} />;
    if (activePath === '/login') return <LoginPage onNavigate={navigateTo} />;
    if (activePath === '/forgot-password') return <ForgotPasswordPage onNavigate={navigateTo} />;
    if (activePath.startsWith('/lead')) return <LeadCapturePage />;
    if (activePath.startsWith('/admin') || (activePath === '/automations/builder' && isAdmin)) {
        return <AdminPanel onNavigate={navigateTo} initialPath={activePath} />;
    }
    if (activePath === '/dashboard' || activePath === '/campaigns' || activePath === '/campaigns/create' || activePath === '/contacts' || activePath === '/messages' || activePath === '/history' || activePath === '/templates' || activePath === '/templates/create' || activePath === '/templates/view' || activePath === '/automations' || activePath === '/automations/builder' || activePath === '/setup' || activePath === '/billing' || activePath === '/settings' || activePath === '/groups') {
        return <DashboardPage onNavigate={navigateTo} initialPath={activePath} />;
    }

    // Default to Login for now if not landing or register
    if (activePath === '/') return <LandingPage activePath={activePath} onNavigate={navigateTo} />;

    return <LoginPage onNavigate={navigateTo} />;
}
