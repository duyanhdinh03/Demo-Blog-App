package com.mediumapp.blog_backend.service;

import com.mediumapp.blog_backend.dto.SettingsDTO;
import com.mediumapp.blog_backend.entity.Settings;
import com.mediumapp.blog_backend.repository.SettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SettingsService {

    @Autowired
    private SettingsRepository settingsRepository;

    public Settings getSettings(String username) {
        return settingsRepository.findByUsername(username)
                .orElse(new Settings(username, 10, "newest"));
    }

    public void saveSettings(String username, SettingsDTO settingsDTO) {
        Settings settings = settingsRepository.findByUsername(username)
                .orElse(new Settings(username, 10, "newest"));
        settings.setPostsPerPage(settingsDTO.getPostsPerPage());
        settings.setHomepagePreference(settingsDTO.getHomepagePreference());
        settingsRepository.save(settings);
    }
}
