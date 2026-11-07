package com.snns.apartment.controller;

import com.snns.apartment.dto.SubTenantRequest;
import com.snns.apartment.dto.TenantOnboardRequest;
import com.snns.apartment.model.SubTenant;
import com.snns.apartment.model.Tenant;
import com.snns.apartment.service.TenantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tenants")
@Tag(name = "Tenants", description = "Resident KYC, Aadhaar document, and Sub-tenant APIs")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get all active tenants", description = "Admin only")
    public ResponseEntity<List<Tenant>> getAllActiveTenants() {
        return ResponseEntity.ok(tenantService.getAllActiveTenants());
    }

    @GetMapping("/directory")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SECURITY')")
    @Operation(summary = "Get directory of all tenants for security gatekeeping", description = "Admin and Security")
    public ResponseEntity<List<Tenant>> getTenantDirectory() {
        return ResponseEntity.ok(tenantService.getAllActiveTenants());
    }

    @GetMapping("/room/{roomId}")
    @Operation(summary = "Get tenant details by room ID")
    public ResponseEntity<Tenant> getTenantByRoomId(@PathVariable Long roomId) {
        return tenantService.getTenantByRoomId(roomId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/profile/{userId}")
    @Operation(summary = "Get tenant profile by user ID")
    public ResponseEntity<Tenant> getTenantProfile(@PathVariable Long userId) {
        return tenantService.getTenantByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/profile/{userId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update tenant profile (name, phone, email, photo, aadhaar doc)")
    public ResponseEntity<Tenant> updateTenantProfile(
            @PathVariable Long userId,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String aadhaarNumber,
            @RequestParam(required = false) String memberDetails,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @RequestPart(value = "aadhaarDoc", required = false) MultipartFile aadhaarDoc) {
        return ResponseEntity.ok(tenantService.updateTenantProfile(userId, fullName, phone, email, aadhaarNumber, memberDetails, photo, aadhaarDoc));
    }

    @PostMapping(value = "/onboard", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Onboard a tenant with Aadhaar and Photo KYC upload", description = "Admin only")
    public ResponseEntity<Tenant> onboardTenant(
            @Valid @ModelAttribute TenantOnboardRequest request,
            @RequestPart(value = "aadhaarDoc", required = false) MultipartFile aadhaarDoc,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {

        return ResponseEntity.ok(tenantService.onboardTenant(request, aadhaarDoc, photo));
    }

    @PostMapping("/sub-tenants")
    @Operation(summary = "Register a sub-tenant / roommate")
    public ResponseEntity<SubTenant> addSubTenant(@Valid @RequestBody SubTenantRequest request) {
        return ResponseEntity.ok(tenantService.addSubTenant(request));
    }

    @GetMapping("/sub-tenants/room/{roomId}")
    @Operation(summary = "Get sub-tenants for a room")
    public ResponseEntity<List<SubTenant>> getSubTenantsByRoomId(@PathVariable Long roomId) {
        return ResponseEntity.ok(tenantService.getSubTenantsByRoomId(roomId));
    }

    @DeleteMapping("/{id}/deboard")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Deboard / checkout tenant", description = "Admin only")
    public ResponseEntity<Void> deboardTenant(@PathVariable Long id) {
        tenantService.deboardTenant(id);
        return ResponseEntity.noContent().build();
    }
}
