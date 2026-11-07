package com.snns.apartment.service;

import com.snns.apartment.dto.VisitorPassRequest;
import com.snns.apartment.model.Notification;
import com.snns.apartment.model.Room;
import com.snns.apartment.model.RoomStatus;
import com.snns.apartment.model.Tenant;
import com.snns.apartment.model.VisitorPass;
import com.snns.apartment.repository.NotificationRepository;
import com.snns.apartment.repository.RoomRepository;
import com.snns.apartment.repository.TenantRepository;
import com.snns.apartment.repository.VisitorPassRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class VisitorPassService {

    private final VisitorPassRepository visitorPassRepository;
    private final RoomRepository roomRepository;
    private final NotificationRepository notificationRepository;
    private final TenantRepository tenantRepository;

    public VisitorPassService(VisitorPassRepository visitorPassRepository,
                              RoomRepository roomRepository,
                              NotificationRepository notificationRepository,
                              TenantRepository tenantRepository) {
        this.visitorPassRepository = visitorPassRepository;
        this.roomRepository = roomRepository;
        this.notificationRepository = notificationRepository;
        this.tenantRepository = tenantRepository;
    }

    /**
     * Resolve room from either roomId or roomNumber in the request.
     */
    private Room resolveRoom(VisitorPassRequest dto) {
        if (dto.getRoomId() != null) {
            return roomRepository.findById(dto.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found with ID: " + dto.getRoomId()));
        } else if (dto.getRoomNumber() != null) {
            return roomRepository.findByRoomNumber(dto.getRoomNumber())
                    .orElseThrow(() -> new RuntimeException("Room not found with Number: " + dto.getRoomNumber()));
        } else {
            throw new RuntimeException("Room ID or Room Number must be provided");
        }
    }

    /**
     * Validate that room is OCCUPIED. Vacant rooms cannot receive visitors.
     */
    private void validateRoomOccupied(Room room) {
        if (room.getStatus() == RoomStatus.VACANT) {
            throw new RuntimeException("Cannot allocate visitor for Vacant Room " + room.getRoomNumber() + 
                    ". Visitors can only be registered for occupied flats.");
        }
    }

    /**
     * Build a VisitorPass from the DTO with common fields populated.
     */
    private VisitorPass buildPass(VisitorPassRequest dto, Room room) {
        VisitorPass pass = new VisitorPass();
        pass.setRoom(room);
        pass.setVisitorName(dto.getVisitorName());
        pass.setPhone(dto.getPhone());
        pass.setVehicleNumber(dto.getVehicleNumber());
        pass.setPurpose(dto.getPurpose() != null ? dto.getPurpose() : "GUEST");
        return pass;
    }

    /**
     * Security guard requests entry for a visitor → status PENDING.
     * Enforces that the room is OCCUPIED.
     * Creates real-time in-app notification for the tenant.
     */
    @Transactional
    public VisitorPass createSecurityRequest(VisitorPassRequest dto) {
        Room room = resolveRoom(dto);
        validateRoomOccupied(room);

        VisitorPass pass = buildPass(dto, room);
        pass.setStatus("PENDING");
        pass.setRequestedBy("SECURITY");
        pass.setApprovedByTenant(false);

        VisitorPass savedPass = visitorPassRepository.save(pass);

        // Create notification for the tenant
        Notification notification = new Notification();
        notification.setRoomId(room.getId());
        notification.setTitle("Visitor Entry Request");
        notification.setMessage("Visitor \"" + dto.getVisitorName() + "\" (" + dto.getPhone()
                + ") is waiting at the gate for Room " + room.getRoomNumber() + ". Purpose: " + pass.getPurpose());
        notification.setType("VISITOR_REQUEST");
        notification.setIsRead(false);
        notification.setRelatedId(savedPass.getId());
        notificationRepository.save(notification);

        return savedPass;
    }

    /**
     * Security guard direct approval (with audit note recorded) → status CHECKED_IN.
     * Enforces that the room is OCCUPIED.
     */
    @Transactional
    public VisitorPass createCallConfirmedEntry(VisitorPassRequest dto) {
        Room room = resolveRoom(dto);
        validateRoomOccupied(room);

        VisitorPass pass = buildPass(dto, room);
        pass.setStatus("CHECKED_IN");
        pass.setRequestedBy("SECURITY");
        pass.setApprovedByTenant(true);
        pass.setCheckIn(LocalDateTime.now());

        String guardName = (dto.getVerifiedByGuard() != null && !dto.getVerifiedByGuard().isBlank())
                ? dto.getVerifiedByGuard().trim()
                : "Gate Security";
        pass.setVerifiedByGuard(guardName);

        String note = (dto.getVerificationNotes() != null && !dto.getVerificationNotes().isBlank())
                ? dto.getVerificationNotes().trim()
                : "Resident phone confirmation verified at gate by " + guardName;
        pass.setVerificationNotes(note);

        return visitorPassRepository.save(pass);
    }

    /**
     * Tenant pre-approves a visitor → status APPROVED.
     * STRICTLY locked to the authenticated tenant's assigned room.
     */
    @Transactional
    public VisitorPass createTenantPreApproval(VisitorPassRequest dto, Long tenantUserId) {
        if (tenantUserId == null) {
            throw new RuntimeException("Authentication required: Only logged-in residents can pre-approve visitors");
        }

        Tenant tenant = tenantRepository.findByUserId(tenantUserId)
                .orElseThrow(() -> new RuntimeException("No active tenant profile found for user ID: " + tenantUserId));

        Room tenantRoom = tenant.getRoom();
        if (tenantRoom == null) {
            throw new RuntimeException("Tenant is not assigned to any room");
        }

        // Security check: If request sent a different roomId or roomNumber, reject cross-room attempt
        if (dto.getRoomId() != null && !tenantRoom.getId().equals(dto.getRoomId())) {
            throw new RuntimeException("Access Denied: You cannot pre-approve visitors for other rooms! Your room is " 
                    + tenantRoom.getRoomNumber());
        }
        if (dto.getRoomNumber() != null && !tenantRoom.getRoomNumber().equalsIgnoreCase(dto.getRoomNumber().trim())) {
            throw new RuntimeException("Access Denied: You cannot pre-approve visitors for other rooms! Your room is " 
                    + tenantRoom.getRoomNumber());
        }

        // Strictly bind to tenant's own room
        VisitorPass pass = buildPass(dto, tenantRoom);
        pass.setStatus("APPROVED");
        pass.setRequestedBy("TENANT");
        pass.setApprovedByTenant(true);
        pass.setVerificationNotes("Pre-approved in portal by Resident: " + tenant.getFullName());

        if (dto.getExpectedVisitTime() != null && !dto.getExpectedVisitTime().isBlank()) {
            try {
                pass.setExpectedVisitTime(LocalDateTime.parse(dto.getExpectedVisitTime()));
            } catch (Exception ignored) {}
        }

        return visitorPassRepository.save(pass);
    }

    /**
     * Tenant approves a pending visitor pass.
     */
    @Transactional
    public VisitorPass approvePass(Long passId, Long tenantUserId) {
        VisitorPass pass = visitorPassRepository.findById(passId)
                .orElseThrow(() -> new RuntimeException("Visitor pass not found with ID: " + passId));

        if (!"PENDING".equals(pass.getStatus())) {
            throw new RuntimeException("Only PENDING passes can be approved. Current status: " + pass.getStatus());
        }

        if (tenantUserId != null) {
            Optional<Tenant> tenantOpt = tenantRepository.findByUserId(tenantUserId);
            if (tenantOpt.isPresent()) {
                Tenant tenant = tenantOpt.get();
                if (tenant.getRoom() != null && !tenant.getRoom().getId().equals(pass.getRoom().getId())) {
                    throw new RuntimeException("Access Denied: You cannot approve visitor passes for Room " + pass.getRoom().getRoomNumber());
                }
            }
        }

        pass.setStatus("APPROVED");
        pass.setApprovedByTenant(true);
        return visitorPassRepository.save(pass);
    }

    /**
     * Tenant rejects a pending visitor pass.
     */
    @Transactional
    public VisitorPass rejectPass(Long passId, Long tenantUserId) {
        VisitorPass pass = visitorPassRepository.findById(passId)
                .orElseThrow(() -> new RuntimeException("Visitor pass not found with ID: " + passId));

        if (!"PENDING".equals(pass.getStatus())) {
            throw new RuntimeException("Only PENDING passes can be rejected. Current status: " + pass.getStatus());
        }

        if (tenantUserId != null) {
            Optional<Tenant> tenantOpt = tenantRepository.findByUserId(tenantUserId);
            if (tenantOpt.isPresent()) {
                Tenant tenant = tenantOpt.get();
                if (tenant.getRoom() != null && !tenant.getRoom().getId().equals(pass.getRoom().getId())) {
                    throw new RuntimeException("Access Denied: You cannot reject visitor passes for Room " + pass.getRoom().getRoomNumber());
                }
            }
        }

        pass.setStatus("REJECTED");
        return visitorPassRepository.save(pass);
    }

    /**
     * Security checks in an approved visitor.
     */
    @Transactional
    public VisitorPass checkInPass(Long passId) {
        VisitorPass pass = visitorPassRepository.findById(passId)
                .orElseThrow(() -> new RuntimeException("Visitor pass not found with ID: " + passId));

        if (!"APPROVED".equals(pass.getStatus()) && !"PENDING".equals(pass.getStatus())) {
            throw new RuntimeException("Pass cannot be checked in. Current status: " + pass.getStatus());
        }

        pass.setStatus("CHECKED_IN");
        pass.setApprovedByTenant(true);
        pass.setCheckIn(LocalDateTime.now());
        return visitorPassRepository.save(pass);
    }

    /**
     * Security checks out a visitor.
     */
    @Transactional
    public VisitorPass checkOutPass(Long passId) {
        VisitorPass pass = visitorPassRepository.findById(passId)
                .orElseThrow(() -> new RuntimeException("Visitor pass not found with ID: " + passId));

        if (!"CHECKED_IN".equals(pass.getStatus())) {
            throw new RuntimeException("Only CHECKED_IN passes can be checked out. Current status: " + pass.getStatus());
        }

        pass.setStatus("CHECKED_OUT");
        pass.setCheckOut(LocalDateTime.now());
        return visitorPassRepository.save(pass);
    }

    public List<VisitorPass> getPendingPassesForRoom(Long roomId) {
        return visitorPassRepository.findByRoomIdAndStatusOrderByCreatedAtDesc(roomId, "PENDING");
    }

    public List<VisitorPass> getAllPasses() {
        return visitorPassRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<VisitorPass> getActivePasses() {
        return visitorPassRepository.findByStatusOrderByCreatedAtDesc("CHECKED_IN");
    }
}
