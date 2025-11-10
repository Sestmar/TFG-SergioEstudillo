package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Date;

@Entity
@Table(name = "solicitudinscripcion")
@Data
public class SolicitudInscripcion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Integer idSolicitud;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_jugador")
    private Jugador jugador;

    @Column(name = "fecha_solicitud")
    private Date fechaSolicitud;

    @Column(name = "estado", length = 20)
    private String estado;

    @Column(name = "motivo_rechazo", length = 255)
    private String motivoRechazo;
}