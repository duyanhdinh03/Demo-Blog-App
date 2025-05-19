package com.mediumapp.blog_backend.dto;

public class SettingsDTO {
    private int postsPerPage;
    private String homepagePreference;

    public SettingsDTO(int postsPerPage, String homepagePreference) {
        this.postsPerPage = postsPerPage;
        this.homepagePreference = homepagePreference;
    }

    public int getPostsPerPage() {
        return postsPerPage;
    }

    public void setPostsPerPage(int postsPerPage) {
        this.postsPerPage = postsPerPage;
    }

    public String getHomepagePreference() {
        return homepagePreference;
    }

    public void setHomepagePreference(String homepagePreference) {
        this.homepagePreference = homepagePreference;
    }
}
