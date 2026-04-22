package com.DAMUnitedFC.backend_tfg.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO de respuesta para mensajes de chat (grupos y privados).
 * Contrato JSON inmutable.
 */
public record MensajeDto(
        Long id,
        Integer remitenteId,
        String remitenteNombre,
        String remitenteApellidos,
        String remitenteFotoUrl,
        Integer equipoId,        // null si es privado
        Integer destinatarioId,  // null si es grupal
        String contenido,        // null si es solo un adjunto
        String urlAdjunto,       // null si es solo texto
        String tipoAdjunto,      // null si es solo texto — ej: "IMAGEN"
        LocalDateTime fechaHora,
        boolean leido,
        ParentPreviewDto parentPreview, // null si no es respuesta a otro mensaje
        boolean editado,
        boolean eliminado,
        List<ReaccionDto> reacciones    // vacía si no tiene reacciones
) {}
