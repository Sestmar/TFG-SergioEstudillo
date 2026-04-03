# 📋 Backlog de Implementación Final - DAM United FC

Este documento centraliza las tareas pendientes para el cierre del TFG. Está diseñado para ser procesado por un agente de IA (Claude/Gemini) de forma secuencial.

---

## 🚀 1. Módulo de Reportes y Actas (Print-Friendly)
**Objetivo:** Permitir que el staff técnico obtenga fichas y actas en papel/PDF usando solo CSS.

- [x] **Definición de Estilos de Impresión (`@media print`)**:
  - Archivo: `frontend/src/global.scss`.
  - Tarea: Crear un bloque `@media print` que oculte: `ion-menu-button`, `ion-tabs`, botones de acción y fondos innecesarios. Forzar colores negros sobre blanco para ahorrar tinta.
- [x] **Botón de Impresión Global**:
  - Archivos: `match-detail.page.html`, `player-dashboard.page.html`.
  - Tarea: Añadir un `<ion-button fill="clear" (click)="print()">` con el icono `print-outline`.
  - Lógica: Implementar `print() { window.print(); }` en los componentes correspondientes.

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
  - Tarea: Usar `[ngClass]` o `[style.color]` para que el badge de estado sea:
    - `ACTIVO` -> `#00ff88` (Verde Neón).
    - `LESIONADO` -> `#ffaa00` (Ámbar).
    - `BAJA` -> `#ff4d4d` (Rojo).
- [ ] **Estructura del Formulario de Perfil**:
  - Archivo: `frontend/src/app/modules/user/pages/profile/profile.page.html`.
  - Tarea: Agrupar campos en `<div class="form-section">` con encabezados H3 estilizados (Account vs Preferences).
- [ ] **Estandarización de Modales (`.night-modal`)**:
  - Archivo: `frontend/src/global.scss`.
  - Tarea: Definir la clase `.night-modal` con fondo `#0a0e1a` y borde neón.
  - Tarea: Revisar todos los `modalController.create()` y añadir `cssClass: 'night-modal'`.

---

## 🛠️ Notas para el Agente
- **Stack**: Angular + Ionic (Frontend), Spring Boot (Backend).
- **Estilo**: "Night Stadium" (Oscuro, bordes con transparencias, acentos neón).
- **Prioridad**: 1. Reportes -> 2. Chat -> 3. UX.
