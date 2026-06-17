package com.expensetracker.dto;

import lombok.Data;

@Data
public class SavingsGoalRequest {
    private String title;
    private Double targetAmount;
}
