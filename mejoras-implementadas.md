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

```typescript
// Forzado de renderizado mediante inmutabilidad
actualizarGrafico(goles: number[]) {
  this.radarChartOptions = {
    ...this.radarChartOptions, // Nueva referencia de objeto
    series: [{
      name: 'Rendimiento Promedio',
      data: goles // Inyección de datos transformados desde el backend
    }],
    xaxis: {
      categories: ['Goles', 'Asistencias', 'Minutos', 'Tarjetas']
    }
  };
}
```

---

## 2. UI/UX Premium: Arquitectura de Estilos "Night Stadium" 🌌

Se abandonó el diseño estándar de componentes móviles para crear una identidad visual inmersiva basada en *Dark Mode* y *Glassmorphism*.

### Ingeniería de CSS Moderno
- **Selectores Funcionales (`:has`)**: Se utilizó el selector de cuarta generación `:has()` para aplicar estilos condicionales basados en el estado del contenido, eliminando la necesidad de directivas `[ngClass]` pesadas en el HTML.
- **Variables CSS Dinámicas**: Centralización de la paleta en un sistema de tokens en `variables.scss` para permitir cambios de tema globales instantáneos.

```scss
// Lógica visual desacoplada del TypeScript
.player-card {
  background: var(--card-bg-glass);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  // Si la tarjeta contiene una barra de posición de portero, cambia el acento
  &:has(.pos-bar.keeper) {
    border-left: 4px solid var(--accent-gold);
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.15);
  }
}
```

---

## 3. Frontend Reactivo: Refactorización RxJS y Tipado Estricto ⚡

Se migró de una programación imperativa (basada en variables locales) a una arquitectura **totalmente reactiva y tipada**.

### Decisiones de Arquitectura
- **Gestión de Memoria**: Implementación de `TakeUntilDestroyed` de Angular 17 para el manejo automático de suscripciones, evitando fugas de memoria (Memory Leaks) en flujos de datos infinitos como los WebSockets.
- **Linearización de Flujos**: Sustitución de suscripciones anidadas (Callback Hell) por operadores de transformación como `switchMap` y `forkJoin`.

```typescript
// Refactor: De código anidado a flujo lineal reactivo
this.route.params.pipe(
  map(p => p['id']),
  switchMap(id => this.matchService.getMatchById(id)),
  tap(match => this.matchActual = match),
  switchMap(match => this.playerService.getPlayersByTeam(match.equipoId)),
  takeUntilDestroyed(this.destroyRef) // Cleanup automático
).subscribe(players => {
  this.jugadoresDisponibles = players;
});
```

---

## 4. Backend: Capa de Servicio y Clean Architecture 🏗️

El backend en Spring Boot se profesionalizó siguiendo principios de **SOLID** y el patrón de **Inyección por Constructor**.

### Especificaciones Técnicas
- **Inyección de Dependencias Segura**: Se eliminó `@Autowired` en favor de inyección por constructor con campos `private final`. Esto garantiza la inmutabilidad de los servicios y facilita las pruebas unitarias (Mocking).
- **Thin Controllers**: Los controladores actúan únicamente como orquestadores de entrada/salida, delegando el 100% de la lógica de negocio a la capa `@Service`.

```java
@Service
@RequiredArgsConstructor // Genera el constructor para inyección final
public class PartidoService {
    private final PartidoRepository partidoRepo;
    private final WhatsAppService whatsAppService;

    @Transactional // Garantiza atomicidad en la base de datos
    public Partido crear(Partido partido) {
        Partido guardado = partidoRepo.save(partido);
        this.notificarPlantilla(guardado); // Disparador de lógica lateral
        return guardado;
    }
}
```

---

## 5. Chat en Tiempo Real: Mensajería Bidireccional con STOMP 💬

Implementación de una infraestructura de mensajería basada en el protocolo STOMP sobre WebSockets para comunicación instantánea y persistencia de estado.

### Arquitectura de Mensajería
- **Interceptor de Handshake**: Validación de tokens JWT en la fase de conexión inicial del socket, impidiendo accesos no autorizados al broker.
- **Doble Cliente STOMP**: Se configuró un cliente para la vista activa del chat y un **Global Listener** que reside en el layout principal para gestionar notificaciones en segundo plano.
- **Sincronización de Sesión (Self-Filtering)**: El servicio ahora rastrea el `currentUserId` para evitar que el emisor reciba alertas o incrementos de badge por sus propios mensajes enviados desde otros dispositivos o pestañas.

