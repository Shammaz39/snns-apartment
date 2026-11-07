package com.snns.apartment.repository;

import com.snns.apartment.model.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    List<Visitor> findByStatusOrderByCheckInDesc(String status);
    List<Visitor> findByRoomIdOrderByCheckInDesc(Long roomId);
    List<Visitor> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
}
