package com.expensetracker.controller;

import com.expensetracker.dto.ProfileRequest;
import com.expensetracker.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping
    public ResponseEntity<?> getProfile(Authentication auth) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(profileService.getProfile(userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(Authentication auth, @RequestBody ProfileRequest request) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(profileService.updateProfile(userId, request));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
