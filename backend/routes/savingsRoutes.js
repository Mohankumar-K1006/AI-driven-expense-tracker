const express = require("express");
const router = express.Router();
const SavingsGoal = require("../models/SavingsGoal");
const auth = require("../middleware/auth");

// 🔥 Create Goal
router.post("/add", auth, async (req, res) => {
    const { title, targetAmount } = req.body;

    const goal = new SavingsGoal({
        user: req.user.id,
        title,
        targetAmount
    });

    await goal.save();
    res.json({ message: "Savings Goal Created" });
});


// 🔥 Add Money to Goal
router.put("/add-money/:id", auth, async (req, res) => {
    const { amount } = req.body;

    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) return res.status(404).json({ message: "Goal not found" });

    goal.savedAmount += amount;
    await goal.save();

    res.json({ message: "Money Added" });
});


// 🔥 Get All Goals
router.get("/", auth, async (req, res) => {

    const goals = await SavingsGoal.find({ user: req.user.id });

    const formatted = goals.map(goal => ({
        _id: goal._id,
        title: goal.title,
        targetAmount: goal.targetAmount,
        savedAmount: goal.savedAmount,
        remaining: goal.targetAmount - goal.savedAmount,
        percentage: ((goal.savedAmount / goal.targetAmount) * 100).toFixed(1),
        completed: goal.savedAmount >= goal.targetAmount
    }));

    res.json(formatted);
});

// 🔥 Delete Goal
router.delete("/:id", auth, async (req, res) => {
    try {
        await SavingsGoal.findByIdAndDelete(req.params.id);
        res.json({ message: "Goal deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;