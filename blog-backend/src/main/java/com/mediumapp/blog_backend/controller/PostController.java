package com.mediumapp.blog_backend.controller;

import com.mediumapp.blog_backend.dto.PostDTO;
import com.mediumapp.blog_backend.service.PostService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<?> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String sort) {

        Pageable pageable = PageRequest.of(page, size);
        if (sort != null && !sort.isEmpty()) {
            String[] sortParams = sort.split(",");
            Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                    ? Sort.Direction.DESC : Sort.Direction.ASC;
            pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        }

        Page<PostDTO> posts;
        if (tag != null && !tag.isEmpty()) {
            posts = postService.getPostsByTag(tag, pageable);
        } else {
            posts = postService.getAllPosts(pageable);
        }

        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable Long postId) {
        PostDTO post = postService.getPostById(postId);
        return ResponseEntity.ok(post);
    }

    @PutMapping("/{postId}/like")
    public ResponseEntity<Void> likePost(@PathVariable Long postId) {
        postService.likePost(postId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchPostsByName(@RequestParam String name) {
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Search term cannot be empty");
        }
        List<PostDTO> results = postService.searchPostsByName(name);
        if (results.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cannot find post with name " + name);
        }
        return ResponseEntity.ok(results);
    }

    @GetMapping("/by-tag/{tagName}")
    public ResponseEntity<Page<PostDTO>> getPostsByTag(
            @PathVariable String tagName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String sort) {

        Pageable pageable = PageRequest.of(page, size);
        if (sort != null && !sort.isEmpty()) {
            String[] sortParams = sort.split(",");
            Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                    ? Sort.Direction.DESC : Sort.Direction.ASC;
            pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));
        }

        Page<PostDTO> posts = postService.getPostsByTag(tagName, pageable);
        return ResponseEntity.ok(posts);
    }

    @PostMapping("/create")
    public ResponseEntity<PostDTO> createPost(
            @RequestParam String name,
            @RequestParam String content,
            @RequestParam String postedBy,
            @RequestParam(required = false) List<String> tagNames) {
        PostDTO post = postService.createPost(name, content, postedBy, tagNames);
        return ResponseEntity.ok(post);
    }
}