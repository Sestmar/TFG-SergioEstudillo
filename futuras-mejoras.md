# Futuras Mejoras - DAM United FC (Pendientes) 🚀

Este documento lista las funcionalidades, mejoras técnicas y tareas de pulido que aún quedan por implementar para cerrar el TFG con broche de oro.

---

## 1. Sistema de Notificaciones Pro (NotificationService) 🔔

**Descripción:** Centralizar la lógica de `ToastController` que actualmente está dispersa por los componentes.

### Tareas
- **Centralización**: Inyectar `ToastController` únicamente en `core/services/NotificationService.ts`.
- **Tipología Visual**: Crear métodos `.success()`, `.error()`, `.warning()` e `.info()` con colores y duraciones predefinidas.
- **Consistencia**: Unificar posición (`top` o `bottom`) y estilo en toda la aplicación.

---

## 2. Generación de Reportes / Actas (Print-Friendly) 📄

**Descripción:** Permitir que el entrenador o admin obtenga un documento PDF con el resumen del partido o la ficha del jugador de forma sencilla.

### Estrategia (Low Cost / High Value)
- **Solución CSS**: Implementar **Media Queries de Impresión** (`@media print`) en las vistas de detalle.
- **Acción**: Añadir un botón que dispare `window.print()`, configurado para ocultar elementos de navegación y dejar solo el contenido relevante.

---

## 3. Pulido Estético y UX (Pantallas Secundarias) ✅ DONE

Mantener la consistencia del diseño "Night Stadium" en toda la app.

### Análisis del Terreno (Para Claude 🤖)
- **Ruta Listado Jugadores**: `frontend/src/app/modules/players/pages/player-dashboard/player-dashboard.page.html` (usa clase `role-badge`).
- **Ruta Perfil**: `frontend/src/app/modules/user/pages/profile/profile.page.html` (usa clases `dark-card` y `input-group`).
- **Ruta Modales**: Localizados en `frontend/src/app/shared/models/convocation-modal/`.
- **Estilos Globales**: `frontend/src/theme/variables.scss`.

### Plan de Acción Exacto
1.  **Listado de Jugadores (`my-team`)**:
    - Localizar la clase `.role-badge` en `player-dashboard.page.scss`.
    - Implementar lógica de colores en el HTML: `ACTIVO` (verde neón), `LESIONADO` (ámbar), `BAJA` (rojo peligro).
    - Añadir tooltips o iconos descriptivos junto al badge.
2.  **Formulario de Perfil**:
    - En `profile.page.html`, envolver los `input-group` en dos nuevos contenedores `<div class="form-section">` con títulos de cabecera: "Información de Cuenta" y "Preferencias de Usuario".
    - Ajustar el SCSS para reducir el padding vertical de los inputs y permitir una vista más compacta.
3.  **Consistencia de Modales**:
    - Crear una clase global `.night-modal` en `global.scss` que fuerce `background: #0a0e1a`, `border-radius: 16px` y `border: 1px solid rgba(108, 99, 255, 0.3)`.
    - Aplicar esta clase usando `cssClass: 'night-modal'` en todas las llamadas a `modalController.create()` encontradas en el análisis previo.

---

## 4. Mejoras en el Chat de Equipo 💬

Mejorar la experiencia de comunicación y restringir el acceso según el rol.

### Tareas
- **Icono de Notificación (Badge)**: Implementar un indicador visual (exclamación o punto rojo) en el icono del menú de chat cuando haya mensajes nuevos sin leer. Requiere que `ChatService` escuche en segundo plano y gestione un estado global (`BehaviorSubject`).
- **Restricción de Rol Admin**: Eliminar el acceso al chat para el rol **ADMIN**, ya que al no tener equipo asignado, la funcionalidad carece de contexto y genera errores de carga.
