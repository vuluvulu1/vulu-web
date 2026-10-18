import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // status: 'loading' | 'in' | 'out'
    const [status, setStatus] = useState(() => (getToken() ? 'loading' : 'out'));
    const [user, setUser] = useState(null);

    const loadMe = useCallback(async () => {
        try {
            setUser(await api.me());
            setStatus('in');
        } catch (err) {
            // Süresi dolmuş ya da şifre değiştiği için geçersiz kalmış token atılır
            if (err.status === 401 || err.status === 403) setToken(null);
            setUser(null);
            setStatus('out');
        }
    }, []);

    useEffect(() => { if (getToken()) loadMe(); }, [loadMe]);

    const login = useCallback(async (username, password, opts) => {
        const { token } = await api.login(username, password, opts);
        setToken(token);
        setStatus('loading');
        await loadMe();
    }, [loadMe]);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        setStatus('out');
    }, []);

    return <AuthContext.Provider value={{ status, user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
