package com.DAMUnitedFC.backend_tfg.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
public class FileController {

    private static final Set<String> EXTENSIONES_PERMITIDAS = Set.of(".jpg", ".jpeg", ".png", ".webp");
    private static final Set<String> MIME_TYPES_PERMITIDOS   = Set.of("image/jpeg", "image/png", "image/webp");

    // Carpeta donde se guardarán las fotos (en la raíz del proyecto)
    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    public FileController() {
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("No se pudo crear el directorio de subida.", ex);
        }
    }

    @PostMapping("/img")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file, HttpServletRequest request) {
        // 1. Validar que el nombre no sea nulo ni vacío
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El nombre del archivo no es válido."));
        }

        // 2. Whitelist de extensiones
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex == -1) {
            return ResponseEntity.badRequest().body(Map.of("error", "El archivo no tiene una extensión reconocible."));
        }
        String extension = originalFilename.substring(dotIndex).toLowerCase();
        if (!EXTENSIONES_PERMITIDAS.contains(extension)) {
            return ResponseEntity.badRequest().body(Map.of("error",
                    "Tipo de archivo no permitido. Solo se aceptan imágenes en formato JPG, JPEG, PNG o WEBP."));
        }

        // 3. Escribir en ubicación temporal para verificar el MIME-type real del contenido
        String tempFileName = "tmp_" + UUID.randomUUID() + extension;
        Path tempLocation = this.fileStorageLocation.resolve(tempFileName);
        try {
            Files.copy(file.getInputStream(), tempLocation, StandardCopyOption.REPLACE_EXISTING);

            String mimeType = Files.probeContentType(tempLocation);
            if (mimeType == null || !MIME_TYPES_PERMITIDOS.contains(mimeType)) {
                Files.deleteIfExists(tempLocation);
                return ResponseEntity.badRequest().body(Map.of("error",
                        "El contenido del archivo no corresponde a una imagen válida."));
            }

            // 4. Mover al nombre definitivo (UUID limpio, sin el nombre original del cliente)
            String fileName = UUID.randomUUID() + extension;
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.move(tempLocation, targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // ✅ DINÁMICO: detecta si está en Render o en local automáticamente
            String baseUrl = request.getRequestURL().toString().replace(request.getRequestURI(), "");
            String fileDownloadUri = baseUrl + "/api/uploads/files/" + fileName;

            Map<String, String> response = new HashMap<>();
            response.put("url", fileDownloadUri);
            return ResponseEntity.ok(response);

        } catch (IOException ex) {
            try { Files.deleteIfExists(tempLocation); } catch (IOException ignored) {}
            return ResponseEntity.badRequest().body(Map.of("error", "Fallo al subir el archivo: " + ex.getMessage()));
        }
    }

    // Endpoint para SERVIR archivos de uploads generales
    @GetMapping("/files/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        return serveFile(this.fileStorageLocation, fileName);
    }

    // Endpoint para SERVIR archivos del chat (subdirectorio chat/)
    @GetMapping("/files/chat/{fileName:.+}")
    public ResponseEntity<Resource> downloadChatFile(@PathVariable String fileName) {
        Path chatStorageLocation = this.fileStorageLocation.resolve("chat").normalize();
        return serveFile(chatStorageLocation, fileName);
    }

    private ResponseEntity<Resource> serveFile(Path baseDir, String fileName) {
        try {
            if (fileName.contains("..") || fileName.contains("/")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Path filePath = baseDir.resolve(fileName).normalize();

            if (!filePath.startsWith(baseDir)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) contentType = "application/octet-stream";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            return ResponseEntity.badRequest().build();
        } catch (IOException ex) {
            return ResponseEntity.internalServerError().build();
        }
    }
}