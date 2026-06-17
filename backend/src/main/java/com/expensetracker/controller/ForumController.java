package com.expensetracker.controller;

import com.expensetracker.dto.CommentRequest;
import com.expensetracker.dto.ForumPostRequest;
import com.expensetracker.service.ForumService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/forum")
public class ForumController {

    @Autowired
    private ForumService forumService;

    @GetMapping("/posts")
    public ResponseEntity<?> getPosts(@RequestParam(required = false) String community) {
        try {
            return ResponseEntity.ok(forumService.getPosts(community));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/communities")
    public ResponseEntity<?> getCommunities() {
        try {
            return ResponseEntity.ok(forumService.getCommunities());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PostMapping("/posts")
    public ResponseEntity<?> createPost(Authentication auth, @RequestBody ForumPostRequest request) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(forumService.createPost(userId, request));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PostMapping("/posts/{id}/like")
    public ResponseEntity<?> toggleLike(Authentication auth, @PathVariable Long id) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(forumService.toggleLike(id, userId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PostMapping("/posts/{id}/comment")
    public ResponseEntity<?> addComment(Authentication auth, @PathVariable Long id,
                                         @RequestBody CommentRequest request) {
        try {
            Long userId = (Long) auth.getPrincipal();
            return ResponseEntity.ok(forumService.addComment(id, userId, request));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