```typescript
// Lógica de filtrado de mensajes propios en ChatService
private async manejarMensajeGlobal(msg: MensajeDto): Promise<void> {
    // Si el mensaje es mío, no cuento el badge ni disparo notificación
    if (msg.remitenteId === this.currentUserId) return;

    const usuarioEnChat = this.router.url.includes('/chat');
    if (usuarioEnChat) return;

    this._noLeidosEquipo$.next(this._noLeidosEquipo$.getValue() + 1);
    await this.dispararNotificacion(msg);
}
```

---

## 6. Notificaciones WhatsApp: Integración de Terceros con Twilio 📱

Sistema de alertas automáticas para convocatorias y recordatorios de partidos.

### Soluciones de Ingeniería
- **Manejo de Asincronía (`@Async`)**: El envío de mensajes se realiza en hilos separados para no bloquear el hilo principal de ejecución, permitiendo que la respuesta al cliente sea inmediata independientemente de la latencia de la API de Twilio.
- **Normalización de Números E.164**: Algoritmo de formateo que asegura compatibilidad internacional y los prefijos requeridos por Twilio (`whatsapp:+34...`).

```java
@Async // Ejecución en pool de hilos secundario
public void enviarNotificacionPartido(String telefono, String rival, String fecha) {
    String destino = "whatsapp:" + formatearNumero(telefono);
    Message.creator(
        new PhoneNumber(destino),
        new PhoneNumber(fromNumber),
        "⚽ *DAM United* - Partido confirmado contra " + rival
    ).create();
}
```

---

## 7. Notificaciones Locales y Badges: UX Nativa y Sincronización Offline 🔔

Se mejoró la retención de usuarios mediante la integración de APIs nativas y un sistema de sincronización de estado que resuelve el problema de los mensajes "perdidos" entre sesiones.

### Implementación y Sincronización
- **Push Local con Capacitor**: Uso del plugin `@capacitor/local-notifications` para mostrar alertas cuando el usuario recibe un mensaje y no está dentro de la pantalla de chat.
- **Sincronización Offline (Badge Recovery)**: Al conectar el WebSocket, el sistema realiza automáticamente una petición `GET /chat/no-leidos` al servidor. Esto asegura que el contador del badge refleje la realidad incluso si el usuario ha recibido mensajes mientras la aplicación estaba cerrada.
- **Gestión de Estado de Badges**: Uso de `BehaviorSubject` para sincronizar el contador de mensajes no leídos entre el servicio de chat y el menú lateral de la aplicación en tiempo real.

```typescript
// Sincronización inicial del contador de no leídos al conectar
this.clientGlobal = this.crearClienteStomp(token, () => {
    // 1. Obtener histórico de no leídos del servidor (Mensajes Offline)
    this.obtenerNoLeidos().subscribe(resp => {
        this._noLeidosEquipo$.next(resp.count);
    });

    // 2. Escuchar nuevos mensajes en tiempo real (Mensajes Online)
    const topicEquipo = `/topic/equipo/${equipoId}`;
    this.clientGlobal!.subscribe(topicEquipo, (frame) => {
        const msg = JSON.parse(frame.body);
        this.manejarMensajeGlobal(msg);
    });
});
```

---

## 8. Refactorización Final: Resolución de Deuda Técnica y Seguridad 🧹

Se ha realizado una limpieza profunda del sistema para garantizar estándares de producción, eliminando código muerto, mejorando el tipado y securizando los accesos externos.

### Acciones de Limpieza y Tipado
- **Eliminación de Código Muerto**: Borrado definitivo de `user-state.service.ts` y sus referencias en los barriles (`index.ts`), reduciendo la superficie de mantenimiento.
- **Tipado Estricto en Servicios**: Refactorización de `player.service.ts` para eliminar el uso de `any` y `unknown`, sustituyéndolos por interfaces de dominio como `EquipoResumen` y `PlayerHistory`.
- **Saneamiento de Logs**: Eliminación masiva de `console.log` en el frontend (24 instancias) y `System.out.println` en el backend (3 instancias) para evitar polución de logs en producción.

### Seguridad y CORS
- **Whitelist de Producción**: Se sustituyó el wildcard de seguridad `"*"` por una configuración de CORS restrictiva que solo permite peticiones desde orígenes autorizados.

```java
// Configuración CORS restrictiva en SecurityConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:4200", 
        "http://localhost:8100", 
        "https://tfg-dam-united-web.onrender.com"
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
}
```

---

