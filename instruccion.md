El manifest ya tiene los meta-data de FCM. Verifico qué
  drawables hay para saber si el icono existe:

  Searched for 2 patterns (ctrl+o to expand)

● Fase 4 ya está completa — nada que hacer. Lo digo con
  evidencia:

  AndroidManifest.xml — ya tiene los dos <meta-data> de FCM
  (líneas 37–45):
  - default_notification_icon → @drawable/ic_notification ✅
  - default_notification_color → @color/colorPrimary ✅

  Token cleanup — ya está implementado en
  FcmNotificationProvider.java desde la sesión anterior: el
  catch (FirebaseMessagingException e) ya captura UNREGISTERED
   e INVALID_ARGUMENT y llama a invalidateToken(usuario) que
  hace setFcmToken(null) + save().

  ---
  Resumen completo de todas las fases

  Fase 1 — Deep Linking (ruteo al tocar la notificación)

  Archivo: NotificationProvider.java
  Cambio: Default method sendNotification(...,
    Map<String,String> data) — WhatsApp lo hereda e ignora
  ────────────────────────────────────────
  Archivo: FcmNotificationProvider.java
  Cambio: Override con .putAllData(data) en el
  Message.Builder;
    el send() simple delega al nuevo
  ────────────────────────────────────────
  Archivo: NotificationService.java
  Cambio: Sobrecarga send(usuario, title, body, data)
  ────────────────────────────────────────
  Archivo: ChatService.java
  Cambio: Usa {"route": "/chat", "type": "CHAT"} en mensajes
    privados y broadcast de equipo
  ────────────────────────────────────────
  Archivo: PartidoService.java
  Cambio: Usa {"route": "/match-detail/{idPartido}", "type":
    "MATCH"} al crear partido
  ────────────────────────────────────────
  Archivo: push-notification.service.ts
  Cambio: Inyectado Router; pushNotificationActionPerformed
  lee
    data['route'] y navega con router.navigateByUrl()

  ---
  Fase 2 — Auto-Asistencia a Entrenamientos

  Archivo: AdminService.java
  Cambio: Nuevo método confirmarAsistencia(idEntrenamiento,
    idJugador): upsert de Asistencia con estado "ASISTE"
  ────────────────────────────────────────
  Archivo: AdminController.java
  Cambio: POST /api/admin/entrenamiento/{id}/confirmar con
    @PreAuthorize a nivel de método que sobreescribe el de
    clase, accesible a JUGADOR/ENTRENADOR/ADMIN
  ────────────────────────────────────────
  Archivo: player.service.ts
  Cambio: confirmarAsistenciaEntrenamiento(idEntrenamiento,
    idJugador)
  ────────────────────────────────────────
  Archivo: player-dashboard.page.ts
  Cambio: confirmedTrainings: Set<number> + métodos
    isTrainingConfirmed() y confirmarAsistencia() con toast de

    éxito/error
  ────────────────────────────────────────
  Archivo: player-dashboard.page.html
  Cambio: Botón checkmark-circle-outline en tarjetas de
  eventos
    tipo !== 'PARTIDO'; se deshabilita y vuelve verde tras
    confirmar

  ---
  Fase 3 — Notificación al Coach al confirmar

  Archivo: AdminService.java
  Cambio: Inyectado NotificationService; confirmarAsistencia()

    notifica al coach del equipo tras guardar: "⚽ [Jugador]
  ha
     confirmado su asistencia al entrenamiento." — null-safe
  en
     toda la cadena

  ---
  Fase 4 — Pulido de UI

  Ya estaba hecho desde una sesión anterior. AndroidManifest
  con icono FCM y token cleanup en FcmNotificationProvider
  operativos.