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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
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
        mensaje.setContenido(dto.contenido());
        mensaje.setFechaHora(LocalDateTime.now());

        if (dto.equipoId() != null) {
            Equipo equipo = equipoRepository.findById(dto.equipoId())
                    .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));
            mensaje.setEquipo(equipo);
        } else if (dto.destinatarioId() != null) {
            Usuario destinatario = usuarioRepository.findById(dto.destinatarioId())
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
                    preview,
                    Map.of("route", "/chat", "type", "CHAT")
            );
        } else if (mensaje.getEquipo() != null) {
            // Mensaje de equipo — broadcast a todos los miembros excepto el remitente
            broadcastEquipo(mensaje.getEquipo(), remitente, senderName, preview);
        }

        return guardado;
    }

    private void broadcastEquipo(Equipo equipo, Usuario remitente, String senderName, String preview) {
        String title = "💬 " + senderName + " en " + equipo.getNombre();
        Map<String, String> chatData = Map.of("route", "/chat", "type", "CHAT");

        // Notificar a los jugadores del equipo (excepto el remitente)
        List<Jugador> jugadores = jugadorRepository.findByEquipoPrincipal_IdEquipo(equipo.getIdEquipo());
        for (Jugador jugador : jugadores) {
            Usuario destinatario = jugador.getUsuario();
            if (destinatario == null || destinatario.getIdUsuario().equals(remitente.getIdUsuario())) {
                continue;
            }
            notificationService.send(destinatario, title, preview, chatData);
        }

        // Notificar al entrenador del equipo (excepto si es el remitente)
        Entrenador entrenador = equipo.getEntrenador();
        if (entrenador != null && entrenador.getUsuario() != null
                && !entrenador.getUsuario().getIdUsuario().equals(remitente.getIdUsuario())) {
            notificationService.send(entrenador.getUsuario(), title, preview, chatData);
        }
    }

    public void validarMembresiaEquipo(Integer idEquipo, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean esAdmin = usuario.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (esAdmin) return;

        boolean esJugadorDelEquipo = jugadorRepository.findByEquipoPrincipal_IdEquipo(idEquipo)
                .stream()
                .anyMatch(j -> j.getUsuario() != null && email.equals(j.getUsuario().getEmail()));
        if (esJugadorDelEquipo) return;

        Equipo equipo = equipoRepository.findById(idEquipo)
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));
        boolean esEntrenadorDelEquipo = equipo.getEntrenador() != null
                && equipo.getEntrenador().getUsuario() != null
                && email.equals(equipo.getEntrenador().getUsuario().getEmail());
        if (esEntrenadorDelEquipo) return;

        throw new AccessDeniedException("No pertenecés a este equipo.");
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
        return new MensajeDto(
                m.getId(),
                m.getRemitente().getIdUsuario(),
                m.getRemitente().getNombre(),
                m.getRemitente().getApellidos(),
                m.getRemitente().getFotoUrl(),
                m.getEquipo() != null ? m.getEquipo().getIdEquipo() : null,
                m.getDestinatario() != null ? m.getDestinatario().getIdUsuario() : null,
                m.getContenido(),
                m.getFechaHora(),
                m.isLeido()
        );
    }
}
