package com.mediumapp.blog_backend.service.Impl;

import com.mediumapp.blog_backend.entity.Comment;
import com.mediumapp.blog_backend.entity.Post;
import com.mediumapp.blog_backend.exception.ApiException;
import com.mediumapp.blog_backend.repository.CommentRepository;
import com.mediumapp.blog_backend.repository.PostRepository;
import com.mediumapp.blog_backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Override
    public Comment createComment(Long postId, String postedBy, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Post not found with id: " + postId));
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setContent(content);
        comment.setPostedBy(postedBy);
        comment.setCreatedAt(new Date());
        return commentRepository.save(comment);
    }

    @Override
    public List<Comment> findByPostId(Long postId) {
        return commentRepository.findByPostId(postId);
    }
}
