package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class EquipoDto {
    private String nombre;
    private String fechaCreacion;
    private String observaciones;
    private Integer idCategoria;
    private Integer idLiga;
    private String escudoUrl;
}