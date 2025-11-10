package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "convocatoria_jugador")
@Data
public class ConvocatoriaJugador {

    @EmbeddedId
    private ConvocatoriaJugadorId id;

    @ManyToOne
    @MapsId("idConvocatoria")
    @JoinColumn(name = "id_convocatoria")
    private Convocatoria convocatoria;

    @ManyToOne
    @MapsId("idJugador")
    @JoinColumn(name = "id_jugador")
    private Jugador jugador;

    // Si necesitas campos adicionales (asistencia, observaciones), añade aquí
}