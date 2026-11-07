package com.snns.apartment.service;

import com.snns.apartment.dto.VisitorRequest;
import com.snns.apartment.model.Room;
import com.snns.apartment.model.Tenant;
import com.snns.apartment.model.Visitor;
import com.snns.apartment.repository.RoomRepository;
import com.snns.apartment.repository.TenantRepository;
import com.snns.apartment.repository.VisitorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VisitorService {

    private final VisitorRepository visitorRepository;
    private final RoomRepository roomRepository;
    private final TenantRepository tenantRepository;

    public VisitorService(VisitorRepository visitorRepository, RoomRepository roomRepository, TenantRepository tenantRepository) {
        this.visitorRepository = visitorRepository;
        this.roomRepository = roomRepository;
        this.tenantRepository = tenantRepository;
    }

    public List<Visitor> getAllVisitors() {
        return visitorRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Visitor> getActiveVisitors() {
        return visitorRepository.findByStatusOrderByCheckInDesc("CHECKED_IN");
    }

    public List<Visitor> getVisitorsByRoom(Long roomId) {
        return visitorRepository.findByRoomIdOrderByCheckInDesc(roomId);
    }

    /**
     * Validate that the given tenant (by userId or tenantId) owns the target room.
     */
    public void validateRoomOwnership(Long roomId, Long tenantUserId) {
        if (tenantUserId == null) return;
        Tenant tenant = tenantRepository.findByUserId(tenantUserId)
                .orElse(null);
        if (tenant != null && tenant.getRoom() != null && !tenant.getRoom().getId().equals(roomId)) {
            throw new RuntimeException("Access Denied: Tenant of room " + tenant.getRoom().getRoomNumber() + 
                    " cannot allocate or approve visitors for room ID " + roomId);
        }
    }

    @Transactional
    public Visitor checkInVisitor(VisitorRequest request) {
        Room room;
        if (request.getRoomId() != null) {
            room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found with ID: " + request.getRoomId()));
        } else if (request.getRoomNumber() != null) {
            room = roomRepository.findByRoomNumber(request.getRoomNumber())
                    .orElseThrow(() -> new RuntimeException("Room not found with Number: " + request.getRoomNumber()));
        } else {
            throw new RuntimeException("Room ID or Room Number must be provided");
        }

        if (room.getStatus() == com.snns.apartment.model.RoomStatus.VACANT) {
            throw new RuntimeException("Cannot allocate visitor for Vacant Room " + room.getRoomNumber() + 
                    ". Visitors can only be checked in for occupied flats.");
        }

        Visitor visitor = new Visitor();
        visitor.setRoom(room);
        visitor.setVisitorName(request.getVisitorName());
        visitor.setPhone(request.getPhone());
        visitor.setVehicleNumber(request.getVehicleNumber());
        visitor.setPurpose(request.getPurpose() != null ? request.getPurpose() : "GUEST");
        visitor.setStatus("CHECKED_IN");
        visitor.setCheckIn(LocalDateTime.now());
        visitor.setIsPreApproved(Boolean.TRUE.equals(request.getIsPreApproved()));
        return visitorRepository.save(visitor);
    }

    @Transactional
    public Visitor checkOutVisitor(Long visitorId) {
        Visitor visitor = visitorRepository.findById(visitorId)
                .orElseThrow(() -> new RuntimeException("Visitor record not found with ID: " + visitorId));
        visitor.setStatus("CHECKED_OUT");
        visitor.setCheckOut(LocalDateTime.now());
        return visitorRepository.save(visitor);
    }

    @Transactional
    public Visitor preApproveVisitor(VisitorRequest request) {
        Room room;
        if (request.getRoomId() != null) {
            room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));
        } else if (request.getRoomNumber() != null) {
            room = roomRepository.findByRoomNumber(request.getRoomNumber())
                    .orElseThrow(() -> new RuntimeException("Room not found"));
        } else {
            throw new RuntimeException("Room ID or Room Number required");
        }
        if (room.getStatus() == com.snns.apartment.model.RoomStatus.VACANT) {
            throw new RuntimeException("Cannot allocate visitor for Vacant Room " + room.getRoomNumber() + 
                    ". Visitors can only be checked in for occupied flats.");
        }

        Visitor visitor = new Visitor();
        visitor.setRoom(room);
        visitor.setVisitorName(request.getVisitorName());
        visitor.setPhone(request.getPhone());
        visitor.setVehicleNumber(request.getVehicleNumber());
        visitor.setPurpose(request.getPurpose() != null ? request.getPurpose() : "GUEST");
        visitor.setStatus("EXPECTED");
        visitor.setIsPreApproved(true);
        return visitorRepository.save(visitor);
    }
}
