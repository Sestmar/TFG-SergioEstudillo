Resumen de lo que encontré y corregí:

  El admin no estaba "ciego" por un problema de backend o CORS. El
  problema eran rutas fantasma — redirects a rutas que no existen en
  app-routing.module.ts:

  Archivo: no-admin.guard.ts:39
  Ruta incorrecta: /admin-dashboard
  Ruta correcta: /admin
  Efecto: Admin rebotado al intentar entrar al chat
  ────────────────────────────────────────
  Archivo: dashboard.page.ts:35
  Ruta incorrecta: /admin/dashboard
  Ruta correcta: /admin
  Efecto: Admin redirigido a wildcard → landing
  ────────────────────────────────────────
  Archivo: dashboard.page.ts:37
  Ruta incorrecta: /coach/dashboard
  Ruta correcta: /coach-dashboard
  Efecto: Coach redirigido a landing
  ────────────────────────────────────────
  Archivo: dashboard.page.ts:39
  Ruta incorrecta: /player/dashboard
  Ruta correcta: /player-dashboard
  Efecto: Jugador redirigido a landing

  También agregué ?. (optional chaining) en user.roles?.includes() del
   dashboard para evitar crash si roles es undefined.

  Con el fix anterior de getCurrentUser() que normaliza rol → roles, y
   estos redirects corregidos, el flujo ahora es:

  Login → Token guardado → GET /me → roles = [user.rol] →
  redirectByRole → ruta correcta → AuthGuard ve isAuthenticated = true
   → RoleGuard ve roles con datos → acceso concedido.