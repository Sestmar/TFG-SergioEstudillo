package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final FcmNotificationProvider fcmProvider;
    private final WhatsAppNotificationProvider whatsAppProvider;

    /**
     * Envía una notificación priorizando FCM.
     * Si el usuario no tiene fcmToken, usa WhatsApp como fallback.
     */
    @Async
    public void send(Usuario usuario, String title, String body) {
        if (usuario == null) return;

        if (usuario.getFcmToken() != null && !usuario.getFcmToken().isBlank()) {
            log.debug("Enviando via FCM a usuario {}", usuario.getIdUsuario());
            fcmProvider.sendNotification(usuario, title, body);
        } else {
            log.debug("Sin fcmToken — fallback WhatsApp para usuario {}", usuario.getIdUsuario());
            whatsAppProvider.sendNotification(usuario, title, body);
        }
    }
}
