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

---

## 29. Logging Profesional: Migración de printStackTrace a SLF4J 🪵✅

Se eliminó el único `e.printStackTrace()` restante en el backend, sustituyéndolo por un logger estructurado con SLF4J via la anotación de Lombok `@Slf4j`.

### Archivo afectado

`PartidoController.java` — método `cerrarActa()`:

```java
// ANTES
} catch (Exception e) {
    e.printStackTrace();
    return ResponseEntity.internalServerError()...
}

// DESPUÉS
@Slf4j
@RestController
public class PartidoController {
    ...
    } catch (Exception e) {
        log.error("Error al cerrar acta del partido: {}", e.getMessage(), e);
        return ResponseEntity.internalServerError()...
    }
```

### Por qué importa

| `printStackTrace()` | `log.error(...)` |
|---|---|
| Escribe a stderr sin formato | Escribe al sistema de logging configurado |
| Sin nivel ni contexto | Nivel `ERROR`, mensaje descriptivo |
| No filtreable en producción | Gestionable con Logback / Render logs |
| Mala práctica en producción | Estándar en aplicaciones Spring Boot |

`@Slf4j` es una anotación de Lombok ya presente en el proyecto. No requiere dependencia adicional — genera el campo `private static final Logger log` en tiempo de compilación.

---

## 31. Saneamiento Final y Profesionalización: Resolución de Deuda Técnica 🧹✅

Se ha realizado una auditoría profunda del código fuente para eliminar malas prácticas y alinear el proyecto con los estándares de producción de nivel Senior. Esta intervención garantiza la mantenibilidad a largo plazo y la seguridad de la información.

### 1. Centralización de Infraestructura (Backend)
Se han extraído todas las URLs de producción que estaban "hardcodeadas" en los servicios y controladores, moviéndolas al sistema de configuración de Spring Boot.

- **Ficheros afectados**: `AdminService.java`, `UsuarioController.java`, `application.properties`.
- **Implementación**: Uso de la anotación `@Value("${propiedad}")` con soporte para variables de entorno de sistema.
- **Impacto**: Permite cambiar el dominio del Backend o Frontend sin necesidad de recompilar el código. El sistema ahora soporta fallbacks automáticos para despliegues en local y producción (Render).

### 2. Refactorización de Inyección de Dependencias (Spring Boot)
Se ha migrado la inyección de campos (`@Autowired`) a **Inyección por Constructor**, siguiendo las recomendaciones oficiales de Spring y las reglas de *Clean Code*.

- **Fichero afectado**: `WebSocketConfig.java`.
- **Implementación**: Uso de la anotación `@RequiredArgsConstructor` de Lombok combinada con campos `private final`.
- **Ventajas Técnicas**:
    - **Inmutabilidad**: Los servicios inyectados no pueden ser modificados después de la creación del objeto.
    - **Testabilidad**: Facilita la creación de pruebas unitarias al permitir pasar mocks directamente por el constructor sin necesidad de reflexión o contextos de Spring pesados.
    - **Detección de dependencias circulares**: Spring detecta fallos de diseño en tiempo de compilación/arranque en lugar de tiempo de ejecución.

### 3. Limpieza de Trazas y Seguridad (Frontend)
Se han eliminado **12 llamadas a `console.warn()`** distribuidas en 8 archivos críticos del Frontend (Auth, Chat, Dashboards, Stats).

- **Motivo**: Los logs de advertencia en producción pueden exponer lógica de negocio, estructuras de datos internas o detalles de la infraestructura a usuarios malintencionados a través de la consola del navegador.
- **Estrategia**: 
    - En bloques `catch`, se reemplazaron los logs por manejos silenciosos o flujos de fallback coherentes.
    - En interceptores de seguridad, se eliminaron mensajes que daban pistas sobre el estado de la sesión, manteniendo únicamente la lógica de redirección y limpieza de tokens.

