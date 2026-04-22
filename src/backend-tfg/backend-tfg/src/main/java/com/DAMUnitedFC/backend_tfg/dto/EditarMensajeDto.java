package com.DAMUnitedFC.backend_tfg.dto;

/**
 * Payload para editar el texto de un mensaje existente.
 * Solo el autor puede editar — validado en ChatService.
 */
public record EditarMensajeDto(String contenido) {}
