package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.EstadisticasJugadorDto;
import com.DAMUnitedFC.backend_tfg.dto.JugadorDto;
import com.DAMUnitedFC.backend_tfg.dto.PlayerHistoryDto;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.service.AdminService;
import com.DAMUnitedFC.backend_tfg.service.JugadorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jugadores")
public class JugadorController {

    private final JugadorService jugadorService;
    private final AdminService adminService;

    public JugadorController(JugadorService jugadorService, AdminService adminService) {
        this.jugadorService = jugadorService;
        this.adminService = adminService;
    }

    @GetMapping
    public List<Jugador> listar() {
        return jugadorService.listar();
    }

    @GetMapping("/{id}")
    public Jugador obtener(@PathVariable Integer id) {
        return jugadorService.obtener(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR')")
    public Jugador crear(@RequestBody JugadorDto dto) {
        return jugadorService.crear(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR') or @jugadorService.isOwner(#id, authentication.name)")
    public Jugador actualizar(@PathVariable Integer id, @RequestBody JugadorDto dto) {
        return jugadorService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void borrar(@PathVariable Integer id) {
        jugadorService.borrar(id);
    }

    @GetMapping("/{id}/stats")
    public EstadisticasJugadorDto obtenerEstadisticas(@PathVariable Integer id) {
        return jugadorService.obtenerEstadisticas(id);
    }

    @GetMapping("/usuario/{idUsuario}/equipo")
    public ResponseEntity<?> getEquipoDelJugador(@PathVariable Integer idUsuario) {
        return jugadorService.getEquipoDelJugador(idUsuario)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<PlayerHistoryDto> getHistorial(@PathVariable Integer id) {
        return ResponseEntity.ok(jugadorService.getHistorial(id));
    }

    @GetMapping("/{idJugador}/entrenamientos/confirmados")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR', 'JUGADOR')")
    public ResponseEntity<List<Long>> getEntrenamientosConfirmados(@PathVariable Integer idJugador) {
        return ResponseEntity.ok(adminService.getEntrenamientosConfirmados(idJugador));
    }

    @PostMapping("/entrenamiento/{id}/confirmar")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR', 'JUGADOR')")
    public ResponseEntity<?> confirmarAsistencia(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Integer idJugador = ((Number) payload.get("idJugador")).intValue();
            adminService.confirmarAsistencia(id, idJugador);
            return ResponseEntity.ok(Collections.singletonMap("message", "Asistencia confirmada"));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("no encontrado")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
