package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "partido")
@Data
public class Partido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_partido")
    private Long idPartido;

    // 🔥 CORRECCIÓN IMPORTANTE: Relación directa con Equipo, no solo el ID
    @ManyToOne
    @JoinColumn(name = "id_equipo")
    private Equipo equipo;

    private String rival;

    @Column(name = "escudo_rival_url")
    private String escudoRivalUrl;

    @Column(name = "fecha_hora")
    private LocalDateTime fechaHora;

    @Column(name = "competicion")
    private String competicion;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    private String lugar;

    private String tipo;

    @Column(name = "goles_favor")
    private Integer golesFavor = 0;

    @Column(name = "goles_contra")
    private Integer golesContra = 0;

    @Column(name = "estado")
    private String estado = "PENDIENTE";

    public Partido() {}

    // Constructor actualizado
    public Partido(Equipo equipo, String rival, LocalDateTime fechaHora, String lugar, String tipo) {
        this.equipo = equipo;
        this.rival = rival;
        this.fechaHora = fechaHora;
        this.lugar = lugar;
        this.tipo = tipo;
        this.estado = "PENDIENTE";
        this.golesFavor = 0;
        this.golesContra = 0;
    }
}