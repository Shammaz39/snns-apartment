package com.snns.apartment.controller;

import com.snns.apartment.model.ApartmentSettings;
import com.snns.apartment.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@Tag(name = "Apartment Settings", description = "Apartment name, UPI QR code, and demo trial configurations")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    @Operation(summary = "Get apartment settings including active UPI and QR code")
    public ResponseEntity<ApartmentSettings> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @GetMapping("/public")
    @Operation(summary = "Get public apartment name and basic details without auth")
    public ResponseEntity<ApartmentSettings> getPublicSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    @PutMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update apartment settings", description = "Admin only")
    public ResponseEntity<ApartmentSettings> updateSettings(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("apartmentName");
        String upi = (String) body.get("upiId");
        Boolean demo = (Boolean) body.get("demoModeActive");
        return ResponseEntity.ok(settingsService.updateSettings(name, upi, demo));
    }

    @PostMapping(value = "/upload-qr", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Upload official Apartment UPI QR Code image", description = "Admin only")
    public ResponseEntity<ApartmentSettings> uploadQrCode(@RequestPart("qrFile") MultipartFile qrFile) {
        return ResponseEntity.ok(settingsService.uploadQrCode(qrFile));
    }
}
