package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.Data;

@Embeddable
@Data
public class EquipoEntrenadorId implements Serializable {
    private Integer idEquipo;
    private Integer idEntrenador;
}