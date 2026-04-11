package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MatchSummaryDto {
    private Long idPartido;
    private String rival;
    private String escudoRivalUrl;
    private LocalDateTime fechaHora;
    private Integer golesFavor;
    private Integer golesContra;
    private String resultado; // "V", "E", "D"
    private Integer puntos;   // 3, 1, 0
    private Integer tarjetasAmarillas;
    private Integer tarjetasRojas;
    private Integer asistenciasTotales;
}
