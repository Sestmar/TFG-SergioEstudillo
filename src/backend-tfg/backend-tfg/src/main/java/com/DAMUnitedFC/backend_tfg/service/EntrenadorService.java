package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.EntrenadorDto;
import com.DAMUnitedFC.backend_tfg.model.*;
import com.DAMUnitedFC.backend_tfg.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.util.*;

@Service
public class EntrenadorService {

    private final EntrenadorRepository repo;
    private final UsuarioRepository usuarioRepo;
    private final EquipoRepository equipoRepo;
    private final EquipoEntrenadorRepository equipoEntrenadorRepo;
    private final PartidoRepository partidoRepo;
    private final AsistenciaRepository asistenciaRepo;
    private final AlineacionRepository alineacionRepo;
    private final JugadorRepository jugadorRepo;

    public EntrenadorService(EntrenadorRepository repo,
                             UsuarioRepository usuarioRepo,
                             EquipoRepository equipoRepo,
                             EquipoEntrenadorRepository equipoEntrenadorRepo,
                             PartidoRepository partidoRepo,
                             AsistenciaRepository asistenciaRepo,
                             AlineacionRepository alineacionRepo,
                             JugadorRepository jugadorRepo) {
        this.repo = repo;
        this.usuarioRepo = usuarioRepo;
        this.equipoRepo = equipoRepo;
        this.equipoEntrenadorRepo = equipoEntrenadorRepo;
        this.partidoRepo = partidoRepo;
        this.asistenciaRepo = asistenciaRepo;
        this.alineacionRepo = alineacionRepo;
        this.jugadorRepo = jugadorRepo;
    }

    public List<Entrenador> listar() {
        return repo.findAll();
    }

    public List<Entrenador> listarSinEquipo() {
        return repo.findEntrenadoresSinEquipo();
    }

