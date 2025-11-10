package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "jugador_equipo")
@Data
public class JugadorEquipo {

    @EmbeddedId
    private JugadorEquipoId id;

    @ManyToOne
    @MapsId("idJugador")
    @JoinColumn(name = "id_jugador")
    private Jugador jugador;

    @ManyToOne
    @MapsId("idEquipo")
    @JoinColumn(name = "id_equipo")
    private Equipo equipo;

    @Column(name = "observacion", length = 255)
    private String observacion;
}
