package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Date;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // ✅ Importante

@Entity
@Table(name = "jugador")
@Data
public class Jugador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_jugador")
    private Integer idJugador;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    // Ignoramos roles y cosas internas de usuario
    @JsonIgnoreProperties({"roles", "hibernateLazyInitializer", "handler", "passwordHash", "tokens"})
    private Usuario usuario;

    @Column(name = "fecha_nacimiento")
    private Date fechaNacimiento;

    @Column(name = "posicion", length = 30)
    private String posicion;

    @Column(name = "dorsal")
    private Integer dorsal;

    @Column(name = "estado", length = 20)
    private String estado;

    @Column(name = "telefono_contacto", length = 12)
    private String telefonoContacto;

    @Column(name = "direccion", length = 70)
    private String direccion;

    @Column(name = "fecha_alta")
    private Date fechaAlta;

    @Column(name = "fecha_baja")
    private Date fechaBaja;

    @Column(name = "observaciones", length = 255)
    private String observaciones;

    // 🔥 CORRECCIÓN DEFINITIVA AQUÍ:
    // Añadimos "entrenador", "liga" y "categoria" a la lista de ignorados.
    // Esto asegura que al cargar el jugador, cargue los datos básicos de su equipo (nombre, foto)
    // PERO NO intente cargar al entrenador ni reiniciar el ciclo.
    @ManyToOne
    @JoinColumn(name = "equipo_principal")
    @JsonIgnoreProperties({"jugadores", "entrenador", "liga", "categoria", "partidos", "hibernateLazyInitializer", "handler"})
    private Equipo equipoPrincipal;

    @Column(name = "foto_url")
    private String fotoUrl;
}