const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

// Summary: Total income, expense, balance
router.get("/summary", auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id });

        let income = 0;
        let expense = 0;

        transactions.forEach(t => {
            if (t.type === "income") income += t.amount;
            else expense += t.amount;
        });

        res.json({
            income,
            expense,
            balance: income - expense
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Category-wise expense breakdown (for Pie Chart)
router.get("/category", auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({
            user: req.user.id,
            type: "expense"
        });

        const categoryMap = {};
        transactions.forEach(t => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });

        const result = Object.entries(categoryMap).map(([name, total]) => ({
            _id: name,
            total
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Monthly expense trend (for Bar Chart)
router.get("/monthly", auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({
            user: req.user.id,
            type: "expense"
        });

        const monthMap = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        transactions.forEach(t => {
            const d = new Date(t.date);
            const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
            const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            if (!monthMap[key]) monthMap[key] = { key, label, amount: 0 };
            monthMap[key].amount += t.amount;
        });

        const months = Object.values(monthMap)
            .sort((a, b) => a.key.localeCompare(b.key))
            .slice(-12)
            .map(({ label, amount }) => ({ month: label, expense: amount }));

        res.json(months);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Income vs Expense comparative trend (for grouped bar chart)
router.get("/income-vs-expense", auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id });

        const monthMap = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        transactions.forEach(t => {
            const d = new Date(t.date);
            const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
            const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
            
            if (!monthMap[key]) {
                monthMap[key] = { key, label, income: 0, expense: 0 };
            }
            if (t.type === "income") monthMap[key].income += t.amount;
            else monthMap[key].expense += t.amount;
        });

        const months = Object.values(monthMap)
            .sort((a, b) => a.key.localeCompare(b.key))
            .slice(-12)
            .map(({ label, income, expense }) => ({ month: label, income, expense }));

        res.json(months);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;