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

    @Column(name = "id_equipo")
    private Long idEquipo;

    private String rival;

    @Column(name = "fecha_hora")
    private LocalDateTime fechaHora;

    @Column(name = "competicion")
    private String competicion;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    private String lugar;

    private String tipo;

    // --- NUEVOS CAMPOS ---
    @Column(name = "goles_favor")
    private Integer golesFavor = 0;

    @Column(name = "goles_contra")
    private Integer golesContra = 0;

    @Column(name = "estado")
    private String estado = "PENDIENTE"; // Valores: PENDIENTE, FINALIZADO

    public Partido() {}

    // Constructor completo actualizado
    public Partido(Long idEquipo, String rival, LocalDateTime fechaHora, String lugar, String tipo) {
        this.idEquipo = idEquipo;
        this.rival = rival;
        this.fechaHora = fechaHora;
        this.lugar = lugar;
        this.tipo = tipo;
        this.estado = "PENDIENTE";
        this.golesFavor = 0;
        this.golesContra = 0;
    }
}