package com.mediumapp.blog_backend.controller;

import com.mediumapp.blog_backend.dto.AuthResponse;
import com.mediumapp.blog_backend.dto.CreateStaffRequest;
import com.mediumapp.blog_backend.dto.LoginRequest;
import com.mediumapp.blog_backend.dto.RegisterRequest;
import com.mediumapp.blog_backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterRequest req) {
        authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }


    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        String token = authService.login(req);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @GetMapping("/check-username/{username}")
    public ResponseEntity<Boolean> checkUsername(@PathVariable String username) {
        boolean exists = authService.checkUsername(username);
        return ResponseEntity.ok(exists);
    }
}
