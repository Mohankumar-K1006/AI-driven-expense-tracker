package com.expensetracker.dto;

import lombok.Data;

@Data
public class ProfileRequest {
    private Double income;
    private Double savingsGoal;
    private Double targetExpense;
}
