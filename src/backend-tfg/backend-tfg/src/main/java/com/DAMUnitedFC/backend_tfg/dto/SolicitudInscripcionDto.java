package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class SolicitudInscripcionDto {
    private Integer idUsuario;
    private Integer idJugador; // Puede ir null en POST nueva
    private String estado; // "pendiente", "aceptada", "rechazada"
    private String motivoRechazo;
    private String observaciones; // Opcional
}