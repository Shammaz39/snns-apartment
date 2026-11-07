package com.snns.apartment.repository;

import com.snns.apartment.model.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FloorRepository extends JpaRepository<Floor, Long> {
    Optional<Floor> findByFloorNumber(Integer floorNumber);
    boolean existsByFloorNumber(Integer floorNumber);
    List<Floor> findAllByOrderByFloorNumberAsc();
}
