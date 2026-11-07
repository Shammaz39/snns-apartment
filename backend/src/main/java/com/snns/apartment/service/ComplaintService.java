package com.snns.apartment.service;

import com.snns.apartment.dto.ComplaintRequest;
import com.snns.apartment.model.*;
import com.snns.apartment.repository.ComplaintRepository;
import com.snns.apartment.repository.RoomRepository;
import com.snns.apartment.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public ComplaintService(ComplaintRepository complaintRepository,
                            RoomRepository roomRepository,
                            UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Complaint> getComplaintsForRoom(Long roomId) {
        return complaintRepository.findByRoomIdOrderByCreatedAtDesc(roomId);
    }

    public Complaint createComplaint(ComplaintRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found: " + request.getRoomId()));

        Complaint complaint = new Complaint();
        complaint.setRoom(room);
        complaint.setUser(user);
        complaint.setCategory(request.getCategory());
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setStatus(ComplaintStatus.OPEN);

        return complaintRepository.save(complaint);
    }

    @Transactional
    public Complaint updateComplaintStatus(Long id, ComplaintStatus status, String adminResponse) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found with ID: " + id));

        complaint.setStatus(status);
        if (adminResponse != null) {
            complaint.setAdminResponse(adminResponse);
        }
        if (status == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(LocalDateTime.now());
        }

        return complaintRepository.save(complaint);
    }
}
