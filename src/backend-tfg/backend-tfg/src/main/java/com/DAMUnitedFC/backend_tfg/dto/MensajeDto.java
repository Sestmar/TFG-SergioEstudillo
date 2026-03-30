package com.DAMUnitedFC.backend_tfg.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MensajeDto {
    private Long id;
    private Integer remitenteId;
    private String remitenteNombre;
    private String remitenteApellidos;
    private String remitenteFotoUrl;
    private Integer equipoId;       // null si es privado
    private Integer destinatarioId; // null si es grupal
    private String contenido;
    private LocalDateTime fechaHora;
    private boolean leido;
}
