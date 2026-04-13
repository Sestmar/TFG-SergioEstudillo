package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.EnviarMensajeDto;
import com.DAMUnitedFC.backend_tfg.dto.MensajeDto;
import com.DAMUnitedFC.backend_tfg.model.Entrenador;
import com.DAMUnitedFC.backend_tfg.model.Equipo;
import com.DAMUnitedFC.backend_tfg.model.Jugador;
import com.DAMUnitedFC.backend_tfg.model.Mensaje;
import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.MensajeRepository;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MensajeRepository mensajeRepository;
    private final UsuarioRepository usuarioRepository;
    private final EquipoRepository equipoRepository;
    private final JugadorRepository jugadorRepository;
    private final NotificationService notificationService;

    @Transactional
    public MensajeDto enviarMensaje(String emailRemitente, EnviarMensajeDto dto) {
        Usuario remitente = usuarioRepository.findByEmail(emailRemitente)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + emailRemitente));

        Mensaje mensaje = new Mensaje();
        mensaje.setRemitente(remitente);
        mensaje.setContenido(dto.getContenido());
        mensaje.setFechaHora(LocalDateTime.now());

        if (dto.getEquipoId() != null) {
            Equipo equipo = equipoRepository.findById(dto.getEquipoId())
                    .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));
            mensaje.setEquipo(equipo);
        } else if (dto.getDestinatarioId() != null) {
            Usuario destinatario = usuarioRepository.findById(dto.getDestinatarioId())
                    .orElseThrow(() -> new RuntimeException("Destinatario no encontrado"));
            mensaje.setDestinatario(destinatario);
        }

        MensajeDto guardado = toDto(mensajeRepository.save(mensaje));

        String preview = mensaje.getContenido().length() > 80
                ? mensaje.getContenido().substring(0, 80) + "..."
                : mensaje.getContenido();
        String senderName = remitente.getNombre();

        if (mensaje.getDestinatario() != null) {
            // Mensaje privado — push solo al destinatario
            notificationService.send(
                    mensaje.getDestinatario(),
                    "💬 Nuevo mensaje de " + senderName,
                    preview
            );
        } else if (mensaje.getEquipo() != null) {
            // Mensaje de equipo — broadcast a todos los miembros excepto el remitente
            broadcastEquipo(mensaje.getEquipo(), remitente, senderName, preview);
        }

        return guardado;
    }

    private void broadcastEquipo(Equipo equipo, Usuario remitente, String senderName, String preview) {
        String title = "💬 " + senderName + " en " + equipo.getNombre();

        // Notificar a los jugadores del equipo (excepto el remitente)
        List<Jugador> jugadores = jugadorRepository.findByEquipoPrincipal_IdEquipo(equipo.getIdEquipo());
        for (Jugador jugador : jugadores) {
            Usuario destinatario = jugador.getUsuario();
            if (destinatario == null || destinatario.getIdUsuario().equals(remitente.getIdUsuario())) {
                continue;
            }
            notificationService.send(destinatario, title, preview);
        }

        // Notificar al entrenador del equipo (excepto si es el remitente)
        Entrenador entrenador = equipo.getEntrenador();
        if (entrenador != null && entrenador.getUsuario() != null
                && !entrenador.getUsuario().getIdUsuario().equals(remitente.getIdUsuario())) {
            notificationService.send(entrenador.getUsuario(), title, preview);
        }
    }

    public List<MensajeDto> listarPorEquipo(Integer idEquipo) {
        return mensajeRepository.findByEquipo_IdEquipoOrderByFechaHoraAsc(idEquipo)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<MensajeDto> listarPrivados(Integer idUsuario1, Integer idUsuario2) {
        Usuario u1 = usuarioRepository.findById(idUsuario1)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Usuario u2 = usuarioRepository.findById(idUsuario2)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return mensajeRepository
                .findByRemitenteAndDestinatarioOrDestinatarioAndRemitenteOrderByFechaHoraAsc(u1, u2, u1, u2)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public long contarNoLeidos(Integer idUsuario) {
        return mensajeRepository.findByDestinatario_IdUsuarioAndLeidoFalse(idUsuario).size();
    }

    @Transactional
    public void marcarLeidos(Integer idUsuario) {
        List<Mensaje> noLeidos = mensajeRepository.findByDestinatario_IdUsuarioAndLeidoFalse(idUsuario);
        noLeidos.forEach(m -> m.setLeido(true));
        mensajeRepository.saveAll(noLeidos);
    }

    public MensajeDto toDto(Mensaje m) {
        MensajeDto dto = new MensajeDto();
        dto.setId(m.getId());
        dto.setRemitenteId(m.getRemitente().getIdUsuario());
        dto.setRemitenteNombre(m.getRemitente().getNombre());
        dto.setRemitenteApellidos(m.getRemitente().getApellidos());
        dto.setRemitenteFotoUrl(m.getRemitente().getFotoUrl());
        if (m.getEquipo() != null) dto.setEquipoId(m.getEquipo().getIdEquipo());
        if (m.getDestinatario() != null) dto.setDestinatarioId(m.getDestinatario().getIdUsuario());
        dto.setContenido(m.getContenido());
        dto.setFechaHora(m.getFechaHora());
        dto.setLeido(m.isLeido());
        return dto;
    }
}
