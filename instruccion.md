# Tarea: Limpieza de Logs y Hardcoding (Frontend & Backend)

## Objetivo
Profesionalizar el código eliminando rastros de desarrollo, logs innecesarios que exponen datos y posibles URLs hardcodeadas.

## Especificaciones de Implementación

### 1. Limpieza de Frontend (Angular)
- **Borrar `console.log`:** Eliminar todos los `console.log` de la aplicación, especialmente los del `ChatService` y los de depuración de componentes.
- **Refactor de `console.error`:**
  - Si el error ya se está notificando al usuario mediante `NotificationService` o `ToastController`, **eliminar** el `console.error`.
  - Si el error es crítico pero no se muestra al usuario, evaluar si debe mostrarse una notificación amigable.
  - No dejar `console.error(err)` o similares en bloques `catch` o `subscribe` sin una acción clara.
- **Seguridad:** Asegurarse de que NO se imprima el objeto `user`, `token` o payloads de `localStorage` en ningún log.

### 2. Saneamiento de Backend (Spring Boot)
- **URLs Hardcodeadas:** Buscar en todo el proyecto (`src/main/java`) cualquier referencia a `http://localhost:8080` o cualquier URL absoluta que apunte al propio servidor.
- **Rutas de Archivos:** En los controladores que manejan imágenes (`MediaController`, `FileController`, `PublicController`, etc.), asegurarse de que las URLs devueltas sean:
  - **Relativas** (ej. `/api/uploads/foto.jpg`).
  - O generadas dinámicamente usando `ServletUriComponentsBuilder` para adaptarse al entorno (Local vs Render).
- **Logs de Servidor:** Eliminar cualquier `System.out.println` residual y asegurarse de que los logs importantes usen `log.info` o `log.error` de SLF4J (que ya implementamos con Claude en la tarea anterior).

## Resultado Esperado
- Código limpio de "ruido" en la consola del navegador.
- Aplicación agnóstica al entorno (sin URLs locales hardcodeadas).
- Mayor seguridad al no exponer estados internos en logs.
