package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "asistencia_entrenamiento")
@Data
public class Asistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAsistencia;

    @Column(name = "id_entrenamiento", nullable = false)
    private Long idEntrenamiento; // Vinculamos por ID (puedes cambiarlo a Objeto si tienes la entidad Entrenamiento)

    @ManyToOne
    @JoinColumn(name = "id_jugador", nullable = false)
    private Jugador jugador;

    @Column(length = 20)
    private String estado; // ASISTE, AUSENTE, LESION

    private String observaciones;
}