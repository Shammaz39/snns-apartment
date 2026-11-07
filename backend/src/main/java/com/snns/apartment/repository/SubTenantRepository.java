package com.snns.apartment.repository;

import com.snns.apartment.model.Room;
import com.snns.apartment.model.SubTenant;
import com.snns.apartment.model.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubTenantRepository extends JpaRepository<SubTenant, Long> {
    List<SubTenant> findByRoomAndIsActiveTrue(Room room);
    List<SubTenant> findByRoomIdAndIsActiveTrue(Long roomId);
    List<SubTenant> findByPrimaryTenantAndIsActiveTrue(Tenant primaryTenant);
}
