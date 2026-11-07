package com.snns.apartment.service;

import com.snns.apartment.dto.FloorRequest;
import com.snns.apartment.model.Floor;
import com.snns.apartment.repository.FloorRepository;
import com.snns.apartment.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FloorService {

    private final FloorRepository floorRepository;
    private final RoomRepository roomRepository;

    public FloorService(FloorRepository floorRepository, RoomRepository roomRepository) {
        this.floorRepository = floorRepository;
        this.roomRepository = roomRepository;
    }

    public List<Floor> getAllFloors() {
        return floorRepository.findAllByOrderByFloorNumberAsc();
    }

    public Floor getFloorById(Long id) {
        return floorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Floor not found with ID: " + id));
    }

    public Floor createFloor(FloorRequest request) {
        if (floorRepository.existsByFloorNumber(request.getFloorNumber())) {
            throw new RuntimeException("Floor number " + request.getFloorNumber() + " already exists");
        }
        Floor floor = new Floor(
                request.getFloorNumber(),
                request.getFloorName(),
                request.getDefaultRent(),
                request.getDefaultLiftFee(),
                request.getDefaultWasteFee()
        );
        return floorRepository.save(floor);
    }

    public Floor updateFloor(Long id, FloorRequest request) {
        Floor floor = getFloorById(id);
        if (!floor.getFloorNumber().equals(request.getFloorNumber()) &&
                floorRepository.existsByFloorNumber(request.getFloorNumber())) {
            throw new RuntimeException("Floor number " + request.getFloorNumber() + " already exists");
        }
        floor.setFloorNumber(request.getFloorNumber());
        floor.setFloorName(request.getFloorName());
        if (request.getDefaultRent() != null) floor.setDefaultRent(request.getDefaultRent());
        if (request.getDefaultLiftFee() != null) floor.setDefaultLiftFee(request.getDefaultLiftFee());
        if (request.getDefaultWasteFee() != null) floor.setDefaultWasteFee(request.getDefaultWasteFee());
        return floorRepository.save(floor);
    }

    public void deleteFloor(Long id) {
        Floor floor = getFloorById(id);
        long roomCount = roomRepository.countByFloorNumber(floor.getFloorNumber());
        if (roomCount > 0) {
            throw new RuntimeException("Cannot delete Floor " + floor.getFloorNumber() + " — " +
                    roomCount + " room(s) still exist on this floor. Delete or move the rooms first.");
        }
        floorRepository.delete(floor);
    }
}
