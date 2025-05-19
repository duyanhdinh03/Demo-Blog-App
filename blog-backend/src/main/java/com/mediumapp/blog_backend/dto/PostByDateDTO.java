package com.mediumapp.blog_backend.dto;

import lombok.Data;

@Data
public class PostByDateDTO {
    private String date;
    private int count;

    public PostByDateDTO(String date, int count) {
        this.date = date;
        this.count = count;
    }
}
