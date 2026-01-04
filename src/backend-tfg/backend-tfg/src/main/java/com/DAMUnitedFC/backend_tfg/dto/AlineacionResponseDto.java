package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class AlineacionResponseDto {
    private Long id;
    private Long idPartido;

    // Datos del Jugador
    private Integer idJugador;
    private String nombre;
    private String apellidos;
    private String fotoUrl;
    private Integer dorsal;
    private String posicion;

    // Datos de Posición
    private String slotId;
    private Boolean esTitular;

    // Estadísticas
    private Integer goles;
    private Integer asistencias;
    private Integer minutosJugados;
    private Boolean tarjetaAmarilla;
    private Boolean tarjetaRoja;

    // Sustituciones
    private Integer minutoEntrada;
    private Integer minutoSalida;

    // 🔥 NUEVOS CAMPOS DE ROLES (CAPITÁN Y TÁCTICA)
    // Estos son necesarios para que el frontend sepa qué iconos pintar al cargar
    private Boolean esCapitan;
    private Boolean esLanzadorPenaltis;
    private Boolean esLanzadorFaltas;

    public AlineacionResponseDto() {}
}