    public Entrenador obtener(Integer id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));
    }

    public Entrenador crear(EntrenadorDto dto) {
        Entrenador e = new Entrenador();
        e.setUsuario(usuarioRepo.findById(dto.getIdUsuario()).orElseThrow(() -> new RuntimeException("Usuario no encontrado")));
        e.setEspecialidad(dto.getEspecialidad());
        e.setLicencia(dto.getLicencia());
        e.setTelefonoContacto(dto.getTelefonoContacto());
        e.setFechaAlta(dto.getFechaAlta() != null ? Date.valueOf(dto.getFechaAlta()) : new Date(System.currentTimeMillis()));
        return repo.save(e);
    }

    public Entrenador actualizar(Integer id, EntrenadorDto dto) {
        Entrenador e = repo.findById(id).orElseThrow(() -> new RuntimeException("Entrenador no encontrado"));
        if (dto.getIdUsuario() != null) {
            e.setUsuario(usuarioRepo.findById(dto.getIdUsuario()).orElseThrow(() -> new RuntimeException("Usuario no encontrado")));
        }
        e.setEspecialidad(dto.getEspecialidad());
        e.setLicencia(dto.getLicencia());
        e.setTelefonoContacto(dto.getTelefonoContacto());
        if (dto.getFechaAlta() != null) e.setFechaAlta(Date.valueOf(dto.getFechaAlta()));
        return repo.save(e);
    }

    public void borrar(Integer id) {
        repo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Map<String, Object>> getEquipoDelUsuario(Integer idUsuario) {
        Optional<Entrenador> entrenadorOpt = repo.findByUsuario_IdUsuario(idUsuario);
        if (entrenadorOpt.isEmpty()) return Optional.empty();

        Entrenador entrenador = entrenadorOpt.get();

        List<EquipoEntrenador> staffAssignments = equipoEntrenadorRepo.findByEntrenador_IdEntrenador(entrenador.getIdEntrenador());
        if (!staffAssignments.isEmpty()) {
            EquipoEntrenador asignacion = staffAssignments.get(0);
            Map<String, Object> response = new HashMap<>();
            response.put("equipo", asignacion.getEquipo());
            response.put("rol", asignacion.getRol());
            response.put("entrenadorId", entrenador.getIdEntrenador());
            return Optional.of(response);
        }

        Optional<Equipo> equipoJefe = equipoRepo.findByEntrenador_Usuario_IdUsuario(idUsuario);
        if (equipoJefe.isPresent()) {
            Map<String, Object> response = new HashMap<>();
            response.put("equipo", equipoJefe.get());
            response.put("rol", "Entrenador Principal");
            response.put("entrenadorId", entrenador.getIdEntrenador());
            return Optional.of(response);
        }

        return Optional.empty();
    }

    public Optional<Map<String, Object>> getEstadisticasEquipo(Integer idEntrenador) {
        Map<String, Object> response = new HashMap<>();

        List<EquipoEntrenador> vinculaciones = equipoEntrenadorRepo.findByEntrenador_IdEntrenador(idEntrenador);
        if (vinculaciones.isEmpty()) {
            Optional<Equipo> eqOpt = equipoRepo.findByEntrenador_IdEntrenador(idEntrenador);
            if (eqOpt.isEmpty()) return Optional.empty();
            Equipo equipoDirecto = eqOpt.get();
            response.put("equipoNombre", equipoDirecto.getNombre());
            return Optional.of(procesarEstadisticasPro(equipoDirecto.getIdEquipo(), response));
        }

        Equipo equipo = vinculaciones.get(0).getEquipo();
        response.put("equipoNombre", equipo.getNombre());
        return Optional.of(procesarEstadisticasPro(equipo.getIdEquipo(), response));
    }

    private Map<String, Object> procesarEstadisticasPro(Integer equipoId, Map<String, Object> response) {
        Long equipoIdLong = Long.valueOf(equipoId);

        List<Partido> todosEventos = partidoRepo.findByEquipo_IdEquipoOrderByFechaHoraAsc(equipoIdLong);
        List<Partido> entrenamientos = todosEventos.stream()
                .filter(p -> "TRAINING".equals(p.getTipo()))
                .sorted((a, b) -> b.getFechaHora().compareTo(a.getFechaHora()))
                .toList();

        long totalEntrenamientos = entrenamientos.size();
        List<Partido> ultimos5Entrenos = entrenamientos.stream().limit(5).toList();

        List<Jugador> jugadores = jugadorRepo.findByEquipoPrincipal_IdEquipo(equipoId);
        List<Map<String, Object>> listaStats = new ArrayList<>();

        for (Jugador j : jugadores) {
            Map<String, Object> stat = new HashMap<>();
            stat.put("id", j.getIdJugador());
            stat.put("nombre", j.getUsuario() != null ? j.getUsuario().getNombre() : "Jugador");
            stat.put("apellidos", j.getUsuario() != null ? j.getUsuario().getApellidos() : "");
            stat.put("fotoUrl", j.getUsuario() != null ? j.getUsuario().getFotoUrl() : null);
            stat.put("posicion", j.getPosicion());

            List<Alineacion> alineaciones = alineacionRepo.findByJugador(j);
            int minutosTotales = alineaciones.stream().mapToInt(a -> a.getMinutosJugados() == null ? 0 : a.getMinutosJugados()).sum();
            long partidosJugados = alineaciones.stream().filter(a -> a.getMinutosJugados() != null && a.getMinutosJugados() > 0).count();

            stat.put("goles", alineaciones.stream().mapToInt(a -> a.getGoles() == null ? 0 : a.getGoles()).sum());
            stat.put("minutos", minutosTotales);
            stat.put("partidosJugados", partidosJugados);
            stat.put("promedioMinutos", partidosJugados > 0 ? (int) (minutosTotales / partidosJugados) : 0);

            List<Asistencia> asistenciasJugador = asistenciaRepo.findByJugador(j);
            long asistidosTotal = asistenciasJugador.stream().filter(a -> "PRESENT".equals(a.getEstado())).count();
            double pctGlobal = totalEntrenamientos > 0 ? ((double) asistidosTotal / totalEntrenamientos) * 100 : 0.0;
            stat.put("asistenciaPct", Math.round(pctGlobal));
            stat.put("entrenosAsistidos", asistidosTotal);

            List<String> historial = new ArrayList<>();
            for (Partido entreno : ultimos5Entrenos) {
                Optional<Asistencia> asis = asistenciaRepo.findByIdEntrenamientoAndJugador(entreno.getIdPartido(), j);
                historial.add(asis.map(Asistencia::getEstado).orElse("UNKNOWN"));
            }
            Collections.reverse(historial);
            stat.put("historialAsistencia", historial);

            listaStats.add(stat);
        }

        response.put("totalEntrenamientos", totalEntrenamientos);
        response.put("jugadores", listaStats);
        return response;
    }
}
