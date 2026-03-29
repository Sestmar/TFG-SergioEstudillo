# Futuras Mejoras - DAM United FC

Este documento lista las funcionalidades y mejoras técnicas pendientes para el proyecto.

---

## 1. Registro de Tarjetas en Actas Oficiales ⚽🟨🟥
**Descripción:** Permitir que el Administrador registre tarjetas amarillas y rojas durante el cierre del acta de un partido.

### Detalles Técnicos:
*   **Backend:**
    *   La entidad `Alineacion` ya cuenta con los campos `tarjeta_amarilla` y `tarjeta_roja`.
    *   El DTO `ActaDto.PlayerStatUpdateDto` utiliza los nombres `amarilla` y `roja`.
    *   **Pendiente:** Asegurar que `PartidoService.cerrarActa` maneje la creación de fichas si el jugador no existía previamente en la alineación (requiere importar `Alineacion` y `Jugador` en el servicio).
*   **Frontend:**
    *   **UI Admin:** Se han implementado los botones neon en `edit-match.page.html` y la lógica de toggle en `edit-match.page.ts`.
    *   **UI Visualización:** `match-detail.page.html` ya tiene los indicadores de tarjetas, pero falta asegurar que el mapeo en `match-detail.page.ts` sea consistente.
    *   **Bug detectado:** Sincronización de nombres de campos entre el payload del frontend (`amarilla`/`roja`) y lo que procesa el backend.

---

## 2. Refactorización de TacticsPage (Final Boss) 🐉
**Descripción:** Limpiar y optimizar el componente más complejo de la aplicación.
*   **Acción:** Extraer lógica a `TacticsService` y unificar flujos RxJS con `switchMap`.

---
