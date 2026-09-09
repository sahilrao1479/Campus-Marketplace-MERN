import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsedUser = JSON.parse(userInfo);
            setUser(parsedUser);
            // Set auth header
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await axios.post('/api/auth/login', { email, password });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await axios.post('/api/auth/register', { name, email, password });
        return data;
    };

    const verifyOtp = async (email, otp) => {
        const { data } = await axios.post('/api/auth/verify-otp', { email, otp });
        setUser(data);
        localStorage.setItem('userInfo', JSON.stringify(data));
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, verifyOtp, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
