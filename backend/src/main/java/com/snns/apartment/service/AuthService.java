package com.snns.apartment.service;

import com.snns.apartment.config.JwtUtil;
import com.snns.apartment.dto.AuthResponse;
import com.snns.apartment.dto.ChangePasswordRequest;
import com.snns.apartment.dto.LoginRequest;
import com.snns.apartment.dto.RegisterRequest;
import com.snns.apartment.model.Role;
import com.snns.apartment.model.Tenant;
import com.snns.apartment.model.User;
import com.snns.apartment.repository.TenantRepository;
import com.snns.apartment.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       TenantRepository tenantRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Resolves the actual username from identifier (username / phone / email / name / room number)
     * so Spring Security's AuthenticationManager can authenticate correctly.
     */
    public String resolveUsername(String identifier) {
        // Direct username match
        Optional<User> byUsername = userRepository.findByUsername(identifier);
        if (byUsername.isPresent()) return byUsername.get().getUsername();

        // Phone match
        Optional<User> byPhone = userRepository.findFirstByPhone(identifier);
        if (byPhone.isPresent()) return byPhone.get().getUsername();

        // Email match
        Optional<User> byEmail = userRepository.findByEmail(identifier);
        if (byEmail.isPresent()) return byEmail.get().getUsername();

        // Full Name match (for Security guard / Staff)
        Optional<User> byName = userRepository.findFirstByFullNameIgnoreCase(identifier);
        if (byName.isPresent()) return byName.get().getUsername();

        // Room number match
        Optional<Tenant> byRoom = tenantRepository.findByRoomRoomNumberAndIsActiveTrue(identifier);
        if (byRoom.isPresent() && byRoom.get().getUser() != null) {
            return byRoom.get().getUser().getUsername();
        }

        // Fallback for "admin" -> "admin@snnsapartment"
        if ("admin".equalsIgnoreCase(identifier)) {
            Optional<User> adminUser = userRepository.findByUsername("admin@snnsapartment");
            if (adminUser.isPresent()) return adminUser.get().getUsername();
        }

        return identifier; // fallback — will fail auth naturally
    }

    public AuthResponse login(LoginRequest request) {
        String resolvedUsername = resolveUsername(request.getUsername().trim());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(resolvedUsername, request.getPassword())
        );

        User user = userRepository.findByUsername(resolvedUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long roomId = null;
        String roomNumber = null;

        if (user.getRole() == Role.ROLE_RESIDENT || user.getRole() == Role.ROLE_SUBTENANT) {
            Optional<Tenant> tenantOpt = tenantRepository.findByUser(user);
            if (tenantOpt.isPresent()) {
                roomId = tenantOpt.get().getRoom().getId();
                roomNumber = tenantOpt.get().getRoom().getRoomNumber();
            }
        }

        String token = jwtUtil.generateToken(user, roomId, roomNumber);

        return new AuthResponse(token, user.getId(), user.getUsername(), user.getFullName(), user.getRole(), roomId, roomNumber);
    }

    public User register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        if (request.getEmail() != null && !request.getEmail().isEmpty() && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        String rawPassword = request.getPassword() != null && !request.getPassword().trim().isEmpty()
                ? request.getPassword()
                : "Abc@123";

        User user = new User(
                request.getUsername(),
                passwordEncoder.encode(rawPassword),
                request.getEmail(),
                request.getFullName(),
                request.getPhone(),
                request.getRole() != null ? request.getRole() : Role.ROLE_RESIDENT
        );

        return userRepository.save(user);
    }

    public User getCurrentUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New password and confirm password do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
