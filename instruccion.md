Fase 2 COMPLETA. Resumen del 2.3:

  Passwords — mínimo 8 caracteres

  - Frontend: login.page.ts, register.page.ts, reset-password.page.ts
  → minLength(4/6) → minLength(8)
  - Backend: RegistroUsuario.java → @Size(min = 8) + @NotBlank +
  @Email. Controller con @Valid.

  Reset Password — token con expiración

  - Nueva entidad: PasswordResetToken.java — token UUID, relación con
  Usuario, expiración 60 min
  - Nuevo repositorio: PasswordResetTokenRepository.java
  - forgot-password reescrito: genera token → guarda en DB → envía
  email con link → todo @Transactional (si el email falla, el token se
   revierte). Ya no cambia la contraseña directamente.
  - reset-password nuevo endpoint: recibe token + newPassword → valida
   expiración → cambia contraseña → elimina token usado.
  - El frontend ya tenía los métodos correctos en auth.service.ts —
  encaja sin cambios.

  CSRF

  - No se implementó porque JWT via header Authorization es inmune a
  CSRF por diseño. Comentario técnico agregado en SecurityConfig.java.

  Las 3 subtareas de la Fase 2 están tachadas. ¿Seguimos con la Fase
  3?