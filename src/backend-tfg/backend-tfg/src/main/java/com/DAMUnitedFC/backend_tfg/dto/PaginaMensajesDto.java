package com.DAMUnitedFC.backend_tfg.dto;

import java.util.List;

public record PaginaMensajesDto(List<MensajeDto> mensajes, boolean hasMore) {}
