package com.expensetracker.service;

import com.expensetracker.model.Transaction;
import com.expensetracker.repository.TransactionRepository;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ExportService {

    @Autowired
    private TransactionRepository transactionRepository;

    public String exportCsv(Long userId) {
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateDesc(userId);
        StringBuilder sb = new StringBuilder();
        sb.append("Date,Type,Category,Amount,Description\n");
        for (Transaction t : transactions) {
            String date = t.getDate() != null ? t.getDate().toString() : "";
            String desc = t.getDescription() != null ? t.getDescription().replace(",", " ") : "";
            sb.append(String.format("%s,%s,%s,%.2f,%s\n", date, t.getType(), t.getCategory(), t.getAmount(), desc));
        }
        return sb.toString();
    }

    public byte[] exportPdf(Long userId) {
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateDesc(userId);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 50, 50);
        try {
            PdfWriter.getInstance(document, baos);
            document.open();
            Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(37, 99, 235));
            Paragraph title = new Paragraph("ExpenseTracker Financial Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(Chunk.NEWLINE);

            double income = 0, expense = 0;
            for (Transaction t : transactions) {
                if ("income".equals(t.getType())) income += t.getAmount();
                else expense += t.getAmount();
            }

            Font sFont = new Font(Font.HELVETICA, 14, Font.BOLD);
            Font nFont = new Font(Font.HELVETICA, 12, Font.NORMAL);
            document.add(new Paragraph("Summary", sFont));
            document.add(new Paragraph("Total Income: Rs. " + income, nFont));
            document.add(new Paragraph("Total Expense: Rs. " + expense, nFont));
            document.add(new Paragraph("Net Balance: Rs. " + (income - expense), nFont));
            document.add(Chunk.NEWLINE);

            document.add(new Paragraph("Transaction History", sFont));
            document.add(Chunk.NEWLINE);
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{18, 12, 20, 15, 35});
            Font hFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
            Color hBg = new Color(37, 99, 235);
            for (String h : new String[]{"Date", "Type", "Category", "Amount", "Description"}) {
                PdfPCell cell = new PdfPCell(new Phrase(h, hFont));
                cell.setBackgroundColor(hBg);
                cell.setPadding(8);
                table.addCell(cell);
            }
            Font cFont = new Font(Font.HELVETICA, 9, Font.NORMAL);
            for (Transaction t : transactions) {
                table.addCell(new Phrase(t.getDate() != null ? t.getDate().toString() : "", cFont));
                table.addCell(new Phrase(t.getType(), cFont));
                table.addCell(new Phrase(t.getCategory(), cFont));
                table.addCell(new Phrase("Rs. " + t.getAmount(), cFont));
                table.addCell(new Phrase(t.getDescription() != null ? t.getDescription() : "-", cFont));
            }
            document.add(table);
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage());
        }
        return baos.toByteArray();
    }
}
