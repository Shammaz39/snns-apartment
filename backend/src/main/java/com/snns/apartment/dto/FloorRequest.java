package com.snns.apartment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class FloorRequest {
    @NotNull
    private Integer floorNumber;

    @NotBlank
    private String floorName;

    private BigDecimal defaultRent;
    private BigDecimal defaultLiftFee;
    private BigDecimal defaultWasteFee;

    public FloorRequest() {}

    public Integer getFloorNumber() { return floorNumber; }
    public void setFloorNumber(Integer floorNumber) { this.floorNumber = floorNumber; }

    public String getFloorName() { return floorName; }
    public void setFloorName(String floorName) { this.floorName = floorName; }

    public BigDecimal getDefaultRent() { return defaultRent; }
    public void setDefaultRent(BigDecimal defaultRent) { this.defaultRent = defaultRent; }

    public BigDecimal getDefaultLiftFee() { return defaultLiftFee; }
    public void setDefaultLiftFee(BigDecimal defaultLiftFee) { this.defaultLiftFee = defaultLiftFee; }

    public BigDecimal getDefaultWasteFee() { return defaultWasteFee; }
    public void setDefaultWasteFee(BigDecimal defaultWasteFee) { this.defaultWasteFee = defaultWasteFee; }
}