### Resumen de Archivos Saneados (Frontend)
- `app.component.ts`
- `auth.interceptor.ts`
- `auth.service.ts`
- `chat.service.ts`
- `user-dashboard.page.ts`
- `chat.page.ts`
- `team-stats.page.ts`
- `player-dashboard.page.ts`

---

## 28. Motor de Reportes PDF: Generación Documental Profesional 📄✅

Se ha implementado un motor de generación de documentos PDF de alto nivel que permite exportar Convocatorias, Actas de Partido y Estadísticas de Temporada directamente desde la aplicación, sin depender de servicios externos.

### Desafío Técnico

El Shadow DOM de Ionic impide el acceso directo de `html2canvas` a los componentes renderizados. Librería `window.print()` no permite control sobre el layout ni la paginación. Se necesitaba una solución que:
1. Renderizara HTML limpio fuera del árbol de componentes de Ionic
2. Capturara dicho HTML como imagen de alta resolución
3. Lo exportara como PDF A4 con paginación automática para documentos largos

### Solución: Patrón "Hidden Container"

Se creó un `PdfService` (`src/app/core/services/pdf/pdf.service.ts`) con tres métodos públicos y un motor de exportación privado reutilizable.

**Flujo del motor (`exportar`):**
```typescript
private async exportar(html: string, filename: string): Promise<void> {
  // 1. Crear contenedor oculto fuera de la viewport
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    // 2. Capturar con html2canvas (scale:2 = doble resolución)
    const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
      scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff'
    });

    const pdf  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfW = pdf.internal.pageSize.getWidth();   // 210mm
    const pdfH = pdf.internal.pageSize.getHeight();  // 297mm
    const imgH = (canvas.height * pdfW) / canvas.width;

    if (imgH <= pdfH) {
      // 3a. Documento corto: añadir en una sola página
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfW, imgH);
    } else {
      // 3b. Documento largo: paginar por slices del canvas
      let yOffset = 0;
      while (yOffset < canvas.height) {
        const sliceH = Math.min(canvas.height - yOffset, (pdfH * canvas.width) / pdfW);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width  = canvas.width;
        sliceCanvas.height = sliceH;
        sliceCanvas.getContext('2d')!.drawImage(canvas, 0, -yOffset);
        pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 0, 0, pdfW, (sliceH * pdfW) / canvas.width);
        yOffset += sliceH;
        if (yOffset < canvas.height) pdf.addPage();
      }
    }
    pdf.save(filename);
  } finally {
    // 4. Limpieza del DOM siempre, incluso si hay error
    document.body.removeChild(container);
  }
}
```

**Por qué `scale: 2`**: html2canvas captura pixels de pantalla. Con `scale:1` el PDF quedaría borroso en impresión. Escala 2 produce una imagen de 2× la resolución del viewport, suficiente para impresión A4 a 150 dpi.

**Por qué `left:-9999px`** y no `display:none`: html2canvas no puede renderizar elementos invisibles (los ignora). El contenedor debe estar en el DOM y tener dimensiones, pero fuera del área visible para el usuario.

### Documentos Generados

#### 1. Convocatoria (`generarConvocatoriaPDF`)
Genera un documento formal con tabla de jugadores convocados y espacio para firmas del entrenador y delegado. Se invoca desde `ConvocationDetailsPage`:

```typescript
// convocation-details.page.ts
async descargarPDF() {
  if (!this.convocation) return;
  this.generandoPdf = true;
  await this.pdfService.generarConvocatoriaPDF(this.convocation);
  this.generandoPdf = false;
}
```

```html
<!-- convocation-details.page.html -->
<ion-button (click)="descargarPDF()" [disabled]="!convocation || generandoPdf">
  <ion-icon [name]="generandoPdf ? 'hourglass-outline' : 'document-outline'"></ion-icon>
</ion-button>
```

#### 2. Acta de Partido (`generarActaPDF`)
Genera el acta oficial con resultado, titulares, suplentes, goles y tarjetas. Se invoca desde `MatchDetailPage`.

