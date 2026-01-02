package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class RegistroUsuario {
    private String nombre;
    private String apellidos;
    private String email;
    private String password;
    private String telefono;
    private String rol;
}
