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

## 3. Pulido Estético y UX (Pantallas Secundarias) 🎨

Mantener la consistencia del diseño "Night Stadium" en toda la app.

### Puntos de Mejora
- **Listado de Jugadores (`my-team`)**: Implementar badges visuales para estados de disponibilidad (activo, lesionado, baja).
- **Formulario de Perfil**: Reorganizar el layout para agrupar campos (Datos Personales, Datos Deportivos) y evitar el scroll infinito de inputs.
- **Consistencia de Modales**: Verificar que todos los diálogos emergentes sigan la paleta `#0a0e1a` / `#6c63ff` y el estilo de bordes redondeados.
