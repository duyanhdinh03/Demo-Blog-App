package com.mediumapp.blog_backend.service;

import com.mediumapp.blog_backend.dto.PostDTO;
import com.mediumapp.blog_backend.enums.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PostService {
    Page<PostDTO> getAllPosts(Pageable pageable);
    PostDTO getPostById(Long postId);
    void likePost(Long postId);
    List<PostDTO> searchPostsByName(String name);
    Page<PostDTO> getPostsByTag(String tagName, Pageable pageable);
    long getTotalPosts();
    List<Object[]> getPostsByDate();
    void deletePost(Long postId);
    PostDTO createPost(String name, String content, String postedBy, List<String> tagNames);
    long countPostsByStatus(PostStatus status);
    void approvePost(Long postId);
}