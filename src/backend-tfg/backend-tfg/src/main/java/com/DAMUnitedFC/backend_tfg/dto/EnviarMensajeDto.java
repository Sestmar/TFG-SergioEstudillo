package com.DAMUnitedFC.backend_tfg.dto;

/**
 * Payload para enviar un mensaje por STOMP (@MessageMapping /chat.enviar).
 * Contrato JSON: {"contenido":"...", "equipoId":1, "destinatarioId":null, "urlAdjunto":null, "tipoAdjunto":null}
 * Al menos uno de contenido o urlAdjunto debe estar presente (validado en ChatService).
 */
public record EnviarMensajeDto(
        String contenido,       // null si el mensaje es solo un adjunto
        Integer equipoId,       // null si es privado
        Integer destinatarioId, // null si es grupal
        String urlAdjunto,      // null si es solo texto
        String tipoAdjunto,     // null si es solo texto — ej: "IMAGEN"
        Long parentId           // null si no es respuesta; reservado para Fase de Respuestas
) {}
