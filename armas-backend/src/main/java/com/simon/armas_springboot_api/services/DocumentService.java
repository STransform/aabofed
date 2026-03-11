package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.clients.TranslationServiceClient;
import com.simon.armas_springboot_api.models.Document;
import com.simon.armas_springboot_api.repositories.DocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DocumentService {
    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    private final DocumentRepository documentRepository;
    private final TranslationServiceClient translationServiceClient;

    @Autowired
    public DocumentService(DocumentRepository documentRepository,
            TranslationServiceClient translationServiceClient) {
        this.documentRepository = documentRepository;
        this.translationServiceClient = translationServiceClient;
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public Document getDocumentById(String id) {
        return documentRepository.findById(id).orElse(null);
    }

    public Document save(Document document) {
        if (document.getId() == null || document.getId().trim().isEmpty()) {
            throw new IllegalArgumentException("Document ID cannot be null or empty");
        }
        if (document.getDirectorate() == null) {
            throw new IllegalArgumentException("Directorate cannot be null");
        }

        // Capture the human-readable report type BEFORE save, because @PrePersist in
        // TranslationEntityListener replaces the field with a key before the DB save.
        String originalReportype = document.getReportype();

        Document saved = documentRepository.save(document);

        try {
            String id = saved.getId();
            String key = "document." + id + ".reportype";

            if (originalReportype != null && !originalReportype.trim().isEmpty()
                    && !originalReportype.startsWith("document.")) {
                translationServiceClient.registerTranslation(
                        new TranslationServiceClient.TranslationRegistrationRequest(
                                key, "en", originalReportype));
                log.info("[DocumentService] Registered translation key: {} = {}", key, originalReportype);
            }
        } catch (Exception e) {
            log.warn("[DocumentService] Failed to register translation for document '{}': {}",
                    document.getId(), e.getMessage());
        }

        return saved;
    }

    public void deleteDocument(String id) {
        documentRepository.deleteById(id);
        try {
            translationServiceClient.deleteTranslationsByPrefix("document." + id + ".");
        } catch (Exception e) {
            log.warn("[DocumentService] Failed to delete translations for document '{}': {}", id, e.getMessage());
        }
    }

    public boolean existsByReportype(String reportype) {
        return documentRepository.existsByReportype(reportype);
    }
}