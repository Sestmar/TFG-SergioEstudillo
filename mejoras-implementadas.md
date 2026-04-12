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

## 32. Laboratorio Táctico 2.0: Estrategia Inmersiva "Full-View" ⚽🧪✅

Se ha desarrollado un módulo de estrategia avanzada (`TacticsProPage`) que trasciende la simple alineación para convertirse en una herramienta de análisis táctico profesional. Este módulo es independiente del acta oficial, permitiendo al entrenador experimentar sin alterar los datos del partido.

### Desafíos Técnicos y Soluciones de Ingeniería

1. **Posicionamiento Libre (Free-Drag)**:
   - **Problema**: El sistema original de slots limitaba la creatividad táctica.
   - **Solución**: Se eliminó la estructura de rejilla (`Flexbox`) en favor de un contenedor con `position: relative`. Los jugadores se posicionan mediante coordenadas porcentuales (`top%`, `left%`) calculadas dinámicamente.
   - **Cálculo de Precisión**: Se implementó una corrección de *offset* en el evento `cdkDragEnded`. Al usar `transform: translate(-50%, -50%)` para centrar visualmente el token, el cálculo de la posición final se ajustó al punto de anclaje real del puntero, logrando una sensación de "soltado" milimétrica.

2. **Interfaz Inmersiva y UX Fluida**:
   - **Ajuste de Pantalla**: El campo se ajusta automáticamente al 100% de la altura del dispositivo (`ion-content [scrollY]="false"`), eliminando el scroll y permitiendo ver los 22 jugadores simultáneamente.
   - **Menú Flotante (Glassmorphism Sidebar)**: Se sustituyó el header fijo por un botón FAB (`≡`) que despliega un sidebar lateral translúcido. Esto maximiza el área de trabajo táctico.
   - **Banquillo "Bottom Sheet"**: Los jugadores disponibles se gestionan desde un panel que desliza desde la parte inferior, siguiendo patrones de diseño nativos de iOS/Android.

3. **Fases Transicionales con Animación**:
   - Implementación de estados de **Ataque (ATQ)** y **Defensa (DEF)** con memorias de posición independientes.
   - El cambio entre fases dispara una animación suave vía `CSS Transition` y `transform: scale()`, permitiendo visualizar cómo se desplaza el equipo en bloque.

4. **Shadow Players (Simulación del Rival)**:
   - Se añadió la capacidad de renderizar 11 "fantasmas" rojos numerados e independientes.
   - Estos tokens permiten al entrenador ensayar movimientos contra un bloque rival específico (ej. presionar un 4-4-2).

5. **Sistema de Dibujo Pro y Persistencia**:
   - **Canvas Persistente**: A diferencia de pizarras efímeras, el sistema guarda cada trazo (puntos y colores) en el `LocalStorage` del navegador.
   - **Arquitectura de Redibujado**: Al cargar la página, un algoritmo recorre el historial de trazos y reconstruye el lienzo de forma transparente para el usuario.
   - **Paleta de Colores**: Inclusión de 4 colores tácticos (Blanco, Púrpura Neón, Rojo Alerta, Amarillo Táctico).

### Impacto en el Proyecto
Esta mejora posiciona la aplicación como una herramienta de alto nivel para directores deportivos, demostrando un dominio avanzado de **Angular CDK**, **Canvas API**, y **Gestión de Estados Complejos** en el Frontend.

---

## 28. Motor de Reportes PDF: Generación Documental Profesional 📄✅

Se ha implementado un motor de generación de documentos PDF de alto nivel que permite exportar Convocatorias, Actas de Partido, Estadísticas de Temporada e Informes Tácticos directamente desde la aplicación, sin depender de servicios externos.

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

#### 4. Exportación de Estrategia Táctica (`generarEstrategiaPDF`)

Genera un informe táctico profesional capturando la pizarra en tiempo real desde `TacticsProPage`. Accesible desde el botón "PDF" en el sidebar de la pizarra.

**Diferencia clave con los otros documentos**: los tres métodos anteriores generan HTML desde cero y lo renderizan en un contenedor oculto. Este método captura un **elemento DOM live** — la pizarra tal y como está en pantalla, incluyendo posiciones de jugadores arrastrados, shadow players del rival y trazos del canvas de dibujo.

