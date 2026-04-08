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

## 🌐 FASE 4: LANDING PAGE COMPLETA (Prioridad Media — Antes de Junio)

*Objetivo: Convertir la landing en una página pública de presentación del club con scroll fluido, dando vida a los enlaces muertos del navbar y footer.*

### 4.1 Navegación por anclas (navbar)

- [x] **Inicio:** Ancla `#hero` — ya existe, simplemente actualizar el `href="#"` a `href="#hero"`.
- [x] **Noticias:** Ancla `#noticias` — nueva sección con las últimas novedades del club.
- [x] **Equipos:** Ya funciona con `routerLink="/club"` — no tocar.

### 4.2 Sección "Noticias" (`#noticias`)

- [x] **Contenido:** 3 tarjetas de noticias/novedades hardcodeadas (título, fecha, imagen, extracto breve). No requiere backend nuevo.
- [x] **Estética:** Misma paleta gold/leather de la landing. Tarjetas con borde dorado, fondo oscuro y efecto hover.
- [x] **Posición en el HTML:** Entre la `fan-section` y el `footer`.

### 4.3 Sección "Historia" (`#historia`)

- [x] **Contenido:** Bloque de texto con la historia del club + imagen ilustrativa (puede ser el escudo grande). Hardcodeado.
- [x] **Layout:** Dos columnas en desktop (texto izquierda, imagen derecha), columna única en mobile.
- [x] **Posición en el HTML:** Antes de la `fan-section`.

### 4.4 Sección "Estadio" (`#estadio`)

- [x] **Contenido:** Nombre del estadio, aforo, dirección y una imagen. Hardcodeado.
- [x] **Layout:** Imagen de fondo con overlay oscuro y datos superpuestos (estilo hero secundario).
- [x] **Posición en el HTML:** Después de la sección "Historia".

### 4.5 Footer — enlaces internos

- [x] **Historia:** Cambiar `href="#"` a `href="#historia"` (scroll suave).
- [x] **Estadio:** Cambiar `href="#"` a `href="#estadio"` (scroll suave).
- [x] **Socios:** Redirigir a `routerLink="/auth/register"` — el registro ya cumple este rol.

### 4.6 Scroll suave global

- [x] Agregar `scroll-behavior: smooth` al `:host` o `ion-content` de la landing para que las anclas animen el scroll en lugar de saltar.

---

## 📈 NOTA PARA EL TFG
Este documento sirve como evidencia de un proceso de **Auditoría y Remediación**. Al finalizar cada tarea, se debe marcar aquí para mantener la trazabilidad de la mejora continua del sistema.
