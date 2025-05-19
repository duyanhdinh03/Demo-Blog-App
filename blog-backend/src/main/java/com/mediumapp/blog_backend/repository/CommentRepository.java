package com.mediumapp.blog_backend.repository;


import com.mediumapp.blog_backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostId(Long postId);
    @Query("SELECT c FROM Comment c WHERE c.postedBy = :postedBy")
    List<Comment> findByPostedBy(@Param("postedBy") String postedBy);
}
