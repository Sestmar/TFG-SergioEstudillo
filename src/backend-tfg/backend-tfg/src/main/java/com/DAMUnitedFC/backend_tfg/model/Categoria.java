package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCategoria;

    @Column(nullable = false, length = 30)
    private String nombre;

    @Column(nullable = false)
    private Integer edadMin;

    @Column(nullable = false)
    private Integer edadMax;
}