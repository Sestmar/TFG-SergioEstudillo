package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class AlineacionDto {
    // Usamos tipos Objeto (Long, Integer) para permitir nulos y evitar errores de parseo
    private Long idPartido;
    private Integer idJugador;
    private String slotId;

    // Constructor vacío obligatorio para Jackson
    public AlineacionDto() {}

    public AlineacionDto(Long idPartido, Integer idJugador, String slotId) {
        this.idPartido = idPartido;
        this.idJugador = idJugador;
        this.slotId = slotId;
    }
}
