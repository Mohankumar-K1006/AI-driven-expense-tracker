const express = require("express");
const router = express.Router();
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

// 1️⃣ Set / Update Monthly Budget
router.post("/set", auth, async (req, res) => {
    try {
        const { categories } = req.body;

        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        let budget = await Budget.findOne({
            user: req.user.id,
            month,
            year
        });

        if (budget) {
            budget.categories = categories;
            await budget.save();
            return res.json({ message: "Budget Updated Successfully" });
        }

        budget = new Budget({
            user: req.user.id,
            month,
            year,
            categories
        });

        await budget.save();

        res.json({ message: "Budget Created Successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 2️⃣ Budget Analysis (Auto Expense Tracking)
router.get("/analysis", auth, async (req, res) => {
    try {
        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        const budget = await Budget.findOne({
            user: req.user.id,
            month,
            year
        });

        if (!budget) return res.json({ categories: [] });

        const transactions = await Transaction.find({
            user: req.user.id,
            type: "expense"
        });

        const result = budget.categories.map(cat => {

            const spent = transactions
                .filter(t => t.category === cat.name)
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                category: cat.name,
                limit: cat.limit,
                spent,
                remaining: cat.limit - spent
            };
        });

        res.json({ categories: result });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
