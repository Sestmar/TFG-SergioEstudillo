package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;
import java.util.List;

@Data
public class SeasonStatsDto {

    private Integer pj;               // Partidos jugados
    private Integer g;                // Victorias
    private Integer e;                // Empates
    private Integer p;                // Derrotas
    private Integer gf;               // Goles a favor
    private Integer gc;               // Goles en contra
    private Integer puntos;           // Puntos acumulados
    private Integer puntosObjetivo;   // Objetivo de temporada (null = sin definir)
    private String  categoriaNombre;  // "Primera Andaluza", "Segunda Regional", etc.
    private List<String> racha;       // Últimos 5: ["V","V","E","D","V"]
}
