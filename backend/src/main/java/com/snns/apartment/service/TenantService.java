package com.snns.apartment.service;

import com.snns.apartment.dto.SubTenantRequest;
import com.snns.apartment.dto.TenantOnboardRequest;
import com.snns.apartment.model.*;
import com.snns.apartment.repository.BillRepository;
import com.snns.apartment.repository.RoomRepository;
import com.snns.apartment.repository.SubTenantRepository;
import com.snns.apartment.repository.TenantRepository;
import com.snns.apartment.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class TenantService {

    private final TenantRepository tenantRepository;
    private final SubTenantRepository subTenantRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final BillRepository billRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    public TenantService(TenantRepository tenantRepository,
                         SubTenantRepository subTenantRepository,
                         RoomRepository roomRepository,
                         UserRepository userRepository,
                         BillRepository billRepository,
                         FileStorageService fileStorageService,
                         PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;
        this.subTenantRepository = subTenantRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.billRepository = billRepository;
        this.fileStorageService = fileStorageService;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Tenant> getAllActiveTenants() {
        return tenantRepository.findByIsActiveTrue();
    }

    public Optional<Tenant> getTenantByRoomId(Long roomId) {
        return tenantRepository.findByRoomIdAndIsActiveTrue(roomId);
    }

    public Optional<Tenant> getTenantByUserId(Long userId) {
        return tenantRepository.findByUserId(userId);
    }

    @Transactional
    public Tenant onboardTenant(TenantOnboardRequest request, MultipartFile aadhaarDoc, MultipartFile photo) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found with ID: " + request.getRoomId()));

        if (room.getStatus() == RoomStatus.OCCUPIED) {
            throw new RuntimeException("Room " + room.getRoomNumber() + " is already occupied!");
        }

        // Create or find User
        String username = request.getUsername();
        if (username == null || username.trim().isEmpty()) {
            username = "room" + room.getRoomNumber().toLowerCase().replaceAll("[^a-z0-9]", "");
        }

        String password = request.getPassword();
        if (password == null || password.trim().isEmpty()) {
            password = "Abc@123";
        }

        User user;
        if (userRepository.existsByUsername(username)) {
            User existing = userRepository.findByUsername(username).get();
            if (tenantRepository.findByUser(existing).isPresent()) {
                // Generate a fresh unique username for this new tenant
                String uniqueUsername = "tenant_" + room.getRoomNumber().toLowerCase().replaceAll("[^a-z0-9]", "") + "_" + System.currentTimeMillis();
                user = new User(
                        uniqueUsername,
                        passwordEncoder.encode(password),
                        request.getEmail(),
                        request.getFullName(),
                        request.getPhone(),
                        Role.ROLE_RESIDENT
                );
                user = userRepository.save(user);
            } else {
                user = existing;
                user.setPassword(passwordEncoder.encode(password));
                user.setFullName(request.getFullName());
                user.setPhone(request.getPhone());
                user.setEmail(request.getEmail());
                user = userRepository.save(user);
            }
        } else {
            user = new User(
                    username,
                    passwordEncoder.encode(password),
                    request.getEmail(),
                    request.getFullName(),
                    request.getPhone(),
                    Role.ROLE_RESIDENT
            );
            user = userRepository.save(user);
        }

        // Upload files if provided
        String aadhaarDocPath = null;
        if (aadhaarDoc != null && !aadhaarDoc.isEmpty()) {
            aadhaarDocPath = fileStorageService.storeFile(aadhaarDoc, "kyc/aadhaar");
        }

        String photoPath = null;
        if (photo != null && !photo.isEmpty()) {
            photoPath = fileStorageService.storeFile(photo, "kyc/photos");
        }

        // Create Tenant entity
        Tenant tenant = new Tenant();
        tenant.setRoom(room);
        tenant.setUser(user);
        tenant.setFullName(request.getFullName());
        tenant.setPhone(request.getPhone());
        tenant.setEmail(request.getEmail());
        tenant.setAadhaarNumber(request.getAadhaarNumber());
        tenant.setAadhaarDocPath(aadhaarDocPath);
        tenant.setPhotoPath(photoPath);
        tenant.setMemberCount(request.getMemberCount() != null ? request.getMemberCount() : 1);
        tenant.setMemberDetails(request.getMemberDetails());
        tenant.setLeaseStartDate(request.getLeaseStartDate());
        tenant.setLeaseEndDate(request.getLeaseEndDate());
        tenant.setIsActive(true);

        // Update room status to OCCUPIED
        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);

        return tenantRepository.save(tenant);
    }

    @Transactional
    public Tenant updateTenantProfile(Long userId, String fullName, String phone, String email, 
                                       String aadhaarNumber, String memberDetails,
                                       MultipartFile photo, MultipartFile aadhaarDoc) {
        Tenant tenant = tenantRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Tenant profile not found for user ID: " + userId));

        if (fullName != null && !fullName.trim().isEmpty()) tenant.setFullName(fullName.trim());
        if (phone != null && !phone.trim().isEmpty()) tenant.setPhone(phone.trim());
        if (email != null) tenant.setEmail(email.trim());
        if (aadhaarNumber != null && !aadhaarNumber.trim().isEmpty()) tenant.setAadhaarNumber(aadhaarNumber.trim());
        if (memberDetails != null) tenant.setMemberDetails(memberDetails);

        if (photo != null && !photo.isEmpty()) {
            String photoPath = fileStorageService.storeFile(photo, "kyc/photos");
            tenant.setPhotoPath(photoPath);
        }
        if (aadhaarDoc != null && !aadhaarDoc.isEmpty()) {
            String aadhaarDocPath = fileStorageService.storeFile(aadhaarDoc, "kyc/aadhaar");
            tenant.setAadhaarDocPath(aadhaarDocPath);
        }

        // Also update the User entity so fullName, phone, email stay synced
        User user = tenant.getUser();
        if (user != null) {
            if (fullName != null && !fullName.trim().isEmpty()) user.setFullName(fullName.trim());
            if (phone != null && !phone.trim().isEmpty()) user.setPhone(phone.trim());
            if (email != null) user.setEmail(email.trim());
            userRepository.save(user);
        }

        return tenantRepository.save(tenant);
    }

    @Transactional
    public SubTenant addSubTenant(SubTenantRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Tenant primaryTenant = tenantRepository.findByRoomIdAndIsActiveTrue(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("No primary active tenant found in room " + room.getRoomNumber()));

        String username = "sub_" + (request.getPhone() != null ? request.getPhone().replaceAll("[^0-9]", "") : System.currentTimeMillis());
        User subUser = new User(
                username,
                passwordEncoder.encode("Abc@123"),
                request.getEmail(),
                request.getFullName(),
                request.getPhone(),
                Role.ROLE_SUBTENANT
        );
        userRepository.save(subUser);

        SubTenant subTenant = new SubTenant();
        subTenant.setRoom(room);
        subTenant.setPrimaryTenant(primaryTenant);
        subTenant.setUser(subUser);
        subTenant.setFullName(request.getFullName());
        subTenant.setPhone(request.getPhone());
        subTenant.setEmail(request.getEmail());
        subTenant.setAadhaarNumber(request.getAadhaarNumber());
        subTenant.setIsActive(true);

        return subTenantRepository.save(subTenant);
    }

    public List<SubTenant> getSubTenantsByRoomId(Long roomId) {
        return subTenantRepository.findByRoomIdAndIsActiveTrue(roomId);
    }

    @Transactional
    public void deboardTenant(Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        Room room = tenant.getRoom();
        if (room != null) {
            boolean hasPendingBills = billRepository.findByRoomIdOrderByCreatedAtDesc(room.getId())
                    .stream()
                    .anyMatch(b -> b.getStatus() == BillStatus.PENDING || b.getStatus() == BillStatus.PENDING_VERIFICATION);

            if (hasPendingBills) {
                throw new RuntimeException("Cannot deboard tenant: Room " + room.getRoomNumber() +
                        " has pending or unverified bills. Please settle all bills before deboarding.");
            }

            room.setStatus(RoomStatus.VACANT);
            roomRepository.save(room);
        }

        tenant.setIsActive(false);
        tenantRepository.save(tenant);
    }
}
