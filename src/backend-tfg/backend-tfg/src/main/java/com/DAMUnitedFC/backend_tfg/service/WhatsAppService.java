package com.DAMUnitedFC.backend_tfg.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppService {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppService.class);

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.whatsapp.number}")
    private String fromNumber;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
        log.info("Twilio inicializado correctamente");
    }

    public void enviarMensaje(String telefonoDestino, String cuerpo) {
        if (telefonoDestino == null || telefonoDestino.isBlank()) {
            log.warn("Número de teléfono vacío — se omite la notificación WhatsApp");
            return;
        }

        String normalizado = telefonoDestino.trim();
        // Si no tiene prefijo internacional, asumimos España (+34)
        if (!normalizado.startsWith("+") && !normalizado.startsWith("00") && !normalizado.startsWith("whatsapp:")) {
            normalizado = "+34" + normalizado;
        }

        String destino = normalizado.startsWith("whatsapp:")
                ? normalizado
                : "whatsapp:" + normalizado;

        try {
            Message message = Message.creator(
                    new PhoneNumber(destino),
                    new PhoneNumber(fromNumber),
                    cuerpo
            ).create();
            log.info("WhatsApp enviado a {} — SID: {}", destino, message.getSid());
        } catch (Exception e) {
            log.error("Error enviando WhatsApp a {}: {}", destino, e.getMessage());
            // No lanzamos excepción — fallo de notificación no debe romper el flujo principal
        }
    }

    public void enviarNotificacionPartido(String telefono, String rival, String lugar, String fechaHora) {
        String mensaje = String.format(
                "⚽ *DAM United FC* — Nuevo partido confirmado:\n\n" +
                "🆚 Rival: *%s*\n" +
                "📍 Lugar: *%s*\n" +
                "📅 Fecha y hora: *%s*\n\n" +
                "Confirmá tu asistencia en la app.",
                rival, lugar, fechaHora
        );
        enviarMensaje(telefono, mensaje);
    }

    public void enviarRecordatorio(String telefono, String rival, String fechaHora) {
        String mensaje = String.format(
                "⏰ *DAM United FC* — Recordatorio:\n\n" +
                "¡Mañana hay partido! 🏟️\n" +
                "🆚 Rival: *%s*\n" +
                "📅 Hora: *%s*\n\n" +
                "No olvides confirmar tu asistencia en la app.",
                rival, fechaHora
        );
        enviarMensaje(telefono, mensaje);
    }
}
