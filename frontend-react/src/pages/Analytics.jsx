import { useState, useEffect } from 'react';
import { analyticsApi } from '../api/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import './Analytics.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

export default function Analytics() {
    const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
    const [catData, setCatData] = useState(null);
    const [monthData, setMonthData] = useState(null);
    const [iveData, setIveData] = useState(null);

    useEffect(() => {
        loadSummary(); loadCategory(); loadMonthly(); loadIncomeVsExpense();
    }, []);

    async function loadSummary() {
        try { const r = await analyticsApi.summary(); const d = await r.json(); setSummary(d); } catch {}
    }

    async function loadCategory() {
        try {
            const r = await analyticsApi.category(); const d = await r.json();
            if (Array.isArray(d) && d.length > 0) {
                setCatData({
                    labels: d.map(x => x._id || x.category),
                    datasets: [{ data: d.map(x => x.total || x.amount),
                        backgroundColor: ['#2563eb','#06b6d4','#059669','#d97706','#dc2626','#7c3aed','#ec4899','#14b8a6','#ea580c','#65a30d'],
                        borderWidth: 2, borderColor: '#fff' }]
                });
            }
        } catch {}
    }

    async function loadMonthly() {
        try {
            const r = await analyticsApi.monthly(); const d = await r.json();
            if (Array.isArray(d) && d.length > 0) {
                setMonthData({
                    labels: d.map(x => x.month),
                    datasets: [{ label: 'Expenses', data: d.map(x => x.expense), backgroundColor: '#2563eb', borderRadius: 6 }]
                });
            }
        } catch {}
    }

    async function loadIncomeVsExpense() {
        try {
            const r = await analyticsApi.incomeVsExpense(); const d = await r.json();
            if (Array.isArray(d) && d.length > 0) {
                setIveData({
                    labels: d.map(x => x.month),
                    datasets: [
                        { label: 'Income', data: d.map(x => x.income), backgroundColor: '#059669', borderRadius: 6 },
                        { label: 'Expense', data: d.map(x => x.expense), backgroundColor: '#dc2626', borderRadius: 6 }
                    ]
                });
            }
        } catch {}
    }

    return (
        <>
            <h1 className="section-title">Analytics</h1>
            <div className="analytics-grid">
                <div className="card full-width">
                    <h3><BarChart3 size={18} /> Financial Summary</h3>
                    <div className="summary-cards">
                        <div className="summary-item">
                            <div className="s-label">Total Income</div>
                            <div className="s-value income">₹ {(summary.income || 0).toLocaleString()}</div>
                        </div>
                        <div className="summary-item">
                            <div className="s-label">Total Expenses</div>
                            <div className="s-value expense">₹ {(summary.expense || 0).toLocaleString()}</div>
                        </div>
                        <div className="summary-item">
                            <div className="s-label">Net Balance</div>
                            <div className="s-value balance">₹ {(summary.balance || 0).toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3><PieChart size={18} /> Category Breakdown</h3>
                    {catData ? (
                        <div style={{ maxWidth: 280, margin: '0 auto' }}>
                            <Doughnut data={catData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, color: '#64748b' } } } }} />
                        </div>
                    ) : <p className="text-muted text-center">No data yet</p>}
                </div>

                <div className="card">
                    <h3><BarChart3 size={18} /> Monthly Trend</h3>
                    {monthData ? (
                        <Bar data={monthData} options={{
                            responsive: true, plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true, ticks: { callback: v => '₹' + v, color: '#64748b' }, grid: { color: '#e2e8f0' } }, x: { ticks: { color: '#64748b' }, grid: { display: false } } }
                        }} />
                    ) : <p className="text-muted text-center">No data yet</p>}
                </div>

                <div className="card full-width">
                    <h3><TrendingUp size={18} /> Income vs Expense</h3>
                    {iveData ? (
                        <Bar data={iveData} options={{
                            responsive: true,
                            plugins: { legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8, color: '#64748b' } } },
                            scales: { y: { beginAtZero: true, ticks: { callback: v => '₹' + v, color: '#64748b' }, grid: { color: '#e2e8f0' } }, x: { ticks: { color: '#64748b' }, grid: { display: false } } }
                        }} />
                    ) : <p className="text-muted text-center">No data yet</p>}
                </div>
            </div>
        </>
    );
}
