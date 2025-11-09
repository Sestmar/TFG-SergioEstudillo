package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Date;

@Entity
@Data
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_equipo")         // Ajusta al nombre real
    private Integer idEquipo;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(name = "fecha_creacion", nullable = false) // Ajusta el nombre real
    private Date fechaCreacion;

    @Column(length = 255)
    private String observaciones;

    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "id_liga", nullable = false)
    private Liga liga;
}