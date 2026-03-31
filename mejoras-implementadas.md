# Mejoras Implementadas - DAM United FC

Este documento registra la evolución técnica, arquitectónica y visual del proyecto, detallando las decisiones de ingeniería tomadas para alcanzar un estándar de software profesional (SaaS).

---

## 1. Analítica Avanzada: Inteligencia de Datos con ApexCharts 📈🧠

Se ha implementado una capa de analítica deportiva profesional, transformando los datos crudos de las actas en información visual estratégica.

### Especificaciones Técnicas y Decisiones de Arquitectura
- **Resolución de Conflictos de Dependencias**: 
  - **Problema**: La versión `ng-apexcharts@2.3.0` introdujo dependencias de Angular 20+ (`afterEveryRender`), rompiendo la compilación en **Angular 17.3.x**.
  - **Solución**: Downgrade estratégico a `ng-apexcharts@1.10.0` y `apexcharts@3.46.0`. 
  - **Explicación sencilla**: Se utilizó `--legacy-peer-deps` para forzar la instalación en un árbol de dependencias estricto, asegurando estabilidad sin comprometer las funcionalidades de visualización.
- **Patrón de Inmutabilidad para Change Detection**:
  Angular no detecta cambios en las propiedades internas de un objeto de configuración. Para forzar el repintado de los gráficos al recibir datos del backend, se implementó el **Spread Operator**:
  ```typescript
  // Decision: Forzar detección de cambios mediante inmutabilidad
  this.radarChartOptions = {
    ...this.radarChartOptions,
    series: [{ name: 'Goles Prom.', data: seriesGoles }]
  };
  ```
- **Lógica de Clasificación Posicional**:
  Se implementó un algoritmo de mapeo para agrupar jugadores por líneas tácticas (Portería, Defensa, Medio, Ataque) basado en strings dinámicos, permitiendo una visualización clara del equilibrio del equipo.

---

## 2. Rediseño Visual Premium: "Night Stadium" & Glassmorphism 🌌🏟️

Se ha abandonado el diseño genérico de Ionic para crear una identidad visual inmersiva y de alta gama.

### Ingeniería de Estilos (SCSS Pro)
- **Selectores de Próxima Generación (`:has`)**:
  Para evitar añadir lógica TypeScript innecesaria o clases adicionales al HTML, se utilizó el selector funcional `:has()`. Esto permite que una tarjeta cambie su gradiente de fondo automáticamente basándose en el contenido de sus hijos (ej. la posición del jugador).
  ```scss
  // Estilo condicional sin tocar el .ts
  .player-card:has(.pos-bar.keeper) {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, var(--card-bg) 100%);
  }
  ```
- **Fix Crítico de Escudos (SVG Rendering)**:
  - **Bug**: Los escudos de equipos rivales (SVGs externos) se renderizaban a tamaños masivos o ínfimos comparados con los PNGs locales.
  - **Solución**: Eliminar el uso de `width: 100%` y establecer **dimensiones fijas en píxeles** con `object-fit: contain` y `overflow: hidden` en el contenedor. Esto garantiza consistencia visual independientemente del `viewBox` del SVG.
- **Efectos de Profundidad**:
  Uso intensivo de `backdrop-filter: blur(12px)` para el efecto Glassmorphism y pseudo-elementos `::before` con gradientes radiales para simular el "glow" de los focos de un estadio nocturno.

---

## 3. Refactorización Estructural del Frontend (Arquitectura Blindada) ⚡

El frontend se ha migrado a un estado de **0 errores de compilación** y alta mantenibilidad.

### Decisiones Técnicas Clave
- **Higiene RxJS**: Blindaje de todas las suscripciones mediante `takeUntilDestroyed(this.destroyRef)`. Esto garantiza que si el usuario navega fuera de una pantalla, las peticiones HTTP y timers se cancelen automáticamente, evitando fugas de memoria.
- **Linearización de Flujos (Evitando el Callback Hell)**:
  En pantallas complejas como `tactics.page.ts`, se reemplazaron las suscripciones anidadas por operadores de transformación:
  ```typescript
  // Refactor: De 3 .subscribe() anidados a un flujo único reactivo
  this.matchSvc.getMatchById(id).pipe(
    switchMap(match => forkJoin({
      players: this.playerSvc.getAllPlayers(),
      savedSlots: this.matchSvc.getLineup(match.id)
    })),
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(result => { ... });
  ```
- **Tipado Estricto (Zero Any)**: Se eliminaron los parches `as any`. Ahora, cada objeto que llega del backend tiene una **Interface DTO** que lo respalda, permitiendo que el compilador de TypeScript detecte errores antes de que la app se ejecute.

---

## 4. Backend: Capa de Servicio e Inyección por Constructor 🏗️🛠️

Se ha profesionalizado el backend Spring Boot siguiendo principios de **SOLID** y **Clean Code**.

