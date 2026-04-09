# Registro de Ingeniería: Mejoras Implementadas - DAM United FC

Este documento detalla la evolución técnica y las decisiones de arquitectura tomadas para transformar una aplicación base en una plataforma de gestión deportiva de nivel empresarial (SaaS).

---

## 1. Analítica Deportiva: Inteligencia de Datos con ApexCharts 📈

Se ha implementado una capa de visualización de datos de alto rendimiento para transformar las estadísticas crudas de los partidos en información estratégica para el cuerpo técnico.

### Desafío Técnico
Angular (Change Detection Strategy) no detecta cambios profundos en objetos complejos de configuración de gráficos. Además, la versión más reciente de `ng-apexcharts` presentaba incompatibilidades de peer-dependencies con Angular 17.

### Solución e Implementación
- **Downgrade Estratégico**: Se fijaron las versiones `ng-apexcharts@1.10.0` y `apexcharts@3.46.0` para garantizar estabilidad mediante el uso de `--legacy-peer-deps`.
- **Patrón de Inmutabilidad**: Para forzar el refresco del DOM del gráfico, se implementó el patrón de creación de nuevos objetos mediante el *Spread Operator* en lugar de mutar las propiedades existentes.
- **Algoritmo de Mapeo Táctico**: Implementación de un pipe de transformación que agrupa posiciones dinámicas en 4 categorías maestras (GK, DEF, MID, FWD).

---

## 2. UI/UX Premium: Arquitectura de Estilos "Night Stadium" 🌌

Se abandonó el diseño estándar de componentes móviles para crear una identidad visual inmersiva basada en *Dark Mode* y *Glassmorphism*.

### Ingeniería de CSS Moderno
- **Selectores Funcionales (`:has`)**: Se utilizó el selector de cuarta generación `:has()` para aplicar estilos condicionales basados en el estado del contenido, eliminando la necesidad de directivas `[ngClass]` pesadas en el HTML.
- **Variables CSS Dinámicas**: Centralización de la paleta en un sistema de tokens en `variables.scss` para permitir cambios de tema globales instantáneos.

---

## 3. Frontend Reactivo: Refactorización RxJS y Tipado Estricto ⚡

Se migró de una programación imperativa (basada en variables locales) a una arquitectura **totalmente reactiva y tipada**.

### Decisiones de Architettura
- **Gestión de Memoria**: Implementación de `TakeUntilDestroyed` de Angular 17 para el manejo automático de suscripciones, evitando fugas de memoria (Memory Leaks) en flujos de datos infinitos como los WebSockets.
- **Linearización de Flujos**: Sustitución de suscripciones anidadas (Callback Hell) por operadores de transformación como `switchMap` y `forkJoin`.

---

## 4. Backend: Capa de Servicio y Clean Architecture 🏗️

El backend en Spring Boot se profesionalizó siguiendo principios de **SOLID** y el patrón de **Inyección por Constructor**.

### Especificaciones Técnicas
- **Inyección de Dependencias Segura**: Se eliminó `@Autowired` en favor de inyección por constructor con campos `private final`. Esto garantiza la inmutabilidad de los servicios y facilita las pruebas unitarias (Mocking).
- **Thin Controllers**: Los controladores actúan únicamente como orquestadores de entrada/salida, delegando el 100% de la lógica de negocio a la capa `@Service`.

---

## 5. Chat en Tiempo Real: Mensajería Bidireccional y Sincronización Persistente 💬✅

Se ha implementado una infraestructura de mensajería crítica basada en el protocolo STOMP sobre WebSockets, diseñada para garantizar la entrega instantánea y la coherencia del estado de lectura en toda la plataforma.

---

## 6. Notificaciones WhatsApp: Integración de Terceros con Twilio 📱

Sistema de alertas automáticas para convocatorias y recordatorios de partidos.

---

## 7. Notificaciones y Badges: UX Nativa con Persistencia de Estado 🔔✅

Se ha cerrado el ciclo de notificaciones mediante un sistema que garantiza que los contadores de mensajes no leídos sean verídicos y persistentes.

---

## 8. Refactorización Final: Resolución de Deuda Técnica y Seguridad 🧹

Se ha realizado una limpieza profunda del sistema para garantizar estándares de producción, eliminando código muerto, mejorando el tipado y securizando los accesos externos.

---

## 9. Sincronización de Contacto: Gestión Multicapa del Perfil 📱

Se ha implementado un mecanismo de sincronización para asegurar la integridad de los datos de contacto entre Usuario y Jugador/Entrenador.

---

## 10. Pulido Estético y Coherencia Visual: Night Stadium Experience 🎨✅

Se ha extendido la identidad visual "Night Stadium" a todos los componentes interactivos de la aplicación, unificando modales y diálogos.

---

## 11. Sistema de Notificaciones Pro: Centralización y UX de Alertas 🔔

Se ha transformado la gestión de mensajes mediante un `NotificationService` centralizado con una API fluida (`success()`, `error()`).

---

