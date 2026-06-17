import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/api';
import { Wallet } from 'lucide-react';
import './Login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setLoading(true);

        try {
            const res = await authApi.login({ email, password });
            const data = await res.json();
            if (data.token) {
                login(data.token, data.name, data.role);
                navigate('/');
            } else {
                setMessage({ text: data.message || 'Login failed. Please try again.', type: 'error' });
            }
        } catch {
            setMessage({ text: 'Network error. Check your connection.', type: 'error' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-wrapper">
                <div className="auth-panel">
                    <div className="brand"><Wallet size={40} /></div>
                    <h2>ExpenseTracker</h2>
                    <p>Track your spending,<br />manage your budgets,<br />and reach your financial goals.</p>
                </div>

                <div className="auth-form-panel">
                    <h1>Welcome back</h1>
                    <p className="sub">Sign in to your account</p>

                    <form onSubmit={handleSubmit} id="loginForm">
                        <input
                            type="email" id="email" placeholder="Email address" required
                            value={email} onChange={e => setEmail(e.target.value)}
                        />
                        <input
                            type={showPassword ? 'text' : 'password'} id="password"
                            placeholder="Password" required
                            value={password} onChange={e => setPassword(e.target.value)}
                        />
                        <div className="form-options">
                            <label className="show-password-label">
                                <input
                                    type="checkbox" id="showPasswordToggle"
                                    checked={showPassword}
                                    onChange={e => setShowPassword(e.target.checked)}
                                /> Show password
                            </label>
                            <div className="forgot-password">
                                <Link to="/forgot-password">Forgot password?</Link>
                            </div>
                        </div>

                        {message.text && (
                            <div className={`message ${message.type}`}>{message.text}</div>
                        )}
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Don't have an account? <Link to="/register">Sign up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
