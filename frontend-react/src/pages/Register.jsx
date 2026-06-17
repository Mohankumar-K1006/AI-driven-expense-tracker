import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/api';
import { Wallet } from 'lucide-react';
import './Login.css';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setLoading(true);

        try {
            const res = await authApi.register({ name, email, password });
            const data = await res.json();
            if (res.status === 201) {
                setMessage({ text: '✔ Registration successful! Redirecting…', type: 'success' });
                setTimeout(() => navigate('/login'), 1500);
            } else {
                setMessage({ text: data.error || data.message || 'Registration failed.', type: 'error' });
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
                    <p>Join thousands of users<br />taking control of their<br />financial future.</p>
                </div>

                <div className="auth-form-panel">
                    <h1>Create Account</h1>
                    <p className="sub">Get started with ExpenseTracker</p>

                    <form onSubmit={handleSubmit} id="registerForm">
                        <input
                            type="text" id="name" placeholder="Full name" required
                            value={name} onChange={e => setName(e.target.value)}
                        />
                        <input
                            type="email" id="email" placeholder="Email address" required
                            value={email} onChange={e => setEmail(e.target.value)}
                        />
                        <input
                            type={showPassword ? 'text' : 'password'} id="password"
                            placeholder="Password" required
                            value={password} onChange={e => setPassword(e.target.value)}
                        />
                        <label className="show-password-label">
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={e => setShowPassword(e.target.checked)}
                            /> Show password
                        </label>

                        {message.text && (
                            <div className={`message ${message.type}`}>{message.text}</div>
                        )}
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Creating account…' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
