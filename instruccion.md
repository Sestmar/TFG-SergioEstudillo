# Mejora: Notificaciones Push Nativas (FCM) vs WhatsApp (Twilio)

## 🎯 Objetivo
Migrar el sistema de alertas de WhatsApp (Twilio) a un sistema de **Notificaciones Push Nativas** utilizando Firebase Cloud Messaging (FCM). Esto permite notificaciones gratuitas, integradas en el sistema operativo y con mejor experiencia de usuario.

---

## 🏗️ FASE 1: Infraestructura y Dependencias
**Meta**: Dejar el proyecto listo para hablar con Firebase.

- **Backend (Spring Boot)**: 
  - Añadir `firebase-admin` al `pom.xml`.
  - Crear `FirebaseConfig.java` para inicializar el SDK con el archivo `serviceAccountKey.json`.
- **Frontend (Capacitor)**:
  - Instalar `@capacitor/push-notifications`.
  - Configurar el `google-services.json` en la carpeta `android/app/`.
  - Actualizar `capacitor.config.ts` para incluir la configuración de notificaciones.

---

## 🏗️ FASE 2: Gestión de Tokens (El "Direccionario")
**Meta**: Que el servidor sepa a qué dispositivo enviarle cada mensaje.

- **Base de Datos**: Añadir campo `fcm_token` a la entidad `Usuario`.
- **API Endpoint**: Crear un endpoint `PUT /api/users/fcm-token` para que el frontend registre el token tras el login.
- **Frontend Service**: Crear un `PushNotificationService` que:
  - Solicite permisos al usuario.
  - Obtenga el token de FCM.
  - Lo envíe al backend y lo guarde localmente para evitar re-envíos innecesarios.

---

## 🏗️ FASE 3: Provider Pattern y Refactor de Twilio
**Meta**: Desacoplar la lógica de envío para que sea fácil cambiar entre Twilio y FCM.

- **NotificationProvider (Interfaz)**: Definir un método `sendNotification(User user, String title, String body)`.
- **FCMImplementation**: Implementar la interfaz usando `FirebaseMessaging.getInstance().send()`.
- **WhatsAppImplementation (Twilio)**: Mover la lógica actual de `WhatsAppService` aquí.
- **NotificationService**: Centralizar el envío. Deberá priorizar FCM si el usuario tiene un `fcmToken`, y usar Twilio/WhatsApp como respaldo (fallback) o simplemente desactivarlo.

---

## 🏗️ FASE 4: Implementación de Casos de Uso
**Meta**: Hacer que la app "cobre vida".

- **Chat Real-Time**: Al guardar un mensaje en la DB, disparar una notificación Push al receptor (usando el `fcmToken`).
- **Nuevos Eventos**: Notificar a todos los jugadores de un equipo cuando el Coach crea un nuevo **Partido** o **Entrenamiento**.
- **Recordatorios 24h (Cron)**: Refactorizar los `@Scheduled` actuales para que usen el nuevo `NotificationService`.

---

## 🏗️ FASE 5: Pulido Visual y Foreground
**Meta**: Que la notificación se vea bien incluso con la app abierta.

- **Listeners en Frontend**: Configurar `pushNotificationReceived` para mostrar un "Toast" o alerta interna si el usuario está usando la app en ese momento (Foreground).
- **Acciones**: Configurar que al tocar la notificación, la app abra la pantalla correspondiente (ej: la sala de chat o el detalle del partido).

---
> **Nota para Claude**: El archivo `serviceAccountKey.json` (Backend) y `google-services.json` (Android) deben ser gestionados como archivos externos por el usuario. No intentes generarlos, solo indica dónde deben ir.
