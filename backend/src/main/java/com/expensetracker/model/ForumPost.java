package com.expensetracker.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "forum_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Builder.Default
    private String community = "general"; // general, budgeting, investing, savings, tips

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "forum_post_tags", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "forum_post_likes", joinColumns = @JoinColumn(name = "post_id"))
    @Column(name = "user_id")
    @Builder.Default
    private List<Long> likes = new ArrayList<>();

    @OneToMany(mappedBy = "forumPost", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
