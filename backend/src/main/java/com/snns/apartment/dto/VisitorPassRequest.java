package com.snns.apartment.dto;

import jakarta.validation.constraints.NotBlank;

public class VisitorPassRequest {

    @NotBlank(message = "Visitor name is required")
    private String visitorName;

    @NotBlank(message = "Visitor phone number is required")
    private String phone;

    private String vehicleNumber;

    private Long roomId;

    private String roomNumber;

    private String purpose = "GUEST";

    @NotBlank(message = "Request type is required")
    private String requestType; // SECURITY_REQUEST, SECURITY_CALL_CONFIRMED, TENANT_PRE_APPROVE

    private String expectedVisitTime; // nullable, ISO format for tenant pre-approval

    private String verifiedByGuard;

    private String verificationNotes;

    public VisitorPassRequest() {}

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

    public String getRequestType() { return requestType; }
    public void setRequestType(String requestType) { this.requestType = requestType; }

    public String getExpectedVisitTime() { return expectedVisitTime; }
    public void setExpectedVisitTime(String expectedVisitTime) { this.expectedVisitTime = expectedVisitTime; }

    public String getVerifiedByGuard() { return verifiedByGuard; }
    public void setVerifiedByGuard(String verifiedByGuard) { this.verifiedByGuard = verifiedByGuard; }

    public String getVerificationNotes() { return verificationNotes; }
    public void setVerificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; }
}
