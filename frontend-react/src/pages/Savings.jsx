import { useState, useEffect } from 'react';
import { savingsApi } from '../api/api';
import { PiggyBank, Plus, Trash2 } from 'lucide-react';
import './Savings.css';

export default function Savings() {
    const [goals, setGoals] = useState([]);
    const [title, setTitle] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [addAmounts, setAddAmounts] = useState({});
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => { loadGoals(); }, []);

    async function loadGoals() {
        try {
            const res = await savingsApi.getAll();
            const data = await res.json();
            setGoals(Array.isArray(data) ? data : []);
        } catch { setGoals([]); }
    }

    async function handleAddGoal(e) {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setLoading(true);
        try {
            const res = await savingsApi.add({ title, targetAmount: Number(targetAmount) });
            if (res.ok) {
                setMessage({ text: '✔ Goal created!', type: 'success' });
                setTitle(''); setTargetAmount('');
                loadGoals();
            } else {
                const d = await res.json();
                setMessage({ text: d.error || 'Failed to create goal.', type: 'error' });
            }
        } catch { setMessage({ text: 'Network error.', type: 'error' }); }
        finally { setLoading(false); }
    }

    async function handleAddMoney(id) {
        const amt = Number(addAmounts[id] || 0);
        if (amt <= 0) return;
        try {
            await savingsApi.addMoney(id, { amount: amt });
            setAddAmounts({ ...addAmounts, [id]: '' });
            loadGoals();
        } catch { alert('Failed to add money.'); }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this savings goal?')) return;
        try {
            const res = await savingsApi.delete(id);
            if (res.ok) {
                loadGoals();
            } else {
                const data = await res.json();
                alert('Failed to delete: ' + (data.error || data.message || 'Unknown error'));
            }
        } catch (err) { alert('Failed to delete: ' + err.message); }
    }

    return (
        <>
            <h1 className="section-title">Savings Goals</h1>
            <div className="savings-grid">
                <div className="card savings-form-card">
                    <h3><PiggyBank size={18} /> Create New Goal</h3>
                    <form onSubmit={handleAddGoal}>
                        <div className="savings-form-row">
                            <div className="form-group">
                                <label>Goal Title</label>
                                <input type="text" placeholder="e.g. Vacation Fund" required
                                    value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Target Amount (₹)</label>
                                <input type="number" placeholder="0" min="1" required
                                    value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginBottom: 2 }}>
                                <Plus size={16} /> {loading ? 'Creating…' : 'Create'}
                            </button>
                        </div>
                        {message.text && <div className={`message ${message.type}`} style={{ marginTop: 8 }}>{message.text}</div>}
                    </form>
                </div>

                {goals.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                        <p className="text-muted">No savings goals yet. Create your first goal above!</p>
                    </div>
                ) : goals.map(goal => {
                    const pct = parseFloat(goal.percentage) || 0;
                    const isComplete = goal.completed;
                    return (
                        <div className="goal-card" key={goal._id}>
                            <div className="goal-header">
                                <span className="goal-title">{goal.title}</span>
                                <span className="goal-pct" style={{ color: isComplete ? 'var(--success)' : 'var(--primary)' }}>
                                    {pct.toFixed(1)}% {isComplete && '✔'}
                                </span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: isComplete ? 'var(--success)' : 'var(--primary)' }} />
                            </div>
                            <div className="goal-amounts">
                                <span>Saved: ₹{goal.savedAmount?.toLocaleString()}</span>
                                <span>Target: ₹{goal.targetAmount?.toLocaleString()}</span>
                            </div>
                            <div className="goal-actions">
                                {!isComplete && (
                                    <>
                                        <input type="number" placeholder="Amount" min="1"
                                            value={addAmounts[goal._id] || ''}
                                            onChange={e => setAddAmounts({ ...addAmounts, [goal._id]: e.target.value })} />
                                        <button className="btn btn-primary" onClick={() => handleAddMoney(goal._id)}>
                                            Add Money
                                        </button>
                                    </>
                                )}
                                <button className="btn btn-danger" onClick={() => handleDelete(goal._id)} style={{ marginLeft: 'auto' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
