package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.EntrenadorDto;
import com.DAMUnitedFC.backend_tfg.model.*;
import com.DAMUnitedFC.backend_tfg.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.util.*;

@RestController
@RequestMapping("/api/entrenadores")
@CrossOrigin(origins = "*")
public class EntrenadorController {

    private final EntrenadorRepository repo;
    private final UsuarioRepository usuarioRepo;
    private final EquipoRepository equipoRepo;
    private final EquipoEntrenadorRepository equipoEntrenadorRepo;

    @Autowired private PartidoRepository partidoRepo;
    @Autowired private AsistenciaRepository asistenciaRepo;
    @Autowired private AlineacionRepository alineacionRepo;
    @Autowired private JugadorRepository jugadorRepo;

    @Autowired
    public EntrenadorController(EntrenadorRepository repo,
                                UsuarioRepository usuarioRepo,
                                EquipoRepository equipoRepo,
                                EquipoEntrenadorRepository equipoEntrenadorRepo) {
        this.repo = repo;
        this.usuarioRepo = usuarioRepo;
        this.equipoRepo = equipoRepo;
        this.equipoEntrenadorRepo = equipoEntrenadorRepo;
    }

    // --- CRUD BÁSICO ---

    @GetMapping
    public List<Entrenador> listar() {
        return repo.findAll();
    }

    @GetMapping("/sin-equipo")
    public ResponseEntity<List<Entrenador>> listarSinEquipo() {
        return ResponseEntity.ok(repo.findEntrenadoresSinEquipo());
    }

