package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.model.*;
import com.DAMUnitedFC.backend_tfg.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private JugadorRepository jugadorRepo;
    @Autowired private EquipoRepository equipoRepo;
    @Autowired private EntrenadorRepository entrenadorRepo;
    @Autowired private EquipoEntrenadorRepository equipoEntrenadorRepo;
    @Autowired private CategoriaRepository categoriaRepo;
    @Autowired private PartidoRepository partidoRepo;
    @Autowired private AlineacionRepository alineacionRepo; // 🔥 Necesario para borrar alineaciones

    @Autowired private PasswordEncoder passwordEncoder;

    // --- USUARIOS ---
    @GetMapping("/candidatos")
    public ResponseEntity<List<Usuario>> getCandidatos() {
        return ResponseEntity.ok(usuarioRepo.findCandidatosSinEquipo());
    }

    @GetMapping("/usuarios-activos")
    public ResponseEntity<List<Map<String, Object>>> getUsuariosActivos() {
        List<Map<String, Object>> activos = new ArrayList<>();

        List<Jugador> jugadores = jugadorRepo.findAll();
        for (Jugador j : jugadores) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", j.getUsuario().getIdUsuario());
            map.put("nombre", j.getUsuario().getNombre() + " " + j.getUsuario().getApellidos());
            map.put("fotoUrl", j.getUsuario().getFotoUrl());
            map.put("rol", "JUGADOR");
            map.put("equipoNombre", j.getEquipoPrincipal() != null ? j.getEquipoPrincipal().getNombre() : "Sin Equipo");
            activos.add(map);
        }

        List<Entrenador> entrenadores = entrenadorRepo.findAll();
        for (Entrenador e : entrenadores) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", e.getUsuario().getIdUsuario());
            map.put("nombre", e.getUsuario().getNombre() + " " + e.getUsuario().getApellidos());
            map.put("fotoUrl", e.getUsuario().getFotoUrl());
            map.put("rol", "STAFF");
            map.put("equipoNombre", "Staff Técnico");
            activos.add(map);
        }
        return ResponseEntity.ok(activos);
    }

    // 🔥 ELIMINAR USUARIO (CON LIMPIEZA EN CASCADA)
    @DeleteMapping("/usuario/{id}")
    @Transactional
    public ResponseEntity<?> deleteUsuario(@PathVariable Integer id) {
        if (!usuarioRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        try {
            // 1. Si es JUGADOR, borrar sus datos
            jugadorRepo.findByUsuario_IdUsuario(id).ifPresent(jugador -> {
                // Borrar sus estadísticas en partidos (alineaciones)
                alineacionRepo.deleteByJugador(jugador);
                // Borrar la ficha de jugador
                jugadorRepo.delete(jugador);
            });

            // 2. Si es ENTRENADOR, borrar sus datos
            entrenadorRepo.findByUsuario_IdUsuario(id).ifPresent(entrenador -> {
                // Borrar vinculación con equipos
                equipoEntrenadorRepo.deleteByEntrenador(entrenador);

                // Desvincular de equipos donde sea entrenador principal (para no borrar el equipo entero)
                List<Equipo> equiposDirigidos = equipoRepo.findByEntrenador(entrenador);
                for (Equipo eq : equiposDirigidos) {
                    eq.setEntrenador(null);
                    equipoRepo.save(eq);
                }

                // Borrar la ficha de entrenador
                entrenadorRepo.delete(entrenador);
            });

            // 3. Finalmente borrar el usuario base
            usuarioRepo.deleteById(id);

            return ResponseEntity.ok(Collections.singletonMap("message", "Usuario y datos asociados eliminados correctamente"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "No se pudo eliminar: " + e.getMessage()));
        }
    }

    @PostMapping("/crear-usuario")
    public ResponseEntity<?> crearUsuario(@RequestBody Map<String, String> payload) {
        try {
            String nombre = payload.get("nombre");
            String email = payload.get("email");
            String rol = payload.get("rol");
            String password = payload.get("password");

            if (usuarioRepo.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "El email ya existe"));
            }

            Usuario u = new Usuario();
            u.setNombre(nombre);
            u.setApellidos("");
            u.setEmail(email);

            // Usamos setPasswordHash (modelo original)
            u.setPasswordHash(passwordEncoder.encode(password));

            u.setRol(rol);
            u.setFechaRegistro(new java.util.Date());

            usuarioRepo.save(u);

            return ResponseEntity.ok(Collections.singletonMap("message", "Usuario creado con éxito"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // --- EQUIPOS ---
    @GetMapping("/equipos")
    public ResponseEntity<List<Map<String, Object>>> getEquiposAdmin() {
        List<Equipo> equipos = equipoRepo.findAll();
        List<Map<String, Object>> respuesta = new ArrayList<>();

        for (Equipo eq : equipos) {
            Map<String, Object> map = new HashMap<>();
            map.put("idEquipo", eq.getIdEquipo());
            map.put("nombre", eq.getNombre());
            map.put("escudoUrl", eq.getEscudoUrl());
            map.put("categoriaNombre", eq.getCategoria() != null ? eq.getCategoria().getNombre() : "General");

            long count = jugadorRepo.countByEquipoPrincipal(eq);
            map.put("jugadoresCount", count);

            respuesta.add(map);
        }
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/crear-equipo")
    public ResponseEntity<?> crearEquipo(@RequestBody Map<String, Object> payload) {
        try {
            String nombre = (String) payload.get("nombre");
            String catNombre = (String) payload.get("categoria");

            Equipo eq = new Equipo();
            eq.setNombre(nombre);
            eq.setFechaCreacion(new java.sql.Date(System.currentTimeMillis()));
            eq.setEscudoUrl("assets/img/mi-club-logo.png");

            if (catNombre != null && !catNombre.isEmpty()) {
                Categoria cat = categoriaRepo.findByNombre(catNombre)
                        .orElseGet(() -> {
                            Categoria nueva = new Categoria();
                            nueva.setNombre(catNombre);
                            return categoriaRepo.save(nueva);
                        });
                eq.setCategoria(cat);
            }

            equipoRepo.save(eq);
            return ResponseEntity.ok(Collections.singletonMap("message", "Equipo creado"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // --- ASIGNACIONES ---
    @PostMapping("/asignar-equipo")
    public ResponseEntity<?> asignarEquipo(@RequestBody Map<String, Object> payload) {
        try {
            Integer idUsuario = ((Number) payload.get("idUsuario")).intValue();
            Integer idEquipo = ((Number) payload.get("idEquipo")).intValue();

            Usuario usuario = usuarioRepo.findById(idUsuario).orElseThrow();
            Equipo equipo = equipoRepo.findById(idEquipo).orElseThrow();

            Jugador nuevoJugador = new Jugador();
            nuevoJugador.setUsuario(usuario);
            nuevoJugador.setEquipoPrincipal(equipo);
            nuevoJugador.setDorsal(0);
            nuevoJugador.setEstado("ACTIVO");
            nuevoJugador.setPosicion("PENDIENTE");

            jugadorRepo.save(nuevoJugador);
            return ResponseEntity.ok(Collections.singletonMap("message", "Jugador fichado."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/asignar-mister")
    public ResponseEntity<?> asignarEntrenador(@RequestBody Map<String, Object> payload) {
        try {
            Integer idUsuario = ((Number) payload.get("idUsuario")).intValue();
            Integer idEquipo = ((Number) payload.get("idEquipo")).intValue();
            String rolStaff = (String) payload.getOrDefault("rol", "Entrenador Principal");

            Usuario usuario = usuarioRepo.findById(idUsuario).orElseThrow();
            Equipo equipo = equipoRepo.findById(idEquipo).orElseThrow();

            Entrenador entrenador = entrenadorRepo.findByUsuario_IdUsuario(idUsuario)
                    .orElseGet(() -> {
                        Entrenador nuevo = new Entrenador();
                        nuevo.setUsuario(usuario);
                        return entrenadorRepo.save(nuevo);
                    });

            EquipoEntrenador vinculacion = new EquipoEntrenador();
            EquipoEntrenadorId idVinculo = new EquipoEntrenadorId();
            idVinculo.setIdEquipo(equipo.getIdEquipo());
            idVinculo.setIdEntrenador(entrenador.getIdEntrenador());

            vinculacion.setId(idVinculo);
            vinculacion.setEquipo(equipo);
            vinculacion.setEntrenador(entrenador);
            vinculacion.setRol(rolStaff);

            equipoEntrenadorRepo.save(vinculacion);
            return ResponseEntity.ok(Collections.singletonMap("message", "Staff contratado."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // --- COMPETICIÓN ---
    @PostMapping("/crear-partido")
    public ResponseEntity<?> crearPartido(@RequestBody Map<String, Object> payload) {
        try {
            Integer idEquipo = ((Number) payload.get("idEquipo")).intValue();
            String rival = (String) payload.get("rival");
            String lugar = (String) payload.get("lugar");
            String fechaStr = (String) payload.get("fechaHora");

            Equipo local = equipoRepo.findById(idEquipo).orElseThrow();

            Partido partido = new Partido();
            partido.setEquipo(local);
            partido.setRival(rival);
            partido.setLugar(lugar);

            if (fechaStr != null) {
                partido.setFechaHora(java.time.LocalDateTime.parse(fechaStr.replace("Z", "")));
            }

            partido.setTipo("PARTIDO");
            partido.setEstado("PENDIENTE");

            partidoRepo.save(partido);

            return ResponseEntity.ok(Collections.singletonMap("message", "Evento creado correctamente"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", "Error creando partido: " + e.getMessage()));
        }
    }

    // Cerrar Acta (Admin)
    @PostMapping("/cerrar-acta")
    @Transactional
    public ResponseEntity<?> cerrarActaAdmin(@RequestBody Map<String, Object> payload) {
        try {
            Long idPartido = ((Number) payload.get("idPartido")).longValue();
            Integer golesFavor = ((Number) payload.get("golesFavor")).intValue();
            Integer golesContra = ((Number) payload.get("golesContra")).intValue();

            Partido p = partidoRepo.findById(idPartido).orElseThrow();
            p.setGolesFavor(golesFavor);
            p.setGolesContra(golesContra);
            p.setEstado("FINALIZADO");
            partidoRepo.save(p);

            return ResponseEntity.ok(Collections.singletonMap("message", "Acta cerrada por Admin"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}