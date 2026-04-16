package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.AlineacionDto;
import com.DAMUnitedFC.backend_tfg.dto.AlineacionResponseDto;
import com.DAMUnitedFC.backend_tfg.dto.CerrarActaDto;
import com.DAMUnitedFC.backend_tfg.service.AlineacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alineaciones")
public class AlineacionController {

    private final AlineacionService alineacionService;

    public AlineacionController(AlineacionService alineacionService) {
        this.alineacionService = alineacionService;
    }

    @GetMapping("/partido/{idPartido}")
    public ResponseEntity<List<AlineacionResponseDto>> getAlineacion(@PathVariable Long idPartido) {
        return ResponseEntity.ok(alineacionService.getAlineacion(idPartido));
    }

    @PreAuthorize("hasAnyRole('ADMIN','ENTRENADOR')")
    @PostMapping("/guardar/{idPartido}")
    public ResponseEntity<?> guardarAlineacion(@PathVariable Long idPartido, @RequestBody List<AlineacionDto> fichas) {
        try {
            alineacionService.guardarAlineacion(idPartido, fichas);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN','ENTRENADOR')")
    @PostMapping("/cerrar")
    public ResponseEntity<?> cerrarActa(@RequestBody CerrarActaDto dto) {
        try {
            alineacionService.cerrarActa(dto);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
