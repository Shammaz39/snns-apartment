package com.snns.apartment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 20)
    private String roomNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoomStatus status = RoomStatus.VACANT;

    @Column(precision = 10, scale = 2)
    private BigDecimal defaultRent = BigDecimal.valueOf(8000.00);

    @Column(precision = 10, scale = 2)
    private BigDecimal defaultLiftFee = BigDecimal.valueOf(500.00);

    @Column(precision = 10, scale = 2)
    private BigDecimal defaultWasteFee = BigDecimal.valueOf(200.00);

    private Integer floorNumber;

    public Room() {}

    public Room(String roomNumber, Integer floorNumber, BigDecimal defaultRent, BigDecimal defaultLiftFee, BigDecimal defaultWasteFee) {
        this.roomNumber = roomNumber;
        this.floorNumber = floorNumber;
        this.defaultRent = defaultRent;
        this.defaultLiftFee = defaultLiftFee;
        this.defaultWasteFee = defaultWasteFee;
        this.status = RoomStatus.VACANT;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public RoomStatus getStatus() { return status; }
    public void setStatus(RoomStatus status) { this.status = status; }

    public BigDecimal getDefaultRent() { return defaultRent; }
    public void setDefaultRent(BigDecimal defaultRent) { this.defaultRent = defaultRent; }

    public BigDecimal getDefaultLiftFee() { return defaultLiftFee; }
    public void setDefaultLiftFee(BigDecimal defaultLiftFee) { this.defaultLiftFee = defaultLiftFee; }

    public BigDecimal getDefaultWasteFee() { return defaultWasteFee; }
    public void setDefaultWasteFee(BigDecimal defaultWasteFee) { this.defaultWasteFee = defaultWasteFee; }

    public Integer getFloorNumber() { return floorNumber; }
    public void setFloorNumber(Integer floorNumber) { this.floorNumber = floorNumber; }
}
