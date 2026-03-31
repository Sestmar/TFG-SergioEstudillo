package com.DAMUnitedFC.backend_tfg.controller;

import com.DAMUnitedFC.backend_tfg.dto.EnviarMensajeDto;
import com.DAMUnitedFC.backend_tfg.dto.MensajeDto;
import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import com.DAMUnitedFC.backend_tfg.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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
    public void enviarMensaje(@Payload EnviarMensajeDto dto,
                               @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            // El interceptor rechazó la conexión o el token es inválido; no procesar el mensaje
            return;
        }

        MensajeDto guardado = chatService.enviarMensaje(userDetails.getUsername(), dto);

        if (dto.getEquipoId() != null) {
            // Mensaje grupal → broadcast al topic del equipo
            messagingTemplate.convertAndSend(
                    "/topic/equipo/" + dto.getEquipoId(), guardado);
        } else if (dto.getDestinatarioId() != null) {
            // Mensaje privado → necesitamos el email del destinatario porque Spring Security
            // usa el email (username) como nombre de principal, no el ID numérico
            String emailDestinatario = usuarioRepository.findById(dto.getDestinatarioId())
                    .orElseThrow(() -> new RuntimeException("Destinatario no encontrado: " + dto.getDestinatarioId()))
                    .getEmail();

            messagingTemplate.convertAndSendToUser(
                    emailDestinatario,
                    "/queue/mensajes",
                    guardado);
            // También se lo mandamos al remitente para que vea su propio mensaje
            messagingTemplate.convertAndSendToUser(
                    userDetails.getUsername(),
                    "/queue/mensajes",
                    guardado);
        }
    }

    // --- REST: historial y utilidades ---

    @GetMapping("/api/chat/equipo/{idEquipo}")
    public ResponseEntity<List<MensajeDto>> historialEquipo(@PathVariable Integer idEquipo) {
        return ResponseEntity.ok(chatService.listarPorEquipo(idEquipo));
    }

    @GetMapping("/api/chat/privado/{idOtroUsuario}")
    public ResponseEntity<List<MensajeDto>> historialPrivado(
            @PathVariable Integer idOtroUsuario,
            @AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuarioActual = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(chatService.listarPrivados(usuarioActual.getIdUsuario(), idOtroUsuario));
    }

    @GetMapping("/api/chat/no-leidos")
    public ResponseEntity<Map<String, Long>> noLeidos(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuarioActual = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        long count = chatService.contarNoLeidos(usuarioActual.getIdUsuario());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/api/chat/marcar-leidos")
    public ResponseEntity<Void> marcarLeidos(@AuthenticationPrincipal UserDetails userDetails) {
        Usuario usuarioActual = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        chatService.marcarLeidos(usuarioActual.getIdUsuario());
        return ResponseEntity.ok().build();
    }
}
