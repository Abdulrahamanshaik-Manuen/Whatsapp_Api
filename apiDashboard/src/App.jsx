import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';

// Simple Router Hook
function getCurrentPath() {
    let path = window.location.pathname || '/';
    if (path.length > 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
    }
    return path;
}

export default function App() {
    const [activePath, setActivePath] = useState(getCurrentPath);

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
    if (activePath === '/dashboard' || activePath === '/campaigns' || activePath === '/contacts' || activePath === '/messages' || activePath === '/history' || activePath === '/analytics' || activePath === '/templates' || activePath === '/automations' || activePath === '/setup' || activePath === '/billing' || activePath === '/settings') {
        return <DashboardPage onNavigate={navigateTo} initialPath={activePath} />;
    }

    // Default to Login for now if not landing or register
    if (activePath === '/') return <LandingPage activePath={activePath} onNavigate={navigateTo} />;

    return <LoginPage onNavigate={navigateTo} />;
}
