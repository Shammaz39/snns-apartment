package com.snns.apartment.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "apartment_settings")
public class ApartmentSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String apartmentName = "SNNS Apartment";

    @Column(length = 100)
    private String upiId = "snnsapartment@okaxis";

    @Column(length = 255)
    private String qrCodePath;

    @Column(precision = 10, scale = 2)
    private BigDecimal defaultRent = BigDecimal.valueOf(8000.00);

    @Column(precision = 10, scale = 2)
    private BigDecimal defaultLiftFee = BigDecimal.valueOf(500.00);

    @Column(precision = 10, scale = 2)
    private BigDecimal defaultWasteFee = BigDecimal.valueOf(200.00);

    // Demo mode fields
    @Column(nullable = false)
    private Boolean demoModeActive = true;

    @Column
    private LocalDate demoExpiryDate;

    public ApartmentSettings() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getApartmentName() { return apartmentName; }
    public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }

    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }

    public String getQrCodePath() { return qrCodePath; }
    public void setQrCodePath(String qrCodePath) { this.qrCodePath = qrCodePath; }

    public BigDecimal getDefaultRent() { return defaultRent; }
    public void setDefaultRent(BigDecimal defaultRent) { this.defaultRent = defaultRent; }

    public BigDecimal getDefaultLiftFee() { return defaultLiftFee; }
    public void setDefaultLiftFee(BigDecimal defaultLiftFee) { this.defaultLiftFee = defaultLiftFee; }

    public BigDecimal getDefaultWasteFee() { return defaultWasteFee; }
    public void setDefaultWasteFee(BigDecimal defaultWasteFee) { this.defaultWasteFee = defaultWasteFee; }

    public Boolean getDemoModeActive() { return demoModeActive; }
    public void setDemoModeActive(Boolean demoModeActive) { this.demoModeActive = demoModeActive; }

    public LocalDate getDemoExpiryDate() { return demoExpiryDate; }
    public void setDemoExpiryDate(LocalDate demoExpiryDate) { this.demoExpiryDate = demoExpiryDate; }
}
