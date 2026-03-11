package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.clients.TranslationServiceClient;
import com.simon.armas_springboot_api.models.Directorate;
import com.simon.armas_springboot_api.repositories.DirectorateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DirectorateService {
    private static final Logger log = LoggerFactory.getLogger(DirectorateService.class);

    private final DirectorateRepository directorateRepository;
    private final TranslationServiceClient translationServiceClient;

    @Autowired
    public DirectorateService(DirectorateRepository directorateRepository,
            TranslationServiceClient translationServiceClient) {
        this.directorateRepository = directorateRepository;
        this.translationServiceClient = translationServiceClient;
    }

    public List<Directorate> getAllDirectorates() {
        return directorateRepository.findAll();
    }

    public Directorate getDirectorateById(String id) {
        return directorateRepository.findById(id).orElse(null);
    }

    public Directorate getDirectorateByNameIgnoreCase(String directoratename) {
        return directorateRepository.findByDirectoratenameIgnoreCase(directoratename).orElse(null);
    }

    public boolean existsByDirectoratenameIgnoreCase(String directoratename) {
        return directorateRepository.existsByDirectoratenameIgnoreCase(directoratename);
    }

    public Directorate save(Directorate directorate) {
        // Capture the human-readable name BEFORE save, because @PrePersist in
        // TranslationEntityListener replaces the field with a key before the DB save.
        String originalName = directorate.getDirectoratename();

        Directorate saved = directorateRepository.save(directorate);

        try {
            String id = saved.getId();
            String key = "directorate." + id + ".directoratename";

            if (originalName != null && !originalName.trim().isEmpty()
                    && !originalName.startsWith("directorate.")) {
                translationServiceClient.registerTranslation(
                        new TranslationServiceClient.TranslationRegistrationRequest(
                                key, "en", originalName));
                log.info("[DirectorateService] Registered translation key: {} = {}", key, originalName);
            }
        } catch (Exception e) {
            log.warn("[DirectorateService] Failed to register translation for directorate '{}': {}",
                    directorate.getId(), e.getMessage());
        }

        return saved;
    }

    public void deleteDirectorate(String id) {
        directorateRepository.deleteById(id);
        try {
            translationServiceClient.deleteTranslationsByPrefix("directorate." + id + ".");
        } catch (Exception e) {
            log.warn("[DirectorateService] Failed to delete translations for directorate '{}': {}", id, e.getMessage());
        }
    }
}