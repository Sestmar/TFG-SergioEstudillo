package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class PublicTeamDto {
    private Long idEquipo;
    private String nombre;
    private String categoria; // Nombre de la categoría
    private String fotoUrl;
    private String entrenadorNombre; // Solo el nombre del míster
}