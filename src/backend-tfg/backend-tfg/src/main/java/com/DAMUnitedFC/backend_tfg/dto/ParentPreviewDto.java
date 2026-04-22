package com.DAMUnitedFC.backend_tfg.dto;

/**
 * Proyección del mensaje padre para renderizar la cita (quote) en el frontend.
 * Se incluye embebido dentro de MensajeDto cuando el mensaje es una respuesta.
 */
public record ParentPreviewDto(
        Long id,
        String remitenteNombre,
        String contenido,    // null si el padre era solo un adjunto
        String tipoAdjunto   // null si el padre era solo texto
) {}
