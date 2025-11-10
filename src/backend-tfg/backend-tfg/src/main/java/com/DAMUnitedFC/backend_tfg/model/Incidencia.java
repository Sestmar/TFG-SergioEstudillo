package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Date;

@Entity
@Table(name = "incidencia")
@Data
public class Incidencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_incidencia")
    private Integer idIncidencia;

    @ManyToOne
    @JoinColumn(name = "id_jugador")
    private Jugador jugador;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(name = "fecha_reporte")
    private Date fechaReporte;

    @Column(name = "tipo", length = 30)
    private String tipo;

    @Column(name = "estado", length = 20)
    private String estado;

    @Column(name = "descripcion", length = 255)
    private String descripcion;
}