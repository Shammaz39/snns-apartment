package com.snns.apartment.dto;

import java.math.BigDecimal;

public class DashboardStatsResponse {
    private long totalRooms;
    private long occupiedRooms;
    private long vacantRooms;
    private long maintenanceRooms;
    private BigDecimal totalPaidRevenue;
    private BigDecimal totalPendingRevenue;
    private long pendingVerificationsCount;
    private long openComplaintsCount;
    private long upcomingEventsCount;
    private boolean demoModeActive;
    private long demoDaysRemaining;

    public DashboardStatsResponse() {}

    public long getTotalRooms() { return totalRooms; }
    public void setTotalRooms(long totalRooms) { this.totalRooms = totalRooms; }

    public long getOccupiedRooms() { return occupiedRooms; }
    public void setOccupiedRooms(long occupiedRooms) { this.occupiedRooms = occupiedRooms; }

    public long getVacantRooms() { return vacantRooms; }
    public void setVacantRooms(long vacantRooms) { this.vacantRooms = vacantRooms; }

    public long getMaintenanceRooms() { return maintenanceRooms; }
    public void setMaintenanceRooms(long maintenanceRooms) { this.maintenanceRooms = maintenanceRooms; }

    public BigDecimal getTotalPaidRevenue() { return totalPaidRevenue; }
    public void setTotalPaidRevenue(BigDecimal totalPaidRevenue) { this.totalPaidRevenue = totalPaidRevenue; }

    public BigDecimal getTotalPendingRevenue() { return totalPendingRevenue; }
    public void setTotalPendingRevenue(BigDecimal totalPendingRevenue) { this.totalPendingRevenue = totalPendingRevenue; }

    public long getPendingVerificationsCount() { return pendingVerificationsCount; }
    public void setPendingVerificationsCount(long pendingVerificationsCount) { this.pendingVerificationsCount = pendingVerificationsCount; }

    public long getOpenComplaintsCount() { return openComplaintsCount; }
    public void setOpenComplaintsCount(long openComplaintsCount) { this.openComplaintsCount = openComplaintsCount; }

    public long getUpcomingEventsCount() { return upcomingEventsCount; }
    public void setUpcomingEventsCount(long upcomingEventsCount) { this.upcomingEventsCount = upcomingEventsCount; }

    public boolean isDemoModeActive() { return demoModeActive; }
    public void setDemoModeActive(boolean demoModeActive) { this.demoModeActive = demoModeActive; }

    public long getDemoDaysRemaining() { return demoDaysRemaining; }
    public void setDemoDaysRemaining(long demoDaysRemaining) { this.demoDaysRemaining = demoDaysRemaining; }
}
