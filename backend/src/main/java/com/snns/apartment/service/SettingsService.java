package com.snns.apartment.service;

import com.snns.apartment.model.ApartmentSettings;
import com.snns.apartment.repository.ApartmentSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Service
public class SettingsService {

    private final ApartmentSettingsRepository settingsRepository;
    private final FileStorageService fileStorageService;

    public SettingsService(ApartmentSettingsRepository settingsRepository, FileStorageService fileStorageService) {
        this.settingsRepository = settingsRepository;
        this.fileStorageService = fileStorageService;
    }

    public ApartmentSettings getSettings() {
        return settingsRepository.findFirstByOrderByIdAsc().orElseGet(() -> {
            ApartmentSettings defaultSettings = new ApartmentSettings();
            defaultSettings.setApartmentName("SNNS Apartment");
            defaultSettings.setUpiId("snnsapartment@upi");
            defaultSettings.setDemoModeActive(true);
            defaultSettings.setDemoExpiryDate(LocalDate.now().plusDays(30));
            return settingsRepository.save(defaultSettings);
        });
    }

    public ApartmentSettings updateSettings(String apartmentName, String upiId, Boolean demoModeActive) {
        ApartmentSettings settings = getSettings();
        if (apartmentName != null && !apartmentName.trim().isEmpty()) {
            settings.setApartmentName(apartmentName);
        }
        if (upiId != null) {
            settings.setUpiId(upiId);
        }
        if (demoModeActive != null) {
            settings.setDemoModeActive(demoModeActive);
        }
        return settingsRepository.save(settings);
    }

    public ApartmentSettings uploadQrCode(MultipartFile qrFile) {
        if (qrFile == null || qrFile.isEmpty()) {
            throw new RuntimeException("QR Code image file cannot be empty");
        }

        String qrPath = fileStorageService.storeFile(qrFile, "settings/qr");
        ApartmentSettings settings = getSettings();
        settings.setQrCodePath(qrPath);
        return settingsRepository.save(settings);
    }
}
