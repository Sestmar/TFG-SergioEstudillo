package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class LigaDto {
    private String nombre;
    private String temporada;
    private String nivel;
    private String observaciones;
    private Integer idCategoria;
}