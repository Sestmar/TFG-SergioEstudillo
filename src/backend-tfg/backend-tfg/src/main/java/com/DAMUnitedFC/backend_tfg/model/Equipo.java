package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import java.sql.Date;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // ✅ Importante

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
    // Evitamos cargar listas inversas de categorías
    @JsonIgnoreProperties({"equipos", "hibernateLazyInitializer", "handler"})
    private Categoria categoria;

    @ManyToOne
    @JoinColumn(name = "id_liga", nullable = false)
    // Evitamos cargar listas inversas de ligas
    @JsonIgnoreProperties({"equipos", "hibernateLazyInitializer", "handler"})
    private Liga liga;

    // 🔥 CORRECCIÓN DOBLE SEGURIDAD:
    // Al cargar el entrenador, ignoramos su propiedad 'equipo' para que no vuelva aquí.
    @OneToOne
    @JoinColumn(name = "id_entrenador")
    @ToString.Exclude
    @JsonIgnoreProperties({"equipo", "usuario", "hibernateLazyInitializer", "handler"})
    private Entrenador entrenador;
}