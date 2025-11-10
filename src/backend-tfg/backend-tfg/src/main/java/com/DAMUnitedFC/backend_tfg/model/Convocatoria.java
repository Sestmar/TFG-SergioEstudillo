package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Timestamp;

@Entity
@Table(name = "convocatoria")
@Data
public class Convocatoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_convocatoria")
    private Integer idConvocatoria;

    @ManyToOne
    @JoinColumn(name = "id_equipo", nullable = false)
    private Equipo equipo;

    @Column(name = "fecha_evento", nullable = false)
    private Timestamp fechaEvento;

    @Column(name = "tipo", length = 30)
    private String tipo;

    @Column(name = "observaciones", length = 255)
    private String observaciones;
}