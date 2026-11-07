package com.snns.apartment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false, length = 20)
    private String billingMonth; // e.g. "2026-10"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal rentAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal liftMaintenanceFee = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal wasteManagementFee = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal otherCharges = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BillStatus status = BillStatus.PENDING;

    @Column(length = 100)
    private String transactionRef; // e.g. UTR / UPI Ref ID

    @Column(length = 255)
    private String receiptDocPath; // Uploaded payment screenshot

    @Column(length = 500)
    private String adminRemarks;

    private LocalDate dueDate;
    private LocalDateTime paidAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        calculateTotal();
    }

    public void calculateTotal() {
        BigDecimal sum = BigDecimal.ZERO;
        if (rentAmount != null) sum = sum.add(rentAmount);
        if (liftMaintenanceFee != null) sum = sum.add(liftMaintenanceFee);
        if (wasteManagementFee != null) sum = sum.add(wasteManagementFee);
        if (otherCharges != null) sum = sum.add(otherCharges);
        this.totalAmount = sum;
    }

    public Bill() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public String getBillingMonth() { return billingMonth; }
    public void setBillingMonth(String billingMonth) { this.billingMonth = billingMonth; }

    public BigDecimal getRentAmount() { return rentAmount; }
    public void setRentAmount(BigDecimal rentAmount) { this.rentAmount = rentAmount; }

    public BigDecimal getLiftMaintenanceFee() { return liftMaintenanceFee; }
    public void setLiftMaintenanceFee(BigDecimal liftMaintenanceFee) { this.liftMaintenanceFee = liftMaintenanceFee; }

    public BigDecimal getWasteManagementFee() { return wasteManagementFee; }
    public void setWasteManagementFee(BigDecimal wasteManagementFee) { this.wasteManagementFee = wasteManagementFee; }

    public BigDecimal getOtherCharges() { return otherCharges; }
    public void setOtherCharges(BigDecimal otherCharges) { this.otherCharges = otherCharges; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public BillStatus getStatus() { return status; }
    public void setStatus(BillStatus status) { this.status = status; }

    public String getTransactionRef() { return transactionRef; }
    public void setTransactionRef(String transactionRef) { this.transactionRef = transactionRef; }

    public String getReceiptDocPath() { return receiptDocPath; }
    public void setReceiptDocPath(String receiptDocPath) { this.receiptDocPath = receiptDocPath; }

    public String getAdminRemarks() { return adminRemarks; }
    public void setAdminRemarks(String adminRemarks) { this.adminRemarks = adminRemarks; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
