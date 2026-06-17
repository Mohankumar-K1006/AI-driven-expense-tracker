package com.expensetracker.dto;

import lombok.Data;
import java.util.List;

@Data
public class BudgetRequest {
    private List<CategoryItem> categories;

    @Data
    public static class CategoryItem {
        private String name;
        private Double limit;
    }
}
