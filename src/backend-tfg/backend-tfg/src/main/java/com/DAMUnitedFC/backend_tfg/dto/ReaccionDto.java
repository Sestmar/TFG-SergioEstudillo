package com.DAMUnitedFC.backend_tfg.dto;

import java.util.List;

/**
 * Reacciones agrupadas por emoji para un mensaje.
 * Se incluye usuarioIds para que el cliente calcule reaccionadoPorMi
 * sin necesidad de DTOs personalizados por usuario en el broadcast STOMP.
 */
public record ReaccionDto(
        String emoji,
        long count,
        List<Integer> usuarioIds
) {}
