package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.EditarMensajeDto;
import com.DAMUnitedFC.backend_tfg.dto.EnviarMensajeDto;
import com.DAMUnitedFC.backend_tfg.dto.MensajeDto;
import com.DAMUnitedFC.backend_tfg.dto.MiembroPreviewDto;
import com.DAMUnitedFC.backend_tfg.dto.NoLeidosDto;
import com.DAMUnitedFC.backend_tfg.dto.PaginaMensajesDto;
import com.DAMUnitedFC.backend_tfg.dto.ReaccionarDto;
import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import com.DAMUnitedFC.backend_tfg.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UsuarioRepository usuarioRepository;

    // --- STOMP: envío en tiempo real ---

    @MessageMapping("/chat.enviar")
    public void enviarMensaje(@Payload EnviarMensajeDto dto, Principal principal) {
        if (principal == null) {
            // El interceptor rechazó la conexión o el token es inválido; no procesar el mensaje
            return;
        }

        String emailRemitente = principal.getName();
        MensajeDto guardado = chatService.enviarMensaje(emailRemitente, dto);

        if (dto.equipoId() != null) {
            // Mensaje grupal → broadcast al topic del equipo
            messagingTemplate.convertAndSend(
                    "/topic/equipo/" + dto.equipoId(), guardado);
        } else if (dto.destinatarioId() != null) {
            // Mensaje privado → necesitamos el email del destinatario porque Spring Security
            // usa el email (username) como nombre de principal, no el ID numérico
            String emailDestinatario = usuarioRepository.findById(dto.destinatarioId())
                    .orElseThrow(() -> new RuntimeException("Destinatario no encontrado: " + dto.destinatarioId()))
                    .getEmail();

            messagingTemplate.convertAndSendToUser(
                    emailDestinatario,
                    "/queue/mensajes",
                    guardado);
            // También se lo mandamos al remitente para que vea su propio mensaje
            messagingTemplate.convertAndSendToUser(
                    emailRemitente,
                    "/queue/mensajes",
                    guardado);
        }
    }

    // --- REST: historial y utilidades ---

    @GetMapping("/api/chat/equipo/{idEquipo}")
    public ResponseEntity<PaginaMensajesDto> historialEquipo(
            @PathVariable Integer idEquipo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        chatService.validarMembresiaEquipo(idEquipo, userDetails.getUsername());
        return ResponseEntity.ok(chatService.listarPorEquipoPaginado(idEquipo, page, size));
    }

    @GetMapping("/api/chat/privado/{idOtroUsuario}")
    public ResponseEntity<PaginaMensajesDto> historialPrivado(
            @PathVariable Integer idOtroUsuario,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuarioActual = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(chatService.listarPrivadosPaginado(usuarioActual.getIdUsuario(), idOtroUsuario, page, size));
    }

    @GetMapping("/api/chat/equipo/{idEquipo}/miembros")
    public ResponseEntity<List<MiembroPreviewDto>> miembrosEquipo(
            @PathVariable Integer idEquipo,
            @AuthenticationPrincipal UserDetails userDetails) {
        chatService.validarMembresiaEquipo(idEquipo, userDetails.getUsername());
        return ResponseEntity.ok(chatService.getMiembrosEquipo(idEquipo));
    }

    @GetMapping("/api/chat/no-leidos")
    public ResponseEntity<NoLeidosDto> noLeidos(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuarioActual = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        long count = chatService.contarNoLeidos(usuarioActual.getIdUsuario());
        return ResponseEntity.ok(new NoLeidosDto(count));
    }

    @PutMapping("/api/chat/marcar-leidos")
    public ResponseEntity<Void> marcarLeidos(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuarioActual = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        chatService.marcarLeidos(usuarioActual.getIdUsuario());
        return ResponseEntity.ok().build();
    }

    // --- Editar mensaje (solo el autor) ---

    @PutMapping("/api/chat/mensajes/{id}")
    public ResponseEntity<?> editarMensaje(
            @PathVariable Long id,
            @RequestBody EditarMensajeDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (dto.contenido() == null || dto.contenido().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El contenido no puede estar vacío."));
        }
        try {
            MensajeDto actualizado = chatService.editarMensaje(id, dto.contenido().trim(), userDetails.getUsername());
            broadcastActualizacion(actualizado);
            return ResponseEntity.ok(actualizado);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // --- Eliminar mensaje — borrado lógico (solo el autor) ---

    @DeleteMapping("/api/chat/mensajes/{id}")
    public ResponseEntity<?> eliminarMensaje(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            MensajeDto actualizado = chatService.eliminarMensaje(id, userDetails.getUsername());
            broadcastActualizacion(actualizado);
            return ResponseEntity.ok(actualizado);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    // --- Reacciones ---

    @PostMapping("/api/chat/mensajes/{id}/reaccion")
    public ResponseEntity<?> reaccionar(
            @PathVariable Long id,
            @RequestBody ReaccionarDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (dto.emoji() == null || dto.emoji().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El emoji es obligatorio."));
        }
        try {
            MensajeDto actualizado = chatService.reaccionar(id, dto.emoji(), userDetails.getUsername());
            broadcastActualizacion(actualizado);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/api/chat/mensajes/{id}/reaccion")
    public ResponseEntity<?> quitarReaccion(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            MensajeDto actualizado = chatService.quitarReaccion(id, userDetails.getUsername());
            broadcastActualizacion(actualizado);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Reenvía el mensaje actualizado por STOMP al canal correspondiente
     * (equipo o privado) para que todos los clientes conectados actualicen su UI.
     */
    private void broadcastActualizacion(MensajeDto dto) {
        if (dto.equipoId() != null) {
            messagingTemplate.convertAndSend("/topic/equipo/" + dto.equipoId(), dto);
        } else if (dto.destinatarioId() != null) {
            usuarioRepository.findById(dto.remitenteId()).ifPresent(u ->
                messagingTemplate.convertAndSendToUser(u.getEmail(), "/queue/mensajes", dto));
            usuarioRepository.findById(dto.destinatarioId()).ifPresent(u ->
                messagingTemplate.convertAndSendToUser(u.getEmail(), "/queue/mensajes", dto));
        }
    }
}
