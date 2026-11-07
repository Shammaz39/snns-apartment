package com.snns.apartment.repository;

import com.snns.apartment.model.ApartmentSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApartmentSettingsRepository extends JpaRepository<ApartmentSettings, Long> {
    Optional<ApartmentSettings> findFirstByOrderByIdAsc();
}
