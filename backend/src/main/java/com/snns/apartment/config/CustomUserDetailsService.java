package com.snns.apartment.config;

import com.snns.apartment.model.Role;
import com.snns.apartment.model.Tenant;
import com.snns.apartment.model.User;
import com.snns.apartment.repository.TenantRepository;
import com.snns.apartment.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    public CustomUserDetailsService(UserRepository userRepository, TenantRepository tenantRepository) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // 1. Try direct username
        Optional<User> userOpt = userRepository.findByUsername(identifier);

        // 2. Try phone number
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findFirstByPhone(identifier);
        }

        // 3. Try email
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(identifier);
        }

        // 4. Try Full Name (e.g. security guard or staff)
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findFirstByFullNameIgnoreCase(identifier);
        }

        // 5. Try Room number (e.g. "101", "204")
        if (userOpt.isEmpty()) {
            Optional<Tenant> tenantOpt = tenantRepository.findByRoomRoomNumberAndIsActiveTrue(identifier);
            if (tenantOpt.isPresent()) {
                userOpt = Optional.ofNullable(tenantOpt.get().getUser());
            }
        }

        // 6. Special fallback for "admin" -> "admin@snnsapartment"
        if (userOpt.isEmpty() && "admin".equalsIgnoreCase(identifier)) {
            userOpt = userRepository.findByUsername("admin@snnsapartment");
        }

        User user = userOpt.orElseThrow(() ->
                new UsernameNotFoundException("No user found with identifier: " + identifier));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
        );
    }
}