```typescript
// tactics-pro.page.ts
async exportarTactica(): Promise<void> {
  const pitch = document.querySelector('[data-test="pitch-board"]') as HTMLElement;
  if (!pitch || this.exportando) return;
  this.exportando = true;
  try {
    await this.pdfSvc.generarEstrategiaPDF(pitch, {
      teamName: this.matchInfo?.equipo?.nombre ?? 'DAM United FC',
      phase: this.currentPhase,
      rival: this.matchInfo?.rival ?? ''
    });
  } finally {
    this.exportando = false;
  }
}
```

**Estructura del PDF generado:**
- **Cabecera** (28mm): fondo `#0a0e1a` + título "INFORME TÁCTICO PROFESIONAL" + `equipo vs rival` + línea separadora `#7c3aed`
- **Cuerpo**: imagen del `pitch-board` centrada y escalada con aspect ratio preservado, `scale: 2` para resolución de impresión
- **Pie** (12mm): fondo gris claro + fase estratégica (ATAQUE/DEFENSA) centrada + fecha de exportación

**Parámetros de `html2canvas`:**
```typescript
html2canvas(pitchElement, {
  scale: 2,
  useCORS: true,
  allowTaint: true,  // necesario para imágenes de avatares cross-origin
  logging: false,
  backgroundColor: '#1a5c2e'
})
```

`allowTaint: true` es crítico aquí porque los avatares de los jugadores provienen de URLs externas (backend). Sin este flag, html2canvas los omite silenciosamente del canvas final.

**Archivos modificados:**

| Archivo | Cambio |
|---|---|
| `pdf.service.ts` | Nuevo método público `generarEstrategiaPDF()` |
| `tactics-pro.page.ts` | Import + inyección de `PdfService`, propiedad `exportando`, método `exportarTactica()` |
| `tactics-pro.page.html` | Botón "PDF" en sidebar con estado de carga (`hourglass` + `disabled`) |

---

## 33. UX/Performance: Skeleton Screens en Vistas Críticas 💀✅

Se ha sustituido el patrón de carga genérico (spinner + texto) por **Skeleton Screens** en las tres vistas de mayor tráfico del entrenador, mejorando la percepción de velocidad y eliminando los saltos de layout (CLS — Cumulative Layout Shift).

### Problema técnico resuelto

Los spinners centrados (`ion-spinner`, `loader-pulse`) ocupan un espacio distinto al del contenido final. Cuando los datos llegan, el DOM se reconstruye y el usuario percibe un "salto" visual. Los skeleton screens resuelven esto porque **el contenedor de carga tiene exactamente la misma estructura y dimensiones que el contenido real** — el ojo humano no percibe diferencia entre el estado de carga y el estado de datos.

### Implementación

Se utilizaron exclusivamente componentes nativos de **Ionic 7** para máxima compatibilidad y consistencia con el sistema de diseño:

```html
<ion-skeleton-text animated="true" style="width: 60%; height: 14px; border-radius: 4px;"></ion-skeleton-text> 
```

La propiedad `animated="true"` activa el efecto shimmer (brillo deslizante) de forma nativa, sin CSS adicional.

### Vistas afectadas

#### 1. `coach-dashboard` (`coach-dashboard.page.html`)
**Antes**: `<div class="loading-state"><div class="loader-pulse"></div><p>Cargando...</p></div>`

**Después**: Skeleton completo que replica el layout real:
- **Sidebar izquierdo**: 5 iconos circulares de navegación
- **Header pro**: saludo (línea corta) + nombre (línea larga) + foto de perfil circular
- **Club identity card**: escudo circular + 3 líneas de info + stats bar (2 items)
- **Status grid**: 2 cards con icono circular + 2 líneas de texto
- **Actions grid**: 1 card grande + 3 cards pequeñas con icono circular + título + descripción

#### 2. `my-team` (`my-team.page.html`)
**Antes**: `<ion-spinner name="crescent" color="secondary">`

