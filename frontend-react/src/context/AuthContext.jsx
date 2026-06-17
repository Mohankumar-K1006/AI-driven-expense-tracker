import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'user');

    const isAuthenticated = !!token;

    function login(tokenValue, name, role) {
        localStorage.setItem('token', tokenValue);
        localStorage.setItem('userName', name || '');
        localStorage.setItem('userRole', role || 'user');
        setToken(tokenValue);
        setUserName(name || '');
        setUserRole(role || 'user');
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        setToken(null);
        setUserName('');
        setUserRole('user');
    }

    return (
        <AuthContext.Provider value={{ token, userName, userRole, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}

export function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) return null;
    return children;
}
