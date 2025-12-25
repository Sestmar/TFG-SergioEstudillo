package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString; // Importante para evitar bucles infinitos
import java.sql.Date;

@Entity
@Data
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_equipo")
    private Integer idEquipo;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(name = "fecha_creacion", nullable = false)
    private Date fechaCreacion;

    @Column(length = 255)
    private String observaciones;

    @Column(name = "foto_url")
    private String fotoUrl;

    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = false)
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "id_liga", nullable = false)
    private Liga liga;

    // 🔥 NUEVO: Relación con Entrenador
    // Esto soluciona el error: equipo.getEntrenador() / equipo.setEntrenador()
    @OneToOne
    @JoinColumn(name = "id_entrenador") // Clave foránea en la tabla Equipo
    @ToString.Exclude // Evita error de StackOverflow al imprimir logs
    private Entrenador entrenador;
}