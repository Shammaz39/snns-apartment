package com.snns.apartment.controller;

import com.snns.apartment.dto.VisitorPassRequest;
import com.snns.apartment.model.User;
import com.snns.apartment.model.VisitorPass;
import com.snns.apartment.repository.UserRepository;
import com.snns.apartment.service.VisitorPassService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/visitor-passes")
@Tag(name = "Visitor Pass Management", description = "Visitor request/approval flow with security and tenant interactions")
public class VisitorPassController {

    private final VisitorPassService visitorPassService;
    private final UserRepository userRepository;

    public VisitorPassController(VisitorPassService visitorPassService, UserRepository userRepository) {
        this.visitorPassService = visitorPassService;
        this.userRepository = userRepository;
    }

    private Long getUserId(UserDetails userDetails) {
        if (userDetails == null) return null;
        Optional<User> u = userRepository.findByUsername(userDetails.getUsername());
        return u.map(User::getId).orElse(null);
    }

    @PostMapping("/request")
    @Operation(summary = "Security creates a visitor entry request (PENDING)")
    public ResponseEntity<VisitorPass> createSecurityRequest(@Valid @RequestBody VisitorPassRequest request) {
        return ResponseEntity.ok(visitorPassService.createSecurityRequest(request));
    }

    @PostMapping("/call-confirmed")
    @Operation(summary = "Security creates a direct entry after call confirmation (CHECKED_IN)")
    public ResponseEntity<VisitorPass> createCallConfirmedEntry(@Valid @RequestBody VisitorPassRequest request) {
        return ResponseEntity.ok(visitorPassService.createCallConfirmedEntry(request));
    }

    @PostMapping("/pre-approve")
    @Operation(summary = "Tenant pre-approves an expected visitor (APPROVED)")
    public ResponseEntity<VisitorPass> createTenantPreApproval(
            @Valid @RequestBody VisitorPassRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(visitorPassService.createTenantPreApproval(request, userId));
    }

    @PutMapping("/{id}/approve")
    @Operation(summary = "Tenant approves a pending visitor request")
    public ResponseEntity<VisitorPass> approvePass(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(visitorPassService.approvePass(id, userId));
    }

    @PutMapping("/{id}/reject")
    @Operation(summary = "Tenant rejects a pending visitor request")
    public ResponseEntity<VisitorPass> rejectPass(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(visitorPassService.rejectPass(id, userId));
    }

    @PutMapping("/{id}/check-in")
    @Operation(summary = "Security checks in an approved or pending visitor")
    public ResponseEntity<VisitorPass> checkInPass(@PathVariable Long id) {
        return ResponseEntity.ok(visitorPassService.checkInPass(id));
    }

    @PutMapping("/{id}/check-out")
    @Operation(summary = "Security checks out a visitor")
    public ResponseEntity<VisitorPass> checkOutPass(@PathVariable Long id) {
        return ResponseEntity.ok(visitorPassService.checkOutPass(id));
    }

    @GetMapping("/pending/room/{roomId}")
    @Operation(summary = "Get pending visitor passes for a specific room")
    public ResponseEntity<List<VisitorPass>> getPendingPassesForRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(visitorPassService.getPendingPassesForRoom(roomId));
    }

    @GetMapping
    @Operation(summary = "Get all visitor passes")
    public ResponseEntity<List<VisitorPass>> getAllPasses() {
        return ResponseEntity.ok(visitorPassService.getAllPasses());
    }

    @GetMapping("/active")
    @Operation(summary = "Get active (checked-in) visitor passes")
    public ResponseEntity<List<VisitorPass>> getActivePasses() {
        return ResponseEntity.ok(visitorPassService.getActivePasses());
    }
}
