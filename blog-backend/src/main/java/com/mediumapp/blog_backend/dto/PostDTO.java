package com.mediumapp.blog_backend.dto;

import com.mediumapp.blog_backend.enums.PostStatus;

import java.time.LocalDateTime;
import java.util.Set;

public class PostDTO {
    private Long id;
    private String name;
    private String content;
    private String postedBy;
    private String img;
    private LocalDateTime date;
    private Integer likeCounts;
    private Integer viewCounts;
    private Set<String> tags;
    private PostStatus status;

    public PostDTO(Long id, String name, String content, String postedBy, String img, LocalDateTime date,
                   Integer likeCounts, Integer viewCounts, Set<String> tags , PostStatus status) {
        this.id = id;
        this.name = name;
        this.content = content;
        this.postedBy = postedBy;
        this.img = img;
        this.date = date;
        this.likeCounts = likeCounts;
        this.viewCounts = viewCounts;
        this.tags = tags;
        this.status = status;
    }

    // Getters và Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getPostedBy() { return postedBy; }
    public void setPostedBy(String postedBy) { this.postedBy = postedBy; }
    public String getImg() { return img; }
    public void setImg(String img) { this.img = img; }
    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }
    public Integer getLikeCounts() { return likeCounts; }
    public void setLikeCounts(Integer likeCounts) { this.likeCounts = likeCounts; }
    public Integer getViewCounts() { return viewCounts; }
    public void setViewCounts(Integer viewCounts) { this.viewCounts = viewCounts; }
    public Set<String> getTags() { return tags; }
    public void setTags(Set<String> tags) { this.tags = tags; }
    public PostStatus getStatus() {
        return status;
    }

    public void setStatus(PostStatus status) {
        this.status = status;
    }
}