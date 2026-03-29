# Guía de Refactorización Frontend — DAM United FC

> **Stack real**: Angular 17 + Ionic 7 + TypeScript 5.2
> **Objetivo**: Dejar el frontend con bases sólidas para añadir nuevas funcionalidades, mejorar la estética y escalar sin deuda técnica.

---

## 1. Diagnóstico General

| Problema | Severidad | Magnitud real |
|---|---|---|
| Suscripciones RxJS sin gestión de memoria | CRÍTICO | 64 de 72 `.subscribe()` sin protección |
| Tipado débil (`any`) | ALTO | 164 menciones en toda la app (37 en services, 127 en modules/shared) |
| Lógica de negocio en Pages | ALTO | Pages con llamadas directas a `HttpClient` y manipulación de datos |
| God Objects (archivos > 16KB de lógica) | MEDIO | `tactics.page.ts`, `admin-dashboard.page.ts` |

---

## 2. Las 3 Fases del Refactor

---

### Fase 1 — Higiene de Memoria y Control de RxJS
**Prioridad: CRÍTICA** | Hacer esto primero desbloquea las fases siguientes.

**Problema**: 64 suscripciones activas sin mecanismo de cancelación. Cuando un componente se destruye, el observable sigue ejecutándose en segundo plano (fuga de memoria, bugs de estado fantasma).

**Patrón a aplicar — Angular 17 moderno (`takeUntilDestroyed`)**

> ⚠️ NO usar el patrón antiguo con `Subject`. Angular 17 tiene una solución nativa mejor.

