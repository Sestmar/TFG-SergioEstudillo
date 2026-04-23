package com.DAMUnitedFC.backend_tfg.config;

import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.EquipoRepository;
import com.DAMUnitedFC.backend_tfg.repository.JugadorRepository;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import com.DAMUnitedFC.backend_tfg.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UsuarioRepository usuarioRepository;
    private final JugadorRepository jugadorRepository;
    private final EquipoRepository equipoRepository;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(
                    "http://localhost:4200",
                    "http://localhost:8100",
                    "http://localhost",
                    "https://localhost",
                    "capacitor://localhost",
                    "https://tfg-dam-united-web.onrender.com"
                )
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    private boolean perteneceAlEquipo(Integer idEquipo, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null) return false;

        boolean esAdmin = usuario.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (esAdmin) return true;

        boolean esJugadorDelEquipo = jugadorRepository.findByEquipoPrincipal_IdEquipo(idEquipo)
                .stream()
                .anyMatch(j -> j.getUsuario() != null && email.equals(j.getUsuario().getEmail()));
        if (esJugadorDelEquipo) return true;

        return equipoRepository.findById(idEquipo)
                .map(e -> e.getEntrenador() != null
                        && e.getEntrenador().getUsuario() != null
                        && email.equals(e.getEntrenador().getUsuario().getEmail()))
                .orElse(false);
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
                        message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    String destination = accessor.getDestination();
                    if (destination != null && destination.matches("/topic/equipo/\\d+")) {
                        Integer idEquipo = Integer.parseInt(destination.substring("/topic/equipo/".length()));
                        java.security.Principal userPrincipal = accessor.getUser();
                        // Si el principal no está disponible en este frame (puede ocurrir con
                        // SockJS en Android WebView), permitimos el SUBSCRIBE y dejamos que la
                        // autorización a nivel de mensaje-broker sea la barrera de seguridad.
                        if (userPrincipal == null) {
                            return message;
                        }
                        if (!(userPrincipal instanceof Authentication auth)
                                || !(auth.getPrincipal() instanceof UserDetails userDetails)
                                || !perteneceAlEquipo(idEquipo, userDetails.getUsername())) {
                            // Descartar silenciosamente en vez de enviar ERROR frame.
                            // Un ERROR frame desconecta al cliente y provoca un loop de reconexión
                            // que impide recibir mensajes, especialmente en Capacitor/Android.
                            return null;
                        }
                    }
                }

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            String username = jwtService.extractUsername(token);
                            var userDetails = userDetailsService.loadUserByUsername(username);
                            if (jwtService.isTokenValid(token, userDetails)) {
                                var auth = new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());
                                accessor.setUser(auth);
                            } else {
                                // Token inválido (expirado o mal formado) → rechazar conexión STOMP
                                StompHeaderAccessor errorAccessor = StompHeaderAccessor.create(StompCommand.ERROR);
                                errorAccessor.setMessage("Token inválido o expirado. Reconectate con credenciales válidas.");
                                errorAccessor.setLeaveMutable(true);
                                return MessageBuilder.createMessage(new byte[0], errorAccessor.getMessageHeaders());
                            }
                        } catch (Exception e) {
                            // Token malformado → rechazar conexión STOMP
                            StompHeaderAccessor errorAccessor = StompHeaderAccessor.create(StompCommand.ERROR);
                            errorAccessor.setMessage("Token inválido: " + e.getMessage());
                            errorAccessor.setLeaveMutable(true);
                            return MessageBuilder.createMessage(new byte[0], errorAccessor.getMessageHeaders());
                        }
                    } else {
                        // Sin header Authorization → rechazar conexión STOMP
                        StompHeaderAccessor errorAccessor = StompHeaderAccessor.create(StompCommand.ERROR);
                        errorAccessor.setMessage("Se requiere autenticación. Incluí el header Authorization: Bearer <token>.");
                        errorAccessor.setLeaveMutable(true);
                        return MessageBuilder.createMessage(new byte[0], errorAccessor.getMessageHeaders());
                    }
                }
                return message;
            }
        });
    }
}
