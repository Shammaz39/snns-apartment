package com.snns.apartment.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "visitor_passes")
public class VisitorPass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false, length = 100)
    private String visitorName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 30)
    private String vehicleNumber;

    @Column(nullable = false, length = 100)
    private String purpose = "GUEST";

    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, CHECKED_IN, CHECKED_OUT

    @Column(nullable = false, length = 20)
    private String requestedBy = "SECURITY"; // SECURITY, TENANT

    private Boolean approvedByTenant = false;

    @Column(length = 100)
    private String verifiedByGuard;

    @Column(length = 255)
    private String verificationNotes;

    private LocalDateTime checkIn;
    private LocalDateTime checkOut;

    private LocalDateTime expectedVisitTime;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public VisitorPass() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public String getVisitorName() { return visitorName; }
    public void setVisitorName(String visitorName) { this.visitorName = visitorName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public Boolean getApprovedByTenant() { return approvedByTenant; }
    public void setApprovedByTenant(Boolean approvedByTenant) { this.approvedByTenant = approvedByTenant; }

    public String getVerifiedByGuard() { return verifiedByGuard; }
    public void setVerifiedByGuard(String verifiedByGuard) { this.verifiedByGuard = verifiedByGuard; }

    public String getVerificationNotes() { return verificationNotes; }
    public void setVerificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; }

    public LocalDateTime getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDateTime checkIn) { this.checkIn = checkIn; }

    public LocalDateTime getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDateTime checkOut) { this.checkOut = checkOut; }

    public LocalDateTime getExpectedVisitTime() { return expectedVisitTime; }
    public void setExpectedVisitTime(LocalDateTime expectedVisitTime) { this.expectedVisitTime = expectedVisitTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
