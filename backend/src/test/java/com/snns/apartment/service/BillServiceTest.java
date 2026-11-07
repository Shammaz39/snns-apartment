package com.snns.apartment.service;

import com.snns.apartment.dto.GenerateBillRequest;
import com.snns.apartment.dto.VerifyPaymentRequest;
import com.snns.apartment.model.Bill;
import com.snns.apartment.model.BillStatus;
import com.snns.apartment.model.Room;
import com.snns.apartment.repository.BillRepository;
import com.snns.apartment.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BillServiceTest {

    @Autowired
    private BillService billService;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BillRepository billRepository;

    private Room testRoom;

    @BeforeEach
    void setup() {
        testRoom = roomRepository.findByRoomNumber("101").orElseGet(() -> {
            Room r = new Room("101", 1, BigDecimal.valueOf(8000), BigDecimal.valueOf(500), BigDecimal.valueOf(200));
            return roomRepository.save(r);
        });
    }

    @Test
    void testGenerateBillForRoom() {
        GenerateBillRequest req = new GenerateBillRequest();
        req.setRoomId(testRoom.getId());
        req.setBillingMonth("2026-11");
        req.setDueDate(LocalDate.now().plusDays(10));

        List<Bill> bills = billService.generateBills(req);

        assertNotNull(bills);
        assertFalse(bills.isEmpty());
        Bill bill = bills.get(0);
        assertEquals("2026-11", bill.getBillingMonth());
        assertEquals(BillStatus.PENDING, bill.getStatus());
        assertEquals(0, BigDecimal.valueOf(8700).compareTo(bill.getTotalAmount()));
    }

    @Test
    void testVerifyPaymentApproved() {
        GenerateBillRequest req = new GenerateBillRequest();
        req.setRoomId(testRoom.getId());
        req.setBillingMonth("2026-12");

        List<Bill> bills = billService.generateBills(req);
        Bill bill = bills.get(0);

        VerifyPaymentRequest verifyReq = new VerifyPaymentRequest(true, "Payment verified from GPay screenshot");
        Bill verifiedBill = billService.verifyPayment(bill.getId(), verifyReq);

        assertEquals(BillStatus.PAID, verifiedBill.getStatus());
        assertNotNull(verifiedBill.getPaidAt());
        assertEquals("Payment verified from GPay screenshot", verifiedBill.getAdminRemarks());
    }

    @Test
    void testVerifyPaymentRejected() {
        GenerateBillRequest req = new GenerateBillRequest();
        req.setRoomId(testRoom.getId());
        req.setBillingMonth("2027-01");

        List<Bill> bills = billService.generateBills(req);
        Bill bill = bills.get(0);

        VerifyPaymentRequest verifyReq = new VerifyPaymentRequest(false, "Invalid transaction UTR");
        Bill rejectedBill = billService.verifyPayment(bill.getId(), verifyReq);

        assertEquals(BillStatus.REJECTED, rejectedBill.getStatus());
        assertEquals("Invalid transaction UTR", rejectedBill.getAdminRemarks());
    }
}
