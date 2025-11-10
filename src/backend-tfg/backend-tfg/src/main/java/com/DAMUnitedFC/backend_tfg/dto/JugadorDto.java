package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class JugadorDto {
    private Integer idUsuario;
    private String fechaNacimiento;
    private String posicion;
    private Integer dorsal;
    private String estado;
    private String telefonoContacto;
    private String direccion;
    private String fechaAlta;
    private String fechaBaja;
    private String observaciones;
    private Integer equipoPrincipal; // FK
}