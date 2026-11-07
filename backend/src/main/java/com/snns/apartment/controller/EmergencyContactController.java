package com.snns.apartment.controller;

import com.snns.apartment.model.EmergencyContact;
import com.snns.apartment.repository.EmergencyContactRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emergency-contacts")
@Tag(name = "Emergency Contacts", description = "Manage emergency contact numbers (plumber, electrician, etc.)")
public class EmergencyContactController {

    private final EmergencyContactRepository emergencyContactRepository;

    public EmergencyContactController(EmergencyContactRepository emergencyContactRepository) {
        this.emergencyContactRepository = emergencyContactRepository;
    }

    @GetMapping
    @Operation(summary = "Get all emergency contacts", description = "Available to all authenticated users")
    public ResponseEntity<List<EmergencyContact>> getAllContacts() {
        return ResponseEntity.ok(emergencyContactRepository.findAllByOrderByContactTypeAscNameAsc());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Add a new emergency contact", description = "Admin only")
    public ResponseEntity<EmergencyContact> addContact(@RequestBody EmergencyContact contact) {
        return ResponseEntity.ok(emergencyContactRepository.save(contact));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update an emergency contact", description = "Admin only")
    public ResponseEntity<EmergencyContact> updateContact(@PathVariable Long id, @RequestBody EmergencyContact contact) {
        EmergencyContact existing = emergencyContactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Emergency contact not found with ID: " + id));

        if (contact.getContactType() != null) existing.setContactType(contact.getContactType());
        if (contact.getName() != null) existing.setName(contact.getName());
        if (contact.getPhone() != null) existing.setPhone(contact.getPhone());
        if (contact.getDescription() != null) existing.setDescription(contact.getDescription());

        return ResponseEntity.ok(emergencyContactRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Delete an emergency contact", description = "Admin only")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
        if (!emergencyContactRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        emergencyContactRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
