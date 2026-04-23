package com.DAMUnitedFC.backend_tfg.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Endpoint autenticado para subir archivos de chat (imágenes, audios y vídeos).
 * Requiere JWT válido — protegido por SecurityConfig (anyRequest().authenticated()).
 *
 * ┌─────────┬──────────────────────────────┬────────┐
 * │  Tipo   │ Extensiones                  │ Límite │
 * ├─────────┼──────────────────────────────┼────────┤
 * │ Imagen  │ jpg, jpeg, png, webp, gif    │  5 MB  │
 * │ Audio   │ ogg, mp3                     │ 10 MB  │
 * │ Vídeo   │ mp4, webm                    │ 25 MB  │
 * └─────────┴──────────────────────────────┴────────┘
 *
 * Nota: .webm y .mp4 están en la categoría VIDEO. Los archivos generados por
 * MediaRecorder (audio/webm, audio/mp4) también pasan por la categoría VIDEO
 * con el límite de 25MB — el frontend es quien marca tipoAdjunto=AUDIO/VIDEO.
 */
@RestController
@RequestMapping("/api/chat/uploads")
public class ChatUploadController {

    private static final long MAX_IMAGEN_BYTES =  5L * 1024 * 1024; //  5 MB
    private static final long MAX_AUDIO_BYTES  = 10L * 1024 * 1024; // 10 MB
    private static final long MAX_VIDEO_BYTES  = 25L * 1024 * 1024; // 25 MB

    // Extensiones por tipo
    private static final Set<String> EXT_IMAGEN = Set.of(".jpg", ".jpeg", ".png", ".webp", ".gif");
    private static final Set<String> EXT_AUDIO  = Set.of(".ogg", ".mp3", ".aac", ".m4a");
    private static final Set<String> EXT_VIDEO  = Set.of(".mp4", ".webm");

    // MIME types por tipo
    private static final Set<String> MIME_IMAGEN = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif");

    private static final Set<String> MIME_AUDIO = Set.of(
            "audio/ogg", "audio/mpeg", "audio/aac", "audio/x-aac", "audio/mp4");

    private static final Set<String> MIME_VIDEO = Set.of(
            "video/mp4", "video/webm", "audio/webm");

    private final Path storageLocation = Paths.get("uploads/chat").toAbsolutePath().normalize();

    public ChatUploadController() {
        try {
            Files.createDirectories(storageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("No se pudo crear el directorio uploads/chat.", ex);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> upload(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {

        // Doble barrera: SecurityConfig ya rechaza sin JWT
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Pre-check global antes de escribir al disco (DoS protection)
        if (file.getSize() > MAX_VIDEO_BYTES) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "El archivo supera el límite máximo de 25 MB."));
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nombre de archivo inválido."));
        }

        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex == -1) {
            return ResponseEntity.badRequest().body(Map.of("error", "El archivo no tiene extensión."));
        }
        String extension = originalFilename.substring(dotIndex).toLowerCase();

        boolean esImagen = EXT_IMAGEN.contains(extension);
        boolean esAudio  = EXT_AUDIO.contains(extension);
        boolean esVideo  = EXT_VIDEO.contains(extension);

        if (!esImagen && !esAudio && !esVideo) {
            return ResponseEntity.badRequest().body(Map.of("error",
                    "Formato no permitido. Imágenes: JPG/PNG/WEBP/GIF — Audio: OGG/MP3 — Vídeo: MP4/WEBM."));
        }

        // Escribir en temporal y verificar MIME real (magic bytes)
        String tempFileName = "tmp_" + UUID.randomUUID() + extension;
        Path tempLocation = storageLocation.resolve(tempFileName);

        try {
            Files.copy(file.getInputStream(), tempLocation, StandardCopyOption.REPLACE_EXISTING);

            String mimeType = Files.probeContentType(tempLocation);
            if (mimeType == null) {
                Files.deleteIfExists(tempLocation);
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "No se pudo determinar el tipo del archivo."));
            }

            // Determinar tipo real y límite por MIME
            long limite;
            String tipoTexto;
            if (MIME_IMAGEN.contains(mimeType)) {
                limite = MAX_IMAGEN_BYTES;
                tipoTexto = "La imagen";
            } else if (MIME_AUDIO.contains(mimeType)) {
                limite = MAX_AUDIO_BYTES;
                tipoTexto = "El audio";
            } else if (MIME_VIDEO.contains(mimeType)) {
                limite = MAX_VIDEO_BYTES;
                tipoTexto = "El vídeo";
            } else {
                Files.deleteIfExists(tempLocation);
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El contenido del archivo no es válido."));
            }

            // Validación de tamaño específica por tipo (el pre-check solo frenó > 25MB)
            if (file.getSize() > limite) {
                Files.deleteIfExists(tempLocation);
                long limiteMB = limite / (1024 * 1024);
                return ResponseEntity.badRequest()
                        .body(Map.of("error", tipoTexto + " supera el límite de " + limiteMB + " MB."));
            }

            // Nombre definitivo basado en UUID — nunca el nombre original del cliente
            String fileName = UUID.randomUUID() + extension;
            Path targetLocation = storageLocation.resolve(fileName);
            Files.move(tempLocation, targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String baseUrl = request.getRequestURL().toString().replace(request.getRequestURI(), "");
            String fileUrl = baseUrl + "/api/uploads/files/chat/" + fileName;

            return ResponseEntity.ok(Map.of("url", fileUrl));

        } catch (IOException ex) {
            try { Files.deleteIfExists(tempLocation); } catch (IOException ignored) {}
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Error al procesar el archivo."));
        }
    }
}