## 9. Sincronización de Contacto: Gestión Multicapa del Perfil 📱

Se ha implementado un mecanismo de sincronización en caliente para asegurar la integridad de los datos de contacto entre las tablas de identidad (Usuario) y las de rol (Jugador/Entrenador).

### Desafío Técnico
La arquitectura original almacenaba el teléfono en dos lugares independientes. Al actualizar el perfil, solo se modificaba la tabla de rol (`telefonoContacto`), pero el sistema de notificaciones WhatsApp (Twilio) consultaba la tabla `Usuario`, lo que provocaba que las alertas se enviaran a números obsoletos.

### Solución: Sincronización Reactiva de Doble Capa
Se ha inyectado el `AuthService` en los componentes de perfil para realizar un "fix quirúrgico" en el bloque de éxito del guardado.

- **Persistencia Atómica (Best-Effort)**: El sistema primero asegura el guardado del perfil de rol. Si este es exitoso, dispara una petición asíncrona para actualizar la tabla `Usuario`.
- **Validación de Datos**: Se implementó un *guard* explícito para evitar llamadas innecesarias al servidor cuando el campo de teléfono está vacío o no ha cambiado.

```typescript
// Sincronización en profile.page.ts y coach-profile.page.ts
this.playerService.updateProfile(this.editForm).subscribe({
  next: () => {
    // Sincronización con la tabla Usuario (necesaria para Twilio/WhatsApp)
    const userId = this.currentUser?.idUsuario;
    if (userId && this.editForm.telefono) {
      this.authSvc.updateUser(userId, { telefono: this.editForm.telefono })
        .subscribe({
          error: (err) => console.error('Error sincronizando teléfono en Usuario', err)
        });
    }
    this.showSuccessToast('Perfil actualizado correctamente');
  }
});
```

---

## 10. Pulido Estético y UX: Experiencia "Premium Stadium" en Pantallas Secundarias 🎨

Se ha extendido la identidad visual "Night Stadium" a las interfaces de gestión y perfiles, eliminando la discrepancia estética entre las pantallas principales (Dashboard) y las de configuración o administración.

### Desafío Técnico
La aplicación presentaba una "fractura visual": mientras el Dashboard usaba estilos inmersivos, los modales y formularios de perfil mantenían componentes estándar de Ionic. Además, la información de disponibilidad de jugadores carecía de jerarquía visual clara (Badges planos), lo que dificultaba la lectura rápida para el cuerpo técnico.

### Solución e Implementación
- **Estandarización de Modales (Night Modal)**: Se implementó una clase global en `global.scss` que actúa sobre los *shadow parts* de Ionic para inyectar la estética Night Stadium (fondos `#0a0e1a` y bordes violeta neón) de forma consistente en toda la app.
- **Arquitectura de Formularios Compactos**: Reorganización del perfil de usuario mediante contenedores `form-section` y cabeceras semánticas, reduciendo la fatiga visual mediante el ajuste de espaciados verticales (`--margin-bottom`).
- **Estados Dinámicos Reactivos**: Implementación de lógica `[ngClass]` en los badges de rol, vinculando el color y el icono directamente al estado de disponibilidad del jugador mediante un sistema de clases CSS funcionales.

```scss
// Definición global del Night Modal para consistencia visual
.night-modal {
  --background: #0a0e1a;
  --border-radius: 16px;

  &::part(content) {
    background: #0a0e1a;
    border: 1px solid rgba(108, 99, 255, 0.3); // Borde violeta sutil
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6); // Profundidad stadium
  }
}
```

```html
<!-- Implementación de Badges de Estado en Dashboard de Jugadores -->
<div class="role-badge" 
     [ngClass]="{ 'estado-activo': isPlayerAvailable(), 'estado-baja': !isPlayerAvailable() }">
  <ion-icon [name]="isPlayerAvailable() ? 'checkmark-circle' : 'close-circle'"></ion-icon>
  <span>{{ isPlayerAvailable() ? 'DISPONIBLE' : 'BAJA MÉDICA' }}</span>
</div>
```

---

## 11. Sistema de Notificaciones Pro: Centralización y UX de Alertas 🔔

Se ha transformado la gestión de mensajes al usuario mediante la creación de un motor de notificaciones centralizado, eliminando la dependencia directa de componentes de UI en la lógica de negocio y unificando la experiencia visual.