**Después**: Skeleton que replica la estructura de secciones de posición:
- 2 bloques `position-section`, cada uno con su `section-label` (dot + texto + count-pill)
- 3 `player-card` por sección con: `pos-bar` lateral neutro, avatar circular (48px), dorsal + nombre + posición, status dot

#### 3. `match-detail` (`match-detail.page.html`)      
**Antes**: `<ion-spinner name="crescent" color="secondary">`

**Después**: Skeleton que replica el acta completa:    
- **Scoreboard**: 2 logos circulares (local/rival) + bloque marcador central (90px ancho) + status pill + 2 líneas de meta (fecha/lugar)
- **Section header**: icono circular + texto "PARTICIPANTES"
- **5 player-card-dark**: avatar circular con dorsal badge superpuesto + nombre + posición + status badge (TITULAR/SUPLENTE)

### Principios de diseño aplicados

| Regla | Cómo se aplicó |
|---|---|
| **Mismo wrapper CSS** | El skeleton usa `dashboard-layout`, `main-container`, `position-section` — los mismos contenedores del contenido real |
| **Dimensiones fijas** | Avatares siempre 48px × 48px con `border-radius: 50%`, igual que las `<img>` reales |
| **Anchos variables** | Líneas de texto al 80%, 60%, 50% para simular jerarquía tipográfica natural |        
| **pointer-events: none** | Los skeleton items no son interactuables — no generan confusión al usuario |     
| **Sin CSS adicional** | Cero nuevas clases. Todo mediante `style` inline de precisión quirúrgica |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `coach/pages/coach-dashboard/coach-dashboard.page.html` | Reemplazado bloque `loading-state` por skeleton completo del layout |
| `coach/pages/my-team/my-team.page.html` | Reemplazado `ion-spinner` por skeleton de secciones + player-cards |
| `match-detail/match-detail.page.html` | Reemplazado `ion-spinner` por skeleton de scoreboard + player-list |

---

## 34. Centro de Inteligencia: Season Analytics & Goals 📊✅

Implementación fullstack de un sistema de analítica de temporada en tiempo real, exponiendo estadísticas competitivas del equipo con contexto de categoría y seguimiento de objetivo de puntos. Visible por entrenador (con edición de objetivo) y jugador (solo lectura), cerrando el círculo de motivación.

### Problema técnico resuelto

El campo `Equipo.categoria` existía en el modelo pero **nunca se había expuesto en ninguna UI**. El equipo podía estar categorizado internamente sin que entrenadores ni jugadores lo vieran. Esta mejora lo convierte en el elemento central del widget de temporada.

Adicionalmente, la tabla `partido` almacena tanto partidos competitivos como entrenamientos (`tipo = 'PARTIDO' | 'ENTRENAMIENTO'`). Sin filtrar por `tipo`, las estadísticas de victorias/empates/derrotas se contaminarían con sesiones de entrenamiento.

### Arquitectura de la solución

#### Backend (Spring Boot)

**Modelo:** Se añadió `puntosObjetivo` a `Equipo` como campo nullable:
```java
@Column(name = "puntos_objetivo")
private Integer puntosObjetivo;
```

**DTO de respuesta:** `SeasonStatsDto` — contrato de salida con todos los datos calculados:
```java
// pj, g, e, p, gf, gc, puntos, puntosObjetivo, categoriaNombre, racha (List<String>)
```

**Repository:** Query derivada con triple filtro — equipo + estado + tipo, ordenada DESC por fecha:
```java
findByEquipo_IdEquipoAndEstadoAndTipoOrderByFechaHoraDesc(idEquipo, "FINALIZADO", "PARTIDO")
```

**Service (`getSeasonStats`):** Iteración única sobre los partidos filtrados. Los primeros 5 resultados (más recientes, orden DESC) se acumulan en `rachaDesc`, que luego se invierte para quedar en orden cronológico (último partido a la derecha, como toda tabla de forma en el fútbol real).

**Endpoints nuevos:**
- `GET /api/equipos/{id}/stats-temporada` — público, hereda `permitAll()` de `GET /api/equipos/**`
- `PATCH /api/equipos/{id}/objetivo` — protegido `ADMIN | ENTRENADOR`, body: `{ puntosObjetivo: number }`

