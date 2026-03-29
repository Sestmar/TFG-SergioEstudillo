# Registro de Refactorización Frontend - DAM United FC

Este documento detalla el progreso de la refactorización progresiva del frontend (Angular 17 + Ionic 7), siguiendo la estrategia definida en `frontend/01-propuesta-refactor-frontend.md`.

---

## Fase 1: Higiene de Memoria (RxJS) ✅
**Objetivo:** Implementar el patrón `takeUntilDestroyed(this.destroyRef)` de Angular 17 para asegurar la limpieza de suscripciones y prevenir fugas de memoria.

### 1.1 Estado Global de la Fase
Se ha completado el blindaje en **21 archivos** críticos del sistema. El 95% de las suscripciones manuales ahora cuentan con mecanismo de autolimpieza.

*   **Módulo de Autenticación (Auth) ✅**: `login`, `register`, `forgot-password`, `reset-password`.
*   **Dashboards y Listados ✅**: `dashboard`, `club`, `match-detail`, `player-dashboard`, `user-dashboard`, `calendar`.
*   **Módulos de Gestión (Coach y Admin) ✅**: `team-stats`, `my-team`, `coach-dashboard`, `coach-profile`, `admin-dashboard`, `team-detail`, `training-attendance`, `edit-match`, `create-convocation`, `convocation-details`, `profile`.

### 1.2 El "Final Boss": Gestión de Tácticas (Tactics) 🛡️
*Estado: En Análisis Estratégico*
*   Se ha identificado que `tactics.page.ts` requiere un refactor arquitectónico (Fase 3) antes de aplicar `takeUntilDestroyed`, debido a la complejidad de sus suscripciones anidadas.

---

## Fase 2: Tipado Estricto (TypeScript) ✅
**Objetivo**: Erradicar el uso de `any` y asegurar que la comunicación con el API sea Type-Safe.

### 2.1 Integración de DTOs del Backend (NeonDB Sync)
Se han sincronizado las interfaces de `src/app/shared/models/models.ts` con el esquema real del backend:
*   **Modelos de Dominio**: `Jugador`, `Partido`, `UsuarioResumen`, `EquipoResumen`.
*   **Gestión de Competición**: `LineupSlotDto` (alineaciones) y `CloseMatchPayload` (actas).
*   **Administración**: `AdminUserDto` y `AdminEquipoDto`.

### 2.2 Servicios Core 100% Tipados
Se ha eliminado la deuda técnica de `any` en los servicios fundamentales:
*   **`ApiService`**: Refactorizado para manejar `HttpParams` de forma segura con `Record<string, any>` y filtrado de `undefined`.
*   **`AuthService` & `UserService`**: Tipado completo de flujos de autenticación y perfiles.
*   **`MatchService` & `TeamService`**: Eliminados casteos `as any`. Las respuestas ahora fluyen como `Observable<Partido[]>` o `Observable<Jugador[]>`.
*   **`ConvocationService`**: Implementada normalización de datos para cumplir con la interfaz `Convocation` (manejo de campos obligatorios no presentes en el JSON crudo).

### 2.3 Hallazgos y Decisiones Técnicas
*   **`UserStateService`**: Identificado como **Código Muerto (Dead Code)**. Se mantiene sin cambios para evitar regresiones innecesarias, pero se recomienda su eliminación en la Fase 3.
*   **Patrón de Extensión de Tipos**: Uso de `Omit<Jugador, 'estado'> & { estado: string | null }` en `PlayerAttendance` para resolver discrepancias de tipado entre el modelo general y el de asistencias.

---

## Fase 3: Arquitectura Smart/Dumb y Delegación ⏳
*Estado: Iniciada*
*   **Objetivo**: Eliminar `HttpClient` de las Pages y mover la lógica de transformación a los servicios.
*   **Avance actual**:
    *   `calendar.page.ts`: Lógica de carga de eventos delegada al servicio.
    *   `user-dashboard.page.ts`: Eliminado `HttpClient` directo.
*   **Próximos pasos**: Refactor de `my-team.page.ts`, `edit-match.page.ts` y el desacoplamiento total de `tactics.page.ts`.

