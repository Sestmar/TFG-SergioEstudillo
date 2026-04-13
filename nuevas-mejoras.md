# Roadmap de Mejoras: Estabilidad y Notificaciones 🏟️🚀

Este documento centraliza las evoluciones de la plataforma para alcanzar un estándar de calidad profesional (Production Ready).

---

## 🛠️ 1. Resiliencia y Estabilidad Visual (Match Insights Pro) (HECHO)
**Objetivo**: Garantizar una experiencia visual ininterrumpida en la Central de Analítica, eliminando errores de consola y fallos de carga en recursos externos.

- **Unificación de Fallbacks**: Implementar una estrategia global de "rescate de imágenes" para escudos de rivales y fotos de jugadores en `match-insights`.
- **Blindaje contra Loops**: Asegurar que los manejadores de error anulen la recursividad (`onerror=null`) para evitar bloqueos del navegador.
- **Validación de Datos**: Mejorar la integración Frontend-Backend para manejar valores nulos o URLs inválidas antes del renderizado.

---

## 🛠️ 2. Migración: De WhatsApp (Twilio) a Push Notifications Nativas (FCM) 🔔
**Objetivo**: Sustituir el servicio externo de Twilio por un sistema de notificaciones nativas multiplataforma utilizando **Firebase Cloud Messaging (FCM)** y **Capacitor**, integrando la comunicación dentro de la propia identidad de la app.

### 2.1. Infraestructura Backend (Spring Boot)
- **FCM Admin SDK**: Integrar la librería oficial de Firebase para la gestión de mensajes desde el servidor.
- **Persistencia de Tokens**: Ampliar el modelo `Usuario` para almacenar el `fcmToken` único de cada dispositivo vinculado.
- **Notification Provider Pattern**: Refactorizar el servicio de notificaciones actual para desacoplar la lógica de envío del proveedor, facilitando el apagado controlado de Twilio y el encendido de FCM.
- **Scheduler Pro**: Optimizar los `@Scheduled` cron jobs para que consulten la base de datos y disparen los recordatorios automáticos (24h antes) vía Push.

### 2.2. Infraestructura Frontend (Ionic + Capacitor)
- **Capacitor Push Plugin**: Implementar `@capacitor/push-notifications` para gestionar permisos, registro de dispositivos y recepción de payloads.
- **Lifecycle Management**: Configurar el comportamiento de las notificaciones cuando la app está en **Foreground** (alerta interna) y **Background/Closed** (notificación de sistema).
- **Token Registration**: Lógica para enviar el token de FCM al backend inmediatamente después de un login exitoso.

### 2.3. Eventos Críticos de Notificación
- **Chat Real-Time**: Notificación inmediata al recibir un mensaje nuevo en el chat del equipo (emisor vs receptores).
- **Gestión de Eventos**: Notificación al crear un nuevo **Partido** o **Entrenamiento**.
- **Recordatorios Automáticos**: Aviso preventivo **24 horas antes** del inicio de cualquier evento programado para asegurar la asistencia.

---
> **Nota**: El foco de esta migración es la **autonomía**. Al eliminar la dependencia de Twilio Sandbox, la aplicación gana escalabilidad infinita y una experiencia de usuario 100% nativa.