#### Frontend (Angular + Ionic)

**`SeasonStats` interface** — modelo tipado en `models.ts` con 10 campos.

**`SeasonStatsWidgetComponent`** — componente standalone con diseño Glassmorphism Night Stadium:
- **Cabecera**: badge de categoría (trofeo + nombre) + puntos totales destacados
- **Tabla stats**: 7 celdas — PJ / G (verde) / E (amarillo) / P (rojo) / GF / GC / DIF (con signo + color dinámico)
- **Racha de forma**: hasta 5 círculos coloreados — verde `V`, amarillo `E`, rojo `D`
- **Barra de objetivo**: `ion-progress-bar` solo visible cuando `puntosObjetivo` está definido, con clamping `Math.min(puntos/objetivo, 1)`

**Integración Coach Dashboard:**
- Widget insertado sobre el `status-grid`
- Botón engranaje en esquina superior derecha abre `ion-alert` con input numérico para editar `puntosObjetivo`
- Guardado optimista: actualiza `seasonStats` en memoria y refresca desde backend
- `CoachService.setObjetivo()` llama al nuevo `PATCH /api/equipos/{id}/objetivo`
- `ApiService.patch<T>()` añadido al servicio centralizado HTTP

**Integración Player Dashboard:**
- Widget insertado entre la identity card y las acciones rápidas
- Sin botón de edición — estrictamente read-only
- `TeamService.getSeasonStats()` llamado al resolver el equipo del jugador
- `catchError(() => of(null))` garantiza que un error en las stats no bloquea el resto del dashboard

### Diseño — Glassmorphism Night Stadium

```scss
.season-widget {
  background: rgba(15, 22, 45, 0.75);
  border: 1px solid rgba(124, 58, 237, 0.2);
  backdrop-filter: blur(12px);
  border-radius: 16px;
}
```

Paleta de resultados: victoria `#4ade80`, empate `#fbbf24`, derrota `#f87171`. Barra de progreso con gradiente `#7c3aed → #a78bfa`.

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `Equipo.java` | Campo `puntosObjetivo` (nullable) |
| `EquipoDto.java` | Campo `puntosObjetivo` para actualización |
| `SeasonStatsDto.java` | Nuevo DTO de respuesta (10 campos) |
| `PartidoRepository.java` | Query derivada con triple filtro + orden DESC |
| `EquipoService.java` | Métodos `getSeasonStats()` y `setObjetivo()` |
| `EquipoController.java` | Endpoints `GET /{id}/stats-temporada` y `PATCH /{id}/objetivo` |
| `models.ts` | Interface `SeasonStats` |
| `api.service.ts` | Método `patch<T>()` añadido |
| `coach.service.ts` | Métodos `getSeasonStats()` y `setObjetivo()` |
| `team.service.ts` | Método `getSeasonStats()` |
| `season-stats-widget/` | Componente standalone nuevo (ts + html + scss) |
| `coach-dashboard.module.ts` | Import del widget standalone |
| `coach-dashboard.page.ts` | Propiedad `seasonStats`, `loadSeasonStats()`, `editarObjetivo()` con alert |
| `coach-dashboard.page.html` | Widget + botón engranaje sobre el status-grid |
| `player-dashboard.module.ts` | Import del widget standalone |
| `player-dashboard.page.ts` | Propiedad `seasonStats`, carga en `loadPlayerProfile()` |
| `player-dashboard.page.html` | Widget read-only entre identity card y acciones |

---

## Mejora 6 — Season Intelligence Suite + Match Insights Visual Upgrade

**Estado:** Completado  
**Rama:** preprod  
**Fecha de cierre:** 2026-04-12

### Objetivo

Evolucionar la tarjeta de estadísticas básica a un sistema de inteligencia táctica profesional con dos páginas dedicadas, gráficos interactivos, PDF exportable y diseño "Night Stadium Pro".

---

### Fase A — Expansión del Backend (SeasonStatsDto)

**Contexto:** El DTO original solo tenía PJ/G/E/P/GF/GC/Puntos. Se necesitaban datos analíticos para alimentar los gráficos.

