package com.mediumapp.blog_backend.dto;

public class UserProfileDTO {
    private String username;
    private String fullName;
    private String avatarUrl;
    private String email;

    public UserProfileDTO(String username, String fullName, String avatarUrl, String email) {
        this.username = username;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.email = email;
    }

    // Getters và setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
