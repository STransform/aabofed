package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.clients.TranslationServiceClient;
import com.simon.armas_springboot_api.models.Organization;
import com.simon.armas_springboot_api.repositories.OrganizationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrganizationService {
    private static final Logger log = LoggerFactory.getLogger(OrganizationService.class);

    private final OrganizationRepository organizationRepository;
    private final TranslationServiceClient translationServiceClient;

    @Autowired
    public OrganizationService(OrganizationRepository organizationRepository,
            TranslationServiceClient translationServiceClient) {
        this.organizationRepository = organizationRepository;
        this.translationServiceClient = translationServiceClient;
    }

    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }

    public Organization getOrganizationById(String id) {
        return organizationRepository.findById(id).orElse(null);
    }

    public Organization save(Organization organization) {

        String originalOrgName = organization.getOrgname();

        Organization saved = organizationRepository.save(organization);

        try {
            String id = saved.getId();
            String key = "organization." + id + ".orgname";

            if (originalOrgName != null && !originalOrgName.trim().isEmpty()
                    && !originalOrgName.startsWith("organization.")) {
                translationServiceClient.registerTranslation(
                        new TranslationServiceClient.TranslationRegistrationRequest(
                                key, "en", originalOrgName));
                log.info("[OrganizationService] Registered translation key: {} = {}", key, originalOrgName);
            }
        } catch (Exception e) {
            log.warn("[OrganizationService] Failed to register translation for org '{}': {}",
                    organization.getId(), e.getMessage());
        }

        return saved;
    }

    public void deleteOrganization(String id) {
        organizationRepository.deleteById(id);
        try {
            translationServiceClient.deleteTranslationsByPrefix("organization." + id + ".");
        } catch (Exception e) {
            log.warn("[OrganizationService] Failed to delete translations for org '{}': {}", id, e.getMessage());
        }
    }

    public Object findById(String id) {
        return organizationRepository.findById(id).orElse(null);
    }
}