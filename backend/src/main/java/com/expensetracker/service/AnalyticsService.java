package com.expensetracker.service;

import com.expensetracker.model.Transaction;
import com.expensetracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private TransactionRepository transactionRepository;

    private static final String[] MONTH_NAMES = {
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    };

    public Map<String, Object> getSummary(Long userId) {
        List<Transaction> transactions = transactionRepository.findByUserId(userId);

        double income = transactions.stream()
                .filter(t -> "income".equals(t.getType()))
                .mapToDouble(Transaction::getAmount).sum();

        double expense = transactions.stream()
                .filter(t -> "expense".equals(t.getType()))
                .mapToDouble(Transaction::getAmount).sum();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("income", income);
        result.put("expense", expense);
        result.put("balance", income - expense);
        return result;
    }

    public List<Map<String, Object>> getCategoryBreakdown(Long userId) {
        List<Transaction> expenses = transactionRepository.findByUserIdAndType(userId, "expense");

        Map<String, Double> categoryMap = expenses.stream()
                .collect(Collectors.groupingBy(Transaction::getCategory,
                        Collectors.summingDouble(Transaction::getAmount)));

        return categoryMap.entrySet().stream().map(entry -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("_id", entry.getKey());
            item.put("total", entry.getValue());
            return item;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getMonthlyTrend(Long userId) {
        List<Transaction> expenses = transactionRepository.findByUserIdAndType(userId, "expense");
        return buildMonthlyData(expenses, false);
    }

    public List<Map<String, Object>> getIncomeVsExpense(Long userId) {
        List<Transaction> transactions = transactionRepository.findByUserId(userId);

        // Group by month key
        Map<String, Map<String, Object>> monthMap = new TreeMap<>();

        for (Transaction t : transactions) {
            LocalDate d = t.getDate();
            String key = String.format("%d-%02d", d.getYear(), d.getMonthValue() - 1);
            String label = MONTH_NAMES[d.getMonthValue() - 1] + " " + d.getYear();

            monthMap.computeIfAbsent(key, k -> {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("key", k);
                entry.put("month", label);
                entry.put("income", 0.0);
                entry.put("expense", 0.0);
                return entry;
            });

            Map<String, Object> entry = monthMap.get(key);
            if ("income".equals(t.getType())) {
                entry.put("income", (double) entry.get("income") + t.getAmount());
            } else {
                entry.put("expense", (double) entry.get("expense") + t.getAmount());
            }
        }

        List<Map<String, Object>> result = new ArrayList<>(monthMap.values());
        // Get last 12 months
        int start = Math.max(0, result.size() - 12);
        result = result.subList(start, result.size());

        // Remove the internal 'key' field
        result.forEach(m -> m.remove("key"));
        return result;
    }

    private List<Map<String, Object>> buildMonthlyData(List<Transaction> transactions, boolean includeIncome) {
        Map<String, Map<String, Object>> monthMap = new TreeMap<>();

        for (Transaction t : transactions) {
            LocalDate d = t.getDate();
            String key = String.format("%d-%02d", d.getYear(), d.getMonthValue() - 1);
            String label = MONTH_NAMES[d.getMonthValue() - 1] + " " + d.getYear();

            monthMap.computeIfAbsent(key, k -> {
                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("key", k);
                entry.put("month", label);
                entry.put("expense", 0.0);
                return entry;
            });

            Map<String, Object> entry = monthMap.get(key);
            entry.put("expense", (double) entry.get("expense") + t.getAmount());
        }

        List<Map<String, Object>> result = new ArrayList<>(monthMap.values());
        int start = Math.max(0, result.size() - 12);
        result = result.subList(start, result.size());

        result.forEach(m -> m.remove("key"));
        return result;
    }
}
