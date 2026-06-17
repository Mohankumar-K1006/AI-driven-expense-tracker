package com.expensetracker.service;

import com.expensetracker.dto.ProfileRequest;
import com.expensetracker.dto.ProfileResponse;
import com.expensetracker.model.User;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    public ProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new ProfileResponse(
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getIncome(),
                user.getSavingsGoal(),
                user.getTargetExpense()
        );
    }

    public ProfileResponse updateProfile(Long userId, ProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getIncome() != null) user.setIncome(request.getIncome());
        if (request.getSavingsGoal() != null) user.setSavingsGoal(request.getSavingsGoal());
        if (request.getTargetExpense() != null) user.setTargetExpense(request.getTargetExpense());

        userRepository.save(user);

        return new ProfileResponse(
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getIncome(),
                user.getSavingsGoal(),
                user.getTargetExpense()
        );
    }
}
