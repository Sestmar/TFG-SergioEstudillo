package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.AlineacionDto;
import com.DAMUnitedFC.backend_tfg.dto.AlineacionResponseDto;
import com.DAMUnitedFC.backend_tfg.dto.CerrarActaDto;
import com.DAMUnitedFC.backend_tfg.model.Alineacion;
import com.DAMUnitedFC.backend_tfg.model.Equipo;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.model.Partido;
import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.AlineacionRepository;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.PartidoRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AlineacionService {

    private final AlineacionRepository alineacionRepo;
    private final PartidoRepository partidoRepo;
    private final JugadorRepository jugadorRepo;
    private final EquipoRepository equipoRepo;

    public AlineacionService(AlineacionRepository alineacionRepo,
                             PartidoRepository partidoRepo,
                             JugadorRepository jugadorRepo,
                             EquipoRepository equipoRepo) {
        this.alineacionRepo = alineacionRepo;
        this.partidoRepo = partidoRepo;
        this.jugadorRepo = jugadorRepo;
        this.equipoRepo = equipoRepo;
    }

    public List<AlineacionResponseDto> getAlineacion(Long idPartido) {
        List<Alineacion> alineaciones = alineacionRepo.findByPartidoIdPartido(idPartido);
        List<AlineacionResponseDto> response = new ArrayList<>();

        for (Alineacion a : alineaciones) {
            AlineacionResponseDto dto = new AlineacionResponseDto();
            dto.setId(a.getId());
            dto.setIdPartido(a.getPartido().getIdPartido());

            if (a.getJugador() != null) {
                Jugador j = a.getJugador();
                dto.setIdJugador(j.getIdJugador());
                dto.setDorsal(j.getDorsal());
                dto.setPosicion(j.getPosicion());
                dto.setFotoUrl(j.getFotoUrl());
                if (j.getUsuario() != null) {
                    dto.setNombre(j.getUsuario().getNombre());
                    dto.setApellidos(j.getUsuario().getApellidos());
                    if (dto.getFotoUrl() == null) dto.setFotoUrl(j.getUsuario().getFotoUrl());
                }
            }

            dto.setSlotId(a.getSlotId());
            dto.setEsTitular(a.getEsTitular());
            dto.setGoles(a.getGoles());
            dto.setAsistencias(a.getAsistencias());
            dto.setMinutosJugados(a.getMinutosJugados());
            dto.setTarjetaAmarilla(a.getTarjetaAmarilla());
            dto.setTarjetaRoja(a.getTarjetaRoja());
            dto.setMinutoEntrada(a.getMinutoEntrada());
            dto.setMinutoSalida(a.getMinutoSalida());
            dto.setEsCapitan(a.getEsCapitan());
            dto.setEsLanzadorPenaltis(a.getEsLanzadorPenaltis());
            dto.setEsLanzadorFaltas(a.getEsLanzadorFaltas());

            response.add(dto);
        }
        return response;
    }

    @Transactional
    public void guardarAlineacion(Long idPartido, List<AlineacionDto> fichas) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Usuario usuarioActual) {
            boolean esAdmin = usuarioActual.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!esAdmin) {
                Partido pCheck = partidoRepo.findById(idPartido)
                        .orElseThrow(() -> new RuntimeException("Partido no encontrado"));
                Equipo equipoCheck = pCheck.getEquipo();
                if (equipoCheck == null
                        || equipoCheck.getEntrenador() == null
                        || equipoCheck.getEntrenador().getUsuario() == null
                        || !usuarioActual.getUsername().equals(equipoCheck.getEntrenador().getUsuario().getEmail())) {
                    throw new AccessDeniedException("No sos el entrenador de este equipo.");
                }
            }
        }

        alineacionRepo.deleteByPartidoIdPartido(idPartido);
        alineacionRepo.flush();

        if (fichas == null || fichas.isEmpty()) return;

        Partido p = partidoRepo.findById(idPartido)
                .orElseThrow(() -> new RuntimeException("Partido no encontrado"));

        for (AlineacionDto ficha : fichas) {
            if (ficha.idJugador() == null) continue;
            Jugador j = jugadorRepo.findById(ficha.idJugador()).orElseThrow();

            Alineacion alineacion = new Alineacion();
            alineacion.setPartido(p);
            alineacion.setJugador(j);

            if (j.getEquipoPrincipal() != null) {
                alineacion.setEquipo(j.getEquipoPrincipal());
            } else if (p.getEquipo() != null) {
                alineacion.setEquipo(p.getEquipo());
            }

            alineacion.setSlotId(ficha.slotId());
            alineacion.setEsTitular(ficha.slotId() == null || !ficha.slotId().startsWith("BENCH"));
            alineacion.setGoles(0);
            alineacion.setAsistencias(0);
            alineacion.setMinutosJugados(0);
            alineacion.setTarjetaAmarilla(false);
            alineacion.setTarjetaRoja(false);
            alineacion.setMinutoEntrada(0);
            alineacion.setEsCapitan(ficha.esCapitan() != null ? ficha.esCapitan() : false);
            alineacion.setEsLanzadorPenaltis(ficha.esLanzadorPenaltis() != null ? ficha.esLanzadorPenaltis() : false);
            alineacion.setEsLanzadorFaltas(ficha.esLanzadorFaltas() != null ? ficha.esLanzadorFaltas() : false);

            alineacionRepo.save(alineacion);
        }
    }

    @Transactional
    public void cerrarActa(CerrarActaDto dto) {
        Long idPartido = dto.idPartido();
        Integer golesFavor = dto.golesFavor() != null ? dto.golesFavor() : 0;
        Integer golesContra = dto.golesContra() != null ? dto.golesContra() : 0;

        Partido p = partidoRepo.findById(idPartido).orElseThrow();
        p.setGolesFavor(golesFavor);
        p.setGolesContra(golesContra);
        p.setEstado("FINALIZADO");
        partidoRepo.save(p);

        List<CerrarActaDto.EstadisticaDto> stats = dto.estadisticas();
        if (stats == null) return;

        for (CerrarActaDto.EstadisticaDto stat : stats) {
            Integer idJugador = stat.idJugador();
            Optional<Alineacion> fichaOpt = alineacionRepo.findFichaExacta(idPartido, idJugador);

            Alineacion alineacion;
            if (fichaOpt.isPresent()) {
                alineacion = fichaOpt.get();
            } else {
                alineacion = new Alineacion();
                alineacion.setPartido(p);
                Jugador j = jugadorRepo.findById(idJugador).orElseThrow();
                alineacion.setJugador(j);
                if (p.getEquipo() != null) alineacion.setEquipo(p.getEquipo());
                alineacion.setEsTitular(false);
                alineacion.setSlotId("BENCH_" + idJugador);
            }

            alineacion.setGoles(safeInt(stat.goles()));
            alineacion.setAsistencias(safeInt(stat.asistencias()));
            alineacion.setMinutosJugados(safeInt(stat.minutos()));
            alineacion.setMinutoEntrada(safeInt(stat.minutoEntrada()));
            alineacion.setMinutoSalida(safeInt(stat.minutoSalida()));
            alineacionRepo.save(alineacion);
        }
    }

    private Integer safeInt(Object value) {
        if (value == null) return 0;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof Long) return ((Long) value).intValue();
        if (value instanceof String) {
            try { return Integer.parseInt((String) value); } catch (NumberFormatException e) { return 0; }
        }
        if (value instanceof Boolean) return ((Boolean) value) ? 1 : 0;
        return 0;
    }
}
