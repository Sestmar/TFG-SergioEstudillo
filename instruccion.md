Backend listo. Mientras espero el frontend, te resumo lo que encontró:

  El chat de equipo nunca funcionó por dos razones encadenadas:

  1. WebSocketConfig.java — el catch del interceptor era vacío. Token inválido
   → excepción silenciada → accessor.setUser() nunca se llamaba → el STOMP
  CONNECT pasaba sin Principal. Ahora devuelve un frame STOMP ERROR explícito
  en vez de ignorarlo.
  2. ChatController.java — userDetails llegaba null (por el punto 1), y
  userDetails.getUsername() lanzaba NPE antes de llegar al convertAndSend. El
  broadcast al topic ni siquiera se ejecutaba. El fix: null-guard al principio
   del método + lookup del email del destinatario para mensajes privados.

  El broadcast a /topic/equipo/{id} estaba bien escrito — simplemente nunca
  llegaba a ejecutarse.

  Esperando al sub-agente de frontend...

● Agent "Fix frontend WebSocket chat" completed

● Los dos terminaron. Acá el panorama completo:

  ---
  Todo lo que se corrigió

  Backend

  ┌──────────────────────┬─────────────────────────────────────────────────┐
  │       Archivo        │                 Qué se arregló                  │
  ├──────────────────────┼─────────────────────────────────────────────────┤
  │ WebSocketConfig.java │ Interceptor preSend ya no silencia errores de   │
  │                      │ token — devuelve STOMP ERROR explícito          │
  ├──────────────────────┼─────────────────────────────────────────────────┤
  │ ChatController.java  │ Null-guard para userDetails null + lookup de    │
  │                      │ email para mensajes privados                    │
  └──────────────────────┴─────────────────────────────────────────────────┘

  Frontend

  ┌─────────────────┬──────────────────────────────────────────────────────┐
  │     Archivo     │                    Qué se arregló                    │
  ├─────────────────┼──────────────────────────────────────────────────────┤
  │                 │ cargarEquipoYConectar() ya no llama iniciarChat() si │
  │ chat.page.ts    │  equipoId es undefined — ni en error ni en respuesta │
  │                 │  sin id                                              │
  ├─────────────────┼──────────────────────────────────────────────────────┤
  │ chat.service.ts │ Logs de debug en onConnect para confirmar            │
  │                 │ suscripciones activas                                │
  └─────────────────┴──────────────────────────────────────────────────────┘

  ---
  El flujo ahora es:
  1. STOMP CONNECT llega → interceptor valida token → si inválido, ERROR frame
   explícito
  2. Si token OK → accessor.setUser(auth) se ejecuta → userDetails llega al
  controller
  3. Jugador/Entrenador conecta → equipoId definido → suscripción a
  /topic/equipo/{id}
  4. Se envía mensaje → controller recibe, persiste, broadcast a
  /topic/equipo/{id} → todos los suscriptos lo reciben

  Levantá el backend (./mvnw spring-boot:run con el perfil local que ya
  fijamos) y probá. Si ves en consola del frontend [ChatService] Suscripción
  activa: /topic/equipo/X, la conexión está bien establecida.