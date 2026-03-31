package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.model.*;
import com.DAMUnitedFC.backend_tfg.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
public class AdminService {

    private final UsuarioRepository usuarioRepo;
    private final JugadorRepository jugadorRepo;
    private final EquipoRepository equipoRepo;
    private final EntrenadorRepository entrenadorRepo;
    private final EquipoEntrenadorRepository equipoEntrenadorRepo;
    private final CategoriaRepository categoriaRepo;
    private final PartidoRepository partidoRepo;
    private final AlineacionRepository alineacionRepo;
    private final AsistenciaRepository asistenciaRepo;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UsuarioRepository usuarioRepo,
                        JugadorRepository jugadorRepo,
                        EquipoRepository equipoRepo,
                        EntrenadorRepository entrenadorRepo,
                        EquipoEntrenadorRepository equipoEntrenadorRepo,
                        CategoriaRepository categoriaRepo,
                        PartidoRepository partidoRepo,
                        AlineacionRepository alineacionRepo,
                        AsistenciaRepository asistenciaRepo,
                        PasswordEncoder passwordEncoder) {
        this.usuarioRepo = usuarioRepo;
        this.jugadorRepo = jugadorRepo;
        this.equipoRepo = equipoRepo;
        this.entrenadorRepo = entrenadorRepo;
        this.equipoEntrenadorRepo = equipoEntrenadorRepo;
        this.categoriaRepo = categoriaRepo;
        this.partidoRepo = partidoRepo;
        this.alineacionRepo = alineacionRepo;
        this.asistenciaRepo = asistenciaRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> getCandidatos() {
        return usuarioRepo.findCandidatosSinEquipo();
    }

    public List<Entrenador> getCandidatosEntrenadores() {
        return entrenadorRepo.findEntrenadoresSinEquipo();
    }

    public List<Map<String, Object>> getUsuariosActivos() {
        List<Map<String, Object>> activos = new ArrayList<>();
        for (Usuario u : usuarioRepo.findAll()) {
            if ("ADMIN".equals(u.getRol()) || "ROLE_ADMIN".equals(u.getRol())) continue;
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getIdUsuario());
            map.put("nombre", u.getNombre() + " " + (u.getApellidos() != null ? u.getApellidos() : ""));
            map.put("fotoUrl", u.getFotoUrl());
            map.put("rol", u.getRol());
            Optional<Jugador> jugOpt = jugadorRepo.findByUsuario_IdUsuario(u.getIdUsuario());
            if (jugOpt.isPresent()) {
                Equipo eq = jugOpt.get().getEquipoPrincipal();
                map.put("equipoNombre", eq != null ? eq.getNombre() : "Sin Equipo");
                map.put("equipoId", eq != null ? eq.getIdEquipo() : null);
            } else {
                Optional<Entrenador> entOpt = entrenadorRepo.findByUsuario_IdUsuario(u.getIdUsuario());
                if (entOpt.isPresent()) {
                    List<EquipoEntrenador> vinculaciones = equipoEntrenadorRepo.findByEntrenador_IdEntrenador(entOpt.get().getIdEntrenador());
                    if (!vinculaciones.isEmpty()) {
                        map.put("equipoNombre", vinculaciones.get(0).getEquipo().getNombre());
                        map.put("equipoId", vinculaciones.get(0).getEquipo().getIdEquipo());
                    } else {
                        map.put("equipoNombre", "Sin Equipo");
                    }
                } else {
                    map.put("equipoNombre", "Sin Equipo");
                }
            }
            activos.add(map);
        }
        return activos;
    }

    @Transactional
    public void deleteUsuario(Integer id) {
        if (!usuarioRepo.existsById(id)) throw new RuntimeException("Usuario no encontrado");
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
    }

    @Transactional
    public void crearUsuario(Map<String, Object> payload) {
        String nombre = (String) payload.get("nombre");
        String apellidos = payload.get("apellidos") != null ? (String) payload.get("apellidos") : "";
        String email = (String) payload.get("email");
        String rol = (String) payload.get("rol");
        String password = (String) payload.get("password");

        if (usuarioRepo.findByEmail(email).isPresent()) throw new RuntimeException("Email existe");
        if (password == null || password.trim().isEmpty()) password = "123456";

        Usuario u = new Usuario();
        u.setNombre(nombre);
        u.setApellidos(apellidos);
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode(password.trim()));

        String rolInput = (rol != null) ? rol.toUpperCase() : "JUGADOR";
        // Normalizar: quitar prefijo ROLE_ si viene, guardar siempre sin prefijo (igual que AuthService)
        String rolNormalizado = rolInput.startsWith("ROLE_") ? rolInput.substring(5) : rolInput;
        if (rolNormalizado.contains("ENTRENADOR") || rolNormalizado.contains("COACH")) u.setRol("ENTRENADOR");
        else if (rolNormalizado.contains("JUGADOR")) u.setRol("JUGADOR");
        else u.setRol(rolNormalizado);

        u.setFechaRegistro(new java.util.Date());
        Usuario savedUser = usuarioRepo.save(u);

        if ("ENTRENADOR".equals(savedUser.getRol())) {
            Entrenador nuevo = new Entrenador();
            nuevo.setUsuario(savedUser);
            entrenadorRepo.save(nuevo);
        }
    }

    public List<Map<String, Object>> getEquiposAdmin() {
        List<Map<String, Object>> respuesta = new ArrayList<>();
        for (Equipo eq : equipoRepo.findAll()) {
            Map<String, Object> map = new HashMap<>();
            map.put("idEquipo", eq.getIdEquipo());
            map.put("nombre", eq.getNombre());
            map.put("escudoUrl", eq.getEscudoUrl());
            map.put("categoriaNombre", eq.getCategoria() != null ? eq.getCategoria().getNombre() : "General");
            map.put("jugadoresCount", jugadorRepo.countByEquipoPrincipal(eq));
            respuesta.add(map);
        }
        return respuesta;
    }

    public void crearEquipo(Map<String, Object> payload) {
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
    }

    public void asignarEquipo(Map<String, Object> payload) {
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
    }

    public void asignarEntrenador(Map<String, Object> payload) {
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
    }

    public void crearPartido(Integer idEquipo, String rival, String lugar, String fechaStr,
                              String escudoRivalUrl, MultipartFile file) throws Exception {
        Equipo local = equipoRepo.findById(idEquipo).orElseThrow();
        Partido partido = new Partido();
        partido.setEquipo(local);
        partido.setRival(rival);
        partido.setLugar(lugar);
        if (escudoRivalUrl != null && !escudoRivalUrl.isEmpty()) {
            partido.setEscudoRivalUrl(escudoRivalUrl);
        } else if (file != null && !file.isEmpty()) {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get("target/uploads");
            if (!Files.exists(path)) Files.createDirectories(path);
            Files.copy(file.getInputStream(), path.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            partido.setEscudoRivalUrl("https://backend-tfg-sergio.onrender.com/api/uploads/" + fileName);
        }
        if (fechaStr != null) {
            partido.setFechaHora(java.time.LocalDateTime.parse(fechaStr.replace("Z", "")));
        }
        partido.setTipo("PARTIDO");
        partido.setEstado("PENDIENTE");
        partidoRepo.save(partido);
    }

    public void crearEntrenamiento(Map<String, Object> payload) {
        Integer idEquipo = ((Number) payload.get("idEquipo")).intValue();
        String fechaStr = (String) payload.get("fechaHora");
        String lugar = (String) payload.get("lugar");
        String descripcion = (String) payload.getOrDefault("descripcion", "Sesión de Entrenamiento");
        Equipo equipo = equipoRepo.findById(idEquipo).orElseThrow();
        Partido training = new Partido();
        training.setEquipo(equipo);
        training.setRival(descripcion);
        training.setLugar(lugar);
        if (fechaStr != null) {
            training.setFechaHora(java.time.LocalDateTime.parse(fechaStr.replace("Z", "")));
        }
        training.setTipo("TRAINING");
        training.setEstado("PENDIENTE");
        training.setEscudoRivalUrl("assets/img/training-icon.png");
        partidoRepo.save(training);
    }

    @Transactional
    public void deleteEvento(Long id) {
        Partido evento = partidoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        alineacionRepo.deleteByPartido(evento);
        asistenciaRepo.deleteByidEntrenamiento(id);
        partidoRepo.delete(evento);
    }

    @Transactional
    public void cerrarActaAdmin(Map<String, Object> payload) {
        Long idPartido = ((Number) payload.get("idPartido")).longValue();
        Integer golesFavor = ((Number) payload.get("golesFavor")).intValue();
        Integer golesContra = ((Number) payload.get("golesContra")).intValue();

        Partido p = partidoRepo.findById(idPartido).orElseThrow();
        p.setGolesFavor(golesFavor);
        p.setGolesContra(golesContra);
        p.setEstado("FINALIZADO");
        partidoRepo.save(p);

        List<Map<String, Object>> estadisticas = (List<Map<String, Object>>) payload.get("estadisticas");
        if (estadisticas == null) return;

        for (Map<String, Object> stat : estadisticas) {
            Integer idJugador = ((Number) stat.get("idJugador")).intValue();
            Integer goles = stat.get("goles") != null ? ((Number) stat.get("goles")).intValue() : 0;
            Integer minutos = stat.get("minutos") != null ? ((Number) stat.get("minutos")).intValue() : 0;
            Integer asistencias = stat.get("asistencias") != null ? ((Number) stat.get("asistencias")).intValue() : 0;
            Boolean esTitular = (Boolean) stat.get("esTitular");
            Integer minEntrada = stat.get("minutoEntrada") != null ? ((Number) stat.get("minutoEntrada")).intValue() : null;
            Integer minSalida = stat.get("minutoSalida") != null ? ((Number) stat.get("minutoSalida")).intValue() : null;

            Jugador jugador = jugadorRepo.findById(idJugador).orElse(null);
            if (jugador == null) continue;

            Optional<Alineacion> alineacionOpt = alineacionRepo.findByPartidoAndJugador(p, jugador);
            Alineacion alineacion = alineacionOpt.orElseGet(() -> {
                Alineacion a = new Alineacion();
                a.setPartido(p);
                a.setJugador(jugador);
                a.setEquipo(p.getEquipo());
                a.setSlotId("BENCH_" + jugador.getIdJugador());
                return a;
            });

            alineacion.setGoles(goles);
            alineacion.setAsistencias(asistencias);
            alineacion.setMinutosJugados(minutos);
            alineacion.setEsTitular(esTitular != null && esTitular);
            alineacion.setMinutoEntrada(minEntrada);
            alineacion.setMinutoSalida(minSalida);
            Boolean amarilla = (Boolean) stat.get("amarilla");
            Boolean roja = (Boolean) stat.get("roja");
            alineacion.setTarjetaAmarilla(amarilla != null && amarilla);
            alineacion.setTarjetaRoja(roja != null && roja);
            alineacionRepo.save(alineacion);
        }
    }

    public Map<String, Object> getEquipoDetalle(Integer id) {
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
            List<Alineacion> alineaciones = alineacionRepo.findByJugador(j);
            p.put("goles", alineaciones.stream().mapToInt(a -> a.getGoles() == null ? 0 : a.getGoles()).sum());
            p.put("asistencias", alineaciones.stream().mapToInt(a -> a.getAsistencias() == null ? 0 : a.getAsistencias()).sum());
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
        return response;
    }

    @Transactional
    public void guardarAsistencia(Map<String, Object> payload) {
        Long idEntrenamiento = ((Number) payload.get("idEntrenamiento")).longValue();
        List<Map<String, Object>> lista = (List<Map<String, Object>>) payload.get("asistencias");
        for (Map<String, Object> item : lista) {
            Integer idJugador = ((Number) item.get("idJugador")).intValue();
            String estado = (String) item.get("estado");
            Jugador jugador = jugadorRepo.findById(idJugador).orElse(null);
            if (jugador == null) continue;
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

    public List<Map<String, Object>> getAsistencia(Long id) {
        List<Map<String, Object>> response = new ArrayList<>();
        for (Asistencia a : asistenciaRepo.findByIdEntrenamiento(id)) {
            Map<String, Object> item = new HashMap<>();
            item.put("idJugador", a.getJugador().getIdJugador());
            item.put("estado", a.getEstado());
            response.add(item);
        }
        return response;
    }
}
