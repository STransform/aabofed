package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.clients.TranslationServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * TranslationResolverService
 *
 * Resolves translation keys (e.g. "organization.BSC.orgname") back to
 * their human-readable values by looking them up in the translation-service.
 *
 * Falls back to the raw key if no matching translation is found, so existing
 * entities that were created before the translation-service was running still
 * display something meaningful.
 */
@Service
public class TranslationResolverService {

    private static final Logger log = LoggerFactory.getLogger(TranslationResolverService.class);

    @Autowired
    private TranslationServiceClient translationClient;

    /**
     * Return the English (or requested locale) value for the given string.
     * If the string does NOT look like a translation key it is returned as-is.
     */
    public String resolve(String value, String locale) {
        if (value == null || value.isBlank())
            return value;
        if (!looksLikeKey(value))
            return value;
        try {
            Map<String, String> dict = translationClient.getTranslations(locale);
            String resolved = dict.get(value);
            if (resolved != null && !resolved.isBlank())
                return resolved;

            // Try English fallback
            if (!"en".equals(locale)) {
                Map<String, String> enDict = translationClient.getTranslations("en");
                resolved = enDict.get(value);
                if (resolved != null && !resolved.isBlank())
                    return resolved;
            }
        } catch (Exception e) {
            log.warn("Could not resolve translation key '{}': {}", value, e.getMessage());
        }
        // Last-resort: extract the entity id part from the key as a human hint
        // e.g. "organization.BSC.orgname" → "BSC"
        String[] parts = value.split("\\.");
        if (parts.length >= 2)
            return parts[1];
        return value;
    }

    /** Resolve using English locale by default. */
    public String resolve(String value) {
        return resolve(value, "en");
    }

    /**
     * A value looks like a translation key when it has at least 2 dots
     * and starts with a known entity prefix.
     */
    private static boolean looksLikeKey(String value) {
        if (value == null)
            return false;
        long dotCount = value.chars().filter(c -> c == '.').count();
        return dotCount >= 2;
    }
}
