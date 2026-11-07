package com.snns.apartment.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "visitors")
public class Visitor {

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

    @Column(nullable = false, length = 30)
    private String purpose = "GUEST"; // GUEST, DELIVERY, SERVICE, CAB

    private LocalDateTime checkIn;
    private LocalDateTime checkOut;

    @Column(nullable = false, length = 20)
    private String status = "CHECKED_IN"; // CHECKED_IN, CHECKED_OUT, EXPECTED

    private Boolean isPreApproved = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.checkIn == null && "CHECKED_IN".equals(this.status)) {
            this.checkIn = LocalDateTime.now();
        }
    }

    public Visitor() {}

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

    public LocalDateTime getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDateTime checkIn) { this.checkIn = checkIn; }

    public LocalDateTime getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDateTime checkOut) { this.checkOut = checkOut; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsPreApproved() { return isPreApproved; }
    public void setIsPreApproved(Boolean isPreApproved) { this.isPreApproved = isPreApproved; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
