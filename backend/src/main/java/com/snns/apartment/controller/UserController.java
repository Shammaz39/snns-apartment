package com.snns.apartment.controller;

import com.snns.apartment.dto.StaffRequest;
import com.snns.apartment.model.Role;
import com.snns.apartment.model.User;
import com.snns.apartment.service.UserService;
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
@RequestMapping("/api/users")
@Tag(name = "User & Staff Management", description = "Admin & Security Staff creation and listing APIs")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all admins and security personnel")
    public ResponseEntity<List<User>> getAllStaff() {
        return ResponseEntity.ok(userService.getAllStaff());
    }

    @GetMapping("/security")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all security staff")
    public ResponseEntity<List<User>> getSecurityStaff() {
        return ResponseEntity.ok(userService.getUsersByRole(Role.ROLE_SECURITY));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create an additional Admin (Admin only)")
    public ResponseEntity<User> createAdmin(@Valid @RequestBody StaffRequest request) {
        return ResponseEntity.ok(userService.createAdmin(request));
    }

    @PostMapping("/security")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a Security Guard account (Admin only)")
    public ResponseEntity<User> createSecurity(@Valid @RequestBody StaffRequest request) {
        return ResponseEntity.ok(userService.createSecurityGuard(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a staff/user account (cannot delete self)")
    public ResponseEntity<Map<String, String>> deleteStaff(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        userService.deleteStaff(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Staff account deleted successfully"));
    }
}
