package com.snns.apartment.repository;

import com.snns.apartment.model.Role;
import com.snns.apartment.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findFirstByPhone(String phone);
    Optional<User> findByFullName(String fullName);
    Optional<User> findFirstByFullNameIgnoreCase(String fullName);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    List<User> findByRole(Role role);
}
