# Guía de Reestructuración del Frontend — DAM United FC

> **Tecnologías utilizadas**: Angular 17 + Ionic 7 + TypeScript 5.2
> **Objetivo**: Establecer unas bases sólidas en el frontend para facilitar la incorporación de nuevas funcionalidades, mejorar la interfaz de usuario y asegurar la escalabilidad sin acumular deuda técnica.

---

## 1. Diagnóstico General

| Problema | Severidad | Magnitud real |
|---|---|---|
| Suscripciones RxJS sin gestión de memoria | CRÍTICO | 64 de 72 `.subscribe()` sin protección |
| Tipado débil (`any`) | ALTO | 164 menciones en toda la aplicación (37 en servicios, 127 en módulos y compartidos) |
| Lógica de negocio en las Páginas | ALTO | Páginas con llamadas directas a `HttpClient` y manipulación de datos |
| Objetos de gran tamaño (archivos > 16KB de lógica) | MEDIO | `tactics.page.ts`, `admin-dashboard.page.ts` |

---

## 2. Las 3 Fases de la Reestructuración

---

### Fase 1 — Gestión de Memoria y Control de RxJS
**Prioridad: CRÍTICA** | Realizar esta tarea primero permite avanzar con las fases siguientes.

**Problema**: Se han detectado 64 suscripciones activas que carecen de un mecanismo de cancelación. Al destruir un componente, el observable continúa ejecutándose en segundo plano, lo que provoca fugas de memoria y errores en el estado de la aplicación.

**Patrón a aplicar — Angular 17 moderno (`takeUntilDestroyed`)**

> ⚠️ No se recomienda utilizar el patrón antiguo con `Subject`. Angular 17 ofrece una solución nativa más eficiente.

```typescript
// ✅ Patrón MODERNO (Angular 17)
import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class MiPage implements OnInit {
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.service.getData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(...);
  }
  // No es necesario implementar ngOnDestroy
}
```

**Alternativa preferida — `AsyncPipe` en la plantilla**

```typescript
// En el componente: se expone únicamente el observable
data$ = this.service.getData();
```

```html
<!-- En la plantilla: Angular gestiona la suscripción y cancelación automáticamente -->
<div *ngIf="data$ | async as data">{{ data.nombre }}</div>      
```

#### Archivos de la Fase 1

| Archivo | Suscripciones | Acción |
|---|---|---|
| `modules/calendar/calendar.page.ts` | 8 | Aplicar `takeUntilDestroyed`. Trasladar `http.get` (línea 84) a `TeamService`. |        
| `modules/user/pages/profile/profile.page.ts` | 5 | Aplicar `takeUntilDestroyed` en todas las suscripciones. |
| `modules/coach/pages/my-team/my-team.page.ts` | 5 | Aplicar `takeUntilDestroyed`. |
| `modules/players/pages/player-dashboard/player-dashboard.page.ts` | 5 | Aplicar `takeUntilDestroyed`. |
| `modules/user/pages/user-dashboard/user-dashboard.page.ts` | 4 | Aplicar `takeUntilDestroyed`. Reemplazar `http.get` por el servicio correspondiente. |
| `modules/admin/pages/admin-dashboard/admin-dashboard.page.ts` | 4 | Aplicar `takeUntilDestroyed`. |
| `modules/admin/pages/team-detail/team-detail.page.ts` | 4 | Aplicar `takeUntilDestroyed`. |
| `modules/coach/pages/coach-profile/coach-profile.page.ts` | 4 | Aplicar `takeUntilDestroyed`. |
| `modules/coach/pages/tactics/tactics.page.ts` | 4 | **CRÍTICO**: Existe lógica de arrastrar y soltar mezclada con flujos de datos. Requiere análisis previo. |
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

### Fase 2 — Eliminación del tipo `any` y Tipado Estricto
**Prioridad: ALTA** | Sin los tipos adecuados, las herramientas de desarrollo y la detección de errores pierden su eficacia.

**Problema**: Se han encontrado 164 menciones al tipo `any`. Los casos más graves se sitúan en los servicios (37), ya que propagan la falta de tipado a los componentes que los consumen.

**Regla**: Todas las respuestas HTTP deben estar tipadas mediante las interfaces definidas en `shared/models/models.ts`.

```typescript
// ✅ Recomendado
getPlayers(): Observable<Jugador[]> {
  return this.http.get<Jugador[]>(`${this.apiUrl}/players`);    
}
```

#### Archivos de la Fase 2

