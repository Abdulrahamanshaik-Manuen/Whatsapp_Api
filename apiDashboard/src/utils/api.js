const API_BASE_URL = 'http://localhost:5000/api';

export const sendOTP = async (phone) => {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
    });
    return response.json();
};

export const verifyOTP = async (phone, otp) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
    });
    return response.json();
};

export const registerUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return response.json();
};

export const createProfile = async (profileData, token) => {
    const response = await fetch(`${API_BASE_URL}/business/profile`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
    });
    return response.json();
};

export const loginUser = async (phone, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
    });
    return response.json();
};

export const getWhatsAppConnectUrl = async (token) => {
    const response = await fetch(`${API_BASE_URL}/whatsapp/connect`, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${token}`
        },
    });
    return response.json();
};
export const getDashboardStats = async (token, range = '7d') => {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard-stats?range=${range}`, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${token}`
        },
    });
    return response.json();
};
