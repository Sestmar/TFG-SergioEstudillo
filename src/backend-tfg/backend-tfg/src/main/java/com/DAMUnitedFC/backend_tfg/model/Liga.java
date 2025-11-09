package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Liga {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idliga") // Nombre real en BD, NO idLiga
    private Integer idliga;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false, length = 15)
    private String temporada;

    @Column(length = 30)
    private String nivel;

    @Column(length = 100)
    private String observaciones;

    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;
}