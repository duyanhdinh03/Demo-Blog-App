package com.mediumapp.blog_backend.dto;

import java.util.List;

public record PostRequest(
        String name,
        String content,
        String postedBy,
        String img,
        List<String> tagNames
) {}
