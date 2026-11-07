package com.snns.apartment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "floors")
public class Floor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private Integer floorNumber;

    @Column(nullable = false, length = 50)
    private String floorName;

    @Column(precision = 10, scale = 2)
    private BigDecimal defaultRent = BigDecimal.valueOf(8000.00);

    @Column(precision = 10, scale = 2)
    private BigDecimal defaultLiftFee = BigDecimal.valueOf(500.00);

    @Column(precision = 10, scale = 2)
    private BigDecimal defaultWasteFee = BigDecimal.valueOf(200.00);

    public Floor() {}

    public Floor(Integer floorNumber, String floorName, BigDecimal defaultRent, BigDecimal defaultLiftFee, BigDecimal defaultWasteFee) {
        this.floorNumber = floorNumber;
        this.floorName = floorName;
        this.defaultRent = defaultRent;
        this.defaultLiftFee = defaultLiftFee;
        this.defaultWasteFee = defaultWasteFee;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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
