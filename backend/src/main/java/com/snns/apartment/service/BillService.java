package com.snns.apartment.service;

import com.snns.apartment.dto.DashboardStatsResponse;
import com.snns.apartment.dto.GenerateBillRequest;
import com.snns.apartment.dto.PaymentSubmitRequest;
import com.snns.apartment.dto.VerifyPaymentRequest;
import com.snns.apartment.model.*;
import com.snns.apartment.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final RoomRepository roomRepository;
    private final ComplaintRepository complaintRepository;
    private final EventRepository eventRepository;
    private final ApartmentSettingsRepository settingsRepository;
    private final FileStorageService fileStorageService;

    public BillService(BillRepository billRepository,
                       RoomRepository roomRepository,
                       ComplaintRepository complaintRepository,
                       EventRepository eventRepository,
                       ApartmentSettingsRepository settingsRepository,
                       FileStorageService fileStorageService) {
        this.billRepository = billRepository;
        this.roomRepository = roomRepository;
        this.complaintRepository = complaintRepository;
        this.eventRepository = eventRepository;
        this.settingsRepository = settingsRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<Bill> getAllBills() {
        return billRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Bill> getBillsForRoom(Long roomId) {
        return billRepository.findByRoomIdOrderByCreatedAtDesc(roomId);
    }

    public List<Bill> getPendingVerifications() {
        return billRepository.findByStatus(BillStatus.PENDING_VERIFICATION);
    }

    public Bill getBillById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found with ID: " + id));
    }

    @Transactional
    public List<Bill> generateBills(GenerateBillRequest request) {
        List<Bill> generatedBills = new ArrayList<>();

        if (request.getRoomId() != null) {
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found"));
            generatedBills.add(createOrUpdateBill(room, request));
        } else {
            // Generate for all occupied rooms
            List<Room> occupiedRooms = roomRepository.findByStatus(RoomStatus.OCCUPIED);
            for (Room room : occupiedRooms) {
                generatedBills.add(createOrUpdateBill(room, request));
            }
        }
        return generatedBills;
    }

    private Bill createOrUpdateBill(Room room, GenerateBillRequest req) {
        Optional<Bill> existing = billRepository.findByRoomIdAndBillingMonth(room.getId(), req.getBillingMonth());
        Bill bill = existing.orElseGet(Bill::new);

        bill.setRoom(room);
        bill.setBillingMonth(req.getBillingMonth());
        bill.setRentAmount(req.getRentAmount() != null ? req.getRentAmount() : room.getDefaultRent());
        bill.setLiftMaintenanceFee(req.getLiftMaintenanceFee() != null ? req.getLiftMaintenanceFee() : room.getDefaultLiftFee());
        bill.setWasteManagementFee(req.getWasteManagementFee() != null ? req.getWasteManagementFee() : room.getDefaultWasteFee());
        bill.setOtherCharges(req.getOtherCharges() != null ? req.getOtherCharges() : BigDecimal.ZERO);
        bill.setDueDate(req.getDueDate() != null ? req.getDueDate() : LocalDate.now().plusDays(10));
        bill.calculateTotal();

        if (bill.getId() == null || bill.getStatus() != BillStatus.PAID) {
            bill.setStatus(BillStatus.PENDING);
        }

        return billRepository.save(bill);
    }

    @Transactional
    public Bill submitPayment(Long billId, PaymentSubmitRequest req, MultipartFile receiptFile) {
        Bill bill = getBillById(billId);

        String receiptPath = null;
        if (receiptFile != null && !receiptFile.isEmpty()) {
            receiptPath = fileStorageService.storeFile(receiptFile, "receipts");
        }

        bill.setTransactionRef(req.getTransactionRef());
        if (receiptPath != null) {
            bill.setReceiptDocPath(receiptPath);
        }
        bill.setStatus(BillStatus.PENDING_VERIFICATION);

        return billRepository.save(bill);
    }

    @Transactional
    public Bill verifyPayment(Long billId, VerifyPaymentRequest req) {
        Bill bill = getBillById(billId);

        if (req.isApproved()) {
            bill.setStatus(BillStatus.PAID);
            bill.setPaidAt(LocalDateTime.now());
            bill.setAdminRemarks(req.getRemarks() != null ? req.getRemarks() : "Payment verified and approved");
        } else {
            bill.setStatus(BillStatus.REJECTED);
            bill.setAdminRemarks(req.getRemarks() != null ? req.getRemarks() : "Payment rejected by Admin");
        }

        return billRepository.save(bill);
    }

    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        long totalRooms = roomRepository.count();
        long occupied = roomRepository.findByStatus(RoomStatus.OCCUPIED).size();
        long vacant = roomRepository.findByStatus(RoomStatus.VACANT).size();
        long maintenance = roomRepository.findByStatus(RoomStatus.MAINTENANCE).size();

        stats.setTotalRooms(totalRooms);
        stats.setOccupiedRooms(occupied);
        stats.setVacantRooms(vacant);
        stats.setMaintenanceRooms(maintenance);

        stats.setTotalPaidRevenue(billRepository.sumTotalPaidRevenue());
        stats.setTotalPendingRevenue(billRepository.sumTotalPendingRevenue());
        stats.setPendingVerificationsCount(billRepository.findByStatus(BillStatus.PENDING_VERIFICATION).size());

        stats.setOpenComplaintsCount(complaintRepository.countByStatus(ComplaintStatus.OPEN));
        stats.setUpcomingEventsCount(eventRepository.count());

        Optional<ApartmentSettings> settings = settingsRepository.findFirstByOrderByIdAsc();
        if (settings.isPresent()) {
            stats.setDemoModeActive(Boolean.TRUE.equals(settings.get().getDemoModeActive()));
            if (settings.get().getDemoExpiryDate() != null) {
                long days = ChronoUnit.DAYS.between(LocalDate.now(), settings.get().getDemoExpiryDate());
                stats.setDemoDaysRemaining(Math.max(0, days));
            } else {
                stats.setDemoDaysRemaining(30);
            }
        } else {
            stats.setDemoModeActive(true);
            stats.setDemoDaysRemaining(30);
        }

        return stats;
    }
}
