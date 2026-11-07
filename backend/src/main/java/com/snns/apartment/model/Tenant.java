package com.snns.apartment.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tenants")
public class Tenant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 30)
    private String aadhaarNumber;

    @Column(length = 255)
    private String aadhaarDocPath;

    @Column(length = 255)
    private String photoPath;

    private Integer memberCount = 1;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String memberDetails; // JSON or comma-separated list of family members (e.g. "Wife (Anju, 28), Child (Rahul, 4)")

    private LocalDate leaseStartDate;
    private LocalDate leaseEndDate;

    private Boolean isActive = true;

    public Tenant() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAadhaarNumber() { return aadhaarNumber; }
    public void setAadhaarNumber(String aadhaarNumber) { this.aadhaarNumber = aadhaarNumber; }

    public String getAadhaarDocPath() { return aadhaarDocPath; }
    public void setAadhaarDocPath(String aadhaarDocPath) { this.aadhaarDocPath = aadhaarDocPath; }

    public String getPhotoPath() { return photoPath; }
    public void setPhotoPath(String photoPath) { this.photoPath = photoPath; }

    public Integer getMemberCount() { return memberCount; }
    public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }

    public String getMemberDetails() { return memberDetails; }
    public void setMemberDetails(String memberDetails) { this.memberDetails = memberDetails; }

    public LocalDate getLeaseStartDate() { return leaseStartDate; }
    public void setLeaseStartDate(LocalDate leaseStartDate) { this.leaseStartDate = leaseStartDate; }

    public LocalDate getLeaseEndDate() { return leaseEndDate; }
    public void setLeaseEndDate(LocalDate leaseEndDate) { this.leaseEndDate = leaseEndDate; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
