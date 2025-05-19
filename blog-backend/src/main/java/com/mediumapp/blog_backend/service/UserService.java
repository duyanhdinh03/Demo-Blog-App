package com.mediumapp.blog_backend.service;

import com.mediumapp.blog_backend.entity.User;
import com.mediumapp.blog_backend.exception.ApiException;
import com.mediumapp.blog_backend.repository.CommentRepository;
import com.mediumapp.blog_backend.repository.PostRepository;
import com.mediumapp.blog_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PostRepository postRepo;
    private final CommentRepository commentRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PostRepository postRepo, CommentRepository commentRepo) {
        this.userRepository = userRepository;
        this.postRepo = postRepo;
        this.commentRepo = commentRepo;
    }

    public long getTotalUsers() {
        return userRepository.count();
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found with id: " + userId));
        postRepo.findByPostedBy(user.getUsername()).forEach(post -> {
            post.setPostedBy(null);
            postRepo.save(post);
        });
        commentRepo.findByPostedBy(user.getUsername()).forEach(commentRepo::delete);
        userRepository.deleteById(userId); // Thay đổi từ deleteUser thành deleteById
    }

    public List<Object[]> getUsersByDate() {
        return userRepository.countUsersByDate();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public User updateUserProfile(String username, User updatedUser) {
        User user = getUserByUsername(username);
        user.setFullName(updatedUser.getFullName());
        user.setAddress(updatedUser.getAddress());
        user.setEmail(updatedUser.getEmail());
        return userRepository.save(user);
    }

    public void updateAvatar(String username, String avatarUrl) {
        User user = getUserByUsername(username);
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
    }

    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = getUserByUsername(username);
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid current password");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void deleteUserByUsername(String username) {
        if (!userRepository.existsByUsername(username)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "User not found with username: " + username);
        }
        userRepository.deleteByUsername(username);
    }
}