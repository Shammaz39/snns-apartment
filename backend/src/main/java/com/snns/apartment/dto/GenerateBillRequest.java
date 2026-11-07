package com.snns.apartment.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDate;

public class GenerateBillRequest {
    private Long roomId; // if null, generate for all occupied rooms!

    @NotBlank
    private String billingMonth; // e.g. "2026-10"

    private BigDecimal rentAmount;
    private BigDecimal liftMaintenanceFee;
    private BigDecimal wasteManagementFee;
    private BigDecimal otherCharges;
    private LocalDate dueDate;

    public GenerateBillRequest() {}

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

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

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}
