const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");
const PDFDocument = require("pdfkit");

// 📥 Export to CSV
router.get("/csv", auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", 'attachment; filename="transactions.csv"');

        // CSV Header
        res.write("Date,Type,Category,Amount,Description\n");

        transactions.forEach(i => {
            const date = new Date(i.date).toISOString().split("T")[0];
            const type = i.type;
            const category = i.category;
            const amount = i.amount;
            const desc = (i.description || "").replace(/,/g, " "); // escape commas
            
            res.write(`${date},${type},${category},${amount},${desc}\n`);
        });

        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📥 Export to PDF
router.get("/pdf", auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });

        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="transactions_report.pdf"');
        
        doc.pipe(res);

        // Header
        doc.fontSize(20).text("ExpenseTracker Financial Report", { align: "center" });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
        doc.moveDown(2);

        // Summary calculations
        let income = 0;
        let expense = 0;
        transactions.forEach(t => {
            if (t.type === "income") income += t.amount;
            else expense += t.amount;
        });

        doc.fontSize(14).text("Summary", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).text(`Total Income: Rs. ${income}`);
        doc.text(`Total Expense: Rs. ${expense}`);
        doc.text(`Net Balance: Rs. ${income - expense}`);
        doc.moveDown(2);

        // Table Header
        doc.fontSize(14).text("Transaction History", { underline: true });
        doc.moveDown(0.5);
        
        const startX = 50;
        let startY = doc.y;

        doc.fontSize(10).font("Helvetica-Bold");
        doc.text("Date", startX, startY, { width: 80 });
        doc.text("Type", startX + 80, startY, { width: 60 });
        doc.text("Category", startX + 140, startY, { width: 100 });
        doc.text("Amount", startX + 240, startY, { width: 80 });
        doc.text("Description", startX + 320, startY, { width: 150 });
        
        doc.moveTo(startX, startY + 15).lineTo(550, startY + 15).stroke();
        startY += 20;

        doc.font("Helvetica");

        transactions.forEach(t => {
            if (startY > 700) {
                doc.addPage();
                startY = 50;
            }
            
            const date = new Date(t.date).toISOString().split("T")[0];
            doc.text(date, startX, startY, { width: 80 });
            doc.text(t.type, startX + 80, startY, { width: 60 });
            doc.text(t.category, startX + 140, startY, { width: 100 });
            doc.text(`Rs. ${t.amount}`, startX + 240, startY, { width: 80 });
            doc.text(t.description || "-", startX + 320, startY, { width: 150 });
            
            startY += 15;
            doc.moveTo(startX, startY).lineTo(550, startY).stroke("#eeeeee");
            startY += 5;
        });

        doc.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
