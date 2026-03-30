package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.model.Partido;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.PartidoRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@RequiredArgsConstructor
public class NotificacionScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificacionScheduler.class);
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final PartidoRepository partidoRepository;
    private final JugadorRepository jugadorRepository;
    private final WhatsAppService whatsAppService;

    /**
     * Ejecuta cada hora en punto.
     * Busca partidos cuya fechaHora esté entre 23h30 y 24h30 desde ahora
     * (ventana de 1h para no perder la ejecución) y envía recordatorio
     * por WhatsApp a cada jugador del equipo que tenga teléfono registrado.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void enviarRecordatorios24h() {
        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime ventanaInicio = ahora.plusHours(23).plusMinutes(30);
        LocalDateTime ventanaFin = ahora.plusHours(24).plusMinutes(30);

        log.info("Ejecutando recordatorio 24h — buscando partidos entre {} y {}", ventanaInicio, ventanaFin);

        List<Partido> partidos = partidoRepository.findByFechaHoraBetween(ventanaInicio, ventanaFin);

        if (partidos.isEmpty()) {
            log.info("No hay partidos en la ventana de 24h");
            return;
        }

        for (Partido partido : partidos) {
            if (partido.getEquipo() == null) {
                log.warn("Partido {} sin equipo asociado — se omite", partido.getIdPartido());
                continue;
            }

            Integer idEquipo = partido.getEquipo().getIdEquipo();
            List<Jugador> jugadores = jugadorRepository.findByEquipoPrincipal_IdEquipo(idEquipo);

            String fechaFormateada = partido.getFechaHora().format(FORMATTER);
            String rival = partido.getRival() != null ? partido.getRival() : "por confirmar";

            log.info("Enviando recordatorio del partido {} ({} vs {}) a {} jugadores",
                    partido.getIdPartido(), partido.getEquipo().getNombre(), rival, jugadores.size());

            for (Jugador jugador : jugadores) {
                String telefono = jugador.getUsuario() != null
                        ? jugador.getUsuario().getTelefono()
                        : null;

                if (telefono == null || telefono.isBlank()) {
                    log.debug("Jugador {} sin teléfono — se omite", jugador.getIdJugador());
                    continue;
                }

                whatsAppService.enviarRecordatorio(telefono, rival, fechaFormateada);
            }
        }
    }
}
