package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.Data;

@Embeddable
@Data
public class ConvocatoriaJugadorId implements Serializable {
    private Integer idConvocatoria;
    private Integer idJugador;
}
