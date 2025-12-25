package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.model.*;
import com.DAMUnitedFC.backend_tfg.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private JugadorRepository jugadorRepo;
    @Autowired private EquipoRepository equipoRepo;
    @Autowired private EntrenadorRepository entrenadorRepo;
    @Autowired private EquipoEntrenadorRepository equipoEntrenadorRepo; // 🔥 Inyección nueva

    // 1. Ver usuarios nuevos (Candidatos sin equipo)
    @GetMapping("/candidatos")
    public ResponseEntity<List<Usuario>> getCandidatos() {
        List<Usuario> candidatos = usuarioRepo.findCandidatosSinEquipo();
        return ResponseEntity.ok(candidatos);
    }

    // 2. Obtener lista de equipos para el select
    @GetMapping("/equipos")
    public ResponseEntity<List<Equipo>> getEquiposAdmin() {
        return ResponseEntity.ok(equipoRepo.findAll());
    }

    // 3. ASIGNAR JUGADOR (Paso 1 del Fichaje)
    @PostMapping("/asignar-equipo")
    public ResponseEntity<?> asignarEquipo(@RequestBody Map<String, Object> payload) {
        try {
            if (payload.get("idUsuario") == null || payload.get("idEquipo") == null) {
                return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", "Faltan datos"));
            }

            Integer idUsuario = ((Number) payload.get("idUsuario")).intValue();
            Integer idEquipo = ((Number) payload.get("idEquipo")).intValue();

            Usuario usuario = usuarioRepo.findById(idUsuario)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Equipo equipo = equipoRepo.findById(idEquipo)
                    .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));

            Jugador nuevoJugador = new Jugador();
            nuevoJugador.setUsuario(usuario);
            nuevoJugador.setEquipoPrincipal(equipo);
            nuevoJugador.setDorsal(0);
            nuevoJugador.setPosicion("Pendiente");

            jugadorRepo.save(nuevoJugador);

            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Fichaje realizado."));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(java.util.Collections.singletonMap("error", "Error interno: " + e.getMessage()));
        }
    }

    // 4. Obtener entrenadores libres
    @GetMapping("/entrenadores-libres")
    public ResponseEntity<List<Usuario>> getEntrenadoresLibres() {
        return ResponseEntity.ok(usuarioRepo.findEntrenadoresDisponibles());
    }

    // 🔥 5. CONTRATAR STAFF TÉCNICO (ESCALABLE)
    @PostMapping("/asignar-mister")
    public ResponseEntity<?> asignarEntrenador(@RequestBody Map<String, Object> payload) {
        try {
            if (payload.get("idUsuario") == null || payload.get("idEquipo") == null) {
                return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", "Faltan datos"));
            }

            Integer idUsuario = ((Number) payload.get("idUsuario")).intValue();
            Integer idEquipo = ((Number) payload.get("idEquipo")).intValue();
            // Leemos el rol, si no viene, asumimos Principal
            String rolStaff = (String) payload.getOrDefault("rol", "Entrenador Principal");

            Usuario usuario = usuarioRepo.findById(idUsuario)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Equipo equipo = equipoRepo.findById(idEquipo)
                    .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));

            // A) Aseguramos que existe la ficha de Entrenador
            Entrenador entrenador = entrenadorRepo.findByUsuario_IdUsuario(idUsuario)
                    .orElseGet(() -> {
                        Entrenador nuevo = new Entrenador();
                        nuevo.setUsuario(usuario);
                        return entrenadorRepo.save(nuevo);
                    });

            // B) GUARDADO EN TABLA INTERMEDIA (Siempre, para historial y staff completo)
            EquipoEntrenador vinculacion = new EquipoEntrenador();
            EquipoEntrenadorId idVinculo = new EquipoEntrenadorId();
            idVinculo.setIdEquipo(equipo.getIdEquipo());
            idVinculo.setIdEntrenador(entrenador.getIdEntrenador());

            vinculacion.setId(idVinculo);
            vinculacion.setEquipo(equipo);
            vinculacion.setEntrenador(entrenador);
            vinculacion.setRol(rolStaff); // Guardamos el puesto específico (Ej: "Fisio")

            equipoEntrenadorRepo.save(vinculacion);

            // C) ACTUALIZAR JEFE DE EQUIPO (Solo si es el Principal)
            // Esto mantiene la compatibilidad con el Dashboard actual
            if ("Entrenador Principal".equalsIgnoreCase(rolStaff)) {
                equipo.setEntrenador(entrenador);
                equipoRepo.save(equipo);
            }

            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Contrato firmado como: " + rolStaff));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }
}