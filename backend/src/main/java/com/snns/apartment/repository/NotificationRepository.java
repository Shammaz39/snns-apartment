package com.snns.apartment.repository;

import com.snns.apartment.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRoomIdAndIsReadFalseOrderByCreatedAtDesc(Long roomId);
    List<Notification> findByRoomIdOrderByCreatedAtDesc(Long roomId);
}
