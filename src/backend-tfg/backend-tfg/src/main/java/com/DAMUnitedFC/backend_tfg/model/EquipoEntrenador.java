package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "equipo_entrenador")
@Data
public class EquipoEntrenador {

    @EmbeddedId
    private EquipoEntrenadorId id;

    @ManyToOne
    @MapsId("idEquipo")
    @JoinColumn(name = "id_equipo")
    private Equipo equipo;

    @ManyToOne
    @MapsId("idEntrenador")
    @JoinColumn(name = "id_entrenador")
    private Entrenador entrenador;

    @Column(name = "rol", nullable = false, length = 20)  // AÑADE ESTE CAMPO
    private String rol;
}