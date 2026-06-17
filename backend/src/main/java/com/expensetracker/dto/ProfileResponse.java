package com.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileResponse {
    private String name;
    private String email;
    private String role;
    private Double income;
    private Double savingsGoal;
    private Double targetExpense;
}
