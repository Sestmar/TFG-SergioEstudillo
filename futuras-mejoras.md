# 🛡️ Hoja de Ruta: Blindaje de Seguridad 2.0 — DAM United FC

Este documento detalla el plan de acción técnico definitivo para resolver los hallazgos de la Auditoría de Seguridad. Integra el diagnóstico inicial de Claude y el análisis de arquitectura de Gemini.

---

## 🚨 FASE 1: INCENDIOS (Prioridad Crítica — Ejecutar YA)

*Objetivo: Detener la exposición de credenciales, blindar el acceso administrativo y parchar vulnerabilidades del core.*

### 1.1 Gestión de Secretos y Credenciales (Backend)
- [x] **Externalizar Secretos:** Mover JWT Secret, Passwords de DB, Gmail y Twilio a variables de entorno en Render.
- [x] **Configuración Segura:** Usar `${VARIABLE_NAME}` en `application.properties` sin valores hardcodeados.
- [x] **Limpieza de Repo:** Agregar `application-local.properties` al `.gitignore`.
- [x] **ROTACIÓN DE CLAVES:** Generar un nuevo JWT Secret y cambiar las passwords de Gmail/Twilio (están comprometidas).

### 1.2 Autorización en Backend (Spring Security)
- [x] **Habilitar Method Security:** Activar `@EnableMethodSecurity` en la configuración.
- [x] **Blindar AdminController:** Aplicar `@PreAuthorize("hasRole('ADMIN')")` a todos sus métodos.
- [x] **Blindar EquipoController:** Aplicar `@PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR')")` (Usar rol `ENTRENADOR`, no `COACH`).
- [x] **Blindar JugadorController:** Asegurar que solo el admin o el propio jugador puedan editar su perfil.

### 1.3 Seguridad en Navegación y Vulnerabilidades de Angular (Frontend)
- [x] **ACTUALIZACIÓN CRÍTICA:** Migrar Angular de v17 a v18.2.15+ para cerrar múltiples CVEs de XSS (SVG, i18n).
- [x] **Guardias de Ruta:** Implementar `canActivate: [AuthGuard]` y `RoleGuard` en todas las rutas privadas de `app-routing.module.ts`.
- [x] **Bloqueo de UI:** Asegurar que los menús de Admin/Entrenador no se rendericen para usuarios sin el rol correspondiente.

---

## ⚔️ FASE 2: FORTALECIMIENTO (Prioridad Alta — Esta Semana)

*Objetivo: Mitigar vectores comunes de ataque y corregir bugs funcionales de seguridad.*

### 2.1 Refactor de CORS y WebSockets
- [x] **CORS:** Eliminar `CorsConfig.java` (duplicado) y centralizar en `SecurityConfig.java` con whitelist estricta.
- [x] **WebSockets:** Restringir orígenes en `WebSocketConfig.java` (punto separado del CORS) para evitar ataques de Cross-Site WebSocket Hijacking.

### 2.2 Validación de Archivos (Path Traversal)
- [x] **Sanitización en FileController:** Validar que el nombre del archivo no contenga `../` ni caracteres especiales.
- [x] **Restricción de Directorio:** Forzar que las lecturas ocurran exclusivamente dentro de `target/uploads`.

### 2.3 Seguridad y Lógica de Passwords
- [x] **Mínimo de caracteres:** Subir el requerimiento a 8 caracteres (Frontend + Backend).
- [x] **Fix Reset Password:** 
  - El token debe tener expiración (1 hora).
  - **Lógica Atómica:** No cambiar la contraseña en la DB si el envío del email falla. Informar al usuario del error.
- [x] **Protección XSRF:** No aplica — la app usa JWT via header Authorization (no cookies), por lo que es inmune a CSRF por diseño. Documentado en SecurityConfig.

---

## 💎 FASE 3: PULIDO PROFESIONAL (Prioridad Media/Baja — Antes de Junio)

*Objetivo: Eliminar rastros de desarrollo y mejorar la observabilidad segura.*

### 3.1 Limpieza de Entorno y Manejo de Errores
- [ ] **URLs Hardcodeadas:** Eliminar referencias a `localhost:8080` en `MediaController.java` y otros.
- [ ] **Global Exception Handler:** Dejar de exponer mensajes internos de excepciones al cliente. Devolver mensajes genéricos y loguear el detalle internamente.
- [ ] **Eliminar e.printStackTrace():** Sustituir todas las trazas de error en consola por un logger profesional (`slf4j`).
- [ ] **Limpiar Frontend:** Eliminar `console.log` y `console.error` que expongan objetos de usuario o tokens.

### 3.2 Seguridad de Cabeceras y Cookies
- [ ] **CSP Headers:** Agregar un `Content-Security-Policy` básico en el `index.html`.
- [ ] **Migración JWT:** Mover el token de `localStorage` a una cookie `httpOnly` y `Secure` para mitigar ataques XSS residuales.

---

## 📈 NOTA PARA EL TFG
Este documento sirve como evidencia de un proceso de **Auditoría y Remediación**. Al finalizar cada tarea, se debe marcar aquí para mantener la trazabilidad de la mejora continua del sistema.
