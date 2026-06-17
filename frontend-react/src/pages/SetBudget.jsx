import { useState } from 'react';
import { budgetApi } from '../api/api';
import { Plus, X, DollarSign } from 'lucide-react';
import './SetBudget.css';

const DEFAULT_CATEGORIES = ['Food', 'Travel', 'Shopping', 'Rent', 'Utilities', 'Entertainment', 'Other'];

export default function SetBudget() {
    const [categories, setCategories] = useState([{ name: 'Food', limit: '' }]);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    function addCategory() {
        setCategories([...categories, { name: '', limit: '' }]);
    }

    function removeCategory(idx) {
        setCategories(categories.filter((_, i) => i !== idx));
    }

    function updateCategory(idx, field, value) {
        const updated = [...categories];
        updated[idx][field] = value;
        setCategories(updated);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        const valid = categories.filter(c => c.name && c.limit > 0);
        if (valid.length === 0) {
            setMessage({ text: 'Add at least one category with a limit.', type: 'error' });
            return;
        }

        setLoading(true);
        try {
            const res = await budgetApi.set({ categories: valid.map(c => ({ name: c.name, limit: Number(c.limit) })) });
            const data = await res.json();
            if (res.ok) {
                setMessage({ text: data.message || '✔ Budget saved!', type: 'success' });
            } else {
                setMessage({ text: data.error || 'Failed to save budget.', type: 'error' });
            }
        } catch {
            setMessage({ text: 'Network error. Try again.', type: 'error' });
        } finally { setLoading(false); }
    }

    return (
        <>
            <h1 className="section-title">Set Monthly Budget</h1>
            <div className="card set-budget-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontWeight: 700 }}>
                    <DollarSign size={18} /> Category Budgets
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="budget-categories">
                        {categories.map((cat, i) => (
                            <div className="budget-cat-row" key={i}>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select value={cat.name} onChange={e => updateCategory(i, 'name', e.target.value)}>
                                        <option value="">Select</option>
                                        {DEFAULT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Limit (₹)</label>
                                    <input type="number" placeholder="0" min="0"
                                        value={cat.limit} onChange={e => updateCategory(i, 'limit', e.target.value)} />
                                </div>
                                <button type="button" className="remove-btn" onClick={() => removeCategory(i)} title="Remove">
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button type="button" className="add-cat-btn" onClick={addCategory}>
                        <Plus size={16} /> Add Category
                    </button>

                    {message.text && <div className={`message ${message.type}`} style={{ marginTop: 16 }}>{message.text}</div>}

                    <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 20 }} disabled={loading}>
                        {loading ? 'Saving…' : 'Save Budget'}
                    </button>
                </form>
            </div>
        </>
    );
}
