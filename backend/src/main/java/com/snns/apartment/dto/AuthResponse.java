package com.snns.apartment.dto;

import com.snns.apartment.model.Role;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private String username;
    private String fullName;
    private Role role;
    private Long roomId;
    private String roomNumber;

    public AuthResponse() {}

    public AuthResponse(String token, Long userId, String username, String fullName, Role role, Long roomId, String roomNumber) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.roomId = roomId;
        this.roomNumber = roomNumber;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Long getRoomId() { return roomId; }
    public void setRoomId(Long roomId) { this.roomId = roomId; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
}
