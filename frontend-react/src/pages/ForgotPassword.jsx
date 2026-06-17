import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/api';
import { Wallet } from 'lucide-react';
import './Login.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setLoading(true);

        try {
            const res = await authApi.forgotPassword({ email });
            const data = await res.json();
            if (res.ok) {
                setMessage({ text: data.message || 'Reset email sent!', type: 'success' });
                if (data.resetUrl) {
                    console.log('Reset URL:', data.resetUrl);
                }
            } else {
                setMessage({ text: data.message || 'Failed to send reset email.', type: 'error' });
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
                    <h1 style={{ textAlign: 'center' }}>Forgot Password</h1>
                    <p className="sub" style={{ textAlign: 'center' }}>
                        Enter your email and we'll send you a reset link
                    </p>

                    <form onSubmit={handleSubmit} id="forgotPasswordForm">
                        <input
                            type="email" id="email" placeholder="Email address" required
                            value={email} onChange={e => setEmail(e.target.value)}
                        />

                        {message.text && (
                            <div className={`message ${message.type}`}>{message.text}</div>
                        )}
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Sending…' : 'Send Reset Link'}
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
