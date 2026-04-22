package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.dto.EnviarMensajeDto;
import com.DAMUnitedFC.backend_tfg.dto.MensajeDto;
import com.DAMUnitedFC.backend_tfg.dto.MiembroPreviewDto;
import com.DAMUnitedFC.backend_tfg.dto.PaginaMensajesDto;
import com.DAMUnitedFC.backend_tfg.dto.ParentPreviewDto;
import com.DAMUnitedFC.backend_tfg.dto.ReaccionDto;
import com.DAMUnitedFC.backend_tfg.model.Reaccion;
import com.DAMUnitedFC.backend_tfg.repository.ReaccionRepository;
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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MensajeRepository mensajeRepository;
    private final UsuarioRepository usuarioRepository;
    private final EquipoRepository equipoRepository;
    private final JugadorRepository jugadorRepository;
    private final NotificationService notificationService;
    private final ReaccionRepository reaccionRepository;

    @Transactional
    public MensajeDto enviarMensaje(String emailRemitente, EnviarMensajeDto dto) {
        if ((dto.contenido() == null || dto.contenido().isBlank()) && dto.urlAdjunto() == null) {
            throw new IllegalArgumentException("El mensaje debe tener contenido o un adjunto.");
        }

        Usuario remitente = usuarioRepository.findByEmail(emailRemitente)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + emailRemitente));

        Mensaje mensaje = new Mensaje();
        mensaje.setRemitente(remitente);
        mensaje.setContenido(dto.contenido());

        // Validar que urlAdjunto sea una ruta interna del servidor para prevenir
        // que un cliente malintencionado inyecte URLs arbitrarias (data:, javascript:, SSRF).
        if (dto.urlAdjunto() != null) {
            String url = dto.urlAdjunto();
            boolean esUrlInterna = url.contains("/api/uploads/files/");
            if (!esUrlInterna) {
                throw new IllegalArgumentException("El adjunto referencia una URL no permitida.");
            }
        }

        mensaje.setUrlAdjunto(dto.urlAdjunto());
        mensaje.setTipoAdjunto(dto.tipoAdjunto());
        mensaje.setFechaHora(LocalDateTime.now());

        if (dto.parentId() != null) {
            mensajeRepository.findById(dto.parentId()).ifPresent(mensaje::setParent);
        }

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

        String preview = buildPreview(mensaje);
        String senderName = remitente.getNombre();

        // Notificaciones push de @menciones (solo en mensajes de equipo)
        if (mensaje.getEquipo() != null) {
            notificarMenciones(mensaje, getMiembroUsuarios(mensaje.getEquipo()));
        }

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

    public PaginaMensajesDto listarPorEquipoPaginado(Integer idEquipo, int page, int size) {
        Slice<Mensaje> slice = mensajeRepository
                .findByEquipo_IdEquipoOrderByFechaHoraDesc(idEquipo, PageRequest.of(page, size));
        List<MensajeDto> dtos = slice.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        Collections.reverse(dtos); // DESC → ASC para mostrar cronológicamente en el cliente
        return new PaginaMensajesDto(dtos, slice.hasNext());
    }

    public PaginaMensajesDto listarPrivadosPaginado(Integer idUsuario1, Integer idUsuario2, int page, int size) {
        Usuario u1 = usuarioRepository.findById(idUsuario1)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Usuario u2 = usuarioRepository.findById(idUsuario2)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Slice<Mensaje> slice = mensajeRepository
                .findByRemitenteAndDestinatarioOrDestinatarioAndRemitenteOrderByFechaHoraDesc(
                        u1, u2, u1, u2, PageRequest.of(page, size));
        List<MensajeDto> dtos = slice.getContent().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        Collections.reverse(dtos);
        return new PaginaMensajesDto(dtos, slice.hasNext());
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

    @Transactional
    public MensajeDto editarMensaje(Long id, String nuevoContenido, String emailEditor) {
        Mensaje mensaje = mensajeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mensaje no encontrado: " + id));

        if (!mensaje.getRemitente().getEmail().equals(emailEditor)) {
            throw new AccessDeniedException("No podés editar mensajes de otros usuarios.");
        }
        if (mensaje.isEliminado()) {
            throw new IllegalStateException("No se puede editar un mensaje eliminado.");
        }

        mensaje.setContenido(nuevoContenido);
        mensaje.setEditado(true);
        return toDto(mensajeRepository.save(mensaje));
    }

    @Transactional
    public MensajeDto eliminarMensaje(Long id, String emailEliminador) {
        Mensaje mensaje = mensajeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mensaje no encontrado: " + id));

        if (!mensaje.getRemitente().getEmail().equals(emailEliminador)) {
            throw new AccessDeniedException("No podés eliminar mensajes de otros usuarios.");
        }

        mensaje.setEliminado(true);
        mensaje.setContenido("Este mensaje fue eliminado.");
        mensaje.setUrlAdjunto(null);
        mensaje.setTipoAdjunto(null);
        return toDto(mensajeRepository.save(mensaje));
    }

    // ── Reacciones ──────────────────────────────────────────────────────────────

    /**
     * Añade o reemplaza la reacción del usuario en un mensaje.
     * Si el usuario ya reaccionó con el mismo emoji → lo quita (toggle).
     * Si reaccionó con otro emoji → lo reemplaza.
     */
    @Transactional
    public MensajeDto reaccionar(Long mensajeId, String emoji, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Mensaje mensaje = mensajeRepository.findById(mensajeId)
                .orElseThrow(() -> new RuntimeException("Mensaje no encontrado: " + mensajeId));

        reaccionRepository.findByMensaje_IdAndUsuario_IdUsuario(mensajeId, usuario.getIdUsuario())
                .ifPresentOrElse(
                        existing -> {
                            if (existing.getEmoji().equals(emoji)) {
                                reaccionRepository.delete(existing);   // mismo emoji → quitar
                            } else {
                                existing.setEmoji(emoji);              // distinto emoji → reemplazar
                                reaccionRepository.save(existing);
                            }
                        },
                        () -> {
                            Reaccion nueva = new Reaccion();
                            nueva.setMensaje(mensaje);
                            nueva.setUsuario(usuario);
                            nueva.setEmoji(emoji);
                            reaccionRepository.save(nueva);
                        }
                );

        reaccionRepository.flush();   // garantiza que toDto() ve el estado actualizado
        return toDto(mensaje);
    }

    /** Quita explícitamente la reacción del usuario (sin importar el emoji). */
    @Transactional
    public MensajeDto quitarReaccion(Long mensajeId, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Mensaje mensaje = mensajeRepository.findById(mensajeId)
                .orElseThrow(() -> new RuntimeException("Mensaje no encontrado: " + mensajeId));

        reaccionRepository.findByMensaje_IdAndUsuario_IdUsuario(mensajeId, usuario.getIdUsuario())
                .ifPresent(reaccionRepository::delete);

        reaccionRepository.flush();
        return toDto(mensaje);
    }

    // ── Miembros del equipo ─────────────────────────────────────────────────────

    public List<MiembroPreviewDto> getMiembrosEquipo(Integer idEquipo) {
        Equipo equipo = equipoRepository.findById(idEquipo)
                .orElseThrow(() -> new RuntimeException("Equipo no encontrado"));

        List<MiembroPreviewDto> result = new ArrayList<>();

        jugadorRepository.findByEquipoPrincipal_IdEquipo(idEquipo).forEach(j -> {
            if (j.getUsuario() != null) {
                Usuario u = j.getUsuario();
                result.add(new MiembroPreviewDto(u.getIdUsuario(), u.getNombre(), u.getApellidos(), u.getFotoUrl()));
            }
        });

        if (equipo.getEntrenador() != null && equipo.getEntrenador().getUsuario() != null) {
            Usuario u = equipo.getEntrenador().getUsuario();
            result.add(new MiembroPreviewDto(u.getIdUsuario(), u.getNombre(), u.getApellidos(), u.getFotoUrl()));
        }

        return result;
    }

    // ── Menciones ───────────────────────────────────────────────────────────────

    private List<Usuario> getMiembroUsuarios(Equipo equipo) {
        List<Usuario> result = new ArrayList<>();
        jugadorRepository.findByEquipoPrincipal_IdEquipo(equipo.getIdEquipo()).forEach(j -> {
            if (j.getUsuario() != null) result.add(j.getUsuario());
        });
        if (equipo.getEntrenador() != null && equipo.getEntrenador().getUsuario() != null) {
            result.add(equipo.getEntrenador().getUsuario());
        }
        return result;
    }

    private void notificarMenciones(Mensaje mensaje, List<Usuario> miembros) {
        String contenido = mensaje.getContenido();
        if (contenido == null || contenido.isBlank()) return;

        // Detecta @Nombre Apellidos — una o dos palabras tras el @
        Pattern p = Pattern.compile("@([A-Za-záéíóúüñÁÉÍÓÚÜÑ]+(?:\\s[A-Za-záéíóúüñÁÉÍÓÚÜÑ]+)?)");
        Matcher m = p.matcher(contenido);

        while (m.find()) {
            String mencionado = m.group(1).trim();
            String preview = contenido.length() > 80 ? contenido.substring(0, 80) + "..." : contenido;
            miembros.stream()
                    .filter(u -> !u.getIdUsuario().equals(mensaje.getRemitente().getIdUsuario()))
                    .filter(u -> (u.getNombre() + " " + u.getApellidos()).equalsIgnoreCase(mencionado))
                    .findFirst()
                    .ifPresent(u -> notificationService.send(
                            u,
                            "📣 " + mensaje.getRemitente().getNombre() + " te mencionó",
                            preview,
                            Map.of("route", "/chat", "type", "MENTION")
                    ));
        }
    }

    private String buildPreview(Mensaje mensaje) {
        if (mensaje.getContenido() != null && !mensaje.getContenido().isBlank()) {
            String c = mensaje.getContenido();
            return c.length() > 80 ? c.substring(0, 80) + "..." : c;
        }
        if ("IMAGEN".equals(mensaje.getTipoAdjunto())) return "📷 Ha enviado una imagen";
        if ("AUDIO".equals(mensaje.getTipoAdjunto()))  return "🎤 Ha enviado una nota de voz";
        if ("VIDEO".equals(mensaje.getTipoAdjunto()))  return "🎬 Ha enviado un vídeo";
        return "📎 Ha enviado un adjunto";
    }

    public MensajeDto toDto(Mensaje m) {
        // Agrupar reacciones por emoji; incluye usuarioIds para que el cliente
        // calcule reaccionadoPorMi sin necesidad de DTOs personalizados por usuario.
        List<ReaccionDto> reacciones = reaccionRepository.findByMensaje_Id(m.getId())
                .stream()
                .collect(Collectors.groupingBy(Reaccion::getEmoji))
                .entrySet().stream()
                .map(e -> new ReaccionDto(
                        e.getKey(),
                        e.getValue().size(),
                        e.getValue().stream()
                                .map(r -> r.getUsuario().getIdUsuario())
                                .collect(Collectors.toList())
                ))
                .collect(Collectors.toList());

        return new MensajeDto(
                m.getId(),
                m.getRemitente().getIdUsuario(),
                m.getRemitente().getNombre(),
                m.getRemitente().getApellidos(),
                m.getRemitente().getFotoUrl(),
                m.getEquipo() != null ? m.getEquipo().getIdEquipo() : null,
                m.getDestinatario() != null ? m.getDestinatario().getIdUsuario() : null,
                m.getContenido(),
                m.getUrlAdjunto(),
                m.getTipoAdjunto(),
                m.getFechaHora(),
                m.isLeido(),
                m.getParent() != null ? new ParentPreviewDto(
                        m.getParent().getId(),
                        m.getParent().getRemitente().getNombre(),
                        m.getParent().getContenido(),
                        m.getParent().getTipoAdjunto()
                ) : null,
                m.isEditado(),
                m.isEliminado(),
                reacciones
        );
    }
}
