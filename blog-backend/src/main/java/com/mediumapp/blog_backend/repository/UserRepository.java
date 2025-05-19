package com.mediumapp.blog_backend.repository;

import com.mediumapp.blog_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    void deleteByUsername(String username);
    @Query("SELECT DATE(u.createdAt), COUNT(u) FROM User u GROUP BY DATE(u.createdAt)")
    List<Object[]> countUsersByDate();
}