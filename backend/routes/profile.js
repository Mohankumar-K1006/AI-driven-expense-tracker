const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

// GET user profile
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      income: user.income,
      savingsGoal: user.savingsGoal,
      targetExpense: user.targetExpense
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE user profile
router.put("/", auth, async (req, res) => {
  try {
    const { income, savingsGoal, targetExpense } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { income, savingsGoal, targetExpense },
      { new: true }
    ).select("-password");

    res.json({
      name: user.name,
      email: user.email,
      role: user.role,
      income: user.income,
      savingsGoal: user.savingsGoal,
      targetExpense: user.targetExpense
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
