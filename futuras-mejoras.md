# 🚀 Hoja de Ruta: Futuras Mejoras - DAM United FC

Este documento identifica las líneas de evolución estratégica para elevar la plataforma a estándares de producto comercial y excelencia técnica.

---

## ✅ 1. Fortalecimiento de la Calidad: Testing Integral (Estado: COMPLETADO)
Implementación de la Pirámide de Testing (93 tests en total) con JUnit 5, Mockito, Jasmine y Cypress. Integración continua (CI) validada en GitHub Actions.

## ✅ 2. Ecosistema Documental: Exportación de Estrategia Pro (Estado: COMPLETADO)
Motor de reportes PDF integrado en el Laboratorio Táctico. Captura de pizarras en alta resolución con metadatos estratégicos para exportación profesional.

## 🔔 3. Notificaciones Nativas: Mobile Push con Firebase (Priority: MEDIUM)
Integración de FCM vía Capacitor para alertas nativas (convocatorias, cambios de hora, mensajes de chat).

## ✅ 4. Pulido de UX: Skeleton Screens (Estado: COMPLETADO)
Implementación de pantallas de carga inteligentes nativas de Ionic 7 en Dashboard, Lista de Jugadores y Detalle de Partido, eliminando el Cumulative Layout Shift (CLS).

---

## 🏆 5. Centro de Inteligencia: Season Analytics & Goals (Estado: PENDIENTE)

Este módulo transforma los datos históricos en inteligencia competitiva, proporcionando una visión de "Temporada Viva" tanto para el entrenador como para los jugadores.

### 📋 Fase A: Infraestructura Backend (Spring Boot)

1.  **Modelo de Datos**: 
    - Actualizar la entidad `Equipo` en el paquete `models` para incluir el campo `Integer puntosObjetivo` (por defecto 0).
    - Actualizar `EquipoDto` para que el Frontend pueda persistir y leer esta meta.

2.  **Capa de Servicio (Lógica de Agregación)**:
    - Implementar en `EquipoService` o `PublicService` el método `getSeasonStats(Long equipoId)`.
    - **Filtrado**: Recuperar todos los partidos donde `equipoLocal.id == equipoId` O `equipoRival.id == equipoId` AND `estado == 'FINALIZADO'`.
    - **Cómputo de Puntos**: 
        - Si es local y `golesLocal > golesRival` -> 3 pts.
        - Si es rival y `golesRival > golesLocal` -> 3 pts.
        - Si `golesLocal == golesRival` -> 1 pt.
        - En cualquier otro caso -> 0 pts.
    - **Cómputo de Goles**: Sumar GF (Goles a Favor) y GC (Goles en Contra) dinámicamente según la posición del equipo en cada partido.
    - **Algoritmo de Racha (Form)**: Obtener los últimos 5 partidos por fecha descendente y mapear a un array de strings: `['V', 'E', 'D', 'V', 'V']`.

3.  **API Rest**:
    - Endpoint: `GET /api/equipos/{id}/stats-temporada`.
    - Response DTO: `SeasonStatsDto { pj, g, e, p, gf, gc, puntos, puntosObjetivo, racha[] }`.

### 🎨 Fase B: Interfaz de Usuario (Angular / Ionic)

1.  **Componente Standalone Reutilizable**:
    - Ubicación: `src/app/shared/components/season-stats-widget/`.
    - **Visual 1: Tabla de Rendimiento**: Un grid minimalista con las siglas (PJ, G, E, P, GF, GC, Dif, Pts).
    - **Visual 2: Barra de Objetivo**: Un `ion-progress-bar` animado que calcule `puntos / puntosObjetivo`. Si `puntosObjetivo` es 0, mostrar mensaje "Sin objetivo definido".
    - **Visual 3: Badge de Racha**: 5 indicadores circulares con gradientes neón (Verde: Victoria, Naranja: Empate, Rojo: Derrota).

2.  **Dashboard del Entrenador (Módulo Coach)**:
    - Insertar el widget sobre el panel de gestión.
    - Añadir un pequeño botón de edición (icono `settings`) que abra un `ion-alert` para que el míster cambie el `puntosObjetivo` en caliente.

3.  **Módulo del Jugador (Módulo User/Club)**:
    - Integrar el widget en la vista principal o en una nueva pestaña "Temporada".
    - El jugador **solo lectura**: solo ve los números para motivarse, no puede editar el objetivo.

### 🎯 Resultados Esperados
- **Motivación**: El jugador ve cuánto falta para el objetivo del club.
- **Análisis**: El míster detecta bajones de rendimiento mediante la racha visual.
- **Profesionalidad**: La app se convierte en un centro de mando estratégico de 360 grados.

---
*Documento actualizado y sellado para implementación: 11 de Abril 2026*
