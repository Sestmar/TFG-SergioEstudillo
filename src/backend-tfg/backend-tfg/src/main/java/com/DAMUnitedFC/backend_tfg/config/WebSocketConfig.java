package com.DAMUnitedFC.backend_tfg.config;

import com.DAMUnitedFC.backend_tfg.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
                        message, StompHeaderAccessor.class);

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
