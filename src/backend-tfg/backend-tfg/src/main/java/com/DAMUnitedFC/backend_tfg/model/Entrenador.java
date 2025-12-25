package com.DAMUnitedFC.backend_tfg.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import java.sql.Date;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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
    // Evitamos cargar roles innecesarios
    @JsonIgnoreProperties({"roles", "hibernateLazyInitializer", "handler"})
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

    // 🔥 Relación inversa con Equipo
    @OneToOne(mappedBy = "entrenador")
    @JsonIgnore // VITAL: Corta el bucle Equipo -> Entrenador -> Equipo
    @ToString.Exclude
    private Equipo equipo;

    public Entrenador() {
        this.fechaAlta = new java.sql.Date(System.currentTimeMillis());
    }
}