const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

// ADD TRANSACTION
router.post("/add", auth, async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;

    const transaction = new Transaction({
      user: req.user.id,
      type,
      category,
      amount,
      description,
      date: date || Date.now()
    });

    await transaction.save();
    res.json({ message: "Transaction added successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL TRANSACTIONS
router.get("/all", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE TRANSACTION
router.delete("/:id", auth, async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// UPDATE TRANSACTION
router.put("/:id", auth, async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      { type, category, amount, description, date },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DASHBOARD SUMMARY
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
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ANALYTICS: Category-wise expense breakdown (for Pie Chart)
router.get("/analytics/category", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user.id,
      type: "expense"
    });

    const categoryMap = {};
    transactions.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    const categories = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount
    }));

    res.json(categories);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ANALYTICS: Monthly expense trend (for Bar Chart)
router.get("/analytics/monthly", auth, async (req, res) => {
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
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (!monthMap[key]) monthMap[key] = { key, label, amount: 0 };
      monthMap[key].amount += t.amount;
    });

    // Sort by date key and return last 12 months
    const months = Object.values(monthMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-12)
      .map(({ label, amount }) => ({ month: label, expense: amount }));

    res.json(months);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

