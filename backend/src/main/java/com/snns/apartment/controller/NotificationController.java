package com.snns.apartment.controller;

import com.snns.apartment.model.Notification;
import com.snns.apartment.repository.NotificationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Notification management for tenants")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping("/room/{roomId}")
    @Operation(summary = "Get all notifications for a room")
    public ResponseEntity<List<Notification>> getNotificationsForRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(notificationRepository.findByRoomIdOrderByCreatedAtDesc(roomId));
    }

    @GetMapping("/room/{roomId}/unread")
    @Operation(summary = "Get unread notifications for a room")
    public ResponseEntity<List<Notification>> getUnreadNotificationsForRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(notificationRepository.findByRoomIdAndIsReadFalseOrderByCreatedAtDesc(roomId));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));
        notification.setIsRead(true);
        return ResponseEntity.ok(notificationRepository.save(notification));
    }
}
