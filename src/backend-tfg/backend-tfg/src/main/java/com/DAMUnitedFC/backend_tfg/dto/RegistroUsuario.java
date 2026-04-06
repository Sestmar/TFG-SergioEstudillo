package com.DAMUnitedFC.backend_tfg.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegistroUsuario {
    @NotBlank
    private String nombre;
    @NotBlank
    private String apellidos;
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;
    private String telefono;
    private String rol;
}
