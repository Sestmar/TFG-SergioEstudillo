# Futuras Mejoras - DAM United FC

Este documento lista las funcionalidades y mejoras técnicas pendientes, priorizadas para maximizar el valor del TFG sin añadir complejidad innecesaria (scope creep).

---

## 1. Chat en Tiempo Real por Equipo (Backend Primero) 💬

**Descripción:** Canal de comunicación interna por equipo. El entrenador puede enviar mensajes a sus jugadores y viceversa.

### Hoja de Ruta Técnica
1.  **Backend (Spring Boot)**: Integrar **Spring WebSocket + STOMP** sobre SockJS.
    - Endpoint: `/ws` para la conexión.
    - Destinos: `/topic/equipo/{teamId}` (broadcast) y `/queue/usuario/{userId}` (privados).
    - Persistencia en BD para el historial.
2.  **Frontend (Angular + Ionic)**: Servicio `ChatService` usando `stompjs` y `sockjs-client`.
    - Suscripción con `takeUntilDestroyed`.
    - UI: Lista de mensajes con scroll automático y burbujas diferenciadas.

Nuevas mejoras para el punto 1.
1. El contador de mensajes no leídos en el menú (Badge)
Esta es una mejora clásica de UX. Para lograrlo, necesitamos que el frontend "escuche" los mensajes entrantes incluso cuando el usuario no está metido en la pantalla del chat.

Cómo se implementa a nivel técnico (Pendiente validar por Claude que conoce la arquitectura):

El ChatService (que es un Singleton en Angular) debe conectarse al WebSocket desde el momento en que el usuario se loguea (por ejemplo, en el app.component.ts o en el dashboard), no solo cuando entra a la página del chat.

El servicio debe mantener una variable reactiva (BehaviorSubject) con el conteo de mensajes no leídos.

Si llega un mensaje y el usuario no está en la ruta /chat, el contador sube. Si entra al /chat, el contador se resetea a cero.

Tu componente del menú lateral simplemente se suscribe a ese BehaviorSubject para mostrar el numerito en un "badge" rojo sobre el icono.

2. Notificaciones Push en el móvil (Local/Push Notifications)
Como bien dices, en una app móvil los usuarios esperan que el teléfono vibre o suene cuando les hablan.

Cómo se implementa a nivel técnico:

Si la app está abierta (en primer plano): Ionic tiene un plugin llamado @capacitor/local-notifications. Cuando el ChatService recibe un mensaje por STOMP y el usuario no está en la pantalla del chat, se dispara una notificación local nativa.

Si la app está cerrada (en segundo plano/matada): Aquí los WebSockets no sirven porque el sistema operativo corta la conexión. Para esto se usa Firebase Cloud Messaging (FCM) integrado con tu backend de Spring Boot, pero es una implementación mucho más compleja.

---

## 2. Sistema de Notificaciones Pro (NotificationService) 🔔

**Descripción:** Centralizar la lógica de `ToastController` que actualmente está dispersa por más de 15 componentes.

### Mejoras a implementar
- **Centralización**: Inyectar `ToastController` solo en `core/services/NotificationService.ts`.
- **Tipología Visual**: Métodos específicos `.success()`, `.error()`, `.warning()` e `.info()` con colores y duraciones predefinidas.
- **Consistencia**: Unificar posición (`top` o `bottom`) y estilo en toda la aplicación.

---

## 3. Generación de Reportes / Actas (Print-Friendly) 📄

**Descripción:** Permitir que el entrenador o admin obtenga un documento con el resumen del partido o ficha del jugador.

### Estrategia de Implementación (Low Cost / High Value)
- **Evitar Scope Creep**: No usar librerías pesadas como iText o JasperReports en el backend si no es estrictamente necesario.
- **Solución CSS**: Implementar **Media Queries de Impresión** (`@media print`) en la vista de detalle.
- **Acción**: Un botón simple que dispare `window.print()`, ocultando el header/footer/sidebar y dejando solo el acta limpia para guardar como PDF desde el navegador.

---

## 4. Analítica y Datos: El Cerebro del Equipo 📈🧠

**Descripción:** Implementar una capa visual de datos para transformar las estadísticas de las actas en información accionable para el entrenador y motivación para el jugador.

### Implementación Propuesta
- **Stack**: Integrar **ApexCharts** o **Chart.js** (ambos tienen excelentes wrappers para Angular).
- **Dashboard del Entrenador**:
  - Gráfico de barras: Goles por partido y racha de victorias/derrotas.
  - Gráfico de radar (Spider Chart): Comparativa de rendimiento por líneas (Defensa, Medio, Ataque).
- **Dashboard del Jugador**:
  - Gráfico de evolución: Minutos jugados y participación en goles a lo largo de la temporada.
  - Comparativa: Rendimiento personal vs. promedio del equipo en su posición.

---

## 5. Deuda Técnica y Limpieza Final 🧹

Estas tareas cierran el ciclo de refactorización profunda para asegurar un código de calidad profesional.

### Tareas Pendientes
- **Eliminar `user-state.service.ts`**: Confirmado como "código muerto". No se usa más allá de su propio index. Borrar archivo y referencias.
- **Tipar `player.service.ts`**: Eliminar los últimos 2 `any` restantes y reemplazarlos por las interfaces del modelo de dominio.
- **Limpieza de Código**: Revisar y eliminar comentarios de debug o emojis temporales (`// 🔥 NUEVO MÉTODO`) para dejar el código listo para producción.
- **CORS**: Cambiar el wildcard `"*"` en `SecurityConfig.java` por la whitelist definitiva de producción.

---

## 5. Mejoras Estéticas (Pulido de Pantallas Secundarias) 🎨

Tras el rediseño visual masivo de las pantallas principales (Dashboard, Tactics, Landing), queda pendiente aplicar el mismo nivel de detalle en:
- **Listado de Jugadores (`my-team`)**: Añadir badges visuales para estados (activo/lesionado).
- **Formulario de Perfil**: Reorganizar el layout para que no sea una lista infinita de inputs.
- **Consistencia de Modales**: Asegurar que todos usen la paleta personalizada `#0a0e1a` / `#6c63ff`.
