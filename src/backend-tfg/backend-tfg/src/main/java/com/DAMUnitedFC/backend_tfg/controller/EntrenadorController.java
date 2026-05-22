package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.EntrenadorDto;
import com.DAMUnitedFC.backend_tfg.model.Entrenador;
import com.DAMUnitedFC.backend_tfg.service.EntrenadorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/entrenadores")
public class EntrenadorController {

    private final EntrenadorService entrenadorService;

    public EntrenadorController(EntrenadorService entrenadorService) {
        this.entrenadorService = entrenadorService;
    }

    @GetMapping
    public List<Entrenador> listar() {
        return entrenadorService.listar();
    }

    @GetMapping("/sin-equipo")
    public ResponseEntity<List<Entrenador>> listarSinEquipo() {
        return ResponseEntity.ok(entrenadorService.listarSinEquipo());
    }

    @GetMapping("/{id}")
    public Entrenador obtener(@PathVariable Integer id) {
        return entrenadorService.obtener(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Entrenador crear(@RequestBody EntrenadorDto dto) {
        return entrenadorService.crear(dto);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR')")
    @PutMapping("/{id}")
    public Entrenador actualizar(@PathVariable Integer id, @RequestBody EntrenadorDto dto) {
        return entrenadorService.actualizar(id, dto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void borrar(@PathVariable Integer id) {
        entrenadorService.borrar(id);
    }

    @GetMapping("/usuario/{idUsuario}/equipo")
    public ResponseEntity<?> getEquipoDelUsuario(@PathVariable Integer idUsuario) {
        return entrenadorService.getEquipoDelUsuario(idUsuario)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body(Collections.singletonMap("error", "Sin asignación de equipo.")));
    }

    @GetMapping("/{idEntrenador}/estadisticas-equipo")
    public ResponseEntity<Map<String, Object>> getEstadisticasEquipo(@PathVariable Integer idEntrenador) {
        return entrenadorService.getEstadisticasEquipo(idEntrenador)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().body(Collections.singletonMap("error", "No tienes equipo asignado.")));
    }
}
