# Futuras Mejoras - DAM United FC

Este documento lista las funcionalidades y mejoras técnicas pendientes para el proyecto.

---

## 1. Registro de Tarjetas en Actas Oficiales 🟨🟥

**Descripción:** Permitir que el Administrador registre tarjetas amarillas y rojas durante el cierre del acta de un partido, y que se reflejen correctamente en la vista de detalle.

**Estado:** En progreso — UI implementada, sincronización de campos pendiente.

### Backend
- `Alineacion` ya tiene `tarjeta_amarilla` y `tarjeta_roja`.
- `ActaDto.PlayerStatUpdateDto` usa los nombres `amarilla` y `roja`.
- **Pendiente:** Verificar que `PartidoService.cerrarActa` maneje el caso en que el jugador no existía previamente en la alineación (crear registro si no existe, no lanzar excepción).

### Frontend
- `edit-match.page.html` — botones toggle ya implementados.
- `match-detail.page.ts` — revisar que el mapeo de `tarjetaAmarilla`/`tarjetaRoja` (boolean en `MatchPlayerDisplay`) coincida con lo que devuelve el backend tras cerrar el acta.
- **Bug activo:** Inconsistencia entre payload del frontend (`amarilla`/`roja`) y el campo esperado por el backend — verificar y unificar.

---

## 2. Mejora de la Pizarra Táctica del Entrenador ⚽🧠

**Descripción:** Mejorar la experiencia de la pizarra táctica — actualmente funcional pero con UX compleja. El objetivo es que asignar jugadores a posiciones sea intuitivo y rápido.

### Mejoras propuestas
- **UX drag & drop:** Revisar que el drag & drop de jugadores al campo funcione fluidamente en móvil (touch events en Ionic).
- **Formaciones predefinidas:** Selector visual de formación con preview del esquema (4-3-3, 4-4-2, etc.) antes de confirmar.
- **Guardado automático:** Auto-save del lineup al soltar un jugador en una posición (actualmente requiere pulsar "Guardar").
- **Indicadores de estado:** Mostrar visualmente en el campo si un jugador está lesionado o sancionado (tarjeta roja acumulada).
- **Extracción a TacticsService:** Mover la lógica de cálculo de posiciones y filas del campo a un servicio dedicado (`TacticsService`) para reducir el tamaño de `tactics.page.ts`.

---

## 3. Chat en Tiempo Real por Equipo 💬

**Descripción:** Canal de comunicación interna por equipo — el entrenador puede enviar mensajes a sus jugadores y viceversa.

### Backend (Spring Boot)
- Integrar **Spring WebSocket + STOMP** sobre SockJS.
- Endpoint: `/ws` como punto de conexión WebSocket.
- Destinos: `/topic/equipo/{teamId}` (broadcast al equipo), `/queue/usuario/{userId}` (mensajes privados).
- Entidad `Mensaje` con campos: `id`, `contenido`, `fechaEnvio`, `remitente` (FK a Usuario), `equipo` (FK a Equipo).
- Repositorio + Service + Controller (`MessageController`) siguiendo la arquitectura del proyecto.
- Guardar historial en BD para cargar mensajes previos al abrir el chat.

### Frontend (Angular + Ionic)
- Servicio `ChatService` en `core/services/chat/` usando `rxjs/webSocket`.
- Componente `ChatPage` o modal de chat accesible desde el dashboard de cada rol.
- Cargar historial al inicializar, suscribirse al topic del equipo con `takeUntilDestroyed`.
- UI: lista de mensajes con burbuja de chat, input fijo en la parte inferior, scroll automático al último mensaje.

---

## 4. Mejora del Sistema de Toasts y Notificaciones 🔔

**Descripción:** Los toasts actuales son genéricos y poco informativos. Mejorar la consistencia y utilidad del feedback al usuario.

### Mejoras propuestas
- **Tipología visual:** Distinguir visualmente entre éxito (verde), error (rojo), advertencia (amarillo) e información (azul) — actualmente todos son iguales.
- **Mensajes descriptivos:** Reemplazar mensajes genéricos ("Error") por mensajes que indiquen qué falló y qué debe hacer el usuario.
- **Cola de toasts:** Si se disparan varios toasts seguidos, que se encolen y no se pisen (el `NotificationService` actual ya tiene estructura para esto — completar la implementación).
- **Acciones en toast:** Para acciones críticas (ej: "Jugador eliminado"), añadir botón "Deshacer" si la operación es reversible.
- **Posición consistente:** Unificar que todos los toasts aparezcan en la misma posición (`top` o `bottom`) — actualmente varía por componente.

---

## 5. Mejora Estética General de la App 🎨

**Descripción:** La app cumple funcionalmente pero varias pantallas y tarjetas tienen un aspecto poco pulido. Mejorar la UI sin cambiar la arquitectura.

### Pantallas prioritarias
- **Dashboard de jugador y entrenador:** Rediseñar las tarjetas de resumen (próximo partido, estadísticas) con mejor jerarquía visual.
- **Listado de jugadores (`my-team`):** Las tarjetas de jugador son demasiado simples — añadir avatar, posición con color, estado (activo/lesionado) con badge visual.
- **Perfil de usuario:** Mejorar el layout del formulario de edición — actualmente es una lista de inputs sin estructura visual.
- **Detalle de partido (`match-detail`):** Mejorar la presentación de la alineación y las estadísticas del partido.
- **Pantallas de autenticación:** Login y registro — mejorar la presentación del logo y el formulario.

### Criterios de mejora
- Mantener el tema de colores actual (dark theme + color primario) — solo mejorar espaciados, tipografía y componentes.
- Usar componentes Ionic nativos donde sea posible (ion-card, ion-avatar, ion-badge) antes de añadir CSS custom.
- Asegurar que los cambios sean responsivos y se vean bien tanto en móvil como en la versión web.

---

## 6. Mejoras Técnicas Menores Pendientes 🔧

- **CORS en producción:** Cambiar el wildcard `"*"` en `SecurityConfig.java` por la lista blanca de orígenes reales cuando se defina el dominio de producción.
- **`player.service.ts` — `getPlayerTeamByUserId`:** Tipar el retorno como `Observable<EquipoResumen>` en lugar de `Observable<any>`.
- **`user-state.service.ts`:** Evaluar si es dead code real — si no se usa en ningún componente, eliminar el archivo completo.
- **Comentarios emoji en código:** Limpiar los comentarios tipo `// 🔥 NUEVO MÉTODO` que quedaron del desarrollo incremental.
