package com.expensetracker.controller;

import com.expensetracker.dto.TransactionRequest;
import com.expensetracker.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping("/add")
    public ResponseEntity<?> add(Authentication auth, @RequestBody TransactionRequest request) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(transactionService.addTransaction(userId, request));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAll(Authentication auth) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(transactionService.getAllTransactions(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(Authentication auth, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(transactionService.deleteTransaction(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(Authentication auth, @PathVariable Long id,
                                     @RequestBody TransactionRequest request) {
        try {
            return ResponseEntity.ok(transactionService.updateTransaction(id, request));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/summary")
    public ResponseEntity<?> summary(Authentication auth) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(transactionService.getSummary(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/analytics/category")
    public ResponseEntity<?> categoryAnalytics(Authentication auth) {
        try {
            Long userId = (Long) auth.getPrincipal();
            // Reuse analytics from transaction service context
            return ResponseEntity.ok(transactionService.getSummary(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/analytics/monthly")
    public ResponseEntity<?> monthlyAnalytics(Authentication auth) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(transactionService.getSummary(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
