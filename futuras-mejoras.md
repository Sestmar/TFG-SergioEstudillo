# 📋 Backlog de Implementación Final - DAM United FC

Este documento centraliza las tareas pendientes para el cierre del TFG. Está diseñado para ser procesado por un agente de IA (Claude/Gemini) de forma secuencial.

---

## ✅ 1. Módulo de Reportes y Actas (FINALIZADO)
**Logro:** Generación de actas profesionales en A4 con fidelidad de color.

- [x] **Definición de Estilos de Impresión (`@media print`)**: Implementado en `global.scss` con fix de tarjetas.
- [x] **Unificación de Estilos**: Eliminación de archivos `global_print_vX.scss` obsoletos.
- [x] **Botón de Impresión Global**: Integrado en `match-detail` y `player-dashboard`.

---

## ✅ 2. Persistencia y Badges del Chat (FINALIZADO)
**Logro:** Sincronización perfecta de mensajes no leídos entre servidor y múltiples dispositivos.

- [x] **Sincronización Inicial de Mensajes**: Implementado mediante `GET /chat/no-leidos` en la conexión global.
- [x] **Persistencia del Estado**: Implementado mediante `marcarLeidos()` al entrar a la sala de chat.
- [x] **Reactividad Full**: Eliminación de bloqueos en `AppComponent` para asegurar conexión inmediata tras login.

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
- **Prioridad Actual**: 1. UX (Badges de estado y Modales) -> 2. Refactor de Formularios.