### Desafío Técnico
La aplicación utilizaba `ToastController` de forma dispersa, lo que provocaba inconsistencias en la duración de los mensajes, posiciones aleatorias (top/bottom) y una estética genérica de Ionic que rompía con el tema "Night Stadium". Además, la API nativa de Ionic requiere múltiples líneas de configuración para cada alerta, generando ruido visual en los componentes.

### Solución e Implementación
- **API Fluida (Short-hand methods)**: Se implementó una capa de abstracción en `NotificationService` con métodos semánticos `.success()`, `.error()`, `.warning()` e `.info()`. Esto permite disparar alertas con una sola línea de código, abstrayendo la configuración de tiempos y estilos.
- **Posicionamiento Estratégico**: Se fijó la posición `top` para todas las notificaciones, garantizando visibilidad inmediata sin obstruir los botones de acción principales que suelen ubicarse en la zona inferior (tab bars o fab buttons).
- **Estilización mediante Shadow Parts**: Uso avanzado de `::part(container)` en el CSS global para inyectar bordes laterales de color neón y fondos con opacidad controlada (`0.96`), manteniendo la coherencia con el resto de la interfaz oscura.

```typescript
// Nueva API simplificada en NotificationService
async success(message: string): Promise<void> {
  await this.presentNightToast(message, 2500, 'toast-success');
}

private async presentNightToast(message: string, duration: number, typeClass: string): Promise<void> {
  const toast = await this.toastController.create({
    message,
    duration,
    position: 'top',
    cssClass: ['night-toast', typeClass],
    buttons: [{ icon: 'close-outline', role: 'cancel' }] // Botón de cierre siempre presente
  });
  await toast.present();
}
```

```scss
// CSS Global para la identidad Night Toast
.night-toast {
  --background: rgba(10, 14, 26, 0.96);
  --color: #e2e8f0;
  --border-radius: 12px;

  &::part(container) {
    border-left: 3px solid #6c63ff; // Acento base violeta
  }

  &.toast-success::part(container) { border-left-color: #22c55e; } // Verde Neón
  &.toast-error::part(container)   { border-left-color: #ef4444; } // Rojo Alerta
}
```

---

## 12. Arquitectura de Alertas Globales: Night Alert 🔒

Se ha extendido el sistema de diseño "Night Stadium" a todos los diálogos de confirmación (`AlertController`) de la aplicación, eliminando la discrepancia estética entre las notificaciones rápidas y las decisiones críticas del usuario (Cerrar Sesión, Borrar Eventos, Altas Médicas).

### Desafío Técnico
A diferencia de los Toasts, las alertas de Ionic inyectan su HTML directamente en el `ion-app` fuera del árbol de componentes estándar. Esto provocaba que los diálogos de confirmación mantuvieran un estilo "blanco/gris" nativo que rompía la inmersión del usuario. Además, configurar manualmente cada alerta en múltiples archivos (`player-dashboard`, `calendar`, `admin`) generaba una deuda técnica de mantenimiento alta.

### Solución e Implementación
- **Estilo Inmersivo (Glassmorphism)**: Se diseñó la clase `.night-alert` en el CSS global, utilizando fondos `#0a0e1a` con un borde neón violeta sutil y un sombreado profundo para simular la iluminación de un estadio nocturno.
- **Inyección Automatizada**: Se refactorizó `NotificationService.ts` para que sus métodos de utilidad (`showAlert`, `showConfirm`, `showPrompt`) incluyan automáticamente la clase `night-alert`. Esto garantiza que cualquier nueva alerta creada a través del servicio herede el diseño premium sin esfuerzo adicional.
- **Refactorización de Diálogos Críticos**: Se actualizaron 8 puntos de control clave en la aplicación (incluyendo el cierre de sesión y la gestión de entrenamientos) para adoptar esta nueva identidad visual.

```scss
// Definición de la estética Night Alert en global.scss
.night-alert {
  --background: #0a0e1a;
  --backdrop-filter: blur(12px);

  button {
    color: #6c63ff !important; // Botones con acento violeta
    font-weight: bold;
    text-transform: uppercase;
  }

  .alert-wrapper {
    border: 1px solid rgba(108, 99, 255, 0.3); // Borde neón sutil
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.8);
  }
}
```

```typescript
// Automatización en NotificationService (Inyección de Clase)
async showConfirm(header: string, message: string): Promise<boolean> {
  return new Promise(async (resolve) => {
    const alert = await this.alertController.create({
      header,
      message,
      cssClass: 'night-alert', // Aplicación global automática
      buttons: [
        { text: 'Cancelar', role: 'cancel', handler: () => resolve(false) },
        { text: 'Confirmar', handler: () => resolve(true) }
      ]
    });
    await alert.present();
  });
}
```

