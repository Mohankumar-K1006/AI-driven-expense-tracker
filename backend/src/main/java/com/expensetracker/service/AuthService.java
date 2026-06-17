package com.expensetracker.service;

import com.expensetracker.dto.*;
import com.expensetracker.model.User;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public Map<String, String> register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User Registered Successfully");
        return response;
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getRole());
        return new AuthResponse(token, user.getName(), user.getRole());
    }

    public Map<String, String> forgotPassword(ForgotPasswordRequest request, String origin) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No user found with that email address"));

        String resetToken = UUID.randomUUID().toString();
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordExpires(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        String frontendUrl = (origin != null && !origin.isEmpty()) ? origin : "http://127.0.0.1:5500";
        String resetUrl = frontendUrl + "/frontend/reset-password.html?token=" + resetToken;

        // Log the reset URL to console (in production, send email)
        System.out.println("Password Reset URL: " + resetUrl);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset email sent successfully.");
        response.put("resetUrl", resetUrl); // Include for dev/testing
        return response;
    }

    public Map<String, String> resetPassword(String token, ResetPasswordRequest request) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new RuntimeException("Password reset token is invalid or has expired."));

        if (user.getResetPasswordExpires() == null || user.getResetPasswordExpires().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Password reset token is invalid or has expired.");
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpires(null);
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password has been successfully updated.");
        return response;
    }
}
