package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.Data;

@Embeddable
@Data
public class JugadorEquipoId implements Serializable {
    private Integer idJugador;
    private Integer idEquipo;
}