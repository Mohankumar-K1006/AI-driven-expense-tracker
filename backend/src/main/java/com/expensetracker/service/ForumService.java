package com.expensetracker.service;

import com.expensetracker.dto.CommentRequest;
import com.expensetracker.dto.ForumPostRequest;
import com.expensetracker.model.Comment;
import com.expensetracker.model.ForumPost;
import com.expensetracker.model.User;
import com.expensetracker.repository.ForumPostRepository;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ForumService {

    @Autowired
    private ForumPostRepository forumPostRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Map<String, Object>> getPosts(String community) {
        List<ForumPost> posts;
        if (community == null || community.isEmpty() || "all".equals(community)) {
            posts = forumPostRepository.findAllByOrderByCreatedAtDesc();
        } else {
            posts = forumPostRepository.findByCommunityOrderByCreatedAtDesc(community);
        }
        return posts.stream().map(this::toMap).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getCommunities() {
        List<Map<String, Object>> communities = new ArrayList<>();
        String[] ids = {"all", "general", "budgeting", "investing", "savings", "tips"};
        String[] names = {"All Discussions", "General", "Budgeting", "Investing", "Savings", "Tips & Tricks"};

        long total = forumPostRepository.count();
        for (int i = 0; i < ids.length; i++) {
            Map<String, Object> c = new LinkedHashMap<>();
            c.put("id", ids[i]);
            c.put("name", names[i]);
            c.put("count", i == 0 ? total : forumPostRepository.countByCommunity(ids[i]));
            communities.add(c);
        }
        return communities;
    }

    public Map<String, Object> createPost(Long userId, ForumPostRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ForumPost post = ForumPost.builder()
                .user(user)
                .title(request.getTitle())
                .content(request.getContent())
                .community(request.getCommunity() != null ? request.getCommunity() : "general")
                .tags(request.getTags() != null ? request.getTags() : new ArrayList<>())
                .build();

        forumPostRepository.save(post);
        return toMap(post);
    }

    public Map<String, Object> toggleLike(Long postId, Long userId) {
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        boolean liked;
        if (post.getLikes().contains(userId)) {
            post.getLikes().remove(userId);
            liked = false;
        } else {
            post.getLikes().add(userId);
            liked = true;
        }
        forumPostRepository.save(post);

        Map<String, Object> result = new HashMap<>();
        result.put("likes", post.getLikes().size());
        result.put("liked", liked);
        return result;
    }

    public List<Map<String, Object>> addComment(Long postId, Long userId, CommentRequest request) {
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .forumPost(post)
                .userId(userId)
                .name(user.getName())
                .text(request.getText())
                .build();

        post.getComments().add(comment);
        forumPostRepository.save(post);

        return post.getComments().stream().map(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("user", c.getUserId());
            m.put("name", c.getName());
            m.put("text", c.getText());
            m.put("createdAt", c.getCreatedAt().toString());
            return m;
        }).collect(Collectors.toList());
    }

    private Map<String, Object> toMap(ForumPost post) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("_id", post.getId());

        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("_id", post.getUser().getId());
        userMap.put("name", post.getUser().getName());
        userMap.put("role", post.getUser().getRole());
        map.put("user", userMap);

        map.put("title", post.getTitle());
        map.put("content", post.getContent());
        map.put("community", post.getCommunity());
        map.put("tags", post.getTags());
        map.put("likes", post.getLikes());
        map.put("comments", post.getComments().stream().map(c -> {
            Map<String, Object> cm = new LinkedHashMap<>();
            cm.put("user", c.getUserId());
            cm.put("name", c.getName());
            cm.put("text", c.getText());
            cm.put("createdAt", c.getCreatedAt().toString());
            return cm;
        }).collect(Collectors.toList()));
        map.put("createdAt", post.getCreatedAt().toString());
        return map;
    }
}
