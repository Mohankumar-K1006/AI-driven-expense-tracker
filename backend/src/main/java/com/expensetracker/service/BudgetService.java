package com.expensetracker.service;

import com.expensetracker.dto.BudgetRequest;
import com.expensetracker.model.Budget;
import com.expensetracker.model.BudgetCategory;
import com.expensetracker.model.Transaction;
import com.expensetracker.model.User;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.TransactionRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, String> setBudget(Long userId, BudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int month = LocalDate.now().getMonthValue();
        int year = LocalDate.now().getYear();

        Optional<Budget> existingBudget = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);

        Budget budget;
        String message;

        if (existingBudget.isPresent()) {
            budget = existingBudget.get();
            budget.getCategories().clear();
            message = "Budget Updated Successfully";
        } else {
            budget = Budget.builder()
                    .user(user)
                    .month(month)
                    .year(year)
                    .build();
            message = "Budget Created Successfully";
        }

        for (BudgetRequest.CategoryItem item : request.getCategories()) {
            BudgetCategory cat = BudgetCategory.builder()
                    .budget(budget)
                    .name(item.getName())
                    .limit(item.getLimit())
                    .build();
            budget.getCategories().add(cat);
        }

        budgetRepository.save(budget);

        Map<String, String> response = new HashMap<>();
        response.put("message", message);
        return response;
    }

    public Map<String, Object> getAnalysis(Long userId) {
        int month = LocalDate.now().getMonthValue();
        int year = LocalDate.now().getYear();

        Optional<Budget> budgetOpt = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);

        if (budgetOpt.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("categories", Collections.emptyList());
            return response;
        }

        Budget budget = budgetOpt.get();
        List<Transaction> expenses = transactionRepository.findByUserIdAndType(userId, "expense");

        // Build category spending map
        Map<String, Double> spendingMap = expenses.stream()
                .collect(Collectors.groupingBy(Transaction::getCategory,
                        Collectors.summingDouble(Transaction::getAmount)));

        List<Map<String, Object>> result = budget.getCategories().stream().map(cat -> {
            double spent = spendingMap.getOrDefault(cat.getName(), 0.0);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("category", cat.getName());
            item.put("limit", cat.getLimit());
            item.put("spent", spent);
            item.put("remaining", cat.getLimit() - spent);
            return item;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("categories", result);
        return response;
    }
}
