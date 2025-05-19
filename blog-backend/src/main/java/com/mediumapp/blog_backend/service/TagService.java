package com.mediumapp.blog_backend.service;

import com.mediumapp.blog_backend.entity.Tag;
import com.mediumapp.blog_backend.repository.TagRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TagService {
    private final TagRepository tagRepo;

    public TagService(TagRepository tagRepo) {
        this.tagRepo = tagRepo;
    }

    public Set<Tag> fetchOrCreateTags(List<String> names) {
        if (names == null || names.isEmpty()) {
            return Collections.emptySet();
        }
        return names.stream()
                .map(name -> tagRepo.findByName(name)
                        .orElseGet(() -> tagRepo.save(new Tag(name))))
                .collect(Collectors.toSet());
    }

    public List<Tag> getAllTags() {
        return tagRepo.findAll();
    }

    public long getTotalTags() {
        return tagRepo.count();
    }

    public void deleteTag(Long tagId) {
        Tag tag = tagRepo.findById(tagId)
                .orElseThrow(() -> new RuntimeException("Tag not found"));
        tagRepo.delete(tag);
    }
}