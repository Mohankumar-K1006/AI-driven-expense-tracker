package com.expensetracker.controller;

import com.expensetracker.service.SuggestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {

    @Autowired
    private SuggestionService suggestionService;

    @GetMapping
    public ResponseEntity<?> getSuggestions(Authentication auth) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(suggestionService.getSuggestions(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