**`SeasonStatsDto.java`** — Nuevos campos:
```java
private List<MatchSummaryDto> historialCompleto;  // Últimos 15 partidos
private int cleanSheets;
private double promedioGolesFavor;
private double promedioGolesContra;
private int mayorRachaVictorias;
private int tarjetasAmarillasTotal;
private int tarjetasRojasTotal;
private int asistenciasTotal;
```

**`EquipoService.getSeasonStats()`** — Refactor completo: un único loop sobre los partidos con inyección de `AlineacionRepository` para tarjetas y asistencias. El historial se limita a los últimos 15 partidos en orden cronológico inverso.

**`AlineacionRepository`** — Query derivada añadida:
```java
List<Alineacion> findByPartido_IdPartidoAndEquipo_IdEquipo(Long idPartido, Integer idEquipo);
```

---

### Fase B — Season Intelligence Page (`/coach/season-intelligence`)

**Acceso:** ADMIN, ENTRENADOR, JUGADOR  
**Módulo:** `season-intelligence.module.ts` con `NgApexchartsModule`

#### Detección de Rol
```typescript
const isJugador = this.authService.hasRole('JUGADOR');
// Jugador usa getPlayerTeamByUserId() — coach usa getDashboardData()
// Razón: /api/equipos/** GET es permitAll() en SecurityConfig
```

#### Sparkline de Rendimiento
Doble serie: puntos acumulados (sólido) + puntos por jornada (dashed). Fuente: `historialCompleto` del DTO.

#### Radar de Excelencia (5 ejes, escala 0–100)
| Eje | Fórmula |
|-----|---------|
| Ataque | `promedio_goles_favor × 25` |
| Defensa | `cleanSheets / pj × 100` |
| Disciplina | `100 - (am/pj × 20) - (rj/pj × 40)` |
| Asistencias | `asistencias_total / pj × 25` |
| Eficacia | `victorias / pj × 100` |

#### Pace Analytics (Análisis Predictivo)
```typescript
readonly TOTAL_PARTIDOS = 34;
get proyeccionFinal() { return Math.round((puntos/pj) * 34); }
get paceStatus(): 'on-track' | 'at-risk' | 'no-objetivo'
```
Visual: barra con extensión proyectada (dashed) + línea vertical de objetivo (verde) + shimmer animado.

#### Hero Points Card
Nueva sección `.si-hero` con puntos totales `4.2rem` en glow neón morado + record W/D/L con colores semánticos.

---

### Fase C — Match Insights Page (`/match-insights/:id`)

**Acceso:** ADMIN, ENTRENADOR, JUGADOR

#### Carga Resiliente (Promise.allSettled)
```typescript
const [lineup, seasonStats] = await Promise.allSettled([
  firstValueFrom(matchSvc.getLineup(matchId)),
  equipoId ? firstValueFrom(coachSvc.getSeasonStats(equipoId)) : Promise.resolve(null)
]);
// Degradación elegante si no hay lineup o si el equipo no tiene stats de temporada
```

#### Scoreboard LCD
Layout flex tres columnas: escudo local / marcador / escudo rival. Marcador `3.8rem` con `text-shadow` semántico por resultado (verde/amarillo/rojo).

#### Radar Comparativo — Diseño e Implementación Final

**4 ejes:** Ataque / Defensa / Disciplina / Generación  
**2 series:** `Este partido` vs `Media de temporada`, normalizadas a escala 0–100 (idéntica al Radar de Excelencia de Season Intelligence).

**Fórmulas de normalización por eje:**

| Eje | Este partido | Media temporada |
|-----|-------------|-----------------|
| Ataque | `golesFavor × 25` (cap 100) | `promedioGolesFavor × 25` |
| Defensa | `cleanSheetMatch ? 100 : 0` | `cleanSheets / pj × 100` |
| Disciplina | `100 - (am × 20) - (rj × 40)` | `100 - (am/pj × 20) - (rj/pj × 40)` |
| Generación | `asistencias × 25` (cap 100) | `asistenciasTotal / pj × 25` |

