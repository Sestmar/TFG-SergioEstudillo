package com.DAMUnitedFC.backend_tfg.dto;

import java.util.List;

/**
 * DTO tipado para el payload de cerrar un acta de partido.
 * Reemplaza el Map&lt;String, Object&gt; anterior manteniendo el mismo contrato JSON.
 */
public record CerrarActaDto(
        Long idPartido,
        Integer golesFavor,
        Integer golesContra,
        List<EstadisticaDto> estadisticas
) {
    /**
     * Estadísticas individuales de cada jugador en el partido.
     * Los nombres de campo son idénticos a las claves del Map anterior.
     */
    public record EstadisticaDto(
            Integer idJugador,
            Integer goles,
            Integer asistencias,
            Integer minutos,
            Integer minutoEntrada,
            Integer minutoSalida
    ) {}
}
