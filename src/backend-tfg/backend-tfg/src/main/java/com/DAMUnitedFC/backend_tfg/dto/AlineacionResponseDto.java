package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class AlineacionResponseDto {
    private Long id;
    private Long idPartido;

    private Integer idJugador;
    private String nombre;
    private String apellidos;
    private String fotoUrl;
    private Integer dorsal;
    private String posicion;

    private String slotId;
    private Boolean esTitular;
    private Integer goles;
    private Integer asistencias;
    private Integer minutosJugados;
    private Boolean tarjetaAmarilla;
    private Boolean tarjetaRoja;

    // 🔥 NUEVOS CAMPOS EN EL DTO
    private Integer minutoEntrada;
    private Integer minutoSalida;

    public AlineacionResponseDto() {}
}