package com.snns.apartment.dataseed;

import com.snns.apartment.model.*;
import com.snns.apartment.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ApartmentSettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ApartmentSettingsRepository settingsRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.settingsRepository = settingsRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Seed Default Settings if none exists
        if (settingsRepository.count() == 0) {
            ApartmentSettings settings = new ApartmentSettings();
            settings.setApartmentName("SNNS Apartment");
            settings.setUpiId("snnsapartment@okaxis");
            settings.setDefaultRent(BigDecimal.valueOf(8000.00));
            settings.setDefaultLiftFee(BigDecimal.valueOf(500.00));
            settings.setDefaultWasteFee(BigDecimal.valueOf(200.00));
            settings.setDemoModeActive(false);
            settingsRepository.save(settings);
            System.out.println(">>> Initialized default Apartment Settings.");
        }

        // 2. Check if any Admin exists in the database. If not, auto-seed the default Super Admin:
        // Username: admin@snnsapartment, Default Password: Abc@123
        boolean adminExists = userRepository.findByRole(Role.ROLE_ADMIN).size() > 0;
        if (!adminExists) {
            User admin = new User(
                    "admin@snnsapartment",
                    passwordEncoder.encode("Abc@123"),
                    "admin@snnsapartment.com",
                    "System Administrator",
                    "+91 9633119765",
                    Role.ROLE_ADMIN
            );
            userRepository.save(admin);
            System.out.println(">>> Auto-seeded Super Admin: admin@snnsapartment / Abc@123");
        }

        // Clean slate: 0 floors, 0 rooms, 0 tenants. Admin will dynamically create them via UI/APIs!
    }
}