---

## 13. Módulo de Reportes y Actas: Ingeniería de Impresión CSS 📄

Se ha implementado un sistema de generación de documentos físicos y digitales (PDF) mediante el uso estratégico de Media Queries, permitiendo que el cuerpo técnico obtenga actas de partidos y fichas de jugadores sin necesidad de librerías externas pesadas.

### Desafío Técnico
Las aplicaciones web modernas con temas oscuros e interfaces densas no son aptas para impresión por defecto; consumen demasiada tinta y muestran elementos de navegación (menús, botones de logout, pestañas) que ensucian el documento final. Además, los gráficos de ApexCharts no suelen renderizarse correctamente en el flujo de impresión estándar.

### Solución e Implementación
- **Motor de Limpieza `@media print`**: Creación de una capa de estilos en `global.scss` que se activa únicamente al imprimir. Esta capa oculta automáticamente más de 10 elementos de la interfaz (menús, spinners, botones de acción) y elimina decoraciones de *glassmorphism* (sombras, filtros de desenfoque).
- **Inversión Cromática Automática**: Forzado de un esquema de color "Papel" (Fondo blanco, texto negro puro) mediante el uso de `!important` en las variables de root. Esto garantiza legibilidad máxima y ahorro de consumibles.
- **Puntos de Entrada Estratégicos**: Integración de botones de impresión con el icono `print-outline` en el Acta de Partido (`match-detail`) y en el Panel del Jugador (`player-dashboard`), disparando la API nativa del navegador de forma reactiva.

```scss
// Lógica de purga de UI para impresión en global.scss
@media print {
  ion-menu-button, ion-tabs, .actions-grid-pro, apx-chart, .sidebar-left {
    display: none !important;
  }

  body, ion-content, .dashboard-bg {
    background: #ffffff !important;
    color: #000000 !important;
  }

  .scoreboard-card, .player-card-dark {
    border: 1px solid #cccccc !important;
    box-shadow: none !important;
  }
}
```

---

## 14. Ingeniería de Impresión y Resolución de Invisibilidad de Actas 📄✅

Se ha perfeccionado el motor de impresión CSS para garantizar que las actas oficiales de los partidos sean 100% fieles a la realidad deportiva, resolviendo problemas críticos de visibilidad de datos y de "limpieza" excesiva del DOM.

### Desafío Técnico: El "Bug de la Tarjeta Invisible"
Los navegadores, por una política de ahorro de tinta, omiten los colores de fondo (`background-color`) en la impresión. Esto provocaba que las tarjetas amarillas y rojas en el acta (`.card-indicator`) aparecieran como recuadros blancos vacíos, perdiendo información vital del partido. Además, un intento previo de optimización ocultó el contenedor raíz (`.main-container`), dejando el PDF totalmente en blanco.

### Solución e Implementación
- **Forzado de Renderizado Cromático**: Implementación de la propiedad de CSS nivel 4 `print-color-adjust: exact` (con su prefijo `-webkit` para compatibilidad con Safari/Chrome). Esto obliga al motor de renderizado a pintar los fondos de las tarjetas con sus colores reglamentarios (`#ffd700` y `#ff0000`).
- **Refactorización de Selectores de Exclusión**: Se ajustó el bloque `@media print` para ser selectivo. Ahora oculta elementos de UI (header, footer, menús, botones) pero mantiene explícitamente el `.main-container` e `ion-content`, asegurando que el flujo de datos del acta sea visible.
- **Unificación de Versiones (Limpieza de Deuda Técnica)**: Se eliminaron tres archivos de estilos obsoletos (`global_print.scss`, `v2` y `v3`), consolidando toda la lógica de impresión en el archivo raíz `global.scss`.

```scss
// Fix maestro para tarjetas y visibilidad en global.scss
@media print {
  // Asegurar que el contenedor principal sea visible
  .main-container, ion-content {
    display: block !important;
    background: white !important;
  }

  // Ingeniería de color para tarjetas deportivas
  .card-indicator {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact; // Forzar color en PDF
    border: 1px solid rgba(0, 0, 0, 0.4) !important;

    &.yellow { background-color: #ffd700 !important; }
    &.red    { background-color: #ff0000 !important; }
  }
}
```

---

> **Estado de la Plataforma**: Arquitectura robusta, escalable y validada bajo estándares profesionales de desarrollo de software.
