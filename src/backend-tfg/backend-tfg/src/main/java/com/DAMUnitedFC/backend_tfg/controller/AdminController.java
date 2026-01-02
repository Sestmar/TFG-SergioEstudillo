package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.model.*;
import com.DAMUnitedFC.backend_tfg.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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
    @Autowired private AlineacionRepository alineacionRepo;

    @Autowired private PasswordEncoder passwordEncoder;

    // --- USUARIOS ---

    @GetMapping("/candidatos")
    public ResponseEntity<List<Usuario>> getCandidatos() {
        return ResponseEntity.ok(usuarioRepo.findCandidatosSinEquipo());
    }

    @GetMapping("/candidatos-entrenadores")
    public ResponseEntity<List<Entrenador>> getCandidatosEntrenadores() {
        return ResponseEntity.ok(entrenadorRepo.findEntrenadoresSinEquipo());
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

    @DeleteMapping("/usuario/{id}")
    @Transactional
    public ResponseEntity<?> deleteUsuario(@PathVariable Integer id) {
        if (!usuarioRepo.existsById(id)) return ResponseEntity.notFound().build();
        try {
            jugadorRepo.findByUsuario_IdUsuario(id).ifPresent(jugador -> {
                alineacionRepo.deleteByJugador(jugador);
                jugadorRepo.delete(jugador);
            });
            entrenadorRepo.findByUsuario_IdUsuario(id).ifPresent(entrenador -> {
                equipoEntrenadorRepo.deleteByEntrenador(entrenador);
                List<Equipo> equiposDirigidos = equipoRepo.findByEntrenador(entrenador);
                for (Equipo eq : equiposDirigidos) {
                    eq.setEntrenador(null);
                    equipoRepo.save(eq);
                }
                entrenadorRepo.delete(entrenador);
            });
            usuarioRepo.deleteById(id);
            return ResponseEntity.ok(Collections.singletonMap("message", "Usuario eliminado correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/crear-usuario")
    public ResponseEntity<?> crearUsuario(@RequestBody Map<String, Object> payload) {
        try {
            String nombre = (String) payload.get("nombre");
            String apellidos = payload.get("apellidos") != null ? (String) payload.get("apellidos") : "";
            String email = (String) payload.get("email");
            String rol = (String) payload.get("rol");
            String password = (String) payload.get("password");

            if (usuarioRepo.findByEmail(email).isPresent()) return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Email existe"));
            if (password == null || password.trim().isEmpty()) password = "123456";

            Usuario u = new Usuario();
            u.setNombre(nombre);
            u.setApellidos(apellidos);
            u.setEmail(email);
            u.setPasswordHash(passwordEncoder.encode(password.trim()));

            String rolInput = (rol != null) ? rol.toUpperCase() : "JUGADOR";
            if (rolInput.contains("ENTRENADOR") || rolInput.contains("COACH")) u.setRol("ROLE_ENTRENADOR");
            else if (rolInput.contains("JUGADOR")) u.setRol("ROLE_JUGADOR");
            else u.setRol(rolInput.startsWith("ROLE_") ? rolInput : "ROLE_" + rolInput);

            u.setFechaRegistro(new java.util.Date());
            Usuario savedUser = usuarioRepo.save(u);

            if ("ROLE_ENTRENADOR".equals(savedUser.getRol())) {
                Entrenador nuevo = new Entrenador();
                nuevo.setUsuario(savedUser);
                entrenadorRepo.save(nuevo);
            }
            return ResponseEntity.ok(Collections.singletonMap("message", "Usuario creado"));
        } catch (Exception e) {
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
            map.put("jugadoresCount", jugadorRepo.countByEquipoPrincipal(eq));
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
                        .orElseGet(() -> { Categoria n = new Categoria(); n.setNombre(catNombre); return categoriaRepo.save(n); });
                eq.setCategoria(cat);
            }
            equipoRepo.save(eq);
            return ResponseEntity.ok(Collections.singletonMap("message", "Equipo creado"));
        } catch (Exception e) { return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage())); }
    }

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
        } catch (Exception e) { return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage())); }
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
                    .orElseGet(() -> { Entrenador n = new Entrenador(); n.setUsuario(usuario); return entrenadorRepo.save(n); });
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
        } catch (Exception e) { return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage())); }
    }

    // --- COMPETICIÓN ---

    @PostMapping(value = "/crear-partido", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> crearPartido(
            @RequestParam("idEquipo") Integer idEquipo,
            @RequestParam("rival") String rival,
            @RequestParam("lugar") String lugar,
            @RequestParam("fechaHora") String fechaStr,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            Equipo local = equipoRepo.findById(idEquipo).orElseThrow();
            Partido partido = new Partido();
            partido.setEquipo(local);
            partido.setRival(rival);
            partido.setLugar(lugar);

            if (file != null && !file.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path path = Paths.get("target/uploads");
                if (!Files.exists(path)) Files.createDirectories(path);
                Files.copy(file.getInputStream(), path.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
                partido.setEscudoRivalUrl("http://localhost:8080/api/uploads/" + fileName);
            }

            if (fechaStr != null) {
                partido.setFechaHora(java.time.LocalDateTime.parse(fechaStr.replace("Z", "")));
            }
            partido.setTipo("PARTIDO");
            partido.setEstado("PENDIENTE");
            partidoRepo.save(partido);
            return ResponseEntity.ok(Collections.singletonMap("message", "Evento creado"));
        } catch (Exception e) { e.printStackTrace(); return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage())); }
    }

    // 🔥 CERRAR ACTA (LÓGICA MEJORADA)
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

            List<Map<String, Object>> estadisticas = (List<Map<String, Object>>) payload.get("estadisticas");

            if (estadisticas != null) {
                for (Map<String, Object> stat : estadisticas) {
                    Integer idJugador = ((Number) stat.get("idJugador")).intValue();
                    Integer goles = stat.get("goles") != null ? ((Number) stat.get("goles")).intValue() : 0;
                    Integer minutos = stat.get("minutos") != null ? ((Number) stat.get("minutos")).intValue() : 0;

                    Jugador jugador = jugadorRepo.findById(idJugador).orElse(null);

                    if (jugador != null) {
                        // Usamos el método compatible que acabamos de definir en el Repo
                        Optional<Alineacion> alineacionOpt = alineacionRepo.findByPartidoAndJugador(p, jugador);
                        Alineacion alineacion;

                        if (alineacionOpt.isPresent()) {
                            alineacion = alineacionOpt.get();
                        } else {
                            alineacion = new Alineacion();
                            alineacion.setPartido(p);
                            alineacion.setJugador(jugador);
                        }

                        alineacion.setGoles(goles);
                        alineacion.setMinutosJugados(minutos);

                        alineacionRepo.save(alineacion);
                    }
                }
            }

            return ResponseEntity.ok(Collections.singletonMap("message", "Acta cerrada y goles guardados"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/equipo/{id}/detalle")
    public ResponseEntity<Map<String, Object>> getEquipoDetalle(@PathVariable Integer id) {
        Equipo equipo = equipoRepo.findById(id).orElseThrow();
        Map<String, Object> response = new HashMap<>();
        response.put("equipo", equipo);

        List<Jugador> jugadores = jugadorRepo.findByEquipoPrincipal_IdEquipo(id);
        List<Map<String, Object>> jugadoresDto = new ArrayList<>();
        for (Jugador j : jugadores) {
            Map<String, Object> p = new HashMap<>();
            p.put("id", j.getIdJugador());
            p.put("nombre", j.getUsuario().getNombre());
            p.put("apellidos", j.getUsuario().getApellidos());
            p.put("dorsal", j.getDorsal());
            p.put("posicion", j.getPosicion());
            p.put("fotoUrl", j.getFotoUrl() != null ? j.getFotoUrl() : j.getUsuario().getFotoUrl());

            int goles = 0;
            try {
                goles = alineacionRepo.findByJugador(j).stream()
                        .mapToInt(a -> a.getGoles() == null ? 0 : a.getGoles())
                        .sum();
            } catch (Exception ignored) {}

            p.put("goles", goles);
            jugadoresDto.add(p);
        }
        response.put("jugadores", jugadoresDto);

        List<EquipoEntrenador> staffRelation = equipoEntrenadorRepo.findById_IdEquipo(id);
        List<Map<String, Object>> staffDto = new ArrayList<>();
        for (EquipoEntrenador ee : staffRelation) {
            Entrenador e = ee.getEntrenador();
            Map<String, Object> s = new HashMap<>();
            s.put("id", e.getIdEntrenador());
            s.put("nombre", e.getUsuario().getNombre());
            s.put("apellidos", e.getUsuario().getApellidos());
            s.put("rol", ee.getRol());
            s.put("fotoUrl", e.getUsuario().getFotoUrl());
            staffDto.add(s);
        }
        response.put("staff", staffDto);
        return ResponseEntity.ok(response);
    }
}