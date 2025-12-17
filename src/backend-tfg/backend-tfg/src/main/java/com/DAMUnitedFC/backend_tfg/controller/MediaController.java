package com.DAMUnitedFC.backend_tfg.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final Path storageLocation = Paths.get("uploads");

    public MediaController() {
        try {
            Files.createDirectories(storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("No se pudo inicializar la carpeta de uploads", e);
        }
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Generar nombre único para evitar colisiones (ej: uuid_nombrefoto.jpg)
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path targetLocation = storageLocation.resolve(filename);

            // Guardar el archivo
            Files.copy(file.getInputStream(), targetLocation);

            // Construir la URL pública (ajusta el puerto si es necesario)
            // En producción, esto debería ser la URL de tu dominio
            String fileUrl = "http://localhost:8080/uploads/" + filename;

            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Fallo al subir imagen"));
        }
    }
}