package com.DAMUnitedFC.backend_tfg.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // Importante para JSON
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import java.sql.Date;

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

    @Column(name = "telefono_contacto", length = 15)
    private String telefonoContacto;

    @Column(name = "fecha_alta", nullable = false)
    private Date fechaAlta;

    @Column(name = "foto_url")
    private String fotoUrl;

    // 🔥 NUEVO: Relación inversa con Equipo
    // Esto soluciona el error: nuevoMister.setEquipo(equipo)
    @OneToOne(mappedBy = "entrenador") // "entrenador" es el nombre del campo en la clase Equipo
    @JsonIgnore // ⚠️ VITAL: Evita bucle infinito al convertir a JSON (Equipo->Entrenador->Equipo...)
    @ToString.Exclude
    private Equipo equipo;

    // Constructor vacío necesario para JPA (Lombok suele generarlo, pero por seguridad)
    public Entrenador() {
        // Inicializamos fecha de alta por defecto si no viene
        this.fechaAlta = new java.sql.Date(System.currentTimeMillis());
    }
}