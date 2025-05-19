package com.mediumapp.blog_backend.repository;

import com.mediumapp.blog_backend.entity.Post;
import com.mediumapp.blog_backend.enums.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByNameContainingIgnoreCase(String name);
    Page<Post> findByTagsName(String tagName, Pageable pageable);
    long countByStatus(PostStatus status);
    @Query("SELECT DATE(p.date) as date, COUNT(p) as count FROM Post p GROUP BY DATE(p.date)")
    List<Object[]> countPostsByDate();
    @Query("SELECT p FROM Post p WHERE p.status = :status")
    Page<Post> findAllByStatus(@Param("status") PostStatus status, Pageable pageable);
    @Query("SELECT p FROM Post p WHERE p.postedBy = :postedBy")
    List<Post> findByPostedBy(@Param("postedBy") String postedBy);

}