package com.snns.apartment.dto;

import com.snns.apartment.model.ComplaintCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ComplaintRequest {
    private Long roomId;

    @NotNull
    private ComplaintCategory category;

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    public ComplaintRequest() {}

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public ComplaintCategory getCategory() { return category; }
    public void setCategory(ComplaintCategory category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
