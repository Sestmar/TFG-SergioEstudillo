package com.DAMUnitedFC.backend_tfg.service;

import com.DAMUnitedFC.backend_tfg.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WhatsAppNotificationProvider implements NotificationProvider {

    private final WhatsAppService whatsAppService;

    @Override
    public void sendNotification(Usuario usuario, String title, String body) {
        String telefono = usuario.getTelefono();
        if (telefono == null || telefono.isBlank()) {
            return;
        }
        whatsAppService.enviarMensaje(telefono, "*" + title + "*\n\n" + body);
    }
}
