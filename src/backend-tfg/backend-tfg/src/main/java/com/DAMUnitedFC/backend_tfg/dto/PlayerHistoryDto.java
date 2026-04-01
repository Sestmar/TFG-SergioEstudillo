package com.DAMUnitedFC.backend_tfg.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerHistoryDto {

    private Integer idJugador;
    private String nombreCompleto;
    private String posicion;
    private Integer dorsal;
    private String estado;
    private String equipoActual;

    private Integer partidosTotales;
    private Integer minutosJugados;
    private Integer goles;
    private Integer asistencias;
    private Integer tarjetasAmarillas;
    private Integer tarjetasRojas;

    private List<PartidoHistorialDto> partidos;
    private List<ConvocatoriaHistorialDto> convocatorias;
    private List<IncidenciaHistorialDto> incidencias;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PartidoHistorialDto {
        private Long idPartido;
        private LocalDateTime fechaHora;
        private String rival;
        private String escudoRivalUrl;
        private String competicion;
        private Integer golesFavor;
        private Integer golesContra;
        private String estado;
        private Boolean esTitular;
        private Integer golesJugador;
        private Integer asistenciasJugador;
        private Integer minutosJugados;
        private Integer minutoEntrada;
        private Integer minutoSalida;
        private Boolean esCapitan;
        private Integer tarjetaAmarilla;
        private Integer tarjetaRoja;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConvocatoriaHistorialDto {
        private Integer idConvocatoria;
        private LocalDateTime fechaEvento;
        private String tipo;
        private String observaciones;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IncidenciaHistorialDto {
        private Integer idIncidencia;
        private LocalDateTime fechaReporte;
        private String tipo;
        private String estado;
        private String descripcion;
    }
}