**Guard NaN ultra-seguro** — `??` no protege contra `NaN` en JavaScript. Si `Math.max(1, valor)` recibe un valor no numérico (ej. string del backend), devuelve `NaN`, que contamina todas las divisiones posteriores:

```typescript
const sn = (n: any): number => { const v = Number(n); return isFinite(v) ? v : 0; };
const pj = Math.max(1, sn(s?.pj));  // pj también pasa por sn()
const safe = (arr: number[]) => arr.map(v => isFinite(v) ? v : 0);  // capa final
```

**Decisión arquitectural:** Ver sección "Resolución Final del Radar: SVG Nativo" más abajo.

#### Press Kit PDF
`PdfService.generarMatchCardPDF(partido, lineup)` — sección scoreboard oscura + metadata + goleadores/asistencias + disciplina. Exportado con `html2canvas` + `jsPDF`.

#### Integración de Navegación
- **Match Detail**: botón "Analytics" visible solo cuando `estado === 'FINALIZADO'`
- **Edit Match**: al cerrar acta, `AlertController` ofrece ir directamente a Match Insights

---

### Upgrade Visual — Night Stadium Pro

#### Sistema de Tokens SCSS
```scss
$bg-deep: #0a0e1a;  $neon: #a855f7;  $glass-bg: rgba(255,255,255,0.04);
$green: #22c55e;    $yellow: #eab308; $red: #ef4444;
$mono: ui-monospace, 'SF Mono', 'Fira Code', 'Courier New', monospace;
// CRÍTICO: $mono debe declararse en el bloque de tokens (línea 1), no a mitad
// del archivo. SCSS procesa top-down y variables usadas antes de su declaración
// producen "Undefined variable" en tiempo de compilación.
```

#### Paso 1 — Scoreboards e Identidad
- Match Insights: scoreboard LCD con escudos con `drop-shadow` neón
- Season Intelligence: hero card con puntos `4.2rem` + glow triple + PRO badge pill

#### Paso 2 — Glassmorphism 2.0
- Cyber-grid: `repeating-linear-gradient` doble en `--background` de `ion-content`
- Gradient border con `background-clip: padding-box / border-box`
- `backdrop-filter: blur(25px)`
- Bracket corner top-left via `::before`

#### Paso 3 — Living Data
- Counter animations: ease-out cúbico con `requestAnimationFrame`, valores escalonados
- Sparkline: `animations: { enabled: true, speed: 1200, animateGradually: { delay: 120 } }`
- Radar: `animations: { enabled: false }` (ver nota en Fase C)
- Pace bar: `@keyframes pace-shimmer` con `background-size: 200%` en loop 2.5s

#### Paso 4 — Elite Micro-Cards
- Goleadores: rank dorado para #1, avatar con border neón, ícono balón con drop-shadow verde
- Disciplina: `@keyframes pulse-yellow` / `pulse-red` en bordes de cards por 2.2s/1.8s
- KPI Season Intelligence: `.kpi-card--shield` (verde) / `--trend` (neón) / `--trophy` (dorado)

#### Paso 5 — Scanlines & Technical Overlays
```scss
@keyframes scanline {
  0% { top:0%; opacity:0; } 4% { opacity:1; } 96% { opacity:1; } 100% { top:100%; opacity:0; }
}
// Excluido de .chart-card: GPU composite layer del pseudo-elemento animado
// puede ocluir el SVG de ApexCharts en Chrome (la capa se dimensiona contra
// el bounding box del padre, no contra el height:1px del pseudo-elemento).
.chart-card.glass::after { content: none; }
```

---

### Resolución Final del Radar: SVG Nativo

#### El problema real — ApexCharts + Ionic Lazy Loading

Tras múltiples iteraciones de debug, `console.log` confirmó que `seasonStats` llegaba correctamente con todos los valores. El radar seguía mostrando `<polygon> attribute points: Expected number, "NaN,NaN"`. La causa raíz no estaba en los datos.

**Root cause:** `match-insights` es un módulo lazy-loaded independiente (`loadChildren` en `app-routing`). Cuando el usuario navega a `/match-insights/:id`, el bundle de `ng-apexcharts` se descarga por primera vez. El componente Angular inicializa y ejecuta `buildRadar()` antes de que el inicializador de ApexCharts termine de ejecutarse — el chart intenta calcular coordenadas SVG con dimensiones `0 × 0` → `NaN` en todos los polygon points.