```typescript
// ❌ Patrón OBSOLETO (Angular 14/15) — NO usar
export class MiPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.service.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(...);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

```typescript
// ✅ Patrón MODERNO (Angular 17) — usar este
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class MiPage implements OnInit {
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.service.getData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(...);
  }
  // No hace falta ngOnDestroy
}
```

**Alternativa preferida cuando sea posible — `AsyncPipe` en el template**

```typescript
// En el componente: solo exponés el observable
data$ = this.service.getData();
```

```html
<!-- En el template: Angular gestiona la suscripción y cancelación automáticamente -->
<div *ngIf="data$ | async as data">{{ data.nombre }}</div>
```

#### Archivos Fase 1

| Archivo | Suscripciones | Acción |
|---|---|---|
| `modules/calendar/calendar.page.ts` | 8 | Aplicar `takeUntilDestroyed`. Mover `http.get` (línea 84) a `TeamService`. |
| `modules/user/pages/profile/profile.page.ts` | 5 | Aplicar `takeUntilDestroyed` en todas. |
| `modules/coach/pages/my-team/my-team.page.ts` | 5 | Aplicar `takeUntilDestroyed`. |
| `modules/players/pages/player-dashboard/player-dashboard.page.ts` | 5 | Aplicar `takeUntilDestroyed`. |
| `modules/user/pages/user-dashboard/user-dashboard.page.ts` | 4 | Aplicar `takeUntilDestroyed`. Cambiar `http.get` por servicio. |
| `modules/admin/pages/admin-dashboard/admin-dashboard.page.ts` | 4 | Aplicar `takeUntilDestroyed`. |
| `modules/admin/pages/team-detail/team-detail.page.ts` | 4 | Aplicar `takeUntilDestroyed`. |
| `modules/coach/pages/coach-profile/coach-profile.page.ts` | 4 | Aplicar `takeUntilDestroyed`. |
| `modules/coach/pages/tactics/tactics.page.ts` | 4 | **CRÍTICO**: Lógica de drag & drop mezclada con flujos de datos. Requiere análisis previo. |
| `modules/coach/pages/coach-dashboard/coach-dashboard.page.ts` | 3 | Aplicar `takeUntilDestroyed`. |
| `modules/dashboard/pages/dashboard/dashboard.page.ts` | 3 | Aplicar `takeUntilDestroyed`. |
| `modules/club/club.page.ts` | 3 | Aplicar `takeUntilDestroyed`. |
| `modules/match-detail/match-detail.page.ts` | 3 | Aplicar `takeUntilDestroyed`. |
| `modules/admin/pages/training-attendance/training-attendance.page.ts` | 3 | Aplicar `takeUntilDestroyed`. |
| `modules/coach/pages/edit-match/edit-match.page.ts` | 3 | Aplicar `takeUntilDestroyed`. |
| `modules/coach/pages/convocations/create-convocation.page.ts` | 2 | Aplicar `takeUntilDestroyed`. |
| `modules/auth/pages/register/register.page.ts` | 2 | Aplicar `takeUntilDestroyed`. |
| `modules/auth/pages/reset-password/reset-password.page.ts` | 1 | Aplicar `takeUntilDestroyed`. |
| `modules/auth/pages/login/login.page.ts` | 1 | Aplicar `takeUntilDestroyed`. |
| `modules/auth/pages/forgot-password/forgot-password.page.ts` | 1 | Aplicar `takeUntilDestroyed`. |
| `modules/coach/pages/convocations/convocation-details/convocation-details.page.ts` | 1 | Aplicar `takeUntilDestroyed`. |

---

### Fase 2 — Erradicación del `any` y Tipado Estricto
**Prioridad: ALTA** | Sin tipos correctos, el autocompletado y la detección de errores son inútiles.

**Problema**: 164 menciones a `any` en toda la app. Los más críticos están en services (37) porque contaminan hacia arriba — un `Observable<any>` en un service convierte en `any` todo lo que lo consume.

**Regla**: Todas las respuestas HTTP deben tiparse con las interfaces de `shared/models/models.ts`.

```typescript
// ❌ Antes
getPlayers(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/players`);
}

// ✅ Después
getPlayers(): Observable<Jugador[]> {
  return this.http.get<Jugador[]>(`${this.apiUrl}/players`);
}
```

#### Archivos Fase 2

| Archivo | Menciones `any` | Acción |
|---|---|---|
| `modules/admin/pages/admin-dashboard/admin-dashboard.page.ts` | 16 | Tipar variables de estado y respuestas HTTP. |
| `modules/coach/pages/tactics/tactics.page.ts` | 10 | Definir interfaces para posiciones y jugadores en táctica. |
| `modules/coach/pages/team-stats/team-stats.page.ts` | 9 | Tipar estadísticas con interfaces específicas. |
| `modules/players/pages/player-dashboard/player-dashboard.page.ts` | 13 | Tipar con `Jugador`, `Estadistica`, `Partido`. |
| `modules/coach/pages/my-team/my-team.page.ts` | 7 | Tipar respuestas de jugadores y equipo. |
| `modules/calendar/calendar.page.ts` | 7 | Tipar eventos de calendario con interfaz `CalendarEvent`. |
| `modules/club/club.page.ts` | 7 | Tipar datos de club y equipo. |
| `modules/admin/pages/training-attendance/training-attendance.page.ts` | 6 | Tipar asistencia con interfaces. |
| `modules/user/pages/profile/profile.page.ts` | 6 | Tipar con `Usuario`. |
| `modules/admin/pages/team-detail/team-detail.page.ts` | 6 | Tipar con `Equipo`, `Jugador`. |
| `core/services/admin/admin.service.ts` | 5 | Tipar todos los métodos de admin. |
| `core/services/convocation\convocation.service.ts` | 5 | Definir interfaz `Convocatoria`. Quitar `any[]`. |
| `core/services/match/match.service.ts` | 5 | Definir interfaces `Partido`, `Alineacion`, `Acta`. Quitar `any[]`. |
| `core/services/incident/incident.service.ts` | 3 | Definir interfaz `Incidencia`. |
| `core/services/api/api.service.ts` | 3 | Tipar respuestas genéricas del API base. |
| `core/services/request/request.service.ts` | 3 | Tipar solicitudes de inscripción. |
| `core/services/state/team-state.service.ts` | 3 | Eliminar casteos a `any`. Usar `Equipo` directamente. |
| `modules/coach/pages/edit-match/edit-match.page.ts` | 9 | Tipar formulario y datos del partido. |
| `modules/coach/pages/coach-dashboard/coach-dashboard.page.ts` | 6 | Tipar datos del dashboard. |
| `core/services/state/user-state.service.ts` | 1 | Eliminar "truco de any" — usar `Usuario` directamente. |
| `shared/models/convocation-modal/convocation-modal.component.ts` | 3 | Tipar inputs/outputs del modal. |

---

### Fase 3 — Delegación a Servicios y Limpieza de Pages
**Prioridad: ARQUITECTÓNICA** | Esto deja el frontend preparado para crecer.

**Problema**: Pages con llamadas directas a `HttpClient`, lógica de transformación de datos inline y suscripciones anidadas (callback hell).

**Reglas de arquitectura a aplicar:**
1. **Ninguna Page importa `HttpClient`** — toda petición HTTP pasa por un service de `core/services/`
2. **Las Pages solo orquestan** — reciben datos de services y los pasan al template
3. **Las transformaciones de datos van a los services** — filtros, mapeos, ordenaciones
4. **Suscripciones anidadas se reemplazan por `switchMap` / `forkJoin`**

```typescript
// ❌ Antes — callback hell
this.teamService.getTeam(id).subscribe(team => {
  this.playerService.getPlayers(team.id).subscribe(players => {
    this.matchService.getMatches(team.id).subscribe(matches => {
      // lógica mezclada
    });
  });
});

// ✅ Después — operadores de aplanamiento
forkJoin({
  players: this.playerService.getPlayers(id),
  matches: this.matchService.getMatches(id)
}).pipe(
  takeUntilDestroyed(this.destroyRef)
).subscribe(({ players, matches }) => {
  // lógica limpia
});
```

#### Archivos Fase 3

| Archivo | Acción |
|---|---|
| `modules/calendar/calendar.page.ts` | Mover `http.get` (línea 84) a un método en `TeamService`. |
| `modules/coach/pages/my-team/my-team.page.ts` | Delegar lógica de actualización de jugadores a `PlayerService`. |
| `modules/coach/pages/tactics/tactics.page.ts` | Extraer lógica de cálculo de posiciones a un `TacticsService` o helper dedicado. |
| `modules/coach/pages/edit-match/edit-match.page.ts` | Mover transformación de datos del partido a `MatchService`. |
| `modules/admin/pages/admin-dashboard/admin-dashboard.page.ts` | Extraer lógica de filtrado y agregación a `AdminService`. |
| `modules/user/pages/user-dashboard/user-dashboard.page.ts` | Eliminar `HttpClient` directo. Centralizar en servicio correspondiente. |

---

## 3. Checklist de Cierre del Refactor

Antes de considerar el refactor terminado y pasar a nuevas funcionalidades:

- [x] **Fase 1**: 0 suscripciones sin `takeUntilDestroyed` o `AsyncPipe` en toda la app (⚠️ pendiente: `tactics.page.ts`)
- [x] **Fase 2**: 0 usos de `any` en `core/services/`. (DTOs reales del backend integrados en `models.ts`).
- [ ] **Fase 3**: 0 imports de `HttpClient` en componentes de `modules/` (En progreso).
- [ ] El servidor de desarrollo arranca sin errores de compilación TypeScript
- [ ] La app navega correctamente por todas las rutas principales

---

## 4. Qué NO hacer durante el refactor

- **No cambiar rutas de endpoints** ni contratos de API
- **No rediseñar la UI** — eso va después del refactor
- **No introducir signals** — es Angular 17 pero introducirlos ahora es scope creep
- **No añadir nuevas funcionalidades** — primero bases sólidas, luego construcción
- **No romper Ionic** — respetar el ciclo de vida `ionViewWillEnter` / `ionViewDidLeave` donde ya se use
