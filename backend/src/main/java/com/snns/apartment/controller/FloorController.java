package com.snns.apartment.controller;

import com.snns.apartment.dto.FloorRequest;
import com.snns.apartment.model.Floor;
import com.snns.apartment.service.FloorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/floors")
@Tag(name = "Floor Management", description = "Floor Configuration & Scaling APIs")
public class FloorController {

    private final FloorService floorService;

    public FloorController(FloorService floorService) {
        this.floorService = floorService;
    }

    @GetMapping
    @Operation(summary = "Get all floors ordered by floor number")
    public ResponseEntity<List<Floor>> getAllFloors() {
        return ResponseEntity.ok(floorService.getAllFloors());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new floor (Admin only)")
    public ResponseEntity<Floor> createFloor(@Valid @RequestBody FloorRequest request) {
        return ResponseEntity.ok(floorService.createFloor(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update floor details and default fees (Admin only)")
    public ResponseEntity<Floor> updateFloor(@PathVariable Long id, @Valid @RequestBody FloorRequest request) {
        return ResponseEntity.ok(floorService.updateFloor(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete floor with guard against existing rooms (Admin only)")
    public ResponseEntity<Map<String, String>> deleteFloor(@PathVariable Long id) {
        floorService.deleteFloor(id);
        return ResponseEntity.ok(Map.of("message", "Floor deleted successfully"));
    }
}
