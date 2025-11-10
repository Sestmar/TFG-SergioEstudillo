package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class IncidenciaDto {
    private Integer idJugador;
    private Integer idUsuario; // Quien reporta
    private String fechaReporte;
    private String tipo;
    private String estado;
    private String descripcion;
}