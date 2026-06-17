package com.expensetracker.service;

import com.expensetracker.dto.AddMoneyRequest;
import com.expensetracker.dto.SavingsGoalRequest;
import com.expensetracker.model.SavingsGoal;
import com.expensetracker.model.User;
import com.expensetracker.repository.SavingsGoalRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SavingsService {

    @Autowired
    private SavingsGoalRepository savingsGoalRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, String> addGoal(Long userId, SavingsGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SavingsGoal goal = SavingsGoal.builder()
                .user(user)
                .title(request.getTitle())
                .targetAmount(request.getTargetAmount())
                .build();

        savingsGoalRepository.save(goal);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Savings Goal Created");
        return response;
    }

    public Map<String, String> addMoney(Long id, AddMoneyRequest request) {
        SavingsGoal goal = savingsGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        goal.setSavedAmount(goal.getSavedAmount() + request.getAmount());
        savingsGoalRepository.save(goal);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Money Added");
        return response;
    }

    public List<Map<String, Object>> getAllGoals(Long userId) {
        List<SavingsGoal> goals = savingsGoalRepository.findByUserId(userId);

        return goals.stream().map(goal -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("_id", goal.getId());
            map.put("title", goal.getTitle());
            map.put("targetAmount", goal.getTargetAmount());
            map.put("savedAmount", goal.getSavedAmount());
            map.put("remaining", goal.getTargetAmount() - goal.getSavedAmount());
            double percentage = goal.getTargetAmount() > 0
                    ? (goal.getSavedAmount() / goal.getTargetAmount()) * 100
                    : 0;
            map.put("percentage", String.format("%.1f", percentage));
            map.put("completed", goal.getSavedAmount() >= goal.getTargetAmount());
            return map;
        }).collect(Collectors.toList());
    }

    public Map<String, String> deleteGoal(Long id) {
        savingsGoalRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Goal deleted successfully");
        return response;
    }
}
