package com.simon.armas_springboot_api.models;

import jakarta.persistence.*;

/**
 * Stores admin-entered translations for dynamic entity fields
 * (organization names, directorate names, report types, etc.)
 * directly in the main armas_db — no translation-service required.
 */
@Entity
@Table(
    name = "dynamic_translation",
    uniqueConstraints = @jakarta.persistence.UniqueConstraint(columnNames = {"message_key", "locale"})
)
public class DynamicTranslation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "message_key", nullable = false, length = 512)
    private String messageKey;

    @Column(name = "locale", nullable = false, length = 10)
    private String locale;

    @Column(name = "message_value", nullable = false, columnDefinition = "TEXT")
    private String messageValue;

    public DynamicTranslation() {}

    public DynamicTranslation(Long id, String messageKey, String locale, String messageValue) {
        this.id = id;
        this.messageKey = messageKey;
        this.locale = locale;
        this.messageValue = messageValue;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMessageKey() { return messageKey; }
    public void setMessageKey(String messageKey) { this.messageKey = messageKey; }

    public String getLocale() { return locale; }
    public void setLocale(String locale) { this.locale = locale; }

    public String getMessageValue() { return messageValue; }
    public void setMessageValue(String messageValue) { this.messageValue = messageValue; }
}