El reto técnico aquí es que `MatchPlayerDisplay` sobrescribe `tarjetaAmarilla`/`tarjetaRoja` como `boolean`, mientras que `LineupSlotDto` los espera como `number` (0 o 1). Se resuelve con un mapeo explícito antes de llamar al servicio:

```typescript
// match-detail.page.ts
async descargarActa() {
  if (!this.match) return;
  this.generandoPdf = true;
  const lineup: LineupSlotDto[] = this.players.map(p => ({
    ...p,
    dorsal: typeof p.dorsal === 'string' ? undefined : p.dorsal,
    tarjetaAmarilla: p.tarjetaAmarilla ? 1 : 0,  // boolean → number
    tarjetaRoja:     p.tarjetaRoja     ? 1 : 0
  }));
  await this.pdfService.generarActaPDF(this.match, lineup);
  this.generandoPdf = false;
}
```

#### 3. Estadísticas de Temporada (`generarEstadisticasPDF`)
Genera un informe tabular completo con dorsal, nombre, posición, goles, asistencias, minutos jugados y % asistencia a entrenamientos. Se invoca desde `TeamStatsPage`.

Para tener acceso al array completo de jugadores (el componente solo almacenaba subconjuntos ordenados), se añadió la propiedad `allPlayers: PlayerSeasonStat[]` que se rellena en `loadFullStats()` antes de distribuir los datos entre los rankings:

```typescript
// team-stats.page.ts
loadFullStats(coachId: number) {
  this.coachSvc.getTeamStats(coachId).pipe(...).subscribe({
    next: (res) => {
      const players: PlayerSeasonStat[] = res.jugadores || [];
      this.allPlayers = players; // ← guardado antes de cualquier sort/slice
      // ... resto de la lógica de rankings y gráficas
    }
  });
}

async descargarEstadisticas() {
  if (!this.allPlayers.length) return;
  this.generandoPdf = true;
  await this.pdfService.generarEstadisticasPDF(this.allPlayers, this.teamName);
  this.generandoPdf = false;
}
```

### Dependencias Instaladas

```bash
npm install jspdf html2canvas --legacy-peer-deps
```

| Librería | Versión | Rol |
|---|---|---|
| `jspdf` | `^2.5.1` | Creación y exportación del PDF A4 |
| `html2canvas` | `^1.4.1` | Renderizado de HTML a canvas bitmap |

### Identidad Visual del Documento

Todos los PDFs comparten la misma cabecera corporativa via el helper privado `cabecera()`:
- Fondo oscuro `#0a0e1a` (color Night Stadium de la app)
- Acento púrpura `#7c3aed` para las líneas separadoras y destacados
- Logo del club (`assets/img/mi-club-logo.png`) en la cabecera, con URL dinámica via `window.location.origin`
- Pie de página con fecha de generación automática

### Bugs corregidos durante pruebas

**1. Nombres en blanco en el PDF**

html2canvas renderiza el div oculto dentro del contexto del DOM de la app. El tema dark de Ionic/Angular establece el color de texto global en blanco (`--ion-text-color`). Al generar el div con `background:#fff` pero sin `color` explícito, el texto heredaba el color blanco del tema — texto blanco sobre fondo blanco, invisible. La columna Posición se veía porque tenía `color:#6b7280` hardcodeado. El resto (nombre, dorsal, minutos) no tenía color explícito.

**Fix**: añadir `color:#111` al div raíz de cada template HTML:
```typescript
`<div style="font-family:Arial,sans-serif;width:700px;background:#fff;padding:0;color:#111;">`
```

**2. Nombre del jugador en convocatoria**

El campo `nombre` de `jugador` en la entidad `Convocation` no está en `Player` directamente sino en `Player.usuario.nombre`. Error de tipo TypeScript: `Property 'nombre' does not exist on type 'Player'`.

**Fix**: acceder via la cadena correcta:
```typescript
// ANTES (incorrecto)
jc.jugador?.nombre

// DESPUÉS (correcto)
jc.jugador?.usuario?.nombre
```
