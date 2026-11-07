package com.snns.apartment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class EventRequest {
    @NotBlank
    private String title;

    private String description;

    @NotNull
    private LocalDateTime eventDate;

    private String venue;
    private Boolean isPopupNotice = false;

    public EventRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public Boolean getIsPopupNotice() { return isPopupNotice; }
    public void setIsPopupNotice(Boolean isPopupNotice) { this.isPopupNotice = isPopupNotice; }
}
