package com.expensetracker.dto;

import lombok.Data;

@Data
public class TransactionRequest {
    private String type;
    private String category;
    private Double amount;
    private String description;
    private String date;
}
