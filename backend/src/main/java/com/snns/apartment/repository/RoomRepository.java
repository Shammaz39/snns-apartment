package com.snns.apartment.repository;

import com.snns.apartment.model.Room;
import com.snns.apartment.model.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomNumber(String roomNumber);
    boolean existsByRoomNumber(String roomNumber);
    List<Room> findByStatus(RoomStatus status);
    List<Room> findAllByOrderByRoomNumberAsc();
    List<Room> findByFloorNumber(Integer floorNumber);
    long countByFloorNumber(Integer floorNumber);
}
