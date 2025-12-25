package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class AlineacionResponseDto {
    private Long id;
    private Long idPartido;

    // Datos del Jugador (Ya procesados, sin objetos anidados)
    private Integer idJugador;
    private String nombre;     // Nombre del usuario
    private String apellidos;  // Apellidos del usuario
    private String fotoUrl;    // Foto del usuario o jugador
    private Integer dorsal;
    private String posicion;

    // Datos de la Alineación
    private String slotId;
    private Boolean esTitular;
    private Integer goles;
    private Integer asistencias;
    private Integer minutosJugados;
    private Boolean tarjetaAmarilla;
    private Boolean tarjetaRoja;

    public AlineacionResponseDto() {}
}