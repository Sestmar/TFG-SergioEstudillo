package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.ActaDto;
import com.DAMUnitedFC.backend_tfg.model.Partido;
import com.DAMUnitedFC.backend_tfg.service.PartidoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/partidos")
public class PartidoController {

    private final PartidoService partidoService;

    public PartidoController(PartidoService partidoService) {
        this.partidoService = partidoService;
    }

    @PostMapping
    public Partido createPartido(@RequestBody Partido partido) {
        return partidoService.crear(partido);
    }

    @GetMapping("/equipo/{idEquipo}")
    public List<Partido> getPartidosPorEquipo(@PathVariable Long idEquipo) {
        return partidoService.listarPorEquipo(idEquipo);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Partido> getPartido(@PathVariable Long id) {
        return partidoService.obtener(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Partido> updatePartido(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return partidoService.actualizar(id, updates)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/cerrar-acta")
    public ResponseEntity<?> cerrarActa(@RequestBody ActaDto acta) {
        try {
            partidoService.cerrarActa(acta);
            return ResponseEntity.ok(Collections.singletonMap("message", "Acta cerrada correctamente"));
        } catch (Exception e) {
            log.error("Error al cerrar acta del partido: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Collections.singletonMap("error", "Error al cerrar acta: " + e.getMessage()));
        }
    }
}
