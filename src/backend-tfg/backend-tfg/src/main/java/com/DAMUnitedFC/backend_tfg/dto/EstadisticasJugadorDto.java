package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class EstadisticasJugadorDto {
    private Integer partidosTotales;
    private Integer golesTotales;
    private Integer asistenciasTotales;
    private Integer minutosJugados;
}