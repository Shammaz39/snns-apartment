package com.snns.apartment.controller;

import com.snns.apartment.dto.VisitorRequest;
import com.snns.apartment.model.Visitor;
import com.snns.apartment.service.VisitorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visitors")
@Tag(name = "Visitor & Security Gatekeeping", description = "Gatekeeper visitor passes, vehicle logging, and check-in/out APIs")
public class VisitorController {

    private final VisitorService visitorService;

    public VisitorController(VisitorService visitorService) {
        this.visitorService = visitorService;
    }

    @GetMapping
    @Operation(summary = "Get all visitor logs")
    public ResponseEntity<List<Visitor>> getAllVisitors() {
        return ResponseEntity.ok(visitorService.getAllVisitors());
    }

    @GetMapping("/active")
    @Operation(summary = "Get active visitors currently inside the complex")
    public ResponseEntity<List<Visitor>> getActiveVisitors() {
        return ResponseEntity.ok(visitorService.getActiveVisitors());
    }

    @GetMapping("/room/{roomId}")
    @Operation(summary = "Get visitor history for a specific room")
    public ResponseEntity<List<Visitor>> getVisitorsByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(visitorService.getVisitorsByRoom(roomId));
    }

    @PostMapping("/check-in")
    @Operation(summary = "Check in a visitor at the gate (Security & Admin)")
    public ResponseEntity<Visitor> checkIn(@Valid @RequestBody VisitorRequest request) {
        return ResponseEntity.ok(visitorService.checkInVisitor(request));
    }

    @PutMapping("/{id}/check-out")
    @Operation(summary = "Check out visitor leaving the complex")
    public ResponseEntity<Visitor> checkOut(@PathVariable Long id) {
        return ResponseEntity.ok(visitorService.checkOutVisitor(id));
    }

    @PostMapping("/pre-approve")
    @Operation(summary = "Resident pre-approves an expected visitor")
    public ResponseEntity<Visitor> preApprove(@Valid @RequestBody VisitorRequest request) {
        return ResponseEntity.ok(visitorService.preApproveVisitor(request));
    }
}
