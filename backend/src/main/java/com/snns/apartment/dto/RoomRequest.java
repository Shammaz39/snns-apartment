package com.snns.apartment.dto;

import com.snns.apartment.model.RoomStatus;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class RoomRequest {
    @NotBlank
    private String roomNumber;

    private Integer floorNumber;

    private RoomStatus status = RoomStatus.VACANT;

    private BigDecimal defaultRent;
    private BigDecimal defaultLiftFee;
    private BigDecimal defaultWasteFee;

    public RoomRequest() {}

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public Integer getFloorNumber() { return floorNumber; }
    public void setFloorNumber(Integer floorNumber) { this.floorNumber = floorNumber; }

    public RoomStatus getStatus() { return status; }
    public void setStatus(RoomStatus status) { this.status = status; }

    public BigDecimal getDefaultRent() { return defaultRent; }
    public void setDefaultRent(BigDecimal defaultRent) { this.defaultRent = defaultRent; }

    public BigDecimal getDefaultLiftFee() { return defaultLiftFee; }
    public void setDefaultLiftFee(BigDecimal defaultLiftFee) { this.defaultLiftFee = defaultLiftFee; }

    public BigDecimal getDefaultWasteFee() { return defaultWasteFee; }
    public void setDefaultWasteFee(BigDecimal defaultWasteFee) { this.defaultWasteFee = defaultWasteFee; }
}
