package com.snns.apartment.repository;

import com.snns.apartment.model.Room;
import com.snns.apartment.model.Tenant;
import com.snns.apartment.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    Optional<Tenant> findByUser(User user);
    Optional<Tenant> findByUserId(Long userId);
    Optional<Tenant> findByRoomAndIsActiveTrue(Room room);
    Optional<Tenant> findByRoomIdAndIsActiveTrue(Long roomId);
    Optional<Tenant> findByRoomRoomNumberAndIsActiveTrue(String roomNumber);
    List<Tenant> findByIsActiveTrue();
    boolean existsByAadhaarNumber(String aadhaarNumber);
}
