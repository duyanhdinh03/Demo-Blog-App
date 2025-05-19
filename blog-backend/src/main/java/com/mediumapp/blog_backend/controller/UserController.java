package com.mediumapp.blog_backend.controller;

import com.cloudinary.Cloudinary;
import com.mediumapp.blog_backend.dto.SettingsDTO;
import com.mediumapp.blog_backend.dto.UserProfileDTO;
import com.mediumapp.blog_backend.entity.*;
import com.mediumapp.blog_backend.exception.ApiException;
import com.mediumapp.blog_backend.service.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@Slf4j
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    @Autowired
    private CommentService commentService;

    @Autowired
    private SettingsService settingsService;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Lấy thông tin hồ sơ người dùng hiện tại
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Fetching profile for user: {}", username);
        User user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    // Cập nhật thông tin hồ sơ
    @PutMapping("/profile/update")
    public ResponseEntity<User> updateProfile(@RequestBody User updatedUser) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Updating profile for user: {}", username);
        User user = userService.updateUserProfile(username, updatedUser);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileDTO> getUserByUsername(@PathVariable String username) {
        log.info("Fetching user profile for username: {}", username);
        User user = userService.getUserByUsername(username);
        UserProfileDTO profile = new UserProfileDTO(
                user.getUsername(),
                user.getEmail(),
                user.getRole().toString(),
                user.getAvatarUrl()
        );
        return ResponseEntity.ok(profile);
    }

    // Cập nhật ảnh đại diện
    @PostMapping("/profile/update-avatar")
    public ResponseEntity<?> updateAvatar(@RequestParam("avatar") MultipartFile file) throws IOException {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Updating avatar for user: {}", username);

        // Kiểm tra file
        if (file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Avatar file is empty");
        }
        if (file.getSize() > 5 * 1024 * 1024) { // 5MB
            throw new ApiException(HttpStatus.BAD_REQUEST, "File size exceeds 5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only image files are allowed");
        }

        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), Map.of("folder", "avatars"));
        String avatarUrl = uploadResult.get("url").toString();
        userService.updateAvatar(username, avatarUrl);
        return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
    }

    // Đổi mật khẩu
    @PostMapping("/profile/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> passwordData) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Changing password for user: {}", username);

        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");
        if (currentPassword == null || newPassword == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password and new password are required");
        }

        userService.changePassword(username, currentPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    // Xóa tài khoản
    @PostMapping("/profile/delete-request")
    public ResponseEntity<?> deleteAccount() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Deleting account for user: {}", username);
        userService.deleteUserByUsername(username);
        return ResponseEntity.ok("Account deleted successfully");
    }

    // Tạo bài viết
    @PostMapping("/posts/create")
    public ResponseEntity<?> createPost(@RequestParam("name") String name,
                                        @RequestParam("content") String content,
                                        @RequestParam(value = "tagNames", required = false) String tagNames) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            if (username == null) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Yêu cầu đăng nhập");
            }
            log.info("Creating post by user: {}", username);
            List<String> tags = tagNames != null && !tagNames.trim().isEmpty()
                    ? Arrays.asList(tagNames.split(","))
                    : List.of();
            postService.createPost(name, content, username, tags);
            return ResponseEntity.ok(Map.of("message", "Post created successfully"));
        } catch (ApiException e) {
            log.error("Error creating post: {}", e.getMessage());
            return ResponseEntity.status(e.getStatus()).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error creating post: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi server: " + e.getMessage()));
        }
    }

    // Tạo bình luận
    @PostMapping("/comments/create")
    public ResponseEntity<Map<String, String>> createComment(@RequestParam("postId") Long postId,
                                                             @RequestParam("content") String content) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Creating comment by user: {} for post: {}", username, postId);
        commentService.createComment(postId, username, content);
        return ResponseEntity.ok(Map.of("message", "Comment created successfully"));
    }

    // Lấy danh sách bình luận theo bài viết
    @GetMapping("/comments/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPost(@PathVariable Long postId) {
        log.info("Fetching comments for post: {}", postId);
        List<Comment> comments = commentService.findByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    // Lấy cài đặt người dùng
    @GetMapping("/settings")
    public ResponseEntity<SettingsDTO> getSettings() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Fetching settings for user: {}", username);
        Settings settings = settingsService.getSettings(username);
        return ResponseEntity.ok(new SettingsDTO(settings.getPostsPerPage(), settings.getHomepagePreference()));
    }

    // Lưu cài đặt người dùng
    @PostMapping("/settings")
    public ResponseEntity<?> saveSettings(@RequestBody SettingsDTO settingsDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Saving settings for user: {}", username);
        settingsService.saveSettings(username, settingsDTO);
        return ResponseEntity.ok("Settings saved successfully");
    }

}