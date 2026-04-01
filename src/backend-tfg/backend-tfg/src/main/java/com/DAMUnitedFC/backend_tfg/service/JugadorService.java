package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.EstadisticasJugadorDto;
import com.DAMUnitedFC.backend_tfg.dto.JugadorDto;
import com.DAMUnitedFC.backend_tfg.dto.PlayerHistoryDto;
import com.DAMUnitedFC.backend_tfg.model.Alineacion;
import com.DAMUnitedFC.backend_tfg.model.ConvocatoriaJugador;
import com.DAMUnitedFC.backend_tfg.model.Equipo;
import com.DAMUnitedFC.backend_tfg.model.Incidencia;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.repository.AlineacionRepository;
import com.DAMUnitedFC.backend_tfg.repository.ConvocatoriaJugadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import com.DAMUnitedFC.backend_tfg.repository.IncidenciaRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class JugadorService {

    private final JugadorRepository jugadorRepo;
    private final UsuarioRepository usuarioRepo;
    private final EquipoRepository equipoRepo;
    private final AlineacionRepository alineacionRepo;
    private final ConvocatoriaJugadorRepository convocatoriaJugadorRepo;
    private final IncidenciaRepository incidenciaRepo;

    public JugadorService(JugadorRepository jugadorRepo,
                          UsuarioRepository usuarioRepo,
                          EquipoRepository equipoRepo,
                          AlineacionRepository alineacionRepo,
                          ConvocatoriaJugadorRepository convocatoriaJugadorRepo,
                          IncidenciaRepository incidenciaRepo) {
        this.jugadorRepo = jugadorRepo;
        this.usuarioRepo = usuarioRepo;
        this.equipoRepo = equipoRepo;
        this.alineacionRepo = alineacionRepo;
        this.convocatoriaJugadorRepo = convocatoriaJugadorRepo;
        this.incidenciaRepo = incidenciaRepo;
    }

    public List<Jugador> listar() {
        return jugadorRepo.findAll();
    }

    public Jugador obtener(Integer id) {
        return jugadorRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Jugador no encontrado"));
    }

    public Jugador crear(JugadorDto dto) {
        return guardarOActualizar(new Jugador(), dto);
    }

    public Jugador actualizar(Integer id, JugadorDto dto) {
        Jugador j = jugadorRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Jugador no encontrado"));
        return guardarOActualizar(j, dto);
    }

    public void borrar(Integer id) {
        jugadorRepo.deleteById(id);
    }

    public EstadisticasJugadorDto obtenerEstadisticas(Integer id) {
        Integer partidos = alineacionRepo.countPartidosJugados(id);
        Integer goles = alineacionRepo.sumGoles(id);
        Integer asistencias = alineacionRepo.sumAsistencias(id);
        Integer minutos = alineacionRepo.sumMinutos(id);

        return new EstadisticasJugadorDto(
                partidos != null ? partidos : 0,
                goles != null ? goles : 0,
                asistencias != null ? asistencias : 0,
                minutos != null ? minutos : 0
        );
    }

    public Optional<Equipo> getEquipoDelJugador(Integer idUsuario) {
        return jugadorRepo.findByUsuario_IdUsuario(idUsuario)
                .map(Jugador::getEquipoPrincipal);
    }

    public PlayerHistoryDto getHistorial(Integer id) {
        Jugador jugador = obtener(id);

        // Alineaciones
        List<Alineacion> alineaciones = alineacionRepo.findByJugador(jugador);

        // Totales calculados desde alineaciones
        int totalPartidos = alineaciones.size();
        int totalMinutos = alineaciones.stream().mapToInt(a -> a.getMinutosJugados() != null ? a.getMinutosJugados() : 0).sum();
        int totalGoles = alineaciones.stream().mapToInt(a -> a.getGoles() != null ? a.getGoles() : 0).sum();
        int totalAsistencias = alineaciones.stream().mapToInt(a -> a.getAsistencias() != null ? a.getAsistencias() : 0).sum();
        int totalAmarillas = (int) alineaciones.stream().filter(a -> Boolean.TRUE.equals(a.getTarjetaAmarilla())).count();
        int totalRojas = (int) alineaciones.stream().filter(a -> Boolean.TRUE.equals(a.getTarjetaRoja())).count();

        // Partidos historial
        List<PlayerHistoryDto.PartidoHistorialDto> partidos = alineaciones.stream()
                .map(a -> PlayerHistoryDto.PartidoHistorialDto.builder()
                        .idPartido(a.getPartido().getIdPartido())
                        .fechaHora(a.getPartido().getFechaHora())
                        .rival(a.getPartido().getRival())
                        .escudoRivalUrl(a.getPartido().getEscudoRivalUrl())
                        .competicion(a.getPartido().getCompeticion())
                        .golesFavor(a.getPartido().getGolesFavor())
                        .golesContra(a.getPartido().getGolesContra())
                        .estado(a.getPartido().getEstado())
                        .esTitular(a.getEsTitular())
                        .golesJugador(a.getGoles() != null ? a.getGoles() : 0)
                        .asistenciasJugador(a.getAsistencias() != null ? a.getAsistencias() : 0)
                        .minutosJugados(a.getMinutosJugados() != null ? a.getMinutosJugados() : 0)
                        .minutoEntrada(a.getMinutoEntrada())
                        .minutoSalida(a.getMinutoSalida())
                        .esCapitan(a.getEsCapitan())
                        .tarjetaAmarilla(Boolean.TRUE.equals(a.getTarjetaAmarilla()) ? 1 : 0)
                        .tarjetaRoja(Boolean.TRUE.equals(a.getTarjetaRoja()) ? 1 : 0)
                        .build())
                .collect(Collectors.toList());

        // Convocatorias
        List<ConvocatoriaJugador> convocatoriasJugador = convocatoriaJugadorRepo.findByJugadorId(id);
        List<PlayerHistoryDto.ConvocatoriaHistorialDto> convocatorias = convocatoriasJugador.stream()
                .map(cj -> PlayerHistoryDto.ConvocatoriaHistorialDto.builder()
                        .idConvocatoria(cj.getConvocatoria().getIdConvocatoria())
                        .fechaEvento(cj.getConvocatoria().getFechaEvento() != null
                                ? cj.getConvocatoria().getFechaEvento().toLocalDateTime()
                                : null)
                        .tipo(cj.getConvocatoria().getTipo())
                        .observaciones(cj.getConvocatoria().getObservaciones())
                        .build())
                .collect(Collectors.toList());

        // Incidencias
        List<Incidencia> incidenciasJugador = incidenciaRepo.findByJugadorId(id);
        List<PlayerHistoryDto.IncidenciaHistorialDto> incidencias = incidenciasJugador.stream()
                .map(i -> PlayerHistoryDto.IncidenciaHistorialDto.builder()
                        .idIncidencia(i.getIdIncidencia())
                        .fechaReporte(i.getFechaReporte() != null
                                ? i.getFechaReporte().toLocalDate().atStartOfDay()
                                : null)
                        .tipo(i.getTipo())
                        .estado(i.getEstado())
                        .descripcion(i.getDescripcion())
                        .build())
                .collect(Collectors.toList());

        // Nombre del equipo actual
        String equipoActual = jugador.getEquipoPrincipal() != null
                ? jugador.getEquipoPrincipal().getNombre()
                : null;

        // Nombre completo
        String nombreCompleto = jugador.getUsuario() != null
                ? (jugador.getUsuario().getNombre() + " " + jugador.getUsuario().getApellidos()).trim()
                : "";

        return PlayerHistoryDto.builder()
                .idJugador(jugador.getIdJugador())
                .nombreCompleto(nombreCompleto)
                .posicion(jugador.getPosicion())
                .dorsal(jugador.getDorsal())
                .estado(jugador.getEstado())
                .equipoActual(equipoActual)
                .partidosTotales(totalPartidos)
                .minutosJugados(totalMinutos)
                .goles(totalGoles)
                .asistencias(totalAsistencias)
                .tarjetasAmarillas(totalAmarillas)
                .tarjetasRojas(totalRojas)
                .partidos(partidos)
                .convocatorias(convocatorias)
                .incidencias(incidencias)
                .build();
    }

    private Jugador guardarOActualizar(Jugador j, JugadorDto dto) {
        if (dto.getIdUsuario() != null) {
            j.setUsuario(usuarioRepo.findById(dto.getIdUsuario().intValue())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado")));
        }

        j.setFechaNacimiento(dto.getFechaNacimiento() != null ? Date.valueOf(dto.getFechaNacimiento()) : null);
        j.setFechaAlta(dto.getFechaAlta() != null ? Date.valueOf(dto.getFechaAlta()) : null);
        j.setFechaBaja(dto.getFechaBaja() != null ? Date.valueOf(dto.getFechaBaja()) : null);
        j.setPosicion(dto.getPosicion());
        j.setDorsal(dto.getDorsal());
        j.setEstado(dto.getEstado());
        j.setTelefonoContacto(dto.getTelefonoContacto());
        j.setDireccion(dto.getDireccion());
        j.setObservaciones(dto.getObservaciones());

        if (dto.getEquipoPrincipal() != null) {
            j.setEquipoPrincipal(equipoRepo.findById(dto.getEquipoPrincipal().intValue()).orElse(null));
        } else {
            j.setEquipoPrincipal(null);
        }

        return jugadorRepo.save(j);
    }
}
