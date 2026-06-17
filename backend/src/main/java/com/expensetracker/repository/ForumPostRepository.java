package com.expensetracker.repository;

import com.expensetracker.model.ForumPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {
    List<ForumPost> findAllByOrderByCreatedAtDesc();
    List<ForumPost> findByCommunityOrderByCreatedAtDesc(String community);
    long countByCommunity(String community);
}
