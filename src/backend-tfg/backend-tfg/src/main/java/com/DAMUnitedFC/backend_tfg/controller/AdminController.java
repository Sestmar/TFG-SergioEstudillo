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
    @Autowired private AsistenciaRepository asistenciaRepo;

    // --- USUARIOS ---

    @GetMapping("/candidatos")
    public ResponseEntity<List<Usuario>> getCandidatos() {
        return ResponseEntity.ok(usuarioRepo.findCandidatosSinEquipo());
    }

    @GetMapping("/candidatos-entrenadores")
    public ResponseEntity<List<Entrenador>> getCandidatosEntrenadores() {
        return ResponseEntity.ok(entrenadorRepo.findEntrenadoresSinEquipo());
    }

    // MÉTODO PARA VER A TODOS LOS USUARIOS (INCLUIDOS NUEVOS)
    @GetMapping("/usuarios-activos")
    public ResponseEntity<List<Map<String, Object>>> getUsuariosActivos() {
        List<Map<String, Object>> activos = new ArrayList<>();

        // 1. Buscamos TODOS los usuarios registrados
        List<Usuario> todosLosUsuarios = usuarioRepo.findAll();

        for (Usuario u : todosLosUsuarios) {
            // Ignoramos al admin para no ensuciar la lista
            if ("ADMIN".equals(u.getRol()) || "ROLE_ADMIN".equals(u.getRol())) continue;

            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getIdUsuario());
            map.put("nombre", u.getNombre() + " " + (u.getApellidos() != null ? u.getApellidos() : ""));
            map.put("fotoUrl", u.getFotoUrl());
            map.put("rol", u.getRol());

            // 2. Intentamos averiguar si tiene equipo buscando en Jugadores
            Optional<Jugador> jugOpt = jugadorRepo.findByUsuario_IdUsuario(u.getIdUsuario());
            if (jugOpt.isPresent()) {
                Equipo eq = jugOpt.get().getEquipoPrincipal();
                map.put("equipoNombre", eq != null ? eq.getNombre() : "Sin Equipo");
                map.put("equipoId", eq != null ? eq.getIdEquipo() : null);
            } else {
                // 3. Si no es jugador, miramos si es entrenador
                Optional<Entrenador> entOpt = entrenadorRepo.findByUsuario_IdUsuario(u.getIdUsuario());

                if (entOpt.isPresent()) {
                    Entrenador entrenador = entOpt.get();

                    // BUSCAMOS SI TIENE EQUIPOS ASIGNADOS REALMENTE
                    List<EquipoEntrenador> vinculaciones = equipoEntrenadorRepo.findByEntrenador_IdEntrenador(entrenador.getIdEntrenador());

                    if (!vinculaciones.isEmpty()) {
                        String nombreEquipo = vinculaciones.get(0).getEquipo().getNombre();
                        map.put("equipoNombre", nombreEquipo);
                        map.put("equipoId", vinculaciones.get(0).getEquipo().getIdEquipo());
                    } else {
                        map.put("equipoNombre", "Sin Equipo");
                    }

                } else {
                    // 4. Si no está en ninguno, es un usuario NUEVO sin asignar
                    map.put("equipoNombre", "Sin Equipo");
                }
            }

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

    @PostMapping("/crear-entrenamiento")
    public ResponseEntity<?> crearEntrenamiento(@RequestBody Map<String, Object> payload) {
        try {
            Integer idEquipo = ((Number) payload.get("idEquipo")).intValue();
            String fechaStr = (String) payload.get("fechaHora");
            String lugar = (String) payload.get("lugar");
            // Usamos "Sesión de Entrenamiento" si no viene descripción
            String descripcion = (String) payload.getOrDefault("descripcion", "Sesión de Entrenamiento");

            Equipo equipo = equipoRepo.findById(idEquipo).orElseThrow();

            Partido training = new Partido();
            training.setEquipo(equipo);
            training.setRival(descripcion); // En el calendario se verá como el título
            training.setLugar(lugar);

            if (fechaStr != null) {
                // Ajuste de fecha de Ionic (quita la Z)
                training.setFechaHora(java.time.LocalDateTime.parse(fechaStr.replace("Z", "")));
            }

            training.setTipo("TRAINING"); // IMPORTANTE: Tipo diferenciado
            training.setEstado("PENDIENTE");
            training.setEscudoRivalUrl("assets/img/training-icon.png");

            partidoRepo.save(training);

            return ResponseEntity.ok(Collections.singletonMap("message", "Entrenamiento creado correctamente"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // 🔥 BORRAR EVENTO (PARTIDO O ENTRENAMIENTO)
    @DeleteMapping("/evento/{id}")
    @Transactional // Importante para borrar en cascada
    public ResponseEntity<?> deleteEvento(@PathVariable Long id) {
        try {
            // 1. Buscar el evento
            Partido evento = partidoRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Evento no encontrado"));

            // 2. Borrar dependencias (Hijos)
            // Borrar alineaciones/estadísticas asociadas
            alineacionRepo.deleteByPartido(evento);

            // Borrar asistencias (si es entrenamiento)
            asistenciaRepo.deleteByidEntrenamiento(id);

            // 3. Borrar el evento (Padre)
            partidoRepo.delete(evento);

            return ResponseEntity.ok(Collections.singletonMap("message", "Evento eliminado correctamente"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", "No se pudo eliminar: " + e.getMessage()));
        }
    }

    // CERRAR ACTA (ACTUALIZADO CON ASISTENCIAS)
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

                    // Datos básicos
                    Integer goles = stat.get("goles") != null ? ((Number) stat.get("goles")).intValue() : 0;
                    Integer minutos = stat.get("minutos") != null ? ((Number) stat.get("minutos")).intValue() : 0;
                    // 🔥 LECTURA DE ASISTENCIAS
                    Integer asistencias = stat.get("asistencias") != null ? ((Number) stat.get("asistencias")).intValue() : 0;

                    // Datos avanzados
                    Boolean esTitular = (Boolean) stat.get("esTitular");
                    Integer minEntrada = stat.get("minutoEntrada") != null ? ((Number) stat.get("minutoEntrada")).intValue() : null;
                    Integer minSalida = stat.get("minutoSalida") != null ? ((Number) stat.get("minutoSalida")).intValue() : null;

                    Jugador jugador = jugadorRepo.findById(idJugador).orElse(null);

                    if (jugador != null) {
                        Optional<Alineacion> alineacionOpt = alineacionRepo.findByPartidoAndJugador(p, jugador);
                        Alineacion alineacion;

                        if (alineacionOpt.isPresent()) {
                            alineacion = alineacionOpt.get();
                        } else {
                            alineacion = new Alineacion();
                            alineacion.setPartido(p);
                            alineacion.setJugador(jugador);
                            alineacion.setEquipo(p.getEquipo());
                            alineacion.setSlotId("BENCH_" + jugador.getIdJugador());
                        }

                        // Guardamos todos los datos (incluidas asistencias)
                        alineacion.setGoles(goles);
                        alineacion.setAsistencias(asistencias);
                        alineacion.setMinutosJugados(minutos);
                        alineacion.setEsTitular(esTitular != null && esTitular);
                        alineacion.setMinutoEntrada(minEntrada);
                        alineacion.setMinutoSalida(minSalida);

                        alineacionRepo.save(alineacion);
                    }
                }
            }

            return ResponseEntity.ok(Collections.singletonMap("message", "Acta cerrada y estadísticas guardadas correctamente."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // 🔥 DETALLE EQUIPO (ACTUALIZADO CON ASISTENCIAS PARA EL FRONTEND)
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
            int asistencias = 0; // 🔥 NUEVO

            try {
                // Obtenemos todas las alineaciones del jugador
                List<Alineacion> alineaciones = alineacionRepo.findByJugador(j);

                goles = alineaciones.stream()
                        .mapToInt(a -> a.getGoles() == null ? 0 : a.getGoles())
                        .sum();

                // 🔥 Calculamos el total de asistencias
                asistencias = alineaciones.stream()
                        .mapToInt(a -> a.getAsistencias() == null ? 0 : a.getAsistencias())
                        .sum();

            } catch (Exception ignored) {}

            p.put("goles", goles);
            p.put("asistencias", asistencias); // 🔥 Enviamos al frontend
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

    // 🔥 PASAR LISTA (GUARDAR ASISTENCIA)
    @PostMapping("/guardar-asistencia")
    @Transactional
    public ResponseEntity<?> guardarAsistencia(@RequestBody Map<String, Object> payload) {
        try {
            Long idEntrenamiento = ((Number) payload.get("idEntrenamiento")).longValue();
            List<Map<String, Object>> lista = (List<Map<String, Object>>) payload.get("asistencias");

            for (Map<String, Object> item : lista) {
                Integer idJugador = ((Number) item.get("idJugador")).intValue();
                String estado = (String) item.get("estado"); // "PRESENT", "ABSENT", "INJURED"

                Jugador jugador = jugadorRepo.findById(idJugador).orElse(null);

                if (jugador != null) {
                    // Buscamos si ya existe registro para actualizarlo, si no, creamos uno nuevo
                    Asistencia asistencia = asistenciaRepo.findByIdEntrenamientoAndJugador(idEntrenamiento, jugador)
                            .orElse(new Asistencia());

                    if (asistencia.getIdAsistencia() == null) {
                        asistencia.setIdEntrenamiento(idEntrenamiento);
                        asistencia.setJugador(jugador);
                    }

                    asistencia.setEstado(estado);
                    asistenciaRepo.save(asistencia);
                }
            }
            return ResponseEntity.ok(Collections.singletonMap("message", "Asistencia guardada correctamente."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // 🔥 OBTENER ASISTENCIA (Para cargarla si ya se pasó lista)
    @GetMapping("/entrenamiento/{id}/asistencia")
    public ResponseEntity<?> getAsistencia(@PathVariable Long id) {
        List<Asistencia> lista = asistenciaRepo.findByIdEntrenamiento(id);

        List<Map<String, Object>> response = new ArrayList<>();
        for(Asistencia a : lista) {
            Map<String, Object> item = new HashMap<>();
            item.put("idJugador", a.getJugador().getIdJugador());
            item.put("estado", a.getEstado());
            response.add(item);
        }
        return ResponseEntity.ok(response);
    }
}