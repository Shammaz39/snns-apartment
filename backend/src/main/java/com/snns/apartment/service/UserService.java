package com.snns.apartment.service;

import com.snns.apartment.dto.StaffRequest;
import com.snns.apartment.model.Role;
import com.snns.apartment.model.User;
import com.snns.apartment.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllStaff() {
        List<User> list = userRepository.findByRole(Role.ROLE_ADMIN);
        list.addAll(userRepository.findByRole(Role.ROLE_SECURITY));
        return list;
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public User createAdmin(StaffRequest request) {
        String username = request.getUsername();
        if (username == null || username.trim().isEmpty()) {
            username = "admin_" + request.getPhone().replaceAll("[^0-9]", "");
        }

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username '" + username + "' is already taken");
        }

        String rawPassword = request.getPassword() != null && !request.getPassword().trim().isEmpty()
                ? request.getPassword()
                : "Abc@123";

        User admin = new User(
                username,
                passwordEncoder.encode(rawPassword),
                request.getEmail(),
                request.getFullName(),
                request.getPhone(),
                Role.ROLE_ADMIN
        );
        return userRepository.save(admin);
    }

    public User createSecurityGuard(StaffRequest request) {
        String username = request.getUsername();
        if (username == null || username.trim().isEmpty()) {
            // Generate clean username from name or phone
            String cleanedName = request.getFullName().toLowerCase().replaceAll("[^a-z0-9]", "");
            username = "guard_" + (cleanedName.isEmpty() ? request.getPhone().replaceAll("[^0-9]", "") : cleanedName);
        }

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username '" + username + "' is already taken");
        }

        String rawPassword = request.getPassword() != null && !request.getPassword().trim().isEmpty()
                ? request.getPassword()
                : "Abc@123";

        User guard = new User(
                username,
                passwordEncoder.encode(rawPassword),
                request.getEmail(),
                request.getFullName(),
                request.getPhone(),
                Role.ROLE_SECURITY
        );
        return userRepository.save(guard);
    }

    public void deleteStaff(Long id, String currentUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        if (user.getUsername().equals(currentUsername)) {
            throw new RuntimeException("You cannot delete your own admin account!");
        }

        userRepository.delete(user);
    }
}
