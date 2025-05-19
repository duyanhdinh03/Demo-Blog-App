package com.mediumapp.blog_backend.dto;

import lombok.Data;

@Data
public class StatsDTO {
    private int total;

    public StatsDTO(int total) {
        this.total = total;
    }
}
