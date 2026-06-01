import React, { useState, useEffect } from 'react';
import { AlertProvider } from './context/AlertContext';
import { SubscriptionGateProvider } from './context/SubscriptionGateContext';

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
    const token = localStorage.getItem('token');
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

    // Route Guards: Logged in users shouldn't access Login/Register
    if (token && (activePath === '/login' || activePath === '/register')) {
        if (isAdmin) {
            return (
                <SubscriptionGateProvider onNavigateToBilling={navigateTo}>
                    <AdminPanel onNavigate={navigateTo} initialPath="/admin" />
                </SubscriptionGateProvider>
            );
        }
        return (
            <SubscriptionGateProvider onNavigateToBilling={navigateTo}>
                <DashboardPage onNavigate={navigateTo} initialPath="/dashboard" />
            </SubscriptionGateProvider>
        );
    }

    // Protected Routes: Require token
    const isProtectedRoute = activePath.startsWith('/admin') || 
        ['/dashboard', '/campaigns', '/campaigns/create', '/contacts', '/messages', '/history', '/templates', '/templates/create', '/templates/view', '/automations', '/automations/builder', '/setup', '/billing', '/settings', '/groups'].includes(activePath);

    if (isProtectedRoute && !token) {
        return <LoginPage onNavigate={navigateTo} />;
    }

    // Role-based Guards: Non-admins trying to access AdminPanel
    if (activePath.startsWith('/admin') && !isAdmin) {
        return <DashboardPage onNavigate={navigateTo} initialPath="/dashboard" />;
    }

    if (activePath === '/register') return <RegisterPage onNavigate={navigateTo} />;
    if (activePath === '/login') return <LoginPage onNavigate={navigateTo} />;
    if (activePath === '/forgot-password') return <ForgotPasswordPage onNavigate={navigateTo} />;
    if (activePath.startsWith('/lead')) return <LeadCapturePage />;

    
    if (activePath.startsWith('/admin') || (activePath === '/automations/builder' && isAdmin)) {
        return (
            <SubscriptionGateProvider onNavigateToBilling={navigateTo}>
                <AdminPanel onNavigate={navigateTo} initialPath={activePath} />
            </SubscriptionGateProvider>
        );
    }

    if (['/dashboard', '/campaigns', '/campaigns/create', '/contacts', '/messages', '/history', '/templates', '/templates/create', '/templates/view', '/automations', '/automations/builder', '/setup', '/billing', '/settings', '/groups'].includes(activePath)) {
        return (
            <SubscriptionGateProvider onNavigateToBilling={navigateTo}>
                <DashboardPage onNavigate={navigateTo} initialPath={activePath} />
            </SubscriptionGateProvider>
        );
    }

    // Default to Landing Page for '/'
    if (activePath === '/') return <LandingPage activePath={activePath} onNavigate={navigateTo} />;

    return <LoginPage onNavigate={navigateTo} />;
}
