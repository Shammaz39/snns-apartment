package com.snns.apartment.controller;

import com.snns.apartment.dto.DashboardStatsResponse;
import com.snns.apartment.dto.GenerateBillRequest;
import com.snns.apartment.dto.PaymentSubmitRequest;
import com.snns.apartment.dto.VerifyPaymentRequest;
import com.snns.apartment.model.Bill;
import com.snns.apartment.service.BillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@Tag(name = "Billing & Revenue", description = "Rent generation, payment proof upload, and receipt verification")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get all bills across all rooms", description = "Admin only")
    public ResponseEntity<List<Bill>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }

    @GetMapping("/room/{roomId}")
    @Operation(summary = "Get billing history for a specific room")
    public ResponseEntity<List<Bill>> getBillsForRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(billService.getBillsForRoom(roomId));
    }

    @GetMapping("/pending-verifications")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get all payments pending verification", description = "Admin only")
    public ResponseEntity<List<Bill>> getPendingVerifications() {
        return ResponseEntity.ok(billService.getPendingVerifications());
    }

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard analytics and revenue metrics")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(billService.getDashboardStats());
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Generate monthly maintenance and rent bills", description = "Admin only. If roomId is omitted, generates for all occupied rooms")
    public ResponseEntity<List<Bill>> generateBills(@Valid @RequestBody GenerateBillRequest request) {
        return ResponseEntity.ok(billService.generateBills(request));
    }

    @PostMapping(value = {"/{id}/pay", "/{id}/submit-payment"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Resident uploads payment screenshot and UTR reference", description = "Status marks PENDING_VERIFICATION")
    public ResponseEntity<Bill> submitPayment(
            @PathVariable Long id,
            @RequestParam("transactionRef") String transactionRef,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt) {

        PaymentSubmitRequest req = new PaymentSubmitRequest(transactionRef);
        return ResponseEntity.ok(billService.submitPayment(id, req, receipt));
    }

    @RequestMapping(value = "/{id}/verify", method = {RequestMethod.POST, RequestMethod.PUT})
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Admin verifies payment receipt and approves or rejects", description = "Admin only")
    public ResponseEntity<Bill> verifyPayment(@PathVariable Long id, @RequestBody VerifyPaymentRequest request) {
        return ResponseEntity.ok(billService.verifyPayment(id, request));
    }
}
