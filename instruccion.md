# INSTRUCCIONES PARA CLAUDE - REFACTOR FRONTEND TFG

¡DALE, Claude! Sergio y Gemini ya hicimos la limpieza inicial, ahora te toca a vos rematar la faena. No te pierdas en el bosque y seguí estas directivas a rajatabla:

## 1. ESTADO ACTUAL Y CONTEXTO
- **Stack:** Angular 17 (¡OJO! Usamos `DestroyRef` e `inject(DestroyRef)`, nada de `OnDestroy` manual si se puede evitar).
- **Fase 1 (RxJS):** ¡CASI LISTA! Blindamos 21 archivos con `takeUntilDestroyed(this.destroyRef)`. 
- **Fase 2 (Tipado):** Iniciada. Tenemos **164 `any`** que hay que purgar.
- **Modelos:** Ya están los DTOs reales del backend en `src/app/shared/models/models.ts` (Jugador, Equipo, Categoria, etc.).

## 2. TAREAS PRIORITARIAS (EN ESTE ORDEN)

### A. EL "FINAL BOSS" - Higiene RxJS en TacticsPage
- **Archivo:** `src/app/modules/coach/pages/tactics/tactics.page.ts` (y sus servicios asociados).
- **Problema:** Tiene suscripciones anidadas horribles (`.subscribe()` dentro de `.subscribe()`). 
- **Misión:** Refactorizá la carga de datos usando operadores de **RxJS declarativos** (`switchMap`, `forkJoin`, `combineLatest`). Linearizá la lógica para que sea legible y blindala con `takeUntilDestroyed`.

### B. PURGA MASIVA DE `any` (Fase 2)
- Atacá los **Servicios** y luego los **Componentes** (fijate en el conteo de `frontend/01-propuesta-refactor-frontend.md`).
- Reemplazá todos los `any` por las interfaces de `shared/models/models.ts`. 
- **PROHIBIDO:** Usar `as any` como parche. Si falta un campo en el modelo, agregalo basándote en lo que devuelve el backend (Spring Boot).

## 3. REGLAS DE ORO
1. **NO MODIFICAR ARCHIVOS .MD:** De eso se encarga Gemini. Vos solo programá.
2. **PERSISTENCIA:** Si hacés cambios importantes, documentalos para Sergio.
3. **PLAN MAESTRO:** Tu brújula detallada es `frontend/01-propuesta-refactor-frontend.md`. Leela ANTES de empezar.

¡DALE, loco! Que este TFG tiene que ser una locura cósmica de Clean Code. 🚀🧉
