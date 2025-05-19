package com.mediumapp.blog_backend.dto;

public record CreateStaffRequest(
        String username,
        String password,
        String email
) {}
