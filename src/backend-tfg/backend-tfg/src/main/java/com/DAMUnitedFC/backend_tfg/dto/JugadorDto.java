package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class JugadorDto {
    private Long idUsuario; // 🔥 Corregido a Long para coincidir con Usuario
    private String fechaNacimiento;
    private String posicion;
    private Integer dorsal;
    private String estado;
    private String telefonoContacto;
    private String direccion;
    private String fechaAlta;
    private String fechaBaja;
    private String observaciones;
    private Long equipoPrincipal; // 🔥 Corregido a Long para coincidir con Equipo
}