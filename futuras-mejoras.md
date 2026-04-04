# 📋 Backlog de Implementación Final - DAM United FC

Este documento centraliza las tareas pendientes para el cierre del TFG. Está diseñado para ser procesado por un agente de IA (Claude/Gemini) de forma secuencial.

---

## ✅ 1. Módulo de Reportes y Actas (FINALIZADO)
**Logro:** Generación de actas profesionales en A4 con fidelidad de color.

- [x] **Definición de Estilos de Impresión (`@media print`)**: Implementado en `global.scss` con fix de tarjetas.
- [x] **Unificación de Estilos**: Eliminación de archivos `global_print_vX.scss` obsoletos.
- [x] **Botón de Impresión Global**: Integrado en `match-detail` y `player-dashboard`.

---

## 💬 2. Persistencia y Badges del Chat
**Objetivo:** Que el contador de mensajes no leídos sea verídico y no dependa solo de estar conectado en ese momento.

- [ ] **Sincronización Inicial de Mensajes**:
  - Archivo: `frontend/src/app/core/services/chat.service.ts`.
  - Tarea: Crear un método `getUnreadCount()` que haga un GET al backend al inicializar el servicio.
  - Lógica: Actualizar el `BehaviorSubject` del badge con el valor devuelto por el servidor.
- [ ] **Persistencia del Estado**:
  - Tarea: Asegurar que al leer un mensaje (abrir el chat), se dispare una petición al backend para marcar como leídos y resetear el badge localmente.

---

## 🎨 3. Refuerzo Visual y Coherencia de Marca
**Objetivo:** Eliminar inconsistencias de diseño en pantallas secundarias.

- [ ] **Lógica de Colores en Badges de Jugador**:
  - Archivo: `frontend/src/app/modules/players/pages/player-dashboard/player-dashboard.page.html`.
  - Tarea: Usar `[ngClass]` para que el badge de estado sea dinámico (Verde Neón para Activo, Ámbar para Lesionado, Rojo para Baja).
- [ ] **Estructura del Formulario de Perfil**:
  - Archivo: `frontend/src/app/modules/user/pages/profile/profile.page.html`.
  - Tarea: Agrupar campos en `<div class="form-section">` con encabezados H3 estilizados.
- [ ] **Estandarización de Modales (`.night-modal`)**:
  - Archivo: `frontend/src/global.scss`.
  - Tarea: Asegurar que todos los modales usen la clase `night-modal` para mantener la estética oscura y neón.

---

## 🛠️ Notas para el Agente
- **Stack**: Angular + Ionic (Frontend), Spring Boot (Backend).
- **Estilo**: "Night Stadium" (Oscuro, bordes con transparencias, acentos neón).
- **Prioridad Actual**: 1. Chat (Sincronización) -> 2. UX (Badges y Modales).
