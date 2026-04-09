# 🛡️ Hoja de Ruta: Blindaje de Seguridad 2.0 — DAM United FC

Este documento detalla el plan de acción técnico definitivo para resolver los hallazgos de la Auditoría de Seguridad. Integra el diagnóstico inicial de Claude y el análisis de arquitectura de Gemini.

---

## 🚨 FASE 1: INCENDIOS (Prioridad Crítica — COMPLETADA ✅)

*Objetivo: Detener la exposición de credenciales, blindar el acceso administrativo y parchar vulnerabilidades del core.*

### 1.1 Gestión de Secretos y Credenciales (Backend)
- [x] **Externalizar Secretos:** Mover JWT Secret, Passwords de DB, Gmail y Twilio a variables de entorno en Render.
- [x] **Configuración Segura:** Usar `${VARIABLE_NAME}` en `application.properties` sin valores hardcodeados.
- [x] **Limpieza de Repo:** Agregar `application-local.properties` al `.gitignore`.
- [x] **ROTACIÓN DE CLAVES:** Generar un nuevo JWT Secret y cambiar las passwords de Gmail/Twilio.

### 1.2 Autorización en Backend (Spring Security)
- [x] **Habilitar Method Security:** Activar `@EnableMethodSecurity` en la configuración.
- [x] **Blindar AdminController:** Aplicar `@PreAuthorize("hasRole('ADMIN')")` a todos sus métodos.
- [x] **Blindar EquipoController:** Aplicar `@PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR')")`.
- [x] **Blindar JugadorController:** Asegurar que solo el admin o el propio jugador puedan editar su perfil.

### 1.3 Seguridad en Navegación y Vulnerabilidades de Angular (Frontend)
- [x] **ACTUALIZACIÓN CRÍTICA:** Migrar Angular de v17 a v18.2.15+ (Completado: Angular 18).
- [x] **Guardias de Ruta:** Implementar `canActivate: [AuthGuard]` y `RoleGuard` en todas las rutas privadas.
- [x] **Bloqueo de UI:** Asegurar que los menús de Admin/Entrenador no se rendericen para usuarios sin el rol correspondiente.

---

## ⚔️ FASE 2: FORTALECIMIENTO (Prioridad Alta — COMPLETADA ✅)

*Objetivo: Mitigar vectores comunes de ataque y corregir bugs funcionales de seguridad.*

### 2.1 Refactor de CORS y WebSockets
- [x] **CORS:** Centralizado en `SecurityConfig.java` con whitelist estricta.
- [x] **WebSockets:** Restricción de orígenes en `WebSocketConfig.java`.

### 2.2 Validación de Archivos (Path Traversal)
- [x] **Sanitización en FileController:** Validar nombres de archivos y bloquear `../`.
- [x] **Restricción de Directorio:** Forzar lecturas dentro de `target/uploads`.

### 2.3 Seguridad y Lógica de Passwords
- [x] **Mínimo de caracteres:** 8 caracteres en registro/reset.
- [x] **Fix Reset Password:** Token con expiración (1 hora) y lógica atómica.

---

## 💎 FASE 3: PULIDO PROFESIONAL (Prioridad Media/Baja — En Proceso 🚧)

*Objetivo: Eliminar rastros de desarrollo y mejorar la observabilidad segura.*

### 3.1 Limpieza de Entorno y Manejo de Errores
- [x] **URLs Hardcodeadas:** Eliminadas referencias a localhost.
- [x] **Global Exception Handler:** Implementado `@ControllerAdvice`.
- [x] **Eliminar e.printStackTrace():** Sustituir todas las trazas de error por un logger (`slf4j`).
- [x] **Limpiar Frontend:** Eliminación masiva de `console.log` innecesarios.

### 3.2 Seguridad de Cabeceras
- [x] **CSP Headers:** Agregado Content-Security-Policy básico en `index.html`.

---

## 🚀 Evolución Estratégica y Calidad Técnica

### 1.1 Ingeniería de Calidad (Evolución)
- [x] **CI/CD Pipelines:** Automatización con GitHub Actions para Frontend y Backend.
- [ ] **Migración a Angular Signals:** Optimizar gestión de estado.
- [x] **PWA (Progressive Web App):** Service Workers configurados.

### 1.3 Funcionalidades de Impacto Deportivo
- [ ] **Pasarela de Pagos (Stripe):** Implementación de pagos de cuotas.
- [x] **Motor de Reportes PDF:** Generación de fichas técnicas en formato PDF.

---

---

## 📋 Registro de Decisiones Técnicas (ADR)
- [ADR-001: Descarte de Migración JWT a Cookies HttpOnly] (Ver archivo original para detalle).
