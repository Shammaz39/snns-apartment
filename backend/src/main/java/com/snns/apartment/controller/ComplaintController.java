package com.snns.apartment.controller;

import com.snns.apartment.dto.ComplaintRequest;
import com.snns.apartment.model.Complaint;
import com.snns.apartment.model.ComplaintStatus;
import com.snns.apartment.service.ComplaintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@Tag(name = "Complaints & Maintenance", description = "Plumbing, electrical, waste, and lift maintenance ticketing")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get all complaints", description = "Admin only")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/room/{roomId}")
    @Operation(summary = "Get complaints for a specific room")
    public ResponseEntity<List<Complaint>> getComplaintsForRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(complaintService.getComplaintsForRoom(roomId));
    }

    @PostMapping
    @Operation(summary = "Submit a maintenance complaint")
    public ResponseEntity<Complaint> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(complaintService.createComplaint(request, userDetails.getUsername()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update complaint status and admin response", description = "Admin only")
    public ResponseEntity<Complaint> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {

        ComplaintStatus status = ComplaintStatus.valueOf(payload.get("status"));
        String adminResponse = payload.get("adminResponse");
        return ResponseEntity.ok(complaintService.updateComplaintStatus(id, status, adminResponse));
    }
}