| Archivo | Menciones de `any` | Acción |
|---|---|---|
| `modules/admin/pages/admin-dashboard/admin-dashboard.page.ts` | 16 | Definir tipos para las variables de estado y respuestas HTTP. |
| `modules/coach/pages/tactics/tactics.page.ts` | 10 | Establecer interfaces para las posiciones y los jugadores en la pizarra táctica. |
| `modules/coach/pages/team-stats/team-stats.page.ts` | 9 | Definir tipos específicos para las estadísticas. |
| `modules/players/pages/player-dashboard/player-dashboard.page.ts` | 13 | Aplicar los tipos `Jugador`, `Estadística` y `Partido`. |     
| `modules/coach/pages/my-team/my-team.page.ts` | 7 | Tipar las respuestas de jugadores y equipos. |
| `modules/calendar/calendar.page.ts` | 7 | Definir el tipo de los eventos del calendario con la interfaz `CalendarEvent`. |
| `modules/club/club.page.ts` | 7 | Establecer tipos para los datos del club y el equipo. |
| `modules/admin/pages/training-attendance/training-attendance.page.ts` | 6 | Tipar la asistencia con las interfaces correspondientes. |
| `modules/user/pages/profile/profile.page.ts` | 6 | Utilizar el tipo `Usuario`. |
| `modules/admin/pages/team-detail/team-detail.page.ts` | 6 | Aplicar los tipos `Equipo` y `Jugador`. |
| `core/services/admin/admin.service.ts` | 5 | Definir tipos para todos los métodos de administración. |
| `core/services/convocation\convocation.service.ts` | 5 | Establecer la interfaz `Convocatoria` y eliminar los arreglos de tipo `any`. |
| `core/services/match/match.service.ts` | 5 | Definir las interfaces `Partido`, `Alineación` y `Acta`. |
| `core/services/incident/incident.service.ts` | 3 | Establecer la interfaz `Incidencia`. |
| `core/services/api/api.service.ts` | 3 | Definir tipos para las respuestas generales de la API base. |
| `core/services/request/request.service.ts` | 3 | Tipar las solicitudes de inscripción. |
| `core/services/state/team-state.service.ts` | 3 | Eliminar conversiones de tipo manuales a `any`. Usar `Equipo` directamente. |
| `modules/coach/pages/edit-match/edit-match.page.ts` | 9 | Establecer tipos para el formulario y los datos del encuentro. |
| `modules/coach/pages/coach-dashboard/coach-dashboard.page.ts` | 6 | Definir tipos para los datos del panel de control. |
| `core/services/state/user-state.service.ts` | 1 | Eliminar el uso del tipo `any` y emplear `Usuario` directamente. |
| `shared/models/convocation-modal/convocation-modal.component.ts` | 3 | Definir tipos para las entradas y salidas del componente modal. |

---

### Fase 3 — Delegación a Servicios y Limpieza de Páginas
**Prioridad: ARQUITECTÓNICA** | Esta fase garantiza que el frontend esté preparado para el crecimiento futuro.

**Problema**: Se han detectado páginas que realizan llamadas directas a `HttpClient`, transformaciones de datos en línea y suscripciones anidadas.

**Reglas de arquitectura:**
1. **Ninguna Página debe importar `HttpClient`** — Todas las peticiones deben gestionarse a través de un servicio en `core/services/`.
2. **Las Páginas deben actuar únicamente como orquestadores** — Reciben datos de los servicios y los suministran a la plantilla.
3. **Las transformaciones de datos corresponden a los servicios** — Filtrado, mapeo y ordenación.
4. **Las suscripciones anidadas deben sustituirse por operadores como `switchMap` o `forkJoin`**.

```typescript
// ✅ Recomendado — Uso de operadores para flujos paralelos
forkJoin({
  players: this.playerService.getPlayers(id),
  matches: this.matchService.getMatches(id)
}).pipe(
  takeUntilDestroyed(this.destroyRef)
).subscribe(({ players, matches }) => {
  // Procesamiento de datos limpio y centralizado
});
```

#### Archivos de la Fase 3

| Archivo | Acción |
|---|---|
| `modules/calendar/calendar.page.ts` | Trasladar `http.get` (línea 84) a un método específico en `TeamService`. |
| `modules/coach/pages/my-team/my-team.page.ts` | Delegar la lógica de actualización de jugadores al servicio `PlayerService`. |
| `modules/coach/pages/tactics/tactics.page.ts` | Extraer el cálculo de posiciones a un servicio de tácticas o una utilidad dedicada. |
| `modules/coach/pages/edit-match/edit-match.page.ts` | Trasladar la transformación de datos del encuentro al servicio `MatchService`. |
| `modules/admin/pages/admin-dashboard/admin-dashboard.page.ts` | Centralizar la lógica de filtrado y agregación en `AdminService`. |   
| `modules/user/pages/user-dashboard/user-dashboard.page.ts` | Eliminar el uso directo de `HttpClient`. Centralizar en el servicio correspondiente. |

---

## 3. Lista de Verificación para el Cierre de la Reestructuración

Antes de dar por finalizada la reestructuración:

- [x] **Fase 1**: Ninguna suscripción sin `takeUntilDestroyed` o `AsyncPipe` en la aplicación (⚠️ pendiente: `tactics.page.ts`).       
- [x] **Fase 2**: Eliminación total del tipo `any` en `core/services/`.
- [ ] **Fase 3**: Eliminación de las importaciones de `HttpClient` en los componentes de los módulos (En proceso).
- [ ] Verificación de que el servidor de desarrollo inicia sin errores de compilación.
- [ ] Comprobación de que la navegación por todas las rutas principales es correcta.

---

## 4. Prácticas no recomendadas durante el proceso

- No modificar las rutas de los puntos de acceso (endpoints) ni los contratos de la API.
- No realizar rediseños de la interfaz de usuario en esta fase.
- No introducir `signals` en este momento para evitar desviaciones en el alcance del proyecto.
- No añadir nuevas funcionalidades hasta asegurar la solidez de las bases actuales.
- Respetar los ciclos de vida de Ionic (`ionViewWillEnter`, `ionViewDidLeave`) en los componentes donde ya se utilicen.
