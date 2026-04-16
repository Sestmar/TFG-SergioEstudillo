package com.DAMUnitedFC.backend_tfg.dto;

/**
 * Payload para enviar un mensaje por STOMP (@MessageMapping /chat.enviar).
 * Contrato JSON: {"contenido":"...", "equipoId":1, "destinatarioId":null}
 */
public record EnviarMensajeDto(
        String contenido,
        Integer equipoId,       // null si es privado
        Integer destinatarioId  // null si es grupal
) {}
