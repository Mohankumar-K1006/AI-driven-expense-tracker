package com.expensetracker.controller;

import com.expensetracker.dto.BudgetRequest;
import com.expensetracker.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @PostMapping("/set")
    public ResponseEntity<?> setBudget(Authentication auth, @RequestBody BudgetRequest request) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(budgetService.setBudget(userId, request));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/analysis")
    public ResponseEntity<?> getAnalysis(Authentication auth) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(budgetService.getAnalysis(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
