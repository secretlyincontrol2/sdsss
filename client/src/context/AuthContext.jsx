import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('fyp_token');
        const savedUser = localStorage.getItem('fyp_user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            authAPI.me()
                .then(res => {
                    setUser(res.data.user);
                    localStorage.setItem('fyp_user', JSON.stringify(res.data.user));
                })
                .catch(() => {
                    localStorage.removeItem('fyp_token');
                    localStorage.removeItem('fyp_user');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        const { token, user: userData } = res.data;
        localStorage.setItem('fyp_token', token);
        localStorage.setItem('fyp_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const register = async (data) => {
        const res = await authAPI.register(data);
        const { token, user: userData } = res.data;
        localStorage.setItem('fyp_token', token);
        localStorage.setItem('fyp_user', JSON.stringify(userData));
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('fyp_token');
        localStorage.removeItem('fyp_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
