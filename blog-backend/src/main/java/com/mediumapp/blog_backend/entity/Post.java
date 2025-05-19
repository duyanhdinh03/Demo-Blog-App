package com.mediumapp.blog_backend.entity;

import com.mediumapp.blog_backend.enums.PostStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "posts")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "posted_by")
    private String postedBy;

    private String img;

    @Column(name = "date")
    private LocalDateTime date;

    @Column(name = "like_counts")
    private Integer likeCounts = 0;

    @Column(name = "view_counts")
    private Integer viewCounts = 0;

    @Enumerated(EnumType.STRING)
    private PostStatus status;

    @ManyToMany
    @JoinTable(
            name = "post_tags",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

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
    public Set<Tag> getTags() { return tags; }
    public void setTags(Set<Tag> tags) { this.tags = tags; }

    public PostStatus getStatus() {
        return status;
    }

    public void setStatus(PostStatus status) {
        this.status = status;
    }
}
