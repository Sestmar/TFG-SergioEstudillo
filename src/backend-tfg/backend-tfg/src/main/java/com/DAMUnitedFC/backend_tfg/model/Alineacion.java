package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "alineacion")
@Data
public class Alineacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el Partido
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_partido", nullable = false)
    @JsonIgnoreProperties({"alineaciones", "equipoLocal", "equipoVisitante", "hibernateLazyInitializer", "handler"})
    private Partido partido;

    // Relación con el Jugador
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_jugador", nullable = false)
    @JsonIgnoreProperties({"equipoPrincipal", "alineaciones", "estadisticas", "equipos", "partidos", "hibernateLazyInitializer", "handler"})
    private Jugador jugador;

    // 🔥 CORRECCIÓN: Relación directa con Equipo en lugar de solo Long
    // Esto habilita setEquipo(Equipo e) y soluciona el error de compilación y de BD
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_equipo", nullable = false)
    @JsonIgnoreProperties({"jugadores", "entrenador", "hibernateLazyInitializer", "handler"})
    private Equipo equipo;

    @Column(name = "slot_id")
    private String slotId;

    @Column(name = "es_titular")
    private Boolean esTitular;

    // --- DATOS DE RENDIMIENTO ---

    @Column(name = "goles")
    private Integer goles = 0;

    @Column(name = "asistencias")
    private Integer asistencias = 0;

    @Column(name = "minutos_jugados")
    private Integer minutosJugados = 0;

    @Column(name = "tarjeta_amarilla")
    private Boolean tarjetaAmarilla = false;

    @Column(name = "tarjeta_roja")
    private Boolean tarjetaRoja = false;

    // 🔥 NUEVOS CAMPOS PARA SUSTITUCIONES
    @Column(name = "minuto_entrada")
    private Integer minutoEntrada; // Nullable para mayor claridad

    @Column(name = "minuto_salida")
    private Integer minutoSalida;

    // 🔥 NUEVOS CAMPOS DE ROLES
    @Column(name = "es_capitan")
    private Boolean esCapitan = false;

    @Column(name = "es_lanzador_penaltis")
    private Boolean esLanzadorPenaltis = false;

    @Column(name = "es_lanzador_faltas")
    private Boolean esLanzadorFaltas = false;

    public Alineacion() {}
}