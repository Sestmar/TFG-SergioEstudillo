# 📋 RESUMEN DE CAMBIOS REALIZADOS (FASE 2)

Claude completó satisfactoriamente la Fase 2, abordando los siguientes puntos:

### 2.3 Seguridad y Lógica de Passwords
1. **Passwords (Mínimo 8 caracteres):**
   - **Frontend:** Actualizados validadores `minLength(8)` en `login.page.ts`, `register.page.ts` y `reset-password.page.ts`.
   - **Backend:** Actualizado `RegistroUsuario.java` con `@Size(min = 8)` y `@Valid` en los controladores. El login sigue aceptando claves anteriores para no bloquear usuarios actuales.

2. **Reset Password (Tokens):**
   - **Nueva Entidad:** `PasswordResetToken` (UUID, expiración 1h, relación con Usuario).
   - **Flujo Atómico:** El endpoint de recuperación es `@Transactional`. Si falla el envío del email, el token no se confirma en la BD.

3. **Seguridad de Archivos:**
   - Se eliminó `MediaController.java` y se blindó `FileController.java` contra Path Traversal.

---

# 🔴 PROBLEMA CRÍTICO: BLOQUEO DE LOGIN EN LOCALHOST

Tras reiniciar el backend y aplicar los cambios de la Fase 2, **no es posible iniciar sesión con las cuentas por defecto (admin, jugadores)** cuyas contraseñas tienen 6 caracteres (`123456`).

### Síntomas Detectados:
- Al introducir la contraseña de 6 caracteres, el sistema muestra el mensaje de error: **"La contraseña es requerida"**.
- El botón de login permanece deshabilitado o el formulario se marca como inválido.
- **Discrepancia:** En la ruta de Render (producción) el login funciona porque el build falló y sigue corriendo la versión vieja del frontend. En Localhost (código nuevo) el login está bloqueado.

### Investigación Requerida para Claude:
1. **Validadores de Login:** Revisar `login.page.ts`. Se ha subido el `minLength` a 8, pero esto bloquea a los usuarios que ya están en la base de datos con claves más cortas.
2. **Lógica de Mensajes en HTML:** El mensaje "La contraseña es requerida" aparece incluso cuando se escribe, lo que indica que el `*ngIf` del HTML está mostrando el error de `required` erróneamente en lugar del de `minlength`.
3. **Acción Sugerida:** Relajar la validación **solo en el login** (bajar `minLength` a 4 o 6, o eliminarlo para dejar que el backend maneje el error) para permitir el acceso a usuarios antiguos. Mantener el requisito de 8+ caracteres únicamente para **Registro** y **Reset Password**.

---

# 🔴 ERROR DE DESPLIEGUE (Recordatorio)

El build de Docker sigue fallando por el conflicto de **Angular 18 vs ESLint 17**.

**Claude:** Por favor, solucioná primero el bloqueo del login en el frontend y luego aplicá la corrección de dependencias para que el despliegue en Render sea exitoso. ¡Es prioridad que el desarrollador pueda entrar al sistema en localhost, loco! 🛠️🦾
