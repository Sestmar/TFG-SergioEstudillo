package com.DAMUnitedFC.backend_tfg.dto;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para mensajes de chat (grupos y privados).
 * Contrato JSON inmutable — los nombres de campo son idénticos a la versión anterior.
 */
public record MensajeDto(
        Long id,
        Integer remitenteId,
        String remitenteNombre,
        String remitenteApellidos,
        String remitenteFotoUrl,
        Integer equipoId,        // null si es privado
        Integer destinatarioId,  // null si es grupal
        String contenido,
        LocalDateTime fechaHora,
        boolean leido
) {}
