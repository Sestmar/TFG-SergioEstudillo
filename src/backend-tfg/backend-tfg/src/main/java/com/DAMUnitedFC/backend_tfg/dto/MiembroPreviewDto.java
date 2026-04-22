package com.DAMUnitedFC.backend_tfg.dto;

/**
 * Proyección ligera de un miembro del equipo.
 * Usada por el frontend para el autocompletado de @menciones.
 */
public record MiembroPreviewDto(
        Integer id,
        String nombre,
        String apellidos,
        String fotoUrl
) {}
