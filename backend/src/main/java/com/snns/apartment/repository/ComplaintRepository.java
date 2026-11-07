package com.snns.apartment.repository;

import com.snns.apartment.model.Complaint;
import com.snns.apartment.model.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByRoomIdOrderByCreatedAtDesc(Long roomId);
    List<Complaint> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Complaint> findByStatus(ComplaintStatus status);
    List<Complaint> findAllByOrderByCreatedAtDesc();
    long countByStatus(ComplaintStatus status);
}