    @GetMapping("/{id}")
    public Entrenador obtener(@PathVariable Integer id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));
    }

    @PostMapping
    public Entrenador crear(@RequestBody EntrenadorDto dto) {
        Entrenador e = new Entrenador();
        e.setUsuario(usuarioRepo.findById(dto.getIdUsuario()).orElseThrow(() -> new RuntimeException("Usuario no encontrado")));
        e.setEspecialidad(dto.getEspecialidad());
        e.setLicencia(dto.getLicencia());
        e.setTelefonoContacto(dto.getTelefonoContacto());

        if (dto.getFechaAlta() != null) {
            e.setFechaAlta(Date.valueOf(dto.getFechaAlta()));
        } else {
            e.setFechaAlta(new Date(System.currentTimeMillis()));
        }
        return repo.save(e);
    }

    @PutMapping("/{id}")
    public Entrenador actualizar(@PathVariable Integer id, @RequestBody EntrenadorDto dto) {
        Entrenador e = repo.findById(id).orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));
        if(dto.getIdUsuario() != null) {
            e.setUsuario(usuarioRepo.findById(dto.getIdUsuario()).orElseThrow(() -> new RuntimeException("Usuario no encontrado")));
        }
        e.setEspecialidad(dto.getEspecialidad());
        e.setLicencia(dto.getLicencia());
        e.setTelefonoContacto(dto.getTelefonoContacto());
        if (dto.getFechaAlta() != null) {
            e.setFechaAlta(Date.valueOf(dto.getFechaAlta()));
        }
        return repo.save(e);
    }

    @DeleteMapping("/{id}")
    public void borrar(@PathVariable Integer id) {
        repo.deleteById(id);
    }

    // --- LOGICA DE EQUIPO Y ROL ---

    @GetMapping("/usuario/{idUsuario}/equipo")
    public ResponseEntity<?> getEquipoDelUsuario(@PathVariable Integer idUsuario) {
        Optional<Entrenador> entrenadorOpt = repo.findByUsuario_IdUsuario(idUsuario);
        if (entrenadorOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Este usuario no es entrenador.");
        }
        Entrenador entrenador = entrenadorOpt.get();

        // 1. Buscar en Staff
        List<EquipoEntrenador> staffAssignments = equipoEntrenadorRepo.findByEntrenador_IdEntrenador(entrenador.getIdEntrenador());
        if (!staffAssignments.isEmpty()) {
            EquipoEntrenador asignacion = staffAssignments.get(0);
            Map<String, Object> response = new HashMap<>();
            response.put("equipo", asignacion.getEquipo());
            response.put("rol", asignacion.getRol());
            response.put("entrenadorId", entrenador.getIdEntrenador());
            return ResponseEntity.ok(response);
        }

        // 2. Buscar como Jefe Directo
        Optional<Equipo> equipoJefe = equipoRepo.findByEntrenador_Usuario_IdUsuario(idUsuario);
        if (equipoJefe.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("equipo", equipoJefe.get());
            response.put("rol", "Entrenador Principal");
            response.put("entrenadorId", entrenador.getIdEntrenador());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(404).body("Sin asignación de equipo.");
    }

    // 🔥 ESTADÍSTICAS PRO
    @GetMapping("/{idEntrenador}/estadisticas-equipo")
    public ResponseEntity<Map<String, Object>> getEstadisticasEquipo(@PathVariable Integer idEntrenador) {
        Map<String, Object> response = new HashMap<>();

        List<EquipoEntrenador> vinculaciones = equipoEntrenadorRepo.findByEntrenador_IdEntrenador(idEntrenador);
        if (vinculaciones.isEmpty()) {
            // Intento fallback por si es entrenador directo
            Optional<Equipo> eqOpt = equipoRepo.findByEntrenador_IdEntrenador(idEntrenador);
            if (eqOpt.isEmpty()) return ResponseEntity.badRequest().body(Collections.singletonMap("error", "No tienes equipo asignado."));

            Equipo equipoDirecto = eqOpt.get();
            response.put("equipoNombre", equipoDirecto.getNombre());
            return procesarEstadisticasPro(equipoDirecto.getIdEquipo(), response);
        }

        Equipo equipo = vinculaciones.get(0).getEquipo();
        response.put("equipoNombre", equipo.getNombre());

        return procesarEstadisticasPro(equipo.getIdEquipo(), response);
    }

    private ResponseEntity<Map<String, Object>> procesarEstadisticasPro(Integer equipoId, Map<String, Object> response) {
        Long equipoIdLong = Long.valueOf(equipoId);

        // A. Obtener TODOS los entrenamientos (recientes primero)
        List<Partido> todosEventos = partidoRepo.findByEquipo_IdEquipoOrderByFechaHoraAsc(equipoIdLong);
        List<Partido> entrenamientos = todosEventos.stream()
                .filter(p -> "TRAINING".equals(p.getTipo()))
                .sorted((a, b) -> b.getFechaHora().compareTo(a.getFechaHora()))
                .toList();

        long totalEntrenamientos = entrenamientos.size();
        List<Partido> ultimos5Entrenos = entrenamientos.stream().limit(5).toList();

        // B. Iterar Jugadores
        List<Jugador> jugadores = jugadorRepo.findByEquipoPrincipal_IdEquipo(equipoId);
        List<Map<String, Object>> listaStats = new ArrayList<>();

        for (Jugador j : jugadores) {
            Map<String, Object> stat = new HashMap<>();
            stat.put("id", j.getIdJugador());

            // Datos básicos seguros
            String nombre = (j.getUsuario() != null) ? j.getUsuario().getNombre() : "Jugador";
            String apellidos = (j.getUsuario() != null) ? j.getUsuario().getApellidos() : "";
            String foto = (j.getUsuario() != null) ? j.getUsuario().getFotoUrl() : null;

            stat.put("nombre", nombre);
            stat.put("apellidos", apellidos);
            stat.put("fotoUrl", foto);
            stat.put("posicion", j.getPosicion());

            // --- 1. ESTADÍSTICAS DE JUEGO (Minutos y Partidos) ---
            List<Alineacion> alineaciones = alineacionRepo.findByJugador(j);

            int goles = alineaciones.stream().mapToInt(a -> a.getGoles() == null ? 0 : a.getGoles()).sum();
            int minutosTotales = alineaciones.stream().mapToInt(a -> a.getMinutosJugados() == null ? 0 : a.getMinutosJugados()).sum();
            long partidosJugados = alineaciones.stream().filter(a -> a.getMinutosJugados() != null && a.getMinutosJugados() > 0).count();
            int promedioMinutos = partidosJugados > 0 ? (int) (minutosTotales / partidosJugados) : 0;

            stat.put("goles", goles);
            stat.put("minutos", minutosTotales);
            stat.put("partidosJugados", partidosJugados);
            stat.put("promedioMinutos", promedioMinutos);

            // --- 2. ESTADÍSTICAS DE ASISTENCIA ---
            List<Asistencia> asistenciasJugador = asistenciaRepo.findByJugador(j);

            long asistidosTotal = asistenciasJugador.stream().filter(a -> "PRESENT".equals(a.getEstado())).count();
            double pctGlobal = totalEntrenamientos > 0 ? ((double) asistidosTotal / totalEntrenamientos) * 100 : 0.0;
            stat.put("asistenciaPct", Math.round(pctGlobal));
            stat.put("entrenosAsistidos", asistidosTotal);

            // Historial Visual
            List<String> historial = new ArrayList<>();
            for (Partido entreno : ultimos5Entrenos) {
                Optional<Asistencia> asis = asistenciaRepo.findByIdEntrenamientoAndJugador(entreno.getIdPartido(), j);
                if (asis.isPresent()) {
                    historial.add(asis.get().getEstado());
                } else {
                    historial.add("UNKNOWN");
                }
            }
            Collections.reverse(historial); // [Antiguo -> Nuevo]
            stat.put("historialAsistencia", historial);

            listaStats.add(stat);
        }

        response.put("totalEntrenamientos", totalEntrenamientos);
        response.put("jugadores", listaStats);

        return ResponseEntity.ok(response);
    }
}