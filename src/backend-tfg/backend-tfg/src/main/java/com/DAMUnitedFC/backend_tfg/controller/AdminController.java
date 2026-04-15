package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.model.Entrenador;
import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.service.AdminService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/candidatos")
    public ResponseEntity<List<Usuario>> getCandidatos() {
        return ResponseEntity.ok(adminService.getCandidatos());
    }

    @GetMapping("/candidatos-entrenadores")
    public ResponseEntity<List<Entrenador>> getCandidatosEntrenadores() {
        return ResponseEntity.ok(adminService.getCandidatosEntrenadores());
    }

    @GetMapping("/usuarios-activos")
    public ResponseEntity<List<Map<String, Object>>> getUsuariosActivos() {
        return ResponseEntity.ok(adminService.getUsuariosActivos());
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<?> actualizarUsuario(@PathVariable Integer id, @RequestBody Map<String, Object> payload) {
        try {
            adminService.actualizarUsuario(id, payload);
            return ResponseEntity.ok(Collections.singletonMap("message", "Usuario actualizado correctamente"));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("no encontrado")) return ResponseEntity.notFound().build();
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/usuario/{id}")
    public ResponseEntity<?> deleteUsuario(@PathVariable Integer id) {
        try {
            adminService.deleteUsuario(id);
            return ResponseEntity.ok(Collections.singletonMap("message", "Usuario eliminado correctamente"));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("no encontrado")) return ResponseEntity.notFound().build();
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/crear-usuario")
    public ResponseEntity<?> crearUsuario(@RequestBody Map<String, Object> payload) {
        try {
            adminService.crearUsuario(payload);
            return ResponseEntity.ok(Collections.singletonMap("message", "Usuario creado"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/equipos")
    public ResponseEntity<List<Map<String, Object>>> getEquiposAdmin() {
        return ResponseEntity.ok(adminService.getEquiposAdmin());
    }

    @PostMapping("/crear-equipo")
    public ResponseEntity<?> crearEquipo(@RequestBody Map<String, Object> payload) {
        try {
            adminService.crearEquipo(payload);
            return ResponseEntity.ok(Collections.singletonMap("message", "Equipo creado"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/asignar-equipo")
    public ResponseEntity<?> asignarEquipo(@RequestBody Map<String, Object> payload) {
        try {
            adminService.asignarEquipo(payload);
            return ResponseEntity.ok(Collections.singletonMap("message", "Jugador fichado."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/asignar-mister")
    public ResponseEntity<?> asignarEntrenador(@RequestBody Map<String, Object> payload) {
        try {
            adminService.asignarEntrenador(payload);
            return ResponseEntity.ok(Collections.singletonMap("message", "Staff contratado."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping(value = "/crear-partido", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> crearPartido(
            @RequestParam("idEquipo") Integer idEquipo,
            @RequestParam("rival") String rival,
            @RequestParam("lugar") String lugar,
            @RequestParam("fechaHora") String fechaStr,
            @RequestParam(value = "escudoRivalUrl", required = false) String escudoRivalUrl,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            adminService.crearPartido(idEquipo, rival, lugar, fechaStr, escudoRivalUrl, file);
            return ResponseEntity.ok(Collections.singletonMap("message", "Evento creado"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/crear-entrenamiento")
    public ResponseEntity<?> crearEntrenamiento(@RequestBody Map<String, Object> payload) {
        try {
            adminService.crearEntrenamiento(payload);
            return ResponseEntity.ok(Collections.singletonMap("message", "Entrenamiento creado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @DeleteMapping("/evento/{id}")
    public ResponseEntity<?> deleteEvento(@PathVariable Long id) {
        try {
            adminService.deleteEvento(id);
            return ResponseEntity.ok(Collections.singletonMap("message", "Evento eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", "No se pudo eliminar: " + e.getMessage()));
        }
    }

    @PostMapping("/cerrar-acta")
    public ResponseEntity<?> cerrarActaAdmin(@RequestBody Map<String, Object> payload) {
        try {
            adminService.cerrarActaAdmin(payload);
            return ResponseEntity.ok(Collections.singletonMap("message", "Acta cerrada y estadísticas guardadas correctamente."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/equipo/{id}/detalle")
    public ResponseEntity<Map<String, Object>> getEquipoDetalle(@PathVariable Integer id) {
        return ResponseEntity.ok(adminService.getEquipoDetalle(id));
    }

    @PostMapping("/guardar-asistencia")
    public ResponseEntity<?> guardarAsistencia(@RequestBody Map<String, Object> payload) {
        try {
            adminService.guardarAsistencia(payload);
            return ResponseEntity.ok(Collections.singletonMap("message", "Asistencia guardada correctamente."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/entrenamiento/{id}/asistencia")
    public ResponseEntity<?> getAsistencia(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getAsistencia(id));
    }

}