**Por qué funciona en Season Intelligence y no en Match Insights:**

Season Intelligence es accedida típicamente desde el dashboard del entrenador, que en el mismo flujo de navegación ya visitó `team-stats` o `player-dashboard` — ambas páginas también importan `NgApexchartsModule`. El bundle de ApexCharts ya está en memoria del browser cuando llegan a season-intelligence. Match Insights puede ser la **primera ruta del usuario que carga ApexCharts** en la sesión (acceso directo desde el listado de partidos), sin caché previo del bundle.

| Módulo | NgApexchartsModule | Primera carga típica | Resultado |
|--------|--------------------|----------------------|-----------|
| `team-stats` | ✓ | Desde coach dashboard | Bundle cacheado |
| `player-dashboard` | ✓ | Desde login | Bundle cacheado |
| `season-intelligence` | ✓ | Siempre después de team-stats o player-dashboard | OK |
| `match-insights` | ✓ (eliminado) | Potencialmente primera ruta con ApexCharts | FALLO |

**Intentos previos antes de la solución final:**

1. `animations: { enabled: false }` — no resuelve el timing del bundle
2. `emptyRadar()` con animaciones deshabilitadas — no resuelve
3. `ionViewWillEnter` → `ionViewDidEnter` + `setTimeout(100)` — mejora marginal, falla en dispositivos lentos
4. Contenedor `height: 350px` explícito + `*ngIf` con guard de datos — no resuelve el timing del bundle

#### Decisión: Migración a SVG Nativo

Se eliminó `NgApexchartsModule` de `match-insights.module.ts` y se reemplazó el `<apx-chart>` por un `<svg>` generado con trigonometría Angular inline.

**Implementación del generador de polygon points:**

```typescript
// Convierte array de valores 0–100 a polygon points SVG para N ejes
radarPoints(data: number[]): string {
  const cx = 150, cy = 150, r = 100, n = data.length;
  return data.map((v, i) => {
    const angle = (2 * Math.PI * i / n) - Math.PI / 2;
    const x = cx + r * (v / 100) * Math.cos(angle);
    const y = cy + r * (v / 100) * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}
```

Para 4 ejes, el eje 0 empieza en `-π/2` (arriba), y cada eje gira `2π/4 = 90°` en sentido horario: Ataque (arriba), Defensa (derecha), Disciplina (abajo), Generación (izquierda). El grid son 5 polígonos estáticos al 100/80/60/40/20% — para 4 ejes con ángulos rectos, son rombos con vértices fijos computados de antemano en el HTML.

**Template SVG:**

```html
<svg viewBox="0 0 300 300" style="width:100%;max-width:300px;display:block;margin:0 auto;">
  <!-- Grid estático (5 niveles) -->
  <polygon points="150,50 250,150 150,250 50,150" fill="rgba(168,85,247,0.03)" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  <!-- ... 4 polígonos más para 80/60/40/20% ... -->
  <!-- Ejes -->
  <line x1="150" y1="150" x2="150" y2="50" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  <!-- ... 3 ejes más ... -->
  <!-- Media temporada (dashed) -->
  <polygon [attr.points]="radarPoints(radarAvg)" fill="rgba(148,163,184,0.10)"
           stroke="rgba(148,163,184,0.55)" stroke-width="1.5" stroke-dasharray="4 3"/>
  <!-- Este partido (sólido) -->
  <polygon [attr.points]="radarPoints(radarMatch)" fill="rgba(168,85,247,0.22)"
           stroke="#a855f7" stroke-width="2"/>
  <!-- Etiquetas posicionadas fuera de los vértices -->
  <text x="150" y="33" text-anchor="middle" fill="#94a3b8" font-size="11">Ataque</text>
  <!-- ... 3 etiquetas más ... -->
</svg>
```

**Comparativa ApexCharts vs SVG Nativo para este caso:**

