package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.EquipoDto;
import com.DAMUnitedFC.backend_tfg.dto.SeasonStatsDto;
import com.DAMUnitedFC.backend_tfg.model.Equipo;
import com.DAMUnitedFC.backend_tfg.service.EquipoService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipos")
public class EquipoController {

    private final EquipoService equipoService;

    public EquipoController(EquipoService equipoService) {
        this.equipoService = equipoService;
    }

    @GetMapping
    public List<Equipo> getEquipos() {
        return equipoService.listar();
    }

    @GetMapping("/{id}")
    public Equipo getEquipo(@PathVariable Integer id) {
        return equipoService.obtener(id);
    }

    @GetMapping("/{id}/stats-temporada")
    public ResponseEntity<SeasonStatsDto> getSeasonStats(@PathVariable Integer id) {
        return ResponseEntity.ok(equipoService.getSeasonStats(id));
    }

    @PatchMapping("/{id}/objetivo")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR')")
    public ResponseEntity<Equipo> setObjetivo(@PathVariable Integer id, @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(equipoService.setObjetivo(id, body.get("puntosObjetivo")));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR')")
    public Equipo crearEquipo(@RequestBody EquipoDto equipoDto) {
        return equipoService.crear(equipoDto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR')")
    public Equipo actualizarEquipo(@PathVariable Integer id, @RequestBody EquipoDto equipoDto) {
        return equipoService.actualizar(id, equipoDto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void borrarEquipo(@PathVariable Integer id) {
        equipoService.borrar(id);
    }
}
