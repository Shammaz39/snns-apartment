package com.snns.apartment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class BulkRoomRequest {

    @NotNull(message = "Floor number is required")
    @Min(value = 1, message = "Floor number must be at least 1")
    private Integer floorNumber;

    @NotNull(message = "Start room suffix is required")
    @Min(value = 1, message = "Start room suffix must be at least 1")
    private Integer startRoomSuffix;

    @NotNull(message = "End room suffix is required")
    private Integer endRoomSuffix;

    private BigDecimal defaultRent;
    private BigDecimal defaultLiftFee;
    private BigDecimal defaultWasteFee;

    public BulkRoomRequest() {}

    public Integer getFloorNumber() { return floorNumber; }
    public void setFloorNumber(Integer floorNumber) { this.floorNumber = floorNumber; }

    public Integer getStartRoomSuffix() { return startRoomSuffix; }
    public void setStartRoomSuffix(Integer startRoomSuffix) { this.startRoomSuffix = startRoomSuffix; }

    public Integer getEndRoomSuffix() { return endRoomSuffix; }
    public void setEndRoomSuffix(Integer endRoomSuffix) { this.endRoomSuffix = endRoomSuffix; }

    public BigDecimal getDefaultRent() { return defaultRent; }
    public void setDefaultRent(BigDecimal defaultRent) { this.defaultRent = defaultRent; }

    public BigDecimal getDefaultLiftFee() { return defaultLiftFee; }
    public void setDefaultLiftFee(BigDecimal defaultLiftFee) { this.defaultLiftFee = defaultLiftFee; }

    public BigDecimal getDefaultWasteFee() { return defaultWasteFee; }
    public void setDefaultWasteFee(BigDecimal defaultWasteFee) { this.defaultWasteFee = defaultWasteFee; }
}
