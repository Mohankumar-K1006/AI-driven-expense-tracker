import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/api';
import { Wallet } from 'lucide-react';
import './Login.css';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (password !== confirmPassword) {
            setMessage({ text: 'Passwords do not match.', type: 'error' });
            return;
        }

        if (password.length < 6) {
            setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const res = await authApi.resetPassword(token, { password });
            const data = await res.json();
            if (res.ok) {
                setMessage({ text: data.message || 'Password updated!', type: 'success' });
            } else {
                setMessage({ text: data.message || 'Failed to reset password.', type: 'error' });
            }
        } catch {
            setMessage({ text: 'Network error. Check your connection.', type: 'error' });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-wrapper" style={{ maxWidth: 480 }}>
                <div className="auth-form-panel">
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Wallet size={40} style={{ color: 'var(--primary)' }} />
                    </div>
                    <h1 style={{ textAlign: 'center' }}>Reset Password</h1>
                    <p className="sub" style={{ textAlign: 'center' }}>
                        Enter your new password below
                    </p>

                    <form onSubmit={handleSubmit} id="resetPasswordForm">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="New password" required
                            value={password} onChange={e => setPassword(e.target.value)}
                        />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm new password" required
                            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
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
                            {loading ? 'Updating…' : 'Update Password'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <Link to="/login">← Back to login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