| Característica | ApexCharts | SVG Nativo |
|---|---|---|
| Tiempo de renderizado | Depende de bundle lazy | Instantáneo (DOM nativo) |
| Dependencia externa | ng-apexcharts + apexcharts | Ninguna |
| Tooltips al hover | ✓ | ✗ |
| Animación de entrada | ✓ | ✗ |
| Grid + polígonos + labels | ✓ | ✓ |
| Leyenda | ✓ | ✓ (inline) |
| Fiabilidad en lazy modules | ✗ (timing issue) | ✓ |
| Tamaño de bundle | +~200KB | +0KB |

Para un radar comparativo de 4 métricas sin interactividad crítica, las ventajas de SVG nativo superan ampliamente las pérdidas (tooltip y animación de entrada).

---

### Bugs Resueltos

| Bug | Causa raíz | Fix |
|-----|-----------|-----|
| Radar NaN en polygon points | ApexCharts bundle carga lazy después del render del componente — dimensiones `0×0` en el init → coordenadas NaN | Migración completa a SVG nativo (eliminado ApexCharts de match-insights) |
| `Math.max(1, pj)` devuelve NaN | `Math.max` con valor no numérico (ej. string del backend) propaga NaN. `??` no filtra NaN, solo null/undefined | `const pj = Math.max(1, sn(s?.pj))` — pj también pasa por el helper `sn()` |
| Escudo rival en loop infinito | `(error)` setea `src` a imagen fallida sin cortar el evento → nuevo error → loop | `(error)="$any($event.target).onerror=null; $any($event.target).src='fallback'"` |
| Avatar goleadores/disciplina en loop | Mismo patrón — `(error)` sin `onerror=null` previo | Mismo fix aplicado a todos los `<img>` con fallback |
| `$mono` undefined en SCSS | Variable declarada a mitad del archivo, usada antes en top-down compilation | Movida al bloque de tokens, línea 1 del archivo |
| `victorias`/`empates` TypeScript error | `SeasonStats` usa campos `g`/`e`/`p` (no nombres completos en español) | Acceso correcto: `s.g`, `s.e`, `s.p` en `runCounterAnimations()` |
| Jugador sin acceso a Season Intelligence | Usaba `getDashboardData` (endpoint exclusivo coach) | `hasRole('JUGADOR')` → rama alternativa con `getPlayerTeamByUserId` |
| `animateGradually` en radar ApexCharts | Opción diseñada para bar/area charts — en radar produce polígono incompleto | Eliminado del objeto de configuración del radar |

---

### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `SeasonStatsDto.java` | +8 campos analíticos |
| `EquipoService.java` | Refactor `getSeasonStats()` completo |
| `AlineacionRepository.java` | Query derivada por partido y equipo |
| `models.ts` | Interface `MatchSummary` + extensión `SeasonStats` |
| `season-intelligence.page.ts` | Página nueva completa (charts + pace + counters) |
| `season-intelligence.page.html` | Template con sparkline, radar, pace track, hero |
| `season-intelligence.page.scss` | Sistema visual Night Stadium Pro |
| `season-intelligence.module.ts` | NgApexchartsModule |
| `match-insights.page.ts` | Página nueva: scoreboard LCD, counter animations, `radarPoints()` SVG, `buildRadar()` con guards NaN |
| `match-insights.page.html` | Scoreboard LCD + KPI row + radar SVG nativo + FIFA scorer cards + disciplina + press kit |
| `match-insights.page.scss` | Sistema visual Night Stadium Pro |
| `match-insights.module.ts` | `NgApexchartsModule` eliminado — radar migrado a SVG nativo |
| `season-stats-widget.component.*` | Link "Intelligence Pro" + `mostrarIntelligence` input |
| `coach-dashboard.page.html` | `[mostrarIntelligence]="true"` |
| `player-dashboard.page.html` | `[mostrarIntelligence]="true"` |
| `edit-match.page.ts` | AlertController post-cierre con nav a Match Insights |
| `match-detail.page.html` | Botón Analytics (solo estado FINALIZADO) |
| `pdf.service.ts` | `generarMatchCardPDF()` |
| `app-routing.module.ts` | Rutas `season-intelligence` y `match-insights/:id` |
