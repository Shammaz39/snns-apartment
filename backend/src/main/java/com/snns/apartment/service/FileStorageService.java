package com.snns.apartment.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        try {
            rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage folder: " + uploadDir, e);
        }
    }

    public String storeFile(MultipartFile file, String subfolder) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            Path targetDir = rootLocation;
            if (subfolder != null && !subfolder.isEmpty()) {
                targetDir = rootLocation.resolve(subfolder);
                Files.createDirectories(targetDir);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFilename = UUID.randomUUID() + extension;
            Path destinationFile = targetDir.resolve(newFilename).normalize();

            Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);

            if (subfolder != null && !subfolder.isEmpty()) {
                return subfolder + "/" + newFilename;
            }
            return newFilename;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + file.getOriginalFilename(), e);
        }
    }

    public Resource loadFileAsResource(String filename) {
        try {
            Path filePath = rootLocation.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found or not readable: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("File path invalid: " + filename, e);
        }
    }
}
