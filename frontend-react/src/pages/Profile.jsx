import { useState, useEffect } from 'react';
import { profileApi } from '../api/api';
import { User, Settings } from 'lucide-react';
import './Profile.css';

export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({ income: '', savingsGoal: '', targetExpense: '' });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => { loadProfile(); }, []);

    async function loadProfile() {
        try {
            const res = await profileApi.get();
            const data = await res.json();
            setProfile(data);
            setForm({
                income: data.income || '',
                savingsGoal: data.savingsGoal || '',
                targetExpense: data.targetExpense || ''
            });
        } catch {}
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setLoading(true);
        try {
            const res = await profileApi.update({
                income: Number(form.income) || 0,
                savingsGoal: Number(form.savingsGoal) || 0,
                targetExpense: Number(form.targetExpense) || 0
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setMessage({ text: '✔ Profile updated!', type: 'success' });
            } else {
                setMessage({ text: 'Failed to update.', type: 'error' });
            }
        } catch { setMessage({ text: 'Network error.', type: 'error' }); }
        finally { setLoading(false); }
    }

    function getInitials(name) {
        return (name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    }

    if (!profile) return <div className="section-title">Loading…</div>;

    return (
        <>
            <h1 className="section-title">Profile</h1>
            <div className="card profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">{getInitials(profile.name)}</div>
                    <div className="profile-info">
                        <h2>{profile.name}</h2>
                        <div className="profile-email">{profile.email}</div>
                        <span className={`badge ${profile.role === 'admin' ? 'badge-warn' : 'badge-success'} profile-role`}>
                            {profile.role}
                        </span>
                    </div>
                </div>

                <form className="profile-form" onSubmit={handleSubmit}>
                    <h3><Settings size={18} /> Financial Settings</h3>
                    <div className="form-group">
                        <label>Monthly Income (₹)</label>
                        <input type="number" placeholder="0" min="0"
                            value={form.income} onChange={e => setForm({ ...form, income: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Savings Goal (₹)</label>
                        <input type="number" placeholder="0" min="0"
                            value={form.savingsGoal} onChange={e => setForm({ ...form, savingsGoal: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Target Monthly Expense (₹)</label>
                        <input type="number" placeholder="0" min="0"
                            value={form.targetExpense} onChange={e => setForm({ ...form, targetExpense: e.target.value })} />
                    </div>

                    {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Saving…' : 'Save Settings'}
                    </button>
                </form>
            </div>
        </>
    );
}
