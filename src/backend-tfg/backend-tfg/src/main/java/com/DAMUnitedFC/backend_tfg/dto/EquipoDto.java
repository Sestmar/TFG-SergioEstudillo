package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class EquipoDto {
    private String nombre;
    private String fechaCreacion; // O mejor LocalDate si configuras mapping
    private String observaciones;
    private Integer idCategoria;
    private Integer idLiga;
}