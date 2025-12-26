package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import java.sql.Date;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
    private String fotoUrl; // Foto de la plantilla (opcional)

    // ✅ NUEVO CAMPO: Escudo del equipo
    @Column(name = "escudo_url")
    private String escudoUrl;

    @ManyToOne
    @JoinColumn(name = "id_categoria", nullable = false)
    @JsonIgnoreProperties({"equipos", "hibernateLazyInitializer", "handler"})
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "id_liga", nullable = false)
    @JsonIgnoreProperties({"equipos", "hibernateLazyInitializer", "handler"})
    private Liga liga;

    @OneToOne
    @JoinColumn(name = "id_entrenador")
    @ToString.Exclude
    @JsonIgnoreProperties({"equipo", "usuario", "hibernateLazyInitializer", "handler"})
    private Entrenador entrenador;
}