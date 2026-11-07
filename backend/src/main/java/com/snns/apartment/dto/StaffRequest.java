package com.snns.apartment.dto;

import com.snns.apartment.model.Role;
import jakarta.validation.constraints.NotBlank;

public class StaffRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String email;

    private String username;

    private String password;

    private Role role; // ROLE_ADMIN or ROLE_SECURITY

    private String gateName;

    public StaffRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getGateName() { return gateName; }
    public void setGateName(String gateName) { this.gateName = gateName; }
}
