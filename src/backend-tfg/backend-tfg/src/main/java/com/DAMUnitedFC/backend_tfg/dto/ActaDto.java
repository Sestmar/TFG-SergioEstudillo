package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;
import java.util.List;

@Data
public class ActaDto {
    // Resultado Global
    private Long idPartido;
    private Integer golesFavor;
    private Integer golesContra;

    // Lista de rendimientos individuales
    private List<PlayerStatUpdateDto> estadisticas;

    @Data
    public static class PlayerStatUpdateDto {
        private Long idJugador; // ID deportivo
        private Integer goles;
        private Integer asistencias;
        private Integer minutos;
        private Boolean amarilla;
        private Boolean roja;
    }
}