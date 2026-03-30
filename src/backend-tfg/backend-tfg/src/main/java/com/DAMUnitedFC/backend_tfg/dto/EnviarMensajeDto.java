package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;

@Data
public class EnviarMensajeDto {
    private String contenido;
    private Integer equipoId;       // null si es privado
    private Integer destinatarioId; // null si es grupal
}
