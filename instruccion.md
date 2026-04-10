# 📝 PROMPT PARA ACTUALIZACIÓN DE README (SESIÓN 10/04/2026)

Copia y pega este prompt a tu IA encargada de la documentación:

---

```markdown
Eres una IA documentativa experta. Tu misión es actualizar el `README.md` del proyecto **DAM United FC** basándote en las mejoras críticas implementadas en la sesión de hoy (10/04/2026).

### 📑 CONTEXTO DE LA SESIÓN: SANEAMIENTO Y LABORATORIO TÁCTICO

En esta sesión se han realizado dos intervenciones de alto nivel:

1. **Saneamiento de Deuda Técnica (Arquitectura Backend):**
   - **Inyección por Constructor**: Se eliminó `@Autowired` en `WebSocketConfig.java` en favor de inyección por constructor con campos `final` y `@RequiredArgsConstructor` (Lombok).
   - **Centralización de Infraestructura**: Se extrajeron las URLs de producción hardcodeadas a `application.properties`, permitiendo la configuración vía variables de entorno (`APP_BACKEND_URL`, `APP_FRONTEND_URL`) con fallbacks automáticos.
   - **Limpieza de Logs**: Se eliminaron 12 llamadas a `console.warn()` en el Frontend para evitar exposición de trazas en producción.

2. **Nuevo Módulo "Laboratorio Táctico Pro" (UX Inmersiva):**
   - **Interfaz Full-View**: Rediseño total de la pizarra táctica para ocupar el 100% de la pantalla sin scroll, optimizada para tablets y móviles.
   - **Libertad Total de Posicionamiento**: Sistema de drag & drop libre basado en coordenadas relativas (%), rompiendo la rejilla rígida anterior.
   - **Menú Flotante & Glassmorphism**: Implementación de un sidebar colapsable y banquillo tipo "Bottom Sheet" para maximizar el área de trabajo.
   - **Estrategia Avanzada**: Fases de Ataque/Defensa con transiciones animadas, simulación de equipo rival (Shadow Players) y sistema de dibujo táctico (Canvas) con persistencia en LocalStorage.

---

### 🛠️ TAREAS DE ACTUALIZACIÓN EN README.md

1. **Sección "Highlights Técnicos"**:
   - Añadir un bullet sobre el **"Laboratorio Táctico Pro"** destacando el uso de Angular CDK para posicionamiento libre y Canvas API para anotaciones persistentes.

2. **Sección "Características Principales" (Módulo Entrenador)**:
   - Resaltar la nueva capacidad de análisis táctico: "Pizarra Pro con simulación de rival, fases de juego animadas y herramientas de dibujo técnico".

3. **Sección "Arquitectura & Estándares"**:
   - Mencionar el saneamiento de la inyección de dependencias (Constructor Injection) y la externalización de la configuración de red.

4. **Pie de Versión**:
   - Actualizar a: *Versión: 7.0 — Tactical Laboratory Pro · Backend Sanitization · Inmersive UX*
   - Fecha: 10 de Abril 2026

Por favor, mantén el tono profesional, técnico y apasionado que caracteriza la documentación de este TFG.
```
---
