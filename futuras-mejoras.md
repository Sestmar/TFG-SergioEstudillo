# 📋 Backlog de Implementación Final - DAM United FC

Este documento centraliza las tareas pendientes para el cierre del TFG. Está diseñado para ser procesado por un agente de IA (Claude/Gemini) de forma secuencial.

---

## ✅ 1. Módulo de Reportes y Actas (FINALIZADO)
**Logro:** Generación de actas profesionales en A4 con fidelidad de color.

- [x] **Definición de Estilos de Impresión (`@media print`)**: Implementado en `global.scss` con fix de tarjetas.
- [x] **Consolidación en Acta de Partido (MatchDetail)**: Se eliminó la impresión de dashboards y modales para centralizar el flujo oficial en el detalle del partido (Pre y Post evento).
- [x] **Unificación de Estilos**: Eliminación de archivos `global_print_vX.scss` obsoletos.

---

## ✅ 2. Persistencia y Badges del Chat (FINALIZADO)
**Logro:** Sincronización perfecta de mensajes no leídos entre servidor y múltiples dispositivos.

- [x] **Sincronización Inicial de Mensajes**: Implementado mediante `GET /chat/no-leidos` en la conexión global.
- [x] **Persistencia del Estado**: Implementado mediante `marcarLeidos()` al entrar a la sala de chat.
- [x] **Reactividad Full**: Eliminación de bloqueos en `AppComponent` para asegurar conexión inmediata tras login.

---

## ✅ 3. Refuerzo Visual y Coherencia de Marca (FINALIZADO)
**Logro:** Identidad visual "Night Stadium" unificada en toda la plataforma.

- [x] **Estructura del Formulario de Perfil**: Agrupación en `form-section` con headers semánticos.
- [x] **Estandarización de Modales (`.night-modal`)**: Clase global implementada e inyectada en controladores de modales (Tácticas, Convocatorias).
- [x] **Lógica de Badges**: Los badges de estado del jugador ya reflejan la identidad visual del club.

---

## 🛠️ Notas para el Agente
- **Stack**: Angular + Ionic (Frontend), Spring Boot (Backend).
- **Estilo**: "Night Stadium" (Oscuro, bordes con transparencias, acentos neón).
- **Estado Actual**: Fase de cierre y documentación final.
