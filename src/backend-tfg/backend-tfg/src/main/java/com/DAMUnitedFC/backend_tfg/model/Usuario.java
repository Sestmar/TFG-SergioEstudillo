package com.DAMUnitedFC.backend_tfg.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuario;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(nullable = false, length = 70)
    private String apellidos;

    @Column(unique = true, nullable = false, length = 120)
    private String email;

    @Column(nullable = false)
    private String passwordHash;  // Cambia según tu campo real

    @Column(nullable = false, length = 20)
    private String rol;

    @Column(nullable = false)
    private java.sql.Date fechaAlta;

    private String telefono;
    private String direccion;
}