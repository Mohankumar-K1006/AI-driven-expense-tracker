package com.expensetracker.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String type; // "income" or "expense"

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Double amount;

    private String description;

    @Builder.Default
    private LocalDate date = LocalDate.now();
}
