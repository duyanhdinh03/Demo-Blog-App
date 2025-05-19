package com.mediumapp.blog_backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Settings {
    @Id
    private Long id;
    private String username;
    private int postsPerPage;
    private String homepagePreference;

    public Settings() {}

    public Settings(String username, int postsPerPage, String homepagePreference) {
        this.username = username;
        this.postsPerPage = postsPerPage;
        this.homepagePreference = homepagePreference;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public int getPostsPerPage() { return postsPerPage; }
    public void setPostsPerPage(int postsPerPage) { this.postsPerPage = postsPerPage; }
    public String getHomepagePreference() { return homepagePreference; }
    public void setHomepagePreference(String homepagePreference) { this.homepagePreference = homepagePreference; }
}
