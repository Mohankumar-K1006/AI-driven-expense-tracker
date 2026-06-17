import { useState, useEffect } from 'react';
import { budgetApi } from '../api/api';
import { Wallet } from 'lucide-react';
import './Budget.css';

export default function Budget() {
    const [categories, setCategories] = useState([]);

    useEffect(() => { loadBudget(); }, []);

    async function loadBudget() {
        try {
            const res = await budgetApi.analysis();
            const data = await res.json();
            setCategories(data.categories || []);
        } catch { setCategories([]); }
    }

    return (
        <>
            <h1 className="section-title">Budget Analysis</h1>
            <div className="budget-grid">
                {categories.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                        <Wallet size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                        <p className="text-muted">No budget set for this month. Go to <strong>Set Budget</strong> to create one.</p>
                    </div>
                ) : categories.map((cat, i) => {
                    const pct = cat.limit > 0 ? Math.min((cat.spent / cat.limit) * 100, 100) : 0;
                    const isOver = cat.spent > cat.limit;
                    return (
                        <div className="budget-item" key={i}>
                            <div className="budget-header">
                                <span className="cat-name">{cat.category}</span>
                                <span className="cat-amounts">
                                    ₹{cat.spent?.toLocaleString()} / ₹{cat.limit?.toLocaleString()}
                                </span>
                            </div>
                            <div className="progress-track">
                                <div className={`progress-fill ${isOver ? 'danger' : ''}`} style={{ width: `${pct}%` }} />
                            </div>
                            <div className="budget-footer">
                                <span>{isOver ? (
                                    <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Over by ₹{Math.abs(cat.remaining).toLocaleString()}</span>
                                ) : `₹${cat.remaining?.toLocaleString()} remaining`}</span>
                                <span>{pct.toFixed(0)}%</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
