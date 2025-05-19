package com.mediumapp.blog_backend.dto;

import com.mediumapp.blog_backend.enums.PostStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PostSummaryDTO {
    private Long id;
    private String name;
    private String postedBy;
    private LocalDateTime date;
    private Integer likeCounts;
    private Integer viewCounts;
    private Integer commentCount;
    private PostStatus status;

    public PostSummaryDTO(Long id, String name, String postedBy, LocalDateTime date,
                          Integer likeCounts, Integer viewCounts, Integer commentCount, PostStatus status) {
        this.id = id;
        this.name = name;
        this.postedBy = postedBy;
        this.date = date;
        this.likeCounts = likeCounts;
        this.viewCounts = viewCounts;
        this.commentCount = commentCount;
        this.status = status;
    }
}
