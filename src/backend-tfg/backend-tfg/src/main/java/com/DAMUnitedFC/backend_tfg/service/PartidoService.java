package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.ActaDto;
import com.DAMUnitedFC.backend_tfg.model.Entrenador;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.model.Partido;
import com.DAMUnitedFC.backend_tfg.repository.AlineacionRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.PartidoRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PartidoService {

    private static final Logger log = LoggerFactory.getLogger(PartidoService.class);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final PartidoRepository partidoRepo;
    private final AlineacionRepository alineacionRepo;
    private final JugadorRepository jugadorRepo;
    private final NotificationService notificationService;

    public PartidoService(PartidoRepository partidoRepo,
                          AlineacionRepository alineacionRepo,
                          JugadorRepository jugadorRepo,
                          NotificationService notificationService) {
        this.partidoRepo = partidoRepo;
        this.alineacionRepo = alineacionRepo;
        this.jugadorRepo = jugadorRepo;
        this.notificationService = notificationService;
    }

    @Transactional
    public Partido crear(Partido partido) {
        log.info("Creando nuevo partido: {} vs {}", partido.getEquipo() != null ? partido.getEquipo().getNombre() : "N/A", partido.getRival());
        Partido guardado = partidoRepo.save(partido);

        // Notificar a los jugadores del equipo — el fallo NO debe interrumpir el guardado
        try {
            if (guardado.getEquipo() != null) {
                Integer idEquipo = guardado.getEquipo().getIdEquipo();
                log.info("Buscando jugadores para el equipo ID: {}", idEquipo);
                List<Jugador> jugadores = jugadorRepo.findByEquipoPrincipal_IdEquipo(idEquipo);
                log.info("Se encontraron {} jugadores para notificar", jugadores.size());

                String rival = guardado.getRival() != null ? guardado.getRival() : "por confirmar";
                String lugar = guardado.getLugar() != null ? guardado.getLugar() : "por confirmar";
                String fechaHora = guardado.getFechaHora() != null
                        ? guardado.getFechaHora().format(FORMATTER)
                        : "por confirmar";

                String title = "⚽ Nuevo partido confirmado";
                String body = String.format("🆚 %s | 📍 %s | 📅 %s\nConfirma tu asistencia en la app.", rival, lugar, fechaHora);
                Map<String, String> matchData = Map.of(
                        "route", "/match-detail/" + guardado.getIdPartido(),
                        "type", "MATCH"
                );

                for (Jugador jugador : jugadores) {
                    if (jugador.getUsuario() != null) {
                        log.info("Notificando a jugador ID {}", jugador.getIdJugador());
                        notificationService.send(jugador.getUsuario(), title, body, matchData);
                    } else {
                        log.warn("Jugador ID {} sin usuario asociado — se omite", jugador.getIdJugador());
                    }
                }

                // Notificar también al entrenador del equipo
                Entrenador entrenador = guardado.getEquipo().getEntrenador();
                if (entrenador != null && entrenador.getUsuario() != null) {
                    log.info("Notificando a entrenador ID {}", entrenador.getIdEntrenador());
                    notificationService.send(entrenador.getUsuario(), title, body, matchData);
                }

                log.info("Proceso de notificaciones finalizado para partido {}", guardado.getIdPartido());
            } else {
                log.warn("El partido no tiene un equipo asociado; no se enviarán notificaciones");
            }
        } catch (Exception e) {
            log.error("Error crítico procesando notificaciones WhatsApp para partido {}: {}",
                    guardado.getIdPartido(), e.getMessage(), e);
        }

        return guardado;
    }
    public List<Partido> listarPorEquipo(Long idEquipo) {
        return partidoRepo.findByEquipo_IdEquipoOrderByFechaHoraAsc(idEquipo);
    }

    public Optional<Partido> obtener(Long id) {
        return partidoRepo.findById(id);
    }

    public Optional<Partido> actualizar(Long id, Map<String, Object> updates) {
        return partidoRepo.findById(id).map(partido -> {
            if (updates.containsKey("rival")) partido.setRival((String) updates.get("rival"));
            if (updates.containsKey("lugar")) partido.setLugar((String) updates.get("lugar"));
            if (updates.containsKey("competicion")) partido.setCompeticion((String) updates.get("competicion"));
            if (updates.containsKey("escudoRivalUrl")) partido.setEscudoRivalUrl((String) updates.get("escudoRivalUrl"));
            return partidoRepo.save(partido);
        });
    }

    @Transactional
    public void cerrarActa(ActaDto acta) {
        Partido p = partidoRepo.findById(acta.getIdPartido())
                .orElseThrow(() -> new RuntimeException("Partido no encontrado"));

        p.setGolesFavor(acta.getGolesFavor());
        p.setGolesContra(acta.getGolesContra());
        p.setEstado("FINALIZADO");
        partidoRepo.save(p);

        for (ActaDto.PlayerStatUpdateDto stat : acta.getEstadisticas()) {
            alineacionRepo.findFichaExacta(acta.getIdPartido(), Math.toIntExact(stat.getIdJugador()))
                    .ifPresent(ficha -> {
                        ficha.setGoles(stat.getGoles() != null ? stat.getGoles() : 0);
                        ficha.setAsistencias(stat.getAsistencias() != null ? stat.getAsistencias() : 0);
                        ficha.setMinutosJugados(stat.getMinutos() != null ? stat.getMinutos() : 0);
                        ficha.setTarjetaAmarilla(stat.getAmarilla() != null ? stat.getAmarilla() : false);
                        ficha.setTarjetaRoja(stat.getRoja() != null ? stat.getRoja() : false);
                        alineacionRepo.save(ficha);
                    });
        }
    }
}
