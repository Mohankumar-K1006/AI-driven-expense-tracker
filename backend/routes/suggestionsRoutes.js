const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const User = require("../models/User");
const auth = require("../middleware/auth");

// GET /api/suggestions — AI-driven spending suggestions
router.get("/", auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const suggestions = [];

        // Fetch all user data
        const [transactions, budgets, user] = await Promise.all([
            Transaction.find({ user: userId }).sort({ date: -1 }),
            Budget.find({ user: userId }),
            User.findById(userId)
        ]);

        if (!transactions.length) {
            suggestions.push({
                type: "info",
                icon: "rocket",
                title: "Get Started!",
                message: "Add your first transaction to start receiving personalized financial insights.",
                priority: 1
            });
            return res.json(suggestions);
        }

        // ── Compute core analytics ──
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        const thisMonthTx = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });

        const lastMonthTx = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        });

        const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

        const thisMonthExpense = thisMonthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
        const thisMonthIncome = thisMonthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
        const lastMonthExpense = lastMonthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

        // ── Category breakdown (this month) ──
        const categoryMap = {};
        thisMonthTx.filter(t => t.type === "expense").forEach(t => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });

        const lastCategoryMap = {};
        lastMonthTx.filter(t => t.type === "expense").forEach(t => {
            lastCategoryMap[t.category] = (lastCategoryMap[t.category] || 0) + t.amount;
        });

        // ── 1. Income vs Expense Ratio ──
        if (totalIncome > 0) {
            const savingsRate = ((totalIncome - totalExpense) / totalIncome * 100).toFixed(0);
            if (savingsRate < 10) {
                suggestions.push({
                    type: "warning",
                    icon: "alert-triangle",
                    title: "Low Savings Rate",
                    message: `Your savings rate is only ${savingsRate}%. Financial experts recommend saving at least 20% of your income. Consider reviewing your top spending categories.`,
                    priority: 2
                });
            } else if (savingsRate >= 30) {
                suggestions.push({
                    type: "success",
                    icon: "trending-up",
                    title: "Great Savings Habit!",
                    message: `You're saving ${savingsRate}% of your income — that's excellent! Consider investing the surplus for long-term growth.`,
                    priority: 5
                });
            }
        }

        // ── 2. Month-over-Month Trend ──
        if (lastMonthExpense > 0 && thisMonthExpense > 0) {
            const changePercent = ((thisMonthExpense - lastMonthExpense) / lastMonthExpense * 100).toFixed(0);
            if (changePercent > 20) {
                suggestions.push({
                    type: "danger",
                    icon: "trending-up",
                    title: "Spending Spike Detected",
                    message: `Your expenses increased by ${changePercent}% compared to last month (₹${lastMonthExpense.toLocaleString()} → ₹${thisMonthExpense.toLocaleString()}). Review recent purchases to identify non-essential spending.`,
                    priority: 1
                });
            } else if (changePercent < -15) {
                suggestions.push({
                    type: "success",
                    icon: "trending-down",
                    title: "Spending Reduced!",
                    message: `Great job! Your spending decreased by ${Math.abs(changePercent)}% this month. Keep up the discipline!`,
                    priority: 4
                });
            }
        }

        // ── 3. Top Spending Category Alert ──
        const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
        if (sortedCategories.length > 0) {
            const [topCat, topAmount] = sortedCategories[0];
            const topPercent = thisMonthExpense > 0
                ? (topAmount / thisMonthExpense * 100).toFixed(0)
                : 0;

            if (topPercent > 40) {
                suggestions.push({
                    type: "warning",
                    icon: "pie-chart",
                    title: `Heavy ${topCat} Spending`,
                    message: `${topCat} accounts for ${topPercent}% of this month's expenses (₹${topAmount.toLocaleString()}). Diversifying your spending can help maintain balance.`,
                    priority: 2
                });
            }
        }

        // ── 4. Category Spike vs Last Month ──
        for (const [cat, amount] of Object.entries(categoryMap)) {
            const lastAmount = lastCategoryMap[cat] || 0;
            if (lastAmount > 0 && amount > lastAmount * 1.5) {
                const spike = ((amount - lastAmount) / lastAmount * 100).toFixed(0);
                suggestions.push({
                    type: "warning",
                    icon: "zap",
                    title: `${cat} Costs Rising`,
                    message: `Your ${cat} spending jumped ${spike}% vs last month (₹${lastAmount.toLocaleString()} → ₹${amount.toLocaleString()}). Check if this is a one-time expense or a new pattern.`,
                    priority: 3
                });
                break; // Only show one category spike
            }
        }

        // ── 5. Budget Overspending ──
        for (const budget of budgets) {
            if (!budget.categories) continue;
            for (const cat of budget.categories) {
                const spent = categoryMap[cat.name] || 0;
                const pct = cat.limit > 0 ? (spent / cat.limit * 100).toFixed(0) : 0;

                if (pct > 100) {
                    suggestions.push({
                        type: "danger",
                        icon: "alert-circle",
                        title: `${cat.name} Over Budget`,
                        message: `You've spent ₹${spent.toLocaleString()} on ${cat.name} — that's ${pct}% of your ₹${cat.limit.toLocaleString()} budget. Try to limit further spending in this category.`,
                        priority: 1
                    });
                } else if (pct > 80) {
                    suggestions.push({
                        type: "warning",
                        icon: "alert-triangle",
                        title: `${cat.name} Budget Warning`,
                        message: `You've used ${pct}% of your ${cat.name} budget (₹${spent.toLocaleString()} / ₹${cat.limit.toLocaleString()}). Pace yourself for the rest of the month.`,
                        priority: 2
                    });
                }
            }
        }

        // ── 6. No Income This Month ──
        if (thisMonthIncome === 0 && thisMonthExpense > 0) {
            suggestions.push({
                type: "info",
                icon: "dollar-sign",
                title: "No Income Recorded",
                message: "You haven't logged any income this month. Make sure to track all income sources for accurate insights.",
                priority: 3
            });
        }

        // ── 7. Weekend Spending Pattern ──
        const weekendExpenses = thisMonthTx.filter(t => {
            const day = new Date(t.date).getDay();
            return t.type === "expense" && (day === 0 || day === 6);
        });
        const weekendTotal = weekendExpenses.reduce((s, t) => s + t.amount, 0);
        if (thisMonthExpense > 0 && weekendTotal / thisMonthExpense > 0.45) {
            suggestions.push({
                type: "info",
                icon: "calendar",
                title: "Weekend Spending Pattern",
                message: `${(weekendTotal / thisMonthExpense * 100).toFixed(0)}% of your expenses happen on weekends. Planning weekend activities in advance could help reduce impulsive purchases.`,
                priority: 4
            });
        }

        // ── 8. Quick Tip (always show one) ──
        const tips = [
            { title: "50/30/20 Rule", message: "Try allocating 50% for needs, 30% for wants, and 20% for savings. It's a simple framework for balanced finances." },
            { title: "Track Daily", message: "Logging expenses daily improves accuracy and builds financial awareness. Don't let small purchases slip through!" },
            { title: "Emergency Fund", message: "Aim to build an emergency fund covering 3–6 months of expenses. Start small and stay consistent." },
            { title: "Review Subscriptions", message: "Audit your recurring subscriptions quarterly. Cancel any you haven't used in the past month." },
            { title: "Cash Envelope Method", message: "For categories you overspend on, try setting aside cash at the start of the month. When it's gone, it's gone." }
        ];
        const dailyTip = tips[now.getDate() % tips.length];
        suggestions.push({
            type: "tip",
            icon: "lightbulb",
            title: dailyTip.title,
            message: dailyTip.message,
            priority: 6
        });

        // Sort by priority (lower = more urgent)
        suggestions.sort((a, b) => a.priority - b.priority);

        res.json(suggestions);
    } catch (err) {
        console.error("Suggestions error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
