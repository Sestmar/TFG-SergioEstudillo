# Plan de Implementación: Chat en Tiempo Real y Notificaciones de WhatsApp

Este documento detalla la arquitectura y los pasos para implementar un sistema de comunicación pro para **DAM United FC**, integrando chats grupales/privados con historial y notificaciones automáticas por WhatsApp para eventos (partidos/entrenamientos).

---

## 1. Arquitectura del Backend (Spring Boot 3.5.7)

### 1.1. Modelo de Datos: Entidad `Mensaje`
Para soportar tanto chats grupales (por equipo) como privados (Admin <-> Usuario), la entidad `Mensaje` debe ser flexible.

**Propuesta de Entidad:**
```java
@Entity
@Data
public class Mensaje {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "remitente_id")
    private Usuario remitente;

    // Si es null, el mensaje es privado. Si tiene valor, es grupal por equipo.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipo_id")
    private Equipo equipo;

    // Si es null, el mensaje es grupal. Si tiene valor, es privado para este usuario.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destinatario_id")
    private Usuario destinatario;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenido;

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    private boolean leido = false;
}
```

### 1.2. Configuración de WebSockets (STOMP)
Implementar `WebSocketConfig` para habilitar la comunicación en tiempo real.
- **Endpoint:** `/ws` (usando SockJS para fallback).
- **Prefixes:** `/app` (entrantes) y `/topic` / `/queue` (salientes).
- **Seguridad:** Interceptor para validar el JWT en la conexión inicial.

### 1.3. Lógica de Negocio: `ChatController` y `ChatService`
- `@MessageMapping("/chat.sendMessage")`: Recibe el mensaje, lo persiste en la BD y lo reenvía al destino:
    - Si es grupal: Enviar a `/topic/equipo/{idEquipo}`.
    - Si es privado: Enviar a `/queue/user/{idDestinatario}`.
- Métodos para recuperar el historial: `listarPorEquipo` y `listarPrivadoConAdmin`.

---

## 2. Notificaciones de WhatsApp (Twilio)

### 2.1. Integración de Twilio
- Añadir dependencia: `com.twilio.sdk:twilio`.
- Crear `WhatsAppService` con métodos `enviarNotificacionEvento` y `enviarRecordatorio24h`.

### 2.2. Triggers de Notificación
1. **Creación de Partido:** En `PartidoService.crear()`, invocar al `WhatsAppService` para enviar notificaciones a todos los jugadores del equipo involucrado.
2. **Recordatorio 24h:** Habilitar `@EnableScheduling` y crear una tarea programada (`@Scheduled(cron = "0 0 * * * *")`) que:
    - Busque partidos que comiencen en exactamente ~24 horas.
    - Envíe un mensaje de recordatorio: *"¡Mañana hay partido! No olvides confirmar tu asistencia en la app."*

---

## 3. Arquitectura del Frontend (Angular/Ionic)

### 3.1. Infraestructura de Chat
- **Servicio:** `ChatService` usando `rx-stomp` para gestionar la conexión, suscripciones y reconexión automática.
- **Store:** Manejar el estado del chat (lista de mensajes) de forma reactiva con BehaviorSubjects o Signals.

### 3.2. UI/UX (Módulos)
- **Componente `ChatRoom`:**
    - Visualización de mensajes con burbujas (estilo WhatsApp).
    - Diferenciación de colores para mensajes propios, de otros jugadores y del Admin.
    - **Optimización:** Carga diferida (Infinite Scroll) del historial de mensajes.
- **Gestión de Admin:** Vista especial para que el Admin elija un usuario y abra una conversación privada.

---

## 4. Pasos de Implementación Recomendados

### Fase 1: Infraestructura Backend
1. Añadir dependencias de WebSockets y Twilio al `pom.xml`.
2. Crear entidad `Mensaje` y sus repositorios.
3. Configurar `WebSocketConfig`.

### Fase 2: Lógica de Notificaciones
1. Implementar `WhatsAppService`.
2. Modificar `PartidoService` para disparar notificaciones al crear.
3. Crear la tarea `@Scheduled` para el recordatorio de 24h.

### Fase 3: Tiempo Real y Frontend
1. Crear el `ChatController` en Spring Boot.
2. Implementar el `ChatService` en Angular.
3. Diseñar las pantallas de chat en Ionic aplicando los estilos existentes (Navy Dark/Glassmorphism).

---
**Nota Técnica:** Para Twilio, necesitaremos las credenciales (`ACCOUNT_SID`, `AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`). Si usás el Sandbox de Twilio, los usuarios deberán aceptar recibir mensajes enviando "join [code]" primero.
