package com.snns.apartment.repository;

import com.snns.apartment.model.VisitorPass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitorPassRepository extends JpaRepository<VisitorPass, Long> {
    List<VisitorPass> findByStatusOrderByCreatedAtDesc(String status);
    List<VisitorPass> findByRoomIdOrderByCreatedAtDesc(Long roomId);
    List<VisitorPass> findByStatusInOrderByCreatedAtDesc(List<String> statuses);
    List<VisitorPass> findAllByOrderByCreatedAtDesc();
    List<VisitorPass> findByRoomIdAndStatusOrderByCreatedAtDesc(Long roomId, String status);
}
