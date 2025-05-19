package com.mediumapp.blog_backend.controller;

import com.mediumapp.blog_backend.dto.PostDTO;
import com.mediumapp.blog_backend.dto.PostSummaryDTO;
import com.mediumapp.blog_backend.dto.StatsDTO;
import com.mediumapp.blog_backend.dto.PostByDateDTO;
import com.mediumapp.blog_backend.entity.User;
import com.mediumapp.blog_backend.enums.PostStatus;
import com.mediumapp.blog_backend.enums.Role;
import com.mediumapp.blog_backend.exception.ApiException;
import com.mediumapp.blog_backend.repository.UserRepository;
import com.mediumapp.blog_backend.service.CommentService;
import com.mediumapp.blog_backend.service.PostService;
import com.mediumapp.blog_backend.service.UserService;
import com.mediumapp.blog_backend.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final PostService postService;
    private final UserService userService;
    private final TagService tagService;
    private final CommentService commentService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AdminController(PostService postService, UserService userService, TagService tagService, CommentService commentService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.postService = postService;
        this.userService = userService;
        this.tagService = tagService;
        this.commentService = commentService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/check-role")
    public ResponseEntity<Void> checkRole() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats/posts")
    public ResponseEntity<StatsDTO> getTotalPosts() {
        long total = postService.getTotalPosts();
        return ResponseEntity.ok(new StatsDTO((int) total));
    }

    @GetMapping("/stats/users")
    public ResponseEntity<StatsDTO> getTotalUsers() {
        long total = userService.getTotalUsers();
        return ResponseEntity.ok(new StatsDTO((int) total));
    }

    @GetMapping("/stats/tags")
    public ResponseEntity<StatsDTO> getTotalTags() {
        long total = tagService.getTotalTags();
        return ResponseEntity.ok(new StatsDTO((int) total));
    }

    @GetMapping("/stats/posts-by-date")
    public ResponseEntity<List<PostByDateDTO>> getPostsByDate() {
        List<Object[]> results = postService.getPostsByDate();
        List<PostByDateDTO> data = results.stream().map(row ->
                new PostByDateDTO(row[0].toString(), ((Number) row[1]).intValue())
        ).collect(Collectors.toList());
        return ResponseEntity.ok(data);
    }

    @GetMapping("/stats/users-by-date")
    public ResponseEntity<List<PostByDateDTO>> getUsersByDate() {
        List<Object[]> results = userService.getUsersByDate();
        List<PostByDateDTO> data = results.stream()
                .map(row -> new PostByDateDTO(
                        row[0] != null ? row[0].toString() : "Unknown", // Xử lý null cho date
                        ((Number) row[1]).intValue()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(data);
    }

    @GetMapping("/stats/page-views")
    public ResponseEntity<StatsDTO> getPageViews() {
        // Giả lập số lượt truy cập (cần triển khai logic thực tế)
        return ResponseEntity.ok(new StatsDTO(1000));
    }

    @GetMapping("/stats/pending-posts")
    public ResponseEntity<StatsDTO> getPendingPosts() {
        long pendingCount = postService.countPostsByStatus(PostStatus.PENDING);
        return ResponseEntity.ok(new StatsDTO((int) pendingCount));
    }

    @GetMapping("/stats/post-status")
    public ResponseEntity<Map<String, Integer>> getPostStatusStats() {
        Map<String, Integer> stats = new HashMap<>();
        stats.put("approved", (int) postService.countPostsByStatus(PostStatus.APPROVED));
        stats.put("pending", (int) postService.countPostsByStatus(PostStatus.PENDING));
        stats.put("overdue", (int) postService.countPostsByStatus(PostStatus.OVERDUE));
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/posts")
    public ResponseEntity<Page<PostDTO>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PostDTO> posts = postService.getAllPosts(pageable);
        return ResponseEntity.ok(posts);
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/posts/recent")
    public ResponseEntity<Page<PostSummaryDTO>> getRecentPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "7") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        Page<PostDTO> posts = postService.getAllPosts(pageable);
        Page<PostSummaryDTO> summary = posts.map(post -> {
            int commentCount = commentService.findByPostId(post.getId()).size();
            return new PostSummaryDTO(post.getId(), post.getName(), post.getPostedBy(),
                    post.getDate(), post.getLikeCounts(), post.getViewCounts(), commentCount, post.getStatus());
        });
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/posts/top")
    public ResponseEntity<Page<PostSummaryDTO>> getTopPosts(
            @RequestParam(defaultValue = "viewCounts") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "7") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        Page<PostDTO> posts = postService.getAllPosts(pageable);
        Page<PostSummaryDTO> summary = posts.map(post -> {
            int commentCount = commentService.findByPostId(post.getId()).size();
            return new PostSummaryDTO(post.getId(), post.getName(), post.getPostedBy(),
                    post.getDate(), post.getLikeCounts(), post.getViewCounts(), commentCount, post.getStatus());
        });
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/posts/{postId}/approve")
    public ResponseEntity<PostDTO> approvePost(@PathVariable Long postId) {
        postService.approvePost(postId);
        return ResponseEntity.ok(postService.getPostById(postId));
    }

    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<User> updateRole(@PathVariable Long userId, @RequestBody Map<String, String> roleUpdate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getRole() == Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Cannot change ADMIN role");
        }
        String newRole = roleUpdate.get("role");
        if (newRole.equals("STAFF") || newRole.equals("USER")) {
            user.setRole(Role.valueOf(newRole));
            return ResponseEntity.ok(userRepository.save(user));
        }
        throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid role");
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }
}