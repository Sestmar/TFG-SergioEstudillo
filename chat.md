# Arquitectura Técnica: Chat en Tiempo Real y Notificaciones

Este documento documenta la arquitectura final implementada para el sistema de comunicación de **DAM United FC**, integrando chats grupales/privados con sincronización persistente de estado.

---

## 1. Infraestructura del Backend (Spring Boot 3.5.7)

### 1.1. Modelo de Datos y Persistencia
Se utiliza una arquitectura de persistencia basada en JPA para gestionar el ciclo de vida de los mensajes y su estado de lectura.
- **Entidad `Mensaje`**: Soporta polimorfismo de destino (Equipo vs Usuario Privado).
- **Estado de Lectura**: Implementado mediante flags booleanos y filtrado por `destinatario_id` o `equipo_id` para gestionar los badges de notificación.

### 1.2. Protocolo de Comunicación (STOMP + WebSockets)
- **Broker de Mensajes**: Configurado con `/topic` para difusión pública (equipo) y `/queue` para mensajes privados.
- **Seguridad (Handshake)**: Validación de JWT en el interceptor de conexión para asegurar que solo usuarios autenticados puedan suscribirse a los canales de su equipo.

---

## 2. Arquitectura del Frontend (Angular/Ionic)

### 2.1. Gestión de Estado Reactiva
El sistema se basa en un **ChatService Centralizado** que gestiona dos conexiones independientes:
1. **Conexión de Sala**: Activa únicamente cuando el usuario está dentro de `/chat`. Gestiona el historial y el scroll infinito.
2. **Conexión Global (Background)**: Inicia en el `AppComponent` y permanece activa durante toda la sesión. Escucha eventos de "mensaje nuevo" para actualizar el badge del menú lateral.

### 2.2. Sincronización de Badges (Persistencia Real)
- **Inicialización (Offline Sync)**: Al conectar el servicio, se realiza una petición HTTP para recuperar el conteo de mensajes no leídos desde la base de datos, asegurando que el badge sea verídico tras un cierre de la aplicación.
- **Acknowledge de Lectura**: Al entrar a una conversación, se dispara una señal al backend (`marcarLeidos`) para persistir el cambio de estado. La UI local solo se resetea tras la confirmación exitosa del servidor.

---

## 3. Notificaciones Nativas (Capacitor)

### 3.1. Local Notifications
Integración con `@capacitor/local-notifications` para disparar alertas visuales en el dispositivo cuando llega un mensaje y el usuario no tiene la aplicación en primer plano o no está en la pantalla de chat.

### 3.2. Filtrado de Emisor
Algoritmo de discriminación que evita el "eco" de notificaciones. Si el mensaje recibido a través del socket pertenece al `currentUserId` (enviado desde otro dispositivo del mismo usuario), el sistema descarta el incremento del badge y la alerta sonora/visual.

---

## 4. Estado de Implementación
- [x] Backend STOMP & WebSockets.
- [x] ChatService Reactivo (RxJS).
- [x] Persistencia de Badges y Sincronización Offline.
- [x] UI Inmersiva "Night Stadium".
- [x] Notificaciones Push Locales.

---
> **Documentación Técnica Cerrada** - El módulo de comunicación se considera en estado de producción y validado.
