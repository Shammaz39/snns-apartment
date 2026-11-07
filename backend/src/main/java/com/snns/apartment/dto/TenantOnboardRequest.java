package com.snns.apartment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class TenantOnboardRequest {
    @NotNull
    private Long roomId;

    private String username;
    private String password;

    @NotBlank
    private String fullName;

    @NotBlank
    private String phone;

    private String email;

    @NotBlank
    private String aadhaarNumber;

    private Integer memberCount = 1;
    private String memberDetails;

    private LocalDate leaseStartDate;
    private LocalDate leaseEndDate;

    public TenantOnboardRequest() {}

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAadhaarNumber() { return aadhaarNumber; }
    public void setAadhaarNumber(String aadhaarNumber) { this.aadhaarNumber = aadhaarNumber; }

    public Integer getMemberCount() { return memberCount; }
    public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }

    public String getMemberDetails() { return memberDetails; }
    public void setMemberDetails(String memberDetails) { this.memberDetails = memberDetails; }

    public LocalDate getLeaseStartDate() { return leaseStartDate; }
    public void setLeaseStartDate(LocalDate leaseStartDate) { this.leaseStartDate = leaseStartDate; }

    public LocalDate getLeaseEndDate() { return leaseEndDate; }
    public void setLeaseEndDate(LocalDate leaseEndDate) { this.leaseEndDate = leaseEndDate; }
}
