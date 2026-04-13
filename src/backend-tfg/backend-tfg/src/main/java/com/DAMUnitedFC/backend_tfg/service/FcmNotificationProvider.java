package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.model.Usuario;
import com.DAMUnitedFC.backend_tfg.repository.UsuarioRepository;
import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.MessagingErrorCode;
import com.google.firebase.messaging.Notification;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FcmNotificationProvider implements NotificationProvider {

    private static final Logger log = LoggerFactory.getLogger(FcmNotificationProvider.class);

    private final UsuarioRepository usuarioRepository;

    @Override
    public void sendNotification(Usuario usuario, String title, String body) {
        sendNotification(usuario, title, body, Map.of());
    }

    @Override
    public void sendNotification(Usuario usuario, String title, String body, Map<String, String> data) {
        if (FirebaseApp.getApps().isEmpty()) {
            log.warn("Firebase no inicializado — se omite push a usuario {}", usuario.getIdUsuario());
            return;
        }

        String fcmToken = usuario.getFcmToken();
        if (fcmToken == null || fcmToken.isBlank()) {
            log.debug("Usuario {} sin fcmToken — se omite push", usuario.getIdUsuario());
            return;
        }

        try {
            Message.Builder builder = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build());

            if (data != null && !data.isEmpty()) {
                builder.putAllData(data);
            }

            String response = FirebaseMessaging.getInstance().send(builder.build());
            log.info("Push enviado a usuario {} — messageId: {}", usuario.getIdUsuario(), response);

        } catch (FirebaseMessagingException e) {
            MessagingErrorCode errorCode = e.getMessagingErrorCode();
            if (errorCode == MessagingErrorCode.UNREGISTERED
                    || errorCode == MessagingErrorCode.INVALID_ARGUMENT) {
                log.warn("Token inválido para usuario {} ({}). Limpiando fcmToken.", usuario.getIdUsuario(), errorCode);
                invalidateToken(usuario);
            } else {
                log.error("Error FCM enviando push a usuario {} ({}): {}",
                        usuario.getIdUsuario(), errorCode, e.getMessage());
            }
        } catch (Exception e) {
            log.error("Error inesperado enviando push a usuario {}: {}", usuario.getIdUsuario(), e.getMessage());
        }
    }

    private void invalidateToken(Usuario usuario) {
        usuario.setFcmToken(null);
        usuarioRepository.save(usuario);
    }
}