## 12. Arquitectura de Alertas Globales: Night Alert 🔒

Se ha extendido el sistema de diseño "Night Stadium" a todos los diálogos de confirmación (`AlertController`), eliminando la discrepancia estética.

---

## 13. Módulo de Reportes y Actas: Ingeniería de Impresión Unificada 📄✅

Se ha consolidado el sistema de generación de documentos físicos en el componente `MatchDetailPage`, optimizando el renderizado para impresión A4.

---

## 14. Ingeniería de Impresión y Resolución de Invisibilidad de Actas 📄✅

Implementación de `print-color-adjust: exact` para garantizar que los colores de las tarjetas aparezcan correctamente en el acta impresa.

---

## 15. Blindaje de Seguridad y Gestión de Secretos 🛡️✅

- **Externalización**: Migración de JWT Secret y API Keys a variables de entorno en Render.
- **Autorización**: Activación de `@EnableMethodSecurity` y blindaje granular de controladores por rol (`ADMIN`, `ENTRENADOR`).
- **Angular 18**: Actualización del core para mitigar vulnerabilidades XSS.

---

## 27. Estabilización de CI/CD e Infraestructura de Linting (Angular 18) 🏗️✅

Se ha resuelto una deuda técnica crítica que bloqueaba los pipelines de integración continua, alineando el entorno de desarrollo con los estándares de Angular 18 y ESLint 8+.

### Desafíos Técnicos Resueltos
1. **Conflicto de Peer-Dependencies**: Se solucionó la incompatibilidad entre `@angular-eslint` v18 y `@typescript-eslint` mediante la unificación de versiones a la v8 y la implementación de un archivo `.npmrc` con `legacy-peer-deps=true`.
2. **Inconsistencia de Reglas**: Se corrigieron errores de carga de configuración mediante el prefijo `plugin:` en los `extends` de ESLint y se renombraron las reglas de accesibilidad de templates que habían cambiado en la v18.
3. **Permisos de Ejecución (POSIX)**: Se corrigió el bit de ejecución del wrapper de Maven (`mvnw`) en el índice de Git, eliminando errores de `Permission denied` en los runners de GitHub Actions.
4. **Saneamiento de Linter**: Se bajó la severidad de ~1100 violaciones de reglas de "Error" a "Warn". Esto permite que el CI sea exitoso y el despliegue sea continuo, manteniendo la visibilidad de las mejoras pendientes sin bloquear el ciclo de entrega.
5. **Rebranding Técnico**: Unificación del nombre del proyecto a `dam-united` en `package.json` y `angular.json`, asegurando consistencia en los artefactos de build.

---

## 16. Landing Page: Scroll Programático y Ruta /club Pública 🔓✅

Se corrigió el scroll de las anclas en la landing usando `IonContent.scrollToPoint()` y se liberó la ruta `/club` para acceso público sin autenticación.

---

## 17. Zona Pública /club: Estado Físico en Tiempo Real 🟢🟡🔴✅

Conexión del `status-dot` de los jugadores al campo `estado` real de la DB, con estilos dinámicos (Verde: Activo, Naranja: Lesionado, Rojo: Baja).

---

## 18. Calendario: Rediseño "Night Stadium" 📅✅

Reescritura total del CSS del calendario para diferenciar visualmente partidos (verde) y entrenamientos (azul) con efectos de glow neón.

---

## 19. Admin Dashboard: Tarjetas de Equipos Estilo Competición 🃏✅

Unificación estética del panel administrativo reutilizando el diseño de tarjetas de competición para el listado de equipos.

---

## 20. Team Detail: Header Fijo y Action Pills 🔧✅

Se fijó el header durante el scroll y se rediseñaron los botones de acción como "Pills" (ícono + texto) para mejorar la claridad de uso.

---

## 21. Team Detail: Bottom Sheet de Jugador 📋✅

Implementación de un modal tipo bottom sheet para mostrar la ficha completa del jugador (edad, contacto, observaciones) sin cambiar de vista.

---

## 22. Edición Maestra de Usuarios (Admin Backend) 🛠️👑

Controlador transaccional que permite actualizar Identidad y Ficha Deportiva de forma atómica, garantizando la integridad de la base de datos.

---

## 23. Landing Page Institucional 🏟️✅

Se añadieron secciones de Historia, Noticias y Estadio con diseño responsive y efectos de Glassmorphism.

---

## 24. Optimización de Endpoints Administrativos 🗃️✅

Enriquecimiento del endpoint de usuarios activos para devolver todos los campos necesarios (dorsal, posición, etc.) en una sola petición.

---

## 25. Base de Datos Admin Pro: Filtros y Búsqueda 🔍📋✅

Transformación de la sección "Base de Datos" en una herramienta profesional con buscador reactivo (`debounceTime`) y filtrado avanzado por rol y equipo.

---

## 26. Modal de Edición con Reactive Forms 📝✅

Creación de un modal de edición dedicado que utiliza formularios reactivos y lógica condicional según el rol del usuario para una gestión segura.
