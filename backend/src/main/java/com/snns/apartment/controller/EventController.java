package com.snns.apartment.controller;

import com.snns.apartment.dto.EventRequest;
import com.snns.apartment.model.Event;
import com.snns.apartment.service.EventService;
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
@RequestMapping("/api/events")
@Tag(name = "Events & Announcements", description = "Cultural events, Onam celebrations, and pop-up notices")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    @Operation(summary = "Get all events and announcements")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/popups")
    @Operation(summary = "Get active pop-up notices for residents")
    public ResponseEntity<List<Event>> getPopupNotices() {
        return ResponseEntity.ok(eventService.getPopupNotices());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Create an event / fest with banner image", description = "Admin only")
    public ResponseEntity<Event> createEvent(
            @Valid @ModelAttribute EventRequest request,
            @RequestPart(value = "banner", required = false) MultipartFile banner) {
        return ResponseEntity.ok(eventService.createEvent(request, banner));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update an event / fest", description = "Admin only")
    public ResponseEntity<Event> updateEvent(
            @PathVariable Long id,
            @Valid @ModelAttribute EventRequest request,
            @RequestPart(value = "banner", required = false) MultipartFile banner) {
        return ResponseEntity.ok(eventService.updateEvent(id, request, banner));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Delete event", description = "Admin only")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
