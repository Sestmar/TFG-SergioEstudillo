package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class PublicPlayerDto {
    private Long idJugador; // ID deportivo (no el de usuario)
    private String nombre;
    private String apellidos;
    private String nombreCompleto; // Helper útil
    private String posicion;
    private Integer dorsal;
    private String fotoUrl;

    // Estadísticas básicas para la ficha pública
    private int goles;
    private int asistencias;

    // Estado físico del jugador (ACTIVO, LESIONADO, BAJA)
    private String estado;
}
