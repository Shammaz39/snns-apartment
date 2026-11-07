package com.snns.apartment.service;

import com.snns.apartment.dto.BulkRoomRequest;
import com.snns.apartment.dto.RoomRequest;
import com.snns.apartment.model.BillStatus;
import com.snns.apartment.model.Floor;
import com.snns.apartment.model.Room;
import com.snns.apartment.model.RoomStatus;
import com.snns.apartment.repository.BillRepository;
import com.snns.apartment.repository.FloorRepository;
import com.snns.apartment.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final BillRepository billRepository;
    private final FloorRepository floorRepository;

    public RoomService(RoomRepository roomRepository, BillRepository billRepository, FloorRepository floorRepository) {
        this.roomRepository = roomRepository;
        this.billRepository = billRepository;
        this.floorRepository = floorRepository;
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAllByOrderByRoomNumberAsc();
    }

    public Room getRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found with ID: " + id));
    }

    public Room createRoom(RoomRequest request) {
        if (roomRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new RuntimeException("Room number " + request.getRoomNumber() + " already exists");
        }

        BigDecimal rent = request.getDefaultRent();
        BigDecimal liftFee = request.getDefaultLiftFee();
        BigDecimal wasteFee = request.getDefaultWasteFee();

        if (rent == null || liftFee == null || wasteFee == null) {
            Optional<Floor> floorOpt = floorRepository.findByFloorNumber(request.getFloorNumber());
            if (floorOpt.isPresent()) {
                Floor f = floorOpt.get();
                if (rent == null) rent = f.getDefaultRent();
                if (liftFee == null) liftFee = f.getDefaultLiftFee();
                if (wasteFee == null) wasteFee = f.getDefaultWasteFee();
            } else {
                if (rent == null) rent = BigDecimal.valueOf(8000.00);
                if (liftFee == null) liftFee = BigDecimal.valueOf(500.00);
                if (wasteFee == null) wasteFee = BigDecimal.valueOf(200.00);
            }
        }

        Room room = new Room(
                request.getRoomNumber(),
                request.getFloorNumber(),
                rent,
                liftFee,
                wasteFee
        );
        if (request.getStatus() != null) {
            room.setStatus(request.getStatus());
        }
        return roomRepository.save(room);
    }

    public List<Room> createBulkRooms(BulkRoomRequest request) {
        List<Room> created = new ArrayList<>();
        int floor = request.getFloorNumber();
        int start = request.getStartRoomSuffix();
        int end = request.getEndRoomSuffix();

        BigDecimal rent = request.getDefaultRent();
        BigDecimal liftFee = request.getDefaultLiftFee();
        BigDecimal wasteFee = request.getDefaultWasteFee();

        if (rent == null || liftFee == null || wasteFee == null) {
            Optional<Floor> floorOpt = floorRepository.findByFloorNumber(floor);
            if (floorOpt.isPresent()) {
                Floor f = floorOpt.get();
                if (rent == null) rent = f.getDefaultRent();
                if (liftFee == null) liftFee = f.getDefaultLiftFee();
                if (wasteFee == null) wasteFee = f.getDefaultWasteFee();
            } else {
                if (rent == null) rent = BigDecimal.valueOf(8000.00);
                if (liftFee == null) liftFee = BigDecimal.valueOf(500.00);
                if (wasteFee == null) wasteFee = BigDecimal.valueOf(200.00);
            }
        }

        for (int i = start; i <= end; i++) {
            String roomNum = floor + (i < 10 ? "0" + i : String.valueOf(i));
            if (roomRepository.existsByRoomNumber(roomNum)) {
                continue;
            }
            Room room = new Room(roomNum, floor, rent, liftFee, wasteFee);
            created.add(roomRepository.save(room));
        }
        return created;
    }

    public Room updateRoom(Long id, RoomRequest request) {
        Room room = getRoomById(id);
        if (!room.getRoomNumber().equals(request.getRoomNumber()) &&
                roomRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new RuntimeException("Room number " + request.getRoomNumber() + " already exists");
        }
        room.setRoomNumber(request.getRoomNumber());
        if (request.getFloorNumber() != null) room.setFloorNumber(request.getFloorNumber());
        if (request.getStatus() != null) room.setStatus(request.getStatus());
        if (request.getDefaultRent() != null) room.setDefaultRent(request.getDefaultRent());
        if (request.getDefaultLiftFee() != null) room.setDefaultLiftFee(request.getDefaultLiftFee());
        if (request.getDefaultWasteFee() != null) room.setDefaultWasteFee(request.getDefaultWasteFee());
        return roomRepository.save(room);
    }

    public void deleteRoom(Long id) {
        Room room = getRoomById(id);
        if (room.getStatus() == RoomStatus.OCCUPIED) {
            throw new RuntimeException("Cannot delete room " + room.getRoomNumber() + " — it is currently OCCUPIED. Deboard the tenant first.");
        }
        boolean hasPendingBills = billRepository.findByRoomIdOrderByCreatedAtDesc(id)
                .stream()
                .anyMatch(b -> b.getStatus() == BillStatus.PENDING || b.getStatus() == BillStatus.PENDING_VERIFICATION);
        if (hasPendingBills) {
            throw new RuntimeException("Cannot delete room " + room.getRoomNumber() + " — it has pending bills. Resolve all bills first.");
        }
        roomRepository.delete(room);
    }

    public List<Room> getRoomsByStatus(RoomStatus status) {
        return roomRepository.findByStatus(status);
    }
}
