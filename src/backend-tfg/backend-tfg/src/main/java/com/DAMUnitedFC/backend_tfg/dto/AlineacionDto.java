package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class AlineacionDto {

    private Long idPartido;
    private Integer idJugador;
    private String slotId;

    // 🔥 NUEVOS CAMPOS
    private Boolean esCapitan;
    private Boolean esLanzadorPenaltis;
    private Boolean esLanzadorFaltas;

    public AlineacionDto() {}

    // Constructor completo actualizado
    public AlineacionDto(Long idPartido, Integer idJugador, String slotId, Boolean esCapitan) {
        this.idPartido = idPartido;
        this.idJugador = idJugador;
        this.slotId = slotId;
        this.esCapitan = esCapitan;
    }
}