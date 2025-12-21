package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;
import java.sql.Date;
// ✅ IMPORTANTE: Importar esto
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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

    // 🔥 CAMBIO CLAVE: Evita error de recursión infinita
    @ManyToOne
    @JoinColumn(name = "equipo_principal")
    @JsonIgnoreProperties({"jugadores", "hibernateLazyInitializer", "handler"})
    private Equipo equipoPrincipal;

    @Column(name = "foto_url")
    private String fotoUrl;
}