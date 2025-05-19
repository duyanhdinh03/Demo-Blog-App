package com.mediumapp.blog_backend.service;


import com.mediumapp.blog_backend.dto.LoginRequest;
import com.mediumapp.blog_backend.dto.RegisterRequest;
import com.mediumapp.blog_backend.entity.User;
import com.mediumapp.blog_backend.enums.Role;
import com.mediumapp.blog_backend.repository.UserRepository;
import com.mediumapp.blog_backend.config.JwtUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.SQLException;

@Slf4j
@Service
public class AuthService {
    @Autowired
    private UserRepository userRepo; // Chỉ giữ một biến userRepo
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private AuthenticationManager authManager;
    @Autowired
    private JwtUtils jwtUtils;

    public void register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.username())) {
            throw new IllegalArgumentException("Username đã tồn tại");
        }
        if (userRepo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email đã tồn tại");
        }

        User user = new User();
        user.setUsername(req.username());
        user.setEmail(req.email());
        user.setPassword(encoder.encode(req.password()));
        user.setRole(Role.USER); // Sử dụng Role enum mới

        try {
            userRepo.save(user);
        } catch (DataIntegrityViolationException e) {
            handleDuplicateException(e, "username", "email");
        }
    }

    public String login(LoginRequest req) {
        log.info("Login attempt for username: {}", req.username());
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.username(), req.password())
            );
            UserDetails ud = userRepo.findByUsername(req.username())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            String token = jwtUtils.generateToken(ud);
            log.info("Generated token for user: {}", req.username());
            return token;
        } catch (Exception e) {
            log.error("Login failed for username: {}. Error: {}", req.username(), e.getMessage());
            throw e;
        }
    }

    private void handleDuplicateException(DataIntegrityViolationException e, String... fields) {
        String errorMsg = "Lỗi dữ liệu";
        Throwable rootCause = e.getRootCause();

        if (rootCause instanceof SQLException sqlEx) {
            String message = sqlEx.getMessage().toLowerCase();
            if (message.contains("username")) {
                errorMsg = "Tên người dùng đã tồn tại";
            } else if (message.contains("email")) {
                errorMsg = "Email đã tồn tại";
            }
        }

        log.error("Lỗi trùng lặp dữ liệu: {}", errorMsg);
        throw new IllegalArgumentException(errorMsg);
    }

    public boolean checkUsername(String username) {
        return userRepo.findByUsername(username).isPresent(); // Sử dụng userRepo
    }
}