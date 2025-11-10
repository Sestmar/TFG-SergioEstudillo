package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "entrenador")
@Data
public class Entrenador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_entrenador")
    private Integer idEntrenador;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "especialidad", length = 50)
    private String especialidad;

    @Column(name = "licencia", length = 50)
    private String licencia;
}