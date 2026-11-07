package com.snns.apartment.dto;

import jakarta.validation.constraints.NotBlank;

public class VisitorRequest {

    @NotBlank(message = "Visitor name is required")
    private String visitorName;

    @NotBlank(message = "Visitor phone number is required")
    private String phone;

    private String vehicleNumber;

    private Long roomId;

    private String roomNumber;

    private String purpose = "GUEST"; // GUEST, DELIVERY, SERVICE, CAB

    private Boolean isPreApproved = false;

    public VisitorRequest() {}

    public String getVisitorName() { return visitorName; }
    public void setVisitorName(String visitorName) { this.visitorName = visitorName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public Boolean getIsPreApproved() { return isPreApproved; }
    public void setIsPreApproved(Boolean isPreApproved) { this.isPreApproved = isPreApproved; }
}
