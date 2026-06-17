package com.expensetracker.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "budget_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "budget_id", nullable = false)
    @JsonIgnore
    private Budget budget;

    private String name;

    @Column(name = "budget_limit")
    private Double limit;
}
