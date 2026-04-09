# 🔧 Auditoría de Deuda Técnica — DAM United FC

> Auditoría realizada: 9 de Abril 2026  
> Estado: En proceso de resolución

---

## 🚨 ALTA — URLs de producción hardcodeadas (Backend)

Estas URLs están embebidas directamente en el código Java, lo que las hace imposibles de cambiar sin recompilar.

| Archivo | Línea | URL hardcodeada |
|---------|-------|-----------------|
| `AdminService.java` | 277 | `https://backend-tfg-sergio.onrender.com/api/uploads/` |
| `UsuarioController.java` | 90 | `https://tfg-dam-united-web.onrender.com/auth/reset-password?token=` |

**Fix aplicado:** Mover a `application.properties` como `app.backend.url` y `app.frontend.url`, inyectar con `@Value`.

---

## ⚠️ MEDIA — console.warn() en producción (Frontend)

12 llamadas a `console.warn()` que se ejecutan en producción, exponiendo trazas internas.

| Archivo | Línea |
|---------|-------|
| `app.component.ts` | 92 |
| `auth.interceptor.ts` | 36 |
| `auth.service.ts` | 51 |
| `auth.service.ts` | 205 |
| `chat.service.ts` | 178 |
| `chat.service.ts` | 261 |
| `chat.service.ts` | 271 |
| `user-dashboard.page.ts` | 82 |
| `chat.page.ts` | 80 |
| `chat.page.ts` | 86 |
| `team-stats.page.ts` | 202 |
| `player-dashboard.page.ts` | 305 |

**Fix aplicado:** Eliminadas todas las llamadas.

---

## ⚠️ MEDIA — @Autowired (inyección de campo) en Backend

Spring recomienda constructor injection. `@Autowired` en campos dificulta los tests y viola inmutabilidad.

| Archivo | Línea |
|---------|-------|
| `WebSocketConfig.java` | 25 |
| `WebSocketConfig.java` | 28 |

**Fix aplicado:** Migrado a constructor injection con `final` + `@RequiredArgsConstructor`.

---

## 🔵 BAJA — Métodos largos en AdminService.java

Métodos que superan 40 líneas, con lógica compleja no extraída.

| Método | Línea aprox. | Longitud |
|--------|-------------|---------|
| `getUsuariosActivos()` | 66 | ~48 líneas |
| `cerrarActaAdmin()` | 316 | ~48 líneas |
| `getEquipoDetalle()` | 366 | ~44 líneas |

**Estado:** Pendiente de refactor (fuera del alcance del TFG).

---

## ✅ RESUELTO — Memory leaks en subscriptions (Frontend)

Auditoría confirmó que todos los componentes críticos usan gestión correcta:

- `admin-dashboard.page.ts` → `takeUntilDestroyed(destroyRef)` ✅
- `chat.page.ts` → `takeUntil(destroy$)` + `ngOnDestroy()` ✅
- `coach.page.ts` → `takeUntilDestroyed(destroyRef)` ✅

---

## ✅ RESUELTO — URLs localhost en CORS (Backend)

Las URLs `localhost:4200`, `localhost:8100` en `WebSocketConfig.java` y `SecurityConfig.java` son **intencionales** — son los orígenes permitidos para desarrollo local. No son deuda técnica.

---

## 📊 Estado Final

| Categoría | Severidad | Estado |
|-----------|-----------|--------|
| URLs producción hardcodeadas | ALTA | ✅ Resuelto |
| console.warn en producción | MEDIA | ✅ Resuelto |
| @Autowired field injection | MEDIA | ✅ Resuelto |
| Métodos largos AdminService | BAJA | ⏳ Pendiente (refactor futuro) |
| Memory leaks subscriptions | — | ✅ No existe problema |
