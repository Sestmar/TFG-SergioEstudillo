Resumen Completo — Migración FCM / Notificaciones Push
  Nativas

  ---
  SESIÓN 1 — Infraestructura Base

  Backend

  pom.xml
  - Añadida dependencia firebase-admin:9.3.0

  FirebaseConfig.java (nuevo)
  - Inicializa el Firebase Admin SDK en el arranque de Spring
  - Falla gracefully si serviceAccountKey.json no existe —
  loga un warning pero no rompe el boot

  Usuario.java
  - Añadido campo fcmToken (@Column name="fcm_token", length
  512)

  NotificationProvider.java (nuevo — interfaz)
  - Define el contrato: sendNotification(Usuario, title, body)

  FcmNotificationProvider.java (nuevo)
  - Implementación FCM del provider
  - Skip automático si Firebase no está inicializado o el
  usuario no tiene token

  WhatsAppNotificationProvider.java (nuevo)
  - Wrapper del WhatsAppService existente — mantiene Twilio
  vivo como fallback

  NotificationService.java (nuevo — orquestador)
  - @Async — no bloquea el hilo principal
  - Lógica de prioridad: FCM primero, WhatsApp como fallback
  si no hay fcmToken

  UsuarioService.java
  - Añadido método actualizarFcmToken(email, token)

  UserController.java
  - Nuevo endpoint PUT /api/usuarios/fcm-token
  - Usa @AuthenticationPrincipal — el token se asocia al
  usuario autenticado, no a un ID por path

  PartidoService.java
  - Reemplazado WhatsAppService por NotificationService
  - Notifica a jugadores + entrenador del equipo al crear un
  partido

  NotificacionScheduler.java
  - Reemplazado WhatsAppService por NotificationService
  - El cron de recordatorio 24h ahora usa el nuevo sistema

  ChatService.java (mensajes privados)
  - Push al destinatario en mensajes 1-a-1

  Frontend

  package.json — @capacitor/push-notifications:^5.0.0

  capacitor.config.ts — Plugin PushNotifications configurado
  con badge, sound, alert

  push-notification.service.ts (nuevo)
  - Solicita permisos al usuario
  - Obtiene el token de FCM y lo registra en el backend
  - Evita re-envíos comparando con el token almacenado en
  StorageService

  auth.service.ts
  - Llama a pushNotificationService.initialize() después del
  login exitoso

  ---
  SESIÓN 2 — Fase Final (4 fases)

  Fase 1 — Broadcast Chat de Equipo

  ChatService.java
  - Inyectado JugadorRepository
  - Nuevo método privado broadcastEquipo() — itera sobre todos
   los jugadores del equipo + entrenador, excluyendo al
  remitente
  - Lógica separada: mensaje privado → push 1-a-1 / mensaje de
   equipo → broadcast

  Fase 2 — Configuración Nativa Android

  AndroidManifest.xml
  - WAKE_LOCK — procesador activo para recibir notificaciones
  en background
  - POST_NOTIFICATIONS — requerido en Android 13+ (API 33)
  - meta-data icono FCM → @drawable/ic_notification
  - meta-data color → @color/colorPrimary

  ic_notification.xml (nuevo)
  - Icono vector monocromático blanco (pelota de fútbol) —
  evita el "cuadrado negro" en la barra de estado

  colors.xml (nuevo)
  - colorPrimary #1A1A2E / colorPrimaryDark #0F0F1A /
  colorAccent #00D4AA
  - Resuelve una referencia huérfana que ya existía en
  styles.xml

  MainActivity.java — Sin cambios. BridgeActivity con
  Capacitor 5+ registra los plugins automáticamente.

  Fase 3 — Foreground mejorado

  push-notification.service.ts
  - Flag listenersRegistered — evita listeners duplicados en
  re-login
  - Referencia activeToast — descarta el toast anterior antes
  de mostrar el nuevo
  - Guard para payloads vacíos
  - cssClass: ['night-toast', 'toast-info'] — consistencia
  visual con el resto de la app

  Fase 4 — Limpieza de Tokens inválidos

  FcmNotificationProvider.java
  - Captura FirebaseMessagingException específica (no
  Exception genérica)
  - Si el código es UNREGISTERED o INVALID_ARGUMENT → llama a
  invalidateToken() que pone fcmToken = null en la DB
  - Otros errores FCM se loguean sin tocar el token

  ---
  Lo que el usuario tiene que hacer manualmente

  ┌────────────────────┬──────────────────────────────────┐
  │       Acción       │              Dónde               │
  ├────────────────────┼──────────────────────────────────┤
  │ Descargar serviceA │ src/backend-tfg/.../src/main/res │
  │ ccountKey.json de  │ ources/                          │
  │ Firebase Console   │                                  │
  ├────────────────────┼──────────────────────────────────┤
  │ Descargar google-s │                                  │
  │ ervices.json de    │ frontend/android/app/            │
  │ Firebase Console   │                                  │
  ├────────────────────┼──────────────────────────────────┤
  │ npm install en     │ Ya hecho según Gemini            │
  │ frontend           │                                  │
  ├────────────────────┼──────────────────────────────────┤
  │ npx cap sync       │ Para sincronizar el plugin con   │
  │ android            │ el proyecto Android              │
  └────────────────────┴──────────────────────────────────┘





 Pasos en Render (una sola vez)

  1. Crear el Secret File

  En el dashboard de tu servicio backend → Environment →
  Secret Files → Add Secret File:

  ┌──────────┬─────────────────────────────────────┐
  │  Campo   │                Valor                │
  ├──────────┼─────────────────────────────────────┤
  │ Filename │ /etc/secrets/serviceAccountKey.json │
  ├──────────┼─────────────────────────────────────┤
  │ Contents │ (pegá el JSON completo de Firebase) │
  └──────────┴─────────────────────────────────────┘

  2. Añadir la variable de entorno

  En Environment Variables:

  ┌────────────────────┬──────────────────────────────────┐
  │        Key         │              Value               │
  ├────────────────────┼──────────────────────────────────┤
  │ FIREBASE_CONFIG_PA │ /etc/secrets/serviceAccountKey.j │
  │ TH                 │ son                              │
  └────────────────────┴──────────────────────────────────┘

  3. Redeploy — y ya está.

  ---
  Cómo funciona según el entorno

  ┌──────┬────────────────────────┬──────────────────────┐
  │ Ento │  FIREBASE_CONFIG_PATH  │      Qué hace        │
  │ rno  │                        │    FirebaseConfig    │
  ├──────┼────────────────────────┼──────────────────────┤
  │      │                        │ Lee classpath:servic │
  │ Loca │ no definida            │ eAccountKey.json (tu │
  │ l    │                        │                      │
  │      │                        │ src/main/resources/) │
  ├──────┼────────────────────────┼──────────────────────┤
  │ Rend │ /etc/secrets/serviceAc │ Lee el Secret File   │
  │ er   │ countKey.json          │ con FileInputStream  │
  └──────┴────────────────────────┴──────────────────────┘

  Y si en ningún entorno existe el archivo, loga un warning
  pero el servidor arranca igual — el FCM simplemente queda
  deshabilitado hasta que lo configurés.
