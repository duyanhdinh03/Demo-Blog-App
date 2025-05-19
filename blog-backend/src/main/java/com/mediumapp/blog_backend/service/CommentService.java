package com.mediumapp.blog_backend.service;

import com.mediumapp.blog_backend.entity.Comment;

import java.util.List;

public interface CommentService {
    Comment createComment(Long postId, String postedBy, String content);
    List<Comment> findByPostId(Long postId);
}
