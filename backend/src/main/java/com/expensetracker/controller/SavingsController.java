package com.expensetracker.controller;

import com.expensetracker.dto.AddMoneyRequest;
import com.expensetracker.dto.SavingsGoalRequest;
import com.expensetracker.service.SavingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/savings")
public class SavingsController {

    @Autowired
    private SavingsService savingsService;

    @PostMapping("/add")
    public ResponseEntity<?> addGoal(Authentication auth, @RequestBody SavingsGoalRequest request) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(savingsService.addGoal(userId, request));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllGoals(Authentication auth) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(savingsService.getAllGoals(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PostMapping("/{id}/add-money")
    public ResponseEntity<?> addMoney(@PathVariable Long id, @RequestBody AddMoneyRequest request) {
        try {
            return ResponseEntity.ok(savingsService.addMoney(id, request));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(savingsService.deleteGoal(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
