package com.expensetracker.dto;

import lombok.Data;
import java.util.List;

@Data
public class ForumPostRequest {
    private String title;
    private String content;
    private String community;
    private List<String> tags;
}
