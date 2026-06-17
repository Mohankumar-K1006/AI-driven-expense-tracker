package com.expensetracker.service;

import com.expensetracker.dto.SummaryResponse;
import com.expensetracker.dto.TransactionRequest;
import com.expensetracker.model.Transaction;
import com.expensetracker.model.User;
import com.expensetracker.repository.TransactionRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, String> addTransaction(Long userId, TransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = Transaction.builder()
                .user(user)
                .type(request.getType())
                .category(request.getCategory())
                .amount(request.getAmount())
                .description(request.getDescription())
                .date(request.getDate() != null && !request.getDate().isEmpty()
                        ? LocalDate.parse(request.getDate())
                        : LocalDate.now())
                .build();

        transactionRepository.save(transaction);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Transaction added successfully");
        return response;
    }

    public List<Map<String, Object>> getAllTransactions(Long userId) {
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateDesc(userId);
        return transactions.stream().map(this::toMap).collect(Collectors.toList());
    }

    public Map<String, String> deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Transaction deleted");
        return response;
    }

    public Map<String, Object> updateTransaction(Long id, TransactionRequest request) {
        Transaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        tx.setType(request.getType());
        tx.setCategory(request.getCategory());
        tx.setAmount(request.getAmount());
        tx.setDescription(request.getDescription());
        if (request.getDate() != null && !request.getDate().isEmpty()) {
            tx.setDate(LocalDate.parse(request.getDate()));
        }

        transactionRepository.save(tx);
        return toMap(tx);
    }

    public SummaryResponse getSummary(Long userId) {
        List<Transaction> transactions = transactionRepository.findByUserId(userId);

        double income = transactions.stream()
                .filter(t -> "income".equals(t.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        double expense = transactions.stream()
                .filter(t -> "expense".equals(t.getType()))
                .mapToDouble(Transaction::getAmount)
                .sum();

        return new SummaryResponse(income, expense, income - expense);
    }

    private Map<String, Object> toMap(Transaction tx) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("_id", tx.getId());
        map.put("user", tx.getUser().getId());
        map.put("type", tx.getType());
        map.put("category", tx.getCategory());
        map.put("amount", tx.getAmount());
        map.put("description", tx.getDescription());
        map.put("date", tx.getDate() != null ? tx.getDate().atStartOfDay().toString() : null);
        return map;
    }
}
