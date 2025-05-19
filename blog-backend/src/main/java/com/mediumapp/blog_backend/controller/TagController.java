package com.mediumapp.blog_backend.controller;

import com.mediumapp.blog_backend.dto.TagDTO;
import com.mediumapp.blog_backend.service.TagService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tags")
public class TagController {
    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping
    public List<TagDTO> allTags() {
        return tagService.getAllTags().stream()
                .map(tag -> new TagDTO(tag.getId(), tag.getName()))
                .collect(Collectors.toList());
    }
}
