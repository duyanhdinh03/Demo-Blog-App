package com.mediumapp.blog_backend.repository;

import com.mediumapp.blog_backend.entity.Settings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SettingsRepository extends JpaRepository<Settings, Long> {
    Optional<Settings> findByUsername(String username);
}
