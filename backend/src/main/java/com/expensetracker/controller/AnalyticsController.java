package com.expensetracker.controller;

import com.expensetracker.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<?> summary(Authentication auth) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(analyticsService.getSummary(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/category")
    public ResponseEntity<?> category(Authentication auth) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(analyticsService.getCategoryBreakdown(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/monthly")
    public ResponseEntity<?> monthly(Authentication auth) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(analyticsService.getMonthlyTrend(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/income-vs-expense")
    public ResponseEntity<?> incomeVsExpense(Authentication auth) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(analyticsService.getIncomeVsExpense(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
