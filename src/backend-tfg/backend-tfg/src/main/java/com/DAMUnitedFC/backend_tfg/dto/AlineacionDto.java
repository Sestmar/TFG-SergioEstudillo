package com.DAMUnitedFC.backend_tfg.dto;

/**
 * Payload de entrada para POST /api/alineaciones/guardar/{idPartido}.
 * Contrato JSON idéntico al de la clase @Data anterior.
 */
public record AlineacionDto(
        Long idPartido,
        Integer idJugador,
        String slotId,
        Boolean esCapitan,
        Boolean esLanzadorPenaltis,
        Boolean esLanzadorFaltas
) {}
