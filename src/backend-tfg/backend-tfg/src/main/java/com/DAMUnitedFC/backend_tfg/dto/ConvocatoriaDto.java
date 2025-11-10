package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class ConvocatoriaDto {
    private Integer idEquipo;
    private String fechaEvento;
    private String tipo;
    private String observaciones;
}