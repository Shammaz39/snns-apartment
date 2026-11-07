package com.snns.apartment.repository;

import com.snns.apartment.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findAllByOrderByEventDateDesc();
    List<Event> findByIsPopupNoticeTrueOrderByCreatedAtDesc();
}
