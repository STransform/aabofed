package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.models.DynamicTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DynamicTranslationRepository extends JpaRepository<DynamicTranslation, Long> {

    Optional<DynamicTranslation> findByMessageKeyAndLocale(String messageKey, String locale);

    List<DynamicTranslation> findByLocale(String locale);

    void deleteByMessageKeyStartingWith(String prefix);
}
