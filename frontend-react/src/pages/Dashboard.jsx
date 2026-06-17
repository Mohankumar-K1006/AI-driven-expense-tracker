import { useState, useEffect, useRef } from 'react';
import { transactionApi, analyticsApi, suggestionApi } from '../api/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Info, Plus, FileText, BarChart3, Pencil, Trash2,
    TrendingUp, TrendingDown, AlertTriangle, AlertCircle,
    PieChart, Zap, DollarSign, Calendar, Lightbulb, Rocket
} from 'lucide-react';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ICON_MAP = {
    'trending-up': TrendingUp, 'trending-down': TrendingDown,
    'alert-triangle': AlertTriangle, 'alert-circle': AlertCircle,
    'pie-chart': PieChart, 'zap': Zap, 'dollar-sign': DollarSign,
    'calendar': Calendar, 'lightbulb': Lightbulb, 'rocket': Rocket,
};

export default function Dashboard() {
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
    const [transactions, setTransactions] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [catData, setCatData] = useState(null);
    const [monthData, setMonthData] = useState(null);
    const [form, setForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], description: '', type: 'expense', category: '' });
    const [editId, setEditId] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [saving, setSaving] = useState(false);
    const formRef = useRef(null);

    useEffect(() => { loadAll(); }, []);

    function loadAll() {
        loadSummary(); loadTransactions(); loadCharts(); loadSuggestions();
    }

    async function loadSummary() {
        try {
            const res = await transactionApi.summary();
            const data = await res.json();
            setSummary({ totalIncome: data.totalIncome || 0, totalExpense: data.totalExpense || 0, balance: data.balance || 0 });
        } catch { /* ignore */ }
    }

    async function loadTransactions() {
        try {
            const res = await transactionApi.getAll();
            const data = await res.json();
            setTransactions(Array.isArray(data) ? data : []);
        } catch { setTransactions([]); }
    }

    async function loadCharts() {
        try {
            const catRes = await analyticsApi.category();
            const catJson = await catRes.json();
            if (Array.isArray(catJson) && catJson.length > 0) {
                setCatData({
                    labels: catJson.map(d => d._id || d.category),
                    datasets: [{
                        data: catJson.map(d => d.total || d.amount),
                        backgroundColor: ['#2563eb','#06b6d4','#059669','#d97706','#dc2626','#7c3aed','#ec4899','#14b8a6','#ea580c','#65a30d'],
                        borderWidth: 2, borderColor: '#fff'
                    }]
                });
            }
            const monRes = await analyticsApi.monthly();
            const monJson = await monRes.json();
            if (Array.isArray(monJson) && monJson.length > 0) {
                setMonthData({
                    labels: monJson.map(d => d.month),
                    datasets: [{
                        label: 'Expenses', data: monJson.map(d => d.expense),
                        backgroundColor: '#2563eb', borderRadius: 6,
                    }]
                });
            }
        } catch { /* ignore */ }
    }

    async function loadSuggestions() {
        try {
            const res = await suggestionApi.get();
            const data = await res.json();
            setSuggestions(Array.isArray(data) ? data : []);
        } catch { setSuggestions([]); }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setSaving(true);
        try {
            const txData = { type: form.type, category: form.category, amount: Number(form.amount), description: form.description, date: form.date };
            let res;
            if (editId) {
                res = await transactionApi.update(editId, txData);
            } else {
                res = await transactionApi.add(txData);
            }
            if (res.ok) {
                setMessage({ text: editId ? '✔ Transaction updated!' : '✔ Transaction saved!', type: 'success' });
                resetForm();
                loadAll();
            } else {
                const d = await res.json();
                setMessage({ text: d.message || 'Failed to save.', type: 'error' });
            }
        } catch {
            setMessage({ text: 'Network error. Try again.', type: 'error' });
        } finally { setSaving(false); }
    }

    function resetForm() {
        setForm({ amount: '', date: new Date().toISOString().split('T')[0], description: '', type: 'expense', category: '' });
        setEditId(null);
    }

    function editTx(tx) {
        setEditId(tx._id);
        setForm({
            amount: tx.amount, date: tx.date ? tx.date.split('T')[0] : '',
            description: tx.description || '', type: tx.type, category: tx.category
        });
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    async function deleteTx(id) {
        if (!confirm('Delete this transaction?')) return;
        try {
            const res = await transactionApi.delete(id);
            if (res.ok) {
                loadAll();
            } else {
                const data = await res.json();
                alert('Failed to delete: ' + (data.error || data.message || 'Unknown error'));
            }
        } catch (err) { alert('Failed to delete transaction: ' + err.message); }
    }

    return (
        <>
            <h1 className="section-title">Dashboard</h1>
            <div className="dash-grid">
                {/* Summary Banner */}
                <div className="summary-banner">
                    <div>
                        <h2>Total Balance</h2>
                        <div className="big-num">₹ {summary.balance.toLocaleString()}</div>
                    </div>
                    <div className="summary-stats">
                        <div className="stat">
                            <div className="label">Income</div>
                            <div className="val">₹ {summary.totalIncome.toLocaleString()}</div>
                        </div>
                        <div className="stat">
                            <div className="label">Expenses</div>
                            <div className="val">₹ {summary.totalExpense.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* AI Suggestions */}
                <div className="card suggestions-card" id="suggestionsCard">
                    <h3>
                        <Info size={20} /> Smart Insights <span className="ai-badge">AI</span>
                    </h3>
                    <div className="suggestions-list">
                        {suggestions.length === 0 ? (
                            <div className="suggestions-empty">Analyzing your spending patterns...</div>
                        ) : suggestions.slice(0, 5).map((s, i) => {
                            const IconComp = ICON_MAP[s.icon] || Lightbulb;
                            return (
                                <div className="suggestion-item" key={i}>
                                    <div className={`suggestion-icon ${s.type}`}><IconComp size={20} /></div>
                                    <div className="suggestion-body">
                                        <h4>{s.title}</h4>
                                        <p>{s.message}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Charts */}
                <div className="card form-card">
                    <h3><BarChart3 size={18} /> Analytics</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                        <div>
                            <h4 style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 10 }}>Category Spending</h4>
                            <div style={{ maxWidth: 250, margin: '0 auto' }}>
                                {catData ? (
                                    <Doughnut data={catData} options={{
                                        responsive: true,
                                        plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, color: '#64748b' } } }
                                    }} />
                                ) : <p className="text-muted text-center">No data yet</p>}
                            </div>
                        </div>
                        <div>
                            <h4 style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 10 }}>Monthly Trend</h4>
                            {monthData ? (
                                <Bar data={monthData} options={{
                                    responsive: true,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { beginAtZero: true, ticks: { callback: v => '₹' + v, color: '#64748b' }, grid: { color: '#e2e8f0' } },
                                        x: { ticks: { color: '#64748b' }, grid: { display: false } }
                                    }
                                }} />
                            ) : <p className="text-muted text-center">No data yet</p>}
                        </div>
                    </div>
                </div>

                {/* Add Transaction */}
                <div className="card form-card" ref={formRef}>
                    <h3><Plus size={18} /> {editId ? 'Edit Transaction' : 'Add Transaction'}</h3>
                    <form onSubmit={handleSubmit} id="transactionForm">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="amount">Amount (₹)</label>
                                <input type="number" id="amount" placeholder="0.00" required min="0"
                                    value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="date">Date</label>
                                <input type="date" id="date" value={form.date}
                                    onChange={e => setForm({ ...form, date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <input type="text" id="description" placeholder="e.g. Lunch at cafe" required
                                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="account">Type</label>
                                <select id="account" value={form.type}
                                    onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <select id="category" value={form.category}
                                    onChange={e => setForm({ ...form, category: e.target.value })}>
                                    <option value="">Select category</option>
                                    <option>Food</option><option>Travel</option><option>Shopping</option>
                                    <option>Rent</option><option>Utilities</option><option>Entertainment</option>
                                    <option>Salary</option><option>Other</option>
                                </select>
                            </div>
                            <div className="form-group span-full">
                                {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
                                <button type="submit" id="submitTxBtn" className="btn btn-primary btn-full" disabled={saving}>
                                    {saving ? (editId ? 'Updating…' : 'Saving…') : (editId ? 'Update Transaction' : 'Save Transaction')}
                                </button>
                                {editId && (
                                    <button type="button" className="btn btn-outline btn-full" style={{ marginTop: 10 }} onClick={resetForm}>
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Recent Transactions */}
                <div className="card history-card">
                    <h3><FileText size={18} /> Recent Transactions</h3>
                    <ul className="tx-list" id="txList">
                        {transactions.length === 0 ? (
                            <li className="empty-tx">No transactions yet. Add one above!</li>
                        ) : transactions.map(tx => {
                            const dateStr = tx.date ? new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                            const isIncome = tx.type === 'income';
                            return (
                                <li className="tx-item" key={tx._id}>
                                    <div className="tx-info">
                                        <span className="tx-desc">{tx.description || tx.category}</span>
                                        <span className="tx-meta">
                                            <span>{tx.category}</span>
                                            <span>•</span>
                                            <span>{dateStr}</span>
                                        </span>
                                    </div>
                                    <span className={`tx-amount ${tx.type}`}>
                                        {isIncome ? '+' : '-'}₹{tx.amount?.toLocaleString()}
                                    </span>
                                    <div className="tx-actions">
                                        <button className="tx-delete" onClick={() => editTx(tx)} title="Edit">
                                            <Pencil size={14} />
                                        </button>
                                        <button className="tx-delete" onClick={() => deleteTx(tx._id)} title="Delete">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </>
    );
}