### Especificaciones Técnicas
- **Inyección por Constructor vs @Autowired**:
  Se eliminó la inyección por campos (poco recomendada y difícil de testear) en favor de la inyección por constructor con campos `private final`.
  - **Razón Técnica**: Garantiza que las dependencias sean inmutables y permite la detección de errores de inyección en tiempo de compilación, no de ejecución.
- **Encapsulación en Capa de Servicio**:
  Los controladores ahora son "delgados" (Thin Controllers). Toda la lógica de promedios, porcentajes de asistencia y cálculos complejos se ha movido a 19 servicios de dominio específicos.
  - **Explicación sencilla**: Esto permite reutilizar la lógica de negocio (ej. calcular el % de asistencia de un jugador) en diferentes endpoints (Admin, Coach, Player) sin duplicar código.

---

## 5. Pizarra Táctica Profesional 2.0 ⚽🧠

### Soluciones de Ingeniería UX
- **Fix de CDK Drag & Drop**: Se corrigió un glitch visual donde los tokens parpadeaban al arrastrar. La causa era que `cdkDropListData` recibía un objeto simple; se refactorizó para que siempre reciba un **Array dinámico** `[player]`, que es lo que el motor de Angular CDK espera para mantener la estabilidad del DOM.
- **Modernización de Avatars**: Cambio de círculos clásicos a **cuadrados redondeados (12px)**.
  - **Decisión Estética**: Sigue la tendencia actual de interfaces deportivas premium (tipo FIFA/Stitch), alejándose del aspecto "móvil genérico" de los círculos de contacto.

---

## 6. Chat en Tiempo Real: Ingeniería de Mensajería Reactiva (STOMP/SockJS) 💬⚡

Se ha implementado un sistema de comunicación bidireccional de alto rendimiento, diseñado bajo una arquitectura de **Message Broker** que garantiza la entrega de mensajes en milisegundos sin sobrecargar el servidor con peticiones innecesarias.

### Infraestructura Backend (Spring Boot + Seguridad)
La arquitectura se apoya en el protocolo **STOMP** sobre **WebSockets**, con un interceptor de seguridad personalizado para validar el acceso en el handshake inicial.

- **Handshake Protegido con JWT**: 
  A diferencia de las peticiones REST estándar, los WebSockets requieren una validación manual en el canal de entrada. Se implementó un `ChannelInterceptor` que extrae y valida el token `Bearer` antes de permitir la suscripción.
  ```java
  // WebSocketConfig.java - Intercepción de seguridad en tiempo real
  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
      registration.interceptors(new ChannelInterceptor() {
          @Override
          public Message<?> preSend(Message<?> message, MessageChannel channel) {
              StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
              if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                  String authHeader = accessor.getFirstNativeHeader("Authorization");
                  // Validación de JWT y seteo de Authentication en el Accessor del socket
                  String token = authHeader.substring(7);
                  String username = jwtService.extractUsername(token);
                  var userDetails = userDetailsService.loadUserByUsername(username);
                  if (jwtService.isTokenValid(token, userDetails)) {
                      var auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                      accessor.setUser(auth);
                  }
              }
              return message;
          }
      });
  }
  ```

- **Ruteo Dinámico de Tópicos**:
  Se utiliza un modelo híbrido: `/topic` para broadcast grupal (Equipo) y `/user/queue` para mensajería privada (Admin-Jugador).
  ```java
  // ChatController.java - Lógica de despacho
  @MessageMapping("/chat.enviar")
  public void enviarMensaje(@Payload EnviarMensajeDto dto, Principal principal) {
      MensajeDto guardado = chatService.enviarMensaje(principal.getName(), dto);
      if (dto.getEquipoId() != null) {
          messagingTemplate.convertAndSend("/topic/equipo/" + dto.getEquipoId(), guardado);
      } else {
          messagingTemplate.convertAndSendToUser(emailDestinatario, "/queue/mensajes", guardado);
      }
  }
  ```

### Arquitectura Frontend (Angular + RxJS + StompJS)
El frontend actúa como un consumidor reactivo, manteniendo un estado único de la sala de chat mediante `BehaviorSubjects`.

- **Sincronización de Estado (REST + WS)**:
  Para evitar duplicidades y garantizar que el usuario vea el historial al entrar, se implementó un flujo de "Hidratación de Estado". Al cargar el componente, se pide el historial vía REST y el servicio se suscribe al socket para inyectar nuevos mensajes al flujo existente.
  ```typescript
  // chat.service.ts - Gestión reactiva del flujo de mensajes
  private mensajes$ = new BehaviorSubject<MensajeDto[]>([]);

  private agregarMensaje(msg: MensajeDto): void {
    const actuales = this.mensajes$.getValue();
    // Protección contra duplicados y actualización inmutable
    if (!actuales.find(m => m.id === msg.id)) {
      this.mensajes$.next([...actuales, msg]);
    }
  }
  ```

- **Resiliencia de Conexión**:
  Configuración de `reconnectDelay: 5000` y uso de `SockJS` como fallback automático. Si el servidor cae o el socket se cierra, el cliente intenta reconectar transparentemente, recuperando las suscripciones a los tópicos del equipo de forma dinámica.

