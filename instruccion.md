# 📋 DIAGNÓSTICO DE ERRORES: LOGIN, F5 Y ERROR 400

Tras los últimos ajustes, el sistema ha entrado en un estado de inestabilidad crítica en el dashboard del Admin.

### 1. El "Efecto F5" (Redirect a player-dashboard)
**Problema:** Al refrescar la página (`F5`) en el panel de Admin, el sistema redirige automáticamente a `/player-dashboard` y se queda colgado.
**Causa Raíz:** Carrera de hilos en el `AuthService`. Al inicializar la app, se lee el token y se marca `isAuthenticated = true` de inmediato, pero el `currentUser$` aún no tiene los roles (ya que estos se cargan asíncronamente vía `getCurrentUser()`). El `RoleGuard` se activa, ve un usuario "sin roles" y aplica la redirección por defecto a jugador.
**Solución Requerida:** 
- El `RoleGuard` y `AuthGuard` deben esperar a que el usuario esté "completamente cargado" (que tenga roles) si existe un token en el storage. 
- No emitir `true` en `isAuthenticated$` hasta que el perfil esté recuperado o asegurar que el Guard espere la emisión del perfil completo.

### 2. Error 400 Bad Request en /api/admin/*
**Problema:** Las llamadas a `equipos` y `usuarios-activos` devuelven 400 tanto en Localhost como en Render.
**Investigación para Claude:**
- **Logs de Backend:** Es imperativo revisar el log de Spring Boot. Un 400 en un GET suele ser una excepción del lado del servidor (como un fallo en la query JPA o en la serialización Jackson) que Spring captura y devuelve como Bad Request.
- **Inconsistencia de Datos:** El usuario reporta que las bases de datos podrían haberse "mezclado". Si el esquema local no coincide exactamente con el de producción o hay datos huérfanos, las queries de `AdminService` pueden estar fallando.
- **Serialización Jackson:** Revisar que en `AdminService.java` los `Map<String, Object>` no estén intentando serializar objetos JPA complejos que provoquen recursión o fallos de carga perezosa (Lazy).

### Tareas Prioritarias:
1. **Fix F5:** Modificar los Guards o el `AuthService` para que el flujo de inicialización sea secuencial y no permita redirecciones antes de tener los roles.
2. **Debug 400:** Claude debe intentar reproducir el error 400 en local, mirar el log de la consola de Spring y solucionar la causa raíz (probablemente en `AdminService.java` o en la configuración de Jackson).
3. **Roles Final Check:** Asegurar que la normalización `rol` -> `roles` sea persistente y no se pierda entre refrescos.

**Claude:** Centrate en estos dos bloqueos. El sistema ya es funcional pero es "frágil" al refrescar y las APIs de admin están rotas. ¡Ponete las pilas con la robustez, loco! 🛠️🦾
