package com.expensetracker.service;

import com.expensetracker.dto.SuggestionResponse;
import com.expensetracker.model.Budget;
import com.expensetracker.model.BudgetCategory;
import com.expensetracker.model.Transaction;
import com.expensetracker.model.User;
import com.expensetracker.repository.BudgetRepository;
import com.expensetracker.repository.TransactionRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SuggestionService {

    @Autowired private TransactionRepository transactionRepository;
    @Autowired private BudgetRepository budgetRepository;
    @Autowired private UserRepository userRepository;

    public List<SuggestionResponse> getSuggestions(Long userId) {
        List<SuggestionResponse> suggestions = new ArrayList<>();
        List<Transaction> transactions = transactionRepository.findByUserId(userId);

        if (transactions.isEmpty()) {
            suggestions.add(SuggestionResponse.builder()
                    .type("info").icon("rocket").title("Get Started!")
                    .message("Add your first transaction to start receiving personalized financial insights.")
                    .priority(1).build());
            return suggestions;
        }

        LocalDate now = LocalDate.now();
        int thisMonth = now.getMonthValue();
        int thisYear = now.getYear();
        int lastMonth = thisMonth == 1 ? 12 : thisMonth - 1;
        int lastMonthYear = thisMonth == 1 ? thisYear - 1 : thisYear;

        List<Transaction> thisMonthTx = transactions.stream()
                .filter(t -> t.getDate().getMonthValue() == thisMonth && t.getDate().getYear() == thisYear)
                .collect(Collectors.toList());
        List<Transaction> lastMonthTx = transactions.stream()
                .filter(t -> t.getDate().getMonthValue() == lastMonth && t.getDate().getYear() == lastMonthYear)
                .collect(Collectors.toList());

        double totalIncome = transactions.stream().filter(t -> "income".equals(t.getType())).mapToDouble(Transaction::getAmount).sum();
        double totalExpense = transactions.stream().filter(t -> "expense".equals(t.getType())).mapToDouble(Transaction::getAmount).sum();
        double thisMonthExpense = thisMonthTx.stream().filter(t -> "expense".equals(t.getType())).mapToDouble(Transaction::getAmount).sum();
        double thisMonthIncome = thisMonthTx.stream().filter(t -> "income".equals(t.getType())).mapToDouble(Transaction::getAmount).sum();
        double lastMonthExpense = lastMonthTx.stream().filter(t -> "expense".equals(t.getType())).mapToDouble(Transaction::getAmount).sum();

        Map<String, Double> categoryMap = thisMonthTx.stream().filter(t -> "expense".equals(t.getType()))
                .collect(Collectors.groupingBy(Transaction::getCategory, Collectors.summingDouble(Transaction::getAmount)));
        Map<String, Double> lastCategoryMap = lastMonthTx.stream().filter(t -> "expense".equals(t.getType()))
                .collect(Collectors.groupingBy(Transaction::getCategory, Collectors.summingDouble(Transaction::getAmount)));

        // 1. Savings rate
        if (totalIncome > 0) {
            long savingsRate = Math.round((totalIncome - totalExpense) / totalIncome * 100);
            if (savingsRate < 10) {
                suggestions.add(SuggestionResponse.builder().type("warning").icon("alert-triangle").title("Low Savings Rate")
                        .message("Your savings rate is only " + savingsRate + "%. Financial experts recommend saving at least 20% of your income.")
                        .priority(2).build());
            } else if (savingsRate >= 30) {
                suggestions.add(SuggestionResponse.builder().type("success").icon("trending-up").title("Great Savings Habit!")
                        .message("You're saving " + savingsRate + "% of your income - excellent! Consider investing the surplus.")
                        .priority(5).build());
            }
        }

        // 2. Month-over-month trend
        if (lastMonthExpense > 0 && thisMonthExpense > 0) {
            long changePercent = Math.round((thisMonthExpense - lastMonthExpense) / lastMonthExpense * 100);
            if (changePercent > 20) {
                suggestions.add(SuggestionResponse.builder().type("danger").icon("trending-up").title("Spending Spike Detected")
                        .message("Expenses increased by " + changePercent + "% compared to last month. Review recent purchases.")
                        .priority(1).build());
            } else if (changePercent < -15) {
                suggestions.add(SuggestionResponse.builder().type("success").icon("trending-down").title("Spending Reduced!")
                        .message("Great job! Spending decreased by " + Math.abs(changePercent) + "% this month.")
                        .priority(4).build());
            }
        }

        // 3. Top spending category
        if (!categoryMap.isEmpty()) {
            Map.Entry<String, Double> top = categoryMap.entrySet().stream().max(Map.Entry.comparingByValue()).get();
            long topPercent = thisMonthExpense > 0 ? Math.round(top.getValue() / thisMonthExpense * 100) : 0;
            if (topPercent > 40) {
                suggestions.add(SuggestionResponse.builder().type("warning").icon("pie-chart")
                        .title("Heavy " + top.getKey() + " Spending")
                        .message(top.getKey() + " accounts for " + topPercent + "% of this month's expenses.")
                        .priority(2).build());
            }
        }

        // 4. Category spike vs last month
        for (Map.Entry<String, Double> e : categoryMap.entrySet()) {
            double lastAmt = lastCategoryMap.getOrDefault(e.getKey(), 0.0);
            if (lastAmt > 0 && e.getValue() > lastAmt * 1.5) {
                long spike = Math.round((e.getValue() - lastAmt) / lastAmt * 100);
                suggestions.add(SuggestionResponse.builder().type("warning").icon("zap")
                        .title(e.getKey() + " Costs Rising")
                        .message(e.getKey() + " spending jumped " + spike + "% vs last month.")
                        .priority(3).build());
                break;
            }
        }

        // 5. Budget overspending
        List<Budget> budgets = budgetRepository.findByUserId(userId);
        for (Budget budget : budgets) {
            if (budget.getCategories() == null) continue;
            for (BudgetCategory cat : budget.getCategories()) {
                double spent = categoryMap.getOrDefault(cat.getName(), 0.0);
                long pct = cat.getLimit() > 0 ? Math.round(spent / cat.getLimit() * 100) : 0;
                if (pct > 100) {
                    suggestions.add(SuggestionResponse.builder().type("danger").icon("alert-circle")
                            .title(cat.getName() + " Over Budget")
                            .message("You've spent Rs." + spent + " on " + cat.getName() + " - that's " + pct + "% of your budget.")
                            .priority(1).build());
                } else if (pct > 80) {
                    suggestions.add(SuggestionResponse.builder().type("warning").icon("alert-triangle")
                            .title(cat.getName() + " Budget Warning")
                            .message("You've used " + pct + "% of your " + cat.getName() + " budget. Pace yourself.")
                            .priority(2).build());
                }
            }
        }

        // 6. No income this month
        if (thisMonthIncome == 0 && thisMonthExpense > 0) {
            suggestions.add(SuggestionResponse.builder().type("info").icon("dollar-sign").title("No Income Recorded")
                    .message("You haven't logged any income this month. Make sure to track all income sources.")
                    .priority(3).build());
        }

        // 7. Weekend spending pattern
        double weekendTotal = thisMonthTx.stream()
                .filter(t -> "expense".equals(t.getType()) && isWeekend(t.getDate()))
                .mapToDouble(Transaction::getAmount).sum();
        if (thisMonthExpense > 0 && weekendTotal / thisMonthExpense > 0.45) {
            long pct = Math.round(weekendTotal / thisMonthExpense * 100);
            suggestions.add(SuggestionResponse.builder().type("info").icon("calendar").title("Weekend Spending Pattern")
                    .message(pct + "% of your expenses happen on weekends. Planning ahead could help reduce impulsive purchases.")
                    .priority(4).build());
        }

        // 8. Daily tip
        String[][] tips = {
                {"50/30/20 Rule", "Try allocating 50% for needs, 30% for wants, and 20% for savings."},
                {"Track Daily", "Logging expenses daily improves accuracy and builds financial awareness."},
                {"Emergency Fund", "Aim to build an emergency fund covering 3-6 months of expenses."},
                {"Review Subscriptions", "Audit your recurring subscriptions quarterly."},
                {"Cash Envelope Method", "For categories you overspend on, try setting aside cash at the start of the month."}
        };
        String[] dailyTip = tips[now.getDayOfMonth() % tips.length];
        suggestions.add(SuggestionResponse.builder().type("tip").icon("lightbulb")
                .title(dailyTip[0]).message(dailyTip[1]).priority(6).build());

        suggestions.sort(Comparator.comparingInt(SuggestionResponse::getPriority));
        return suggestions;
    }

    private boolean isWeekend(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        return day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY;
    }
}
