package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.models.MasterTransaction;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;

@Service
public class FileStorageService {
    public String storeFile(MultipartFile file, MasterTransaction trans, Principal principal, boolean isSupporting) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("No file provided for upload.");
        }

        String originalDocname = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed_file");
        String docname = System.currentTimeMillis() + "_" + originalDocname;
        if (!isSupporting) {
            trans.setDocname(originalDocname); // Store original name in database
        } else {
            trans.setSupportingDocname(originalDocname);
        }

        String createdBy = principal.getName();
        String uploadDir = "C:/AMSReports/" + createdBy + "/";
        Path uploadPath = Paths.get(uploadDir);

        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new IOException("Could not create directory: " + uploadPath, e);
        }

        try (InputStream inputStream = file.getInputStream()) {
            Path filePath = uploadPath.resolve(docname);
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            return filePath.toString();
        } catch (IOException ioe) {
            throw new IOException("Could not save file: " + docname + " at " + uploadPath, ioe);
        }
    }
}