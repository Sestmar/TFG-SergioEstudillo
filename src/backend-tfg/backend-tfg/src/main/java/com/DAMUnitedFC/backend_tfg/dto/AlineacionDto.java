package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class AlineacionDto {

    private Long idPartido;
    private Integer idJugador; // Integer porque el ID del jugador suele ser Integer
    private String slotId;     // Posición en la pizarra (ej: "FWD-1")

    // Constructor vacío (Obligatorio para Jackson)
    public AlineacionDto() {}

    public AlineacionDto(Long idPartido, Integer idJugador, String slotId) {
        this.idPartido = idPartido;
        this.idJugador = idJugador;
        this.slotId = slotId;
    }
}