package com.snns.apartment.controller;

import com.snns.apartment.dto.BulkRoomRequest;
import com.snns.apartment.dto.RoomRequest;
import com.snns.apartment.model.Room;
import com.snns.apartment.model.RoomStatus;
import com.snns.apartment.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@Tag(name = "Rooms", description = "Apartment Room and Flat Management APIs")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    @Operation(summary = "Get all rooms")
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get room by ID")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Filter rooms by status (VACANT, OCCUPIED, MAINTENANCE)")
    public ResponseEntity<List<Room>> getRoomsByStatus(@PathVariable RoomStatus status) {
        return ResponseEntity.ok(roomService.getRoomsByStatus(status));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Create a single room", description = "Admin only")
    public ResponseEntity<Room> createRoom(@Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.createRoom(request));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Bulk generate rooms for a floor", description = "Admin only — auto-generates rooms from startRoomSuffix to endRoomSuffix on given floor")
    public ResponseEntity<List<Room>> createBulkRooms(@Valid @RequestBody BulkRoomRequest request) {
        return ResponseEntity.ok(roomService.createBulkRooms(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update room details (rent, fees, status)", description = "Admin only")
    public ResponseEntity<Room> updateRoom(@PathVariable Long id, @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.updateRoom(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Delete room (guarded — cannot delete occupied or rooms with pending bills)", description = "Admin only")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}