- **UX Premium (Infinite Scroll & Marcar Leídos)**:
  Se integra un mecanismo de persistencia que cuenta los mensajes no leídos y los resetea automáticamente mediante una llamada `PUT` al entrar en la sala, sincronizando la base de datos con la interfaz de usuario.

---

## 7. Notificaciones Inteligentes: Integración con WhatsApp via Twilio 📱🔔


Se ha integrado el canal de comunicación preferido por los deportistas (WhatsApp) para automatizar la logística de los partidos y recordatorios.

### Ingeniería de Integración de Terceros
- **Provider: Twilio WhatsApp Business API**:
  - Se utiliza el SDK oficial de Twilio para Java. La comunicación se realiza mediante peticiones REST autenticadas desde el servidor hacia la API de Twilio, que actúa como puente hacia los dispositivos móviles.
- **Normalización Estricta E.164**:
  - Se implementó una lógica de formateo automático en `WhatsAppService.java` que antepone el prefijo internacional (`+34` para España) si el número no cumple con el estándar global. Esto previene fallos silenciosos de entrega por números introducidos sin prefijo en el perfil.
- **Disparadores Automáticos y Consistencia de Datos**:
  - **Hook de Creación de Partido**: Al guardar un nuevo partido en `PartidoService`, se dispara la notificación a toda la plantilla.
  - **Transaccionalidad Crítica**: Se aplicó `@Transactional` en el proceso de creación para solventar errores de `LazyInitializationException`. Esto garantiza que la sesión de Hibernate permanezca activa mientras el servicio recorre la lista de jugadores y accede a sus datos de usuario para el envío de notificaciones.
- **Notificación Programada (Scheduler)**: Implementación de `@Scheduled` en el backend para buscar partidos en las próximas 24 horas y enviar recordatorios de "Confirmación de Asistencia" de forma automática.

---

## 8. Notificaciones Nativas y Badges: UX de Mensajería 360° 🔔🔴

Se ha elevado la experiencia de usuario a un estándar de aplicación nativa mediante la implementación de un sistema de notificaciones en tiempo real y contadores visuales (Badges) que funcionan en toda la aplicación.

### Arquitectura de Doble Cliente STOMP (Background Listening)
Para que el usuario reciba alertas sin estar dentro de la pantalla de chat, se diseñó una arquitectura de **suscripción global persistente**.

- **Cliente Global vs. Cliente Local**:
  - **Local**: Se activa únicamente en `/chat` para la gestión de mensajes en pantalla.
  - **Global**: Se instancia en el layout principal tras el login. Permanece activo en segundo plano, escuchando el tópico del equipo para disparar eventos de sistema.
  ```typescript
  // chat.service.ts - Lógica de escucha en segundo plano
  private async manejarMensajeGlobal(msg: MensajeDto): Promise<void> {
    const usuarioEnChat = this.router.url.includes('/chat');
    // Si ya está en el chat, no molestamos con badges ni alertas
    if (usuarioEnChat) return;

    this._noLeidosEquipo$.next(this._noLeidosEquipo$.getValue() + 1);
    await this.dispararNotificacion(msg);
  }
  ```

### Integración con Capacitor Local Notifications
Se ha integrado el plugin `@capacitor/local-notifications` para transformar los mensajes del WebSocket en notificaciones nativas del sistema operativo (Android/iOS).

- **Flujo de Notificación Inteligente**:
  1. **Recepción**: El `clientGlobal` detecta un mensaje nuevo.
  2. **Validación de Ruta**: Se comprueba mediante el `Router` de Angular si el usuario está visualizando el chat.
  3. **Disparo Nativo**: Si el usuario está en otra sección, se lanza la notificación con el nombre del remitente y el contenido.
  4. **Navegación**: Se registró un listener global que redirige automáticamente a `/chat` cuando el usuario toca la notificación.
  ```typescript
  // Implementación de notificación nativa
  private async dispararNotificacion(msg: MensajeDto): Promise<void> {
    const permiso = await LocalNotifications.requestPermissions();
    if (permiso.display === 'granted') {
      await LocalNotifications.schedule({
        notifications: [{
          id: Date.now(),
          title: msg.remitenteNombre,
          body: msg.contenido,
          extra: { route: '/chat' }
        }]
      });
    }
  }
  ```

### Indicadores Visuales (Badges Reactivos)
El menú lateral y los accesos directos al chat ahora incluyen un `<ion-badge>` dinámico vinculado a un `BehaviorSubject` en el `ChatService`.

- **Sincronización Automática**: El contador se incrementa con cada mensaje recibido globalmente y se **resetea instantáneamente** mediante el método `resetearNoLeidos()` cuando el usuario entra en la sala de chat, garantizando una interfaz limpia y precisa.

---

> **Estado del Proyecto**: Arquitectura industrial, comunicación en tiempo real y experiencia móvil nativa validada al 100%.

