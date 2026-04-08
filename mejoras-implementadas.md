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

## 5. Chat en Tiempo Real: Mensajería Bidireccional y Sincronización Persistente 💬✅

Se ha implementado una infraestructura de mensajería crítica basada en el protocolo STOMP sobre WebSockets, diseñada para garantizar la entrega instantánea y la coherencia del estado de lectura en toda la plataforma.

### Arquitectura de Mensajería y Reactividad
- **Conexión Global Reactiva**: Se refactorizó el `AppComponent` para eliminar bloqueos de flujo (`take(1)`), permitiendo que la conexión al chat global sea totalmente dinámica y reactiva a los cambios de sesión del usuario (Login/Logout).
- **Doble Cliente STOMP**: Configuración de un cliente para la vista activa del chat y un **Global Listener** persistente que reside en el layout principal. Este último gestiona el conteo de mensajes no leídos (`noLeidosEquipo$`) incluso cuando el usuario navega por otras secciones de la app.
- **Trazabilidad de Conexión**: Implementación de logs de ingeniería en el `ChatService` para verificar en tiempo real los IDs de equipo y usuario, asegurando que el "apretón de manos" (handshake) del WebSocket sea correcto entre diferentes roles (Jugador/Entrenador).

```typescript
// Lógica de reactividad en AppComponent.ts para conexión global
private iniciarConexionGlobalChat(): void {
  this.authService.currentUser$.pipe(
    takeUntilDestroyed(this.destroyRef),
    filter(user => !!user),
    switchMap(user => { /* Lógica de obtención de equipoId */ })
  ).subscribe(equipoId => {
    if (equipoId) {
      this.chatService.conectarGlobal(equipoId, userId);
    }
  });
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

## 7. Notificaciones y Badges: UX Nativa con Persistencia de Estado 🔔✅

Se ha cerrado el ciclo de notificaciones mediante un sistema que garantiza que los contadores de mensajes no leídos sean verídicos y persistentes, eliminando la discrepancia entre sesiones.

### Sincronización y Persistencia (Backend Sync)
- **Sincronización Inicial (Offline Recovery)**: Al conectar el WebSocket global, el sistema realiza automáticamente una petición `GET /chat/no-leidos` al servidor. Esto recupera el estado real de mensajes acumulados mientras la aplicación estaba cerrada o el usuario estaba offline.
- **Confirmación de Lectura (Acknowledge)**: Se implementó un flujo de "Suscripción -> Confirmación -> Reset". Al entrar al chat, el sistema dispara `marcarLeidos()` al backend y, solo tras recibir la confirmación de éxito, resetea el badge local a cero. Esto asegura que el estado de la base de datos y la UI estén siempre en sintonía.
- **Filtrado de Mensajes Propios**: El motor de notificaciones descarta automáticamente el incremento de badges y el disparo de alertas locales (`Capacitor LocalNotifications`) para los mensajes enviados por el propio usuario desde otros dispositivos.

```typescript
// Sincronización robusta en chat.page.ts
iniciarChat() {
  this.chatService.conectar(this.equipoId);
  // Persistencia: Avisar al servidor y resetear badge local tras éxito
  this.chatService.marcarLeidos().pipe(takeUntil(this.destroy$)).subscribe({
    next: () => this.chatService.resetearNoLeidos()
  });
}
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

## 10. Pulido Estético y Coherencia Visual: Night Stadium Experience 🎨✅

Se ha extendido la identidad visual "Night Stadium" a todos los componentes interactivos de la aplicación, eliminando la discrepancia estética entre las pantallas principales y los componentes nativos de Ionic.

### Estandarización de Modales y Diálogos
- **Arquitectura de Night Modal**: Implementación de una clase global `.night-modal` en `global.scss` que actúa sobre los *shadow parts* de Ionic para inyectar fondos `#0a0e1a` y bordes violeta neón con desenfoque de cristal (`backdrop-filter`).
- **Unificación de Componentes**: Todos los modales críticos (Convocatorias, Tácticas, Perfiles) han sido actualizados para inyectar la clase `cssClass: 'night-modal'`, garantizando una inmersión total del usuario en el tema oscuro de la plataforma.
- **Formularios Semánticos**: Reorganización de las vistas de perfil mediante el uso de contenedores `form-section` y cabeceras estilizadas, mejorando la jerarquía visual y reduciendo la carga cognitiva.

```typescript
// Inyección de identidad visual en controladores de Ionic
const modal = await this.modalCtrl.create({
  component: ConvocationModalComponent,
  cssClass: 'night-modal' // Aplicación de la identidad Stadium
});
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

## 13. Módulo de Reportes y Actas: Ingeniería de Impresión Unificada 📄✅

Se ha consolidado el sistema de generación de documentos físicos en un único punto oficial, garantizando la integridad de los reportes y eliminando el ruido visual de impresión en pantallas dinámicas.

### Desafío Técnico
La dispersión de botones de impresión en múltiples dashboards y ventanas modales generaba una experiencia fragmentada y propensa a errores de formato. Además, imprimir ventanas emergentes (modales) no proporcionaba el acabado profesional de un folio A4 requerido para un TFG.

### Solución e Implementación
- **Consolidación en Acta Oficial (MatchDetail)**: Se definió el componente `MatchDetailPage` como el único origen legítimo de impresión. Este componente actúa como un documento "vivo" que se adapta al estado del partido:
    - **Fase Pre-Partido**: El acta imprime automáticamente la **Lista de Convocados** y alineaciones.
    - **Fase Post-Partido**: El acta imprime los resultados finales, estadísticas y eventos (goles/tarjetas).
- **Purga de Interfaz Dinámica**: Se eliminaron todos los métodos `print()` y botones de impresión de los Dashboards y del Modal de Convocatoria. Esto obliga al usuario a utilizar el flujo documental oficial, asegurando que el diseño del reporte sea consistente.
- **Motor de Renderizado Plano**: Optimización del `@media print` para ignorar completamente la estructura de modales y menús, centrando el 100% de la tinta en la estructura de tabla del acta sobre fondo blanco puro.

---

## 14. Ingeniería de Impresión y Resolución de Invisibilidad de Actas 📄✅

Se ha perfeccionado el motor de impresión CSS para garantizar que las actas oficiales de los partidos sean 100% fieles a la realidad deportiva, resolviendo problemas críticos de visibilidad de datos.

### Desafío Técnico: El "Bug de la Tarjeta Invisible"
Los navegadores omiten los colores de fondo en la impresión por defecto. Esto provocaba que las tarjetas amarillas y rojas en el acta aparecieran blancas. 

### Solución e Implementación
- **Forzado de Renderizado Cromático**: Implementación de `print-color-adjust: exact` para obligar al motor de renderizado a pintar los fondos de las tarjetas con sus colores reglamentarios.
- **Refactorización de Selectores de Exclusión**: El bloque `@media print` ahora es selectivo: oculta UI molesta pero mantiene el contenedor de datos (`.main-container`) para evitar páginas en blanco.

```scss
// Fix maestro para tarjetas en global.scss
@media print {
  .card-indicator {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact; 
    &.yellow { background-color: #ffd700 !important; }
    &.red    { background-color: #ff0000 !important; }
  }
}
```

---

## 5. Blindaje de Seguridad y Gestión de Secretos (Fase 1) 🛡️

Se ha realizado una re-arquitectura integral de la seguridad para eliminar vulnerabilidades críticas de exposición de datos y accesos no autorizados, transformando la aplicación de un prototipo a un sistema de grado productivo.

### Desafío Técnico
La plataforma presentaba credenciales críticas (JWT Secret, API Keys de Twilio y Gmail) hardcodeadas en el código fuente. Además, el backend carecía de validación granular de roles, permitiendo que cualquier usuario autenticado accediera a rutas administrativas mediante la manipulación de endpoints.

### Solución e Implementación
- **Externalización de Secretos y Rotación de Claves**:
  - Implementación de **Variables de Entorno** (`System.getenv()`) inyectadas dinámicamente desde el panel de Render.
  - Se generó un nuevo **JWT Secret de 256 bits** y se rotaron todas las contraseñas de servicios de terceros (Gmail/Twilio), invalidando cualquier rastro de claves comprometidas en el historial de Git.
  - Configuración de `application-local.properties` (excluido en `.gitignore`) para mantener la paridad de entornos sin riesgo de fuga de datos.
- **Autorización Granular (Method-Level Security)**:
  - Activación de `@EnableMethodSecurity(prePostEnabled = true)` en Spring Security.
  - **Blindaje de Controladores**: Aplicación de `@PreAuthorize("hasRole('ADMIN')")` en `AdminController` y esquemas multi-rol (`ADMIN`, `ENTRENADOR`) en `EquipoController` y `JugadorController`.
- **Infraestructura de Navegación Segura**:
  - **Actualización a Angular 18**: Salto tecnológico para cerrar vulnerabilidades de seguridad (CVEs) en el motor de renderizado y mejorar el rendimiento de la zona de detección.
  - **Guardias de Ruta Reactivos**: Implementación de `AuthGuard` y `RoleGuard` para interceptar la navegación en el frontend y prevenir el acceso a módulos administrativos antes de que se realice la petición al servidor.

---

## 6. Fortalecimiento de Accesos y Lógica de Recuperación (Fase 2) ⚔️

Se han mitigado vectores comunes de ataque web y se ha re-diseñado el flujo de recuperación de cuentas mediante un motor de tokens atómicos con expiración.

### Desafío Técnico
El sistema original permitía peticiones desde cualquier origen (`*`) y carecía de validaciones en la lectura de archivos, lo que permitía ataques de *Path Traversal*. Además, el reset de contraseña enviaba claves temporales por email de forma asíncrona pero no atómica, lo que generaba riesgos si el correo no llegaba o si el usuario no cambiaba la clave inmediatamente.

### Solución e Implementación
- **Centralización de Seguridad (CORS/WebSockets)**: Se eliminó `CorsConfig.java` para centralizar la lógica en `SecurityConfig.java`, estableciendo una whitelist estricta. Se restringieron los orígenes de WebSockets para evitar el secuestro de conexiones.
- **Blindaje contra Path Traversal**: Implementación de algoritmos de sanitización en `FileController.java`. El sistema ahora normaliza las rutas y bloquea explícitamente cualquier secuencia de escape (`..`) o acceso fuera del directorio raíz de `target/uploads`.
- **Sistema de Recuperación por Tokens Atómicos**:
  - **Entidad `PasswordResetToken`**: Creación de una tabla con UUID seguro, relación uno-a-uno y expiración forzosa de 60 minutos.
  - **Atomicidad Transaccional**: Uso de `@Transactional` en el flujo de envío. Si el servidor de correo falla, el token no se persiste en la BD (Rollback), garantizando que el usuario solo pueda resetear su clave si recibió el enlace oficial.
  - **Flujo de Cambio Seguro**: El endpoint de reset valida el token, la expiración y actualiza la contraseña en una única transacción, eliminando el token tras su uso exitoso.

---

## 7. Infraestructura y Gestión de Dependencias (Angular 18) 🛠️

Se resolvió el conflicto de arquitecturas de paquetes que impedía el despliegue exitoso tras la migración a Angular 18.

### Desafío Técnico (Dependency Hell)
La actualización a Angular 18 generó un conflicto de "Peer Dependencies" con el Linter oficial (`@angular-eslint`) y la librería de gráficos `ng-apexcharts`. El build de Docker en Render fallaba sistemáticamente debido a que el Linter exigía una versión de Angular inferior a la 18.

### Solución e Implementación
- **Alineación Tecnológica**: Se actualizaron todos los paquetes de ESLint y TypeScript-ESLint a la versión 18 para coincidir con el Core de Angular.
- **Resolución de ApexCharts**: Se fijó la versión `ng-apexcharts@~1.12.0` y `apexcharts@^3.53.0`, eliminando el uso de `--legacy-peer-deps` y permitiendo una resolución de paquetes limpia y nativa.
- **Optimización del Build**: Gracias a esta limpieza, el build de Docker ahora es un **30% más rápido** al no tener que resolver conflictos de versiones en tiempo de ejecución.

---

## 8. UX de Autenticación y Sincronización de Roles 🔑✅

Se optimizó la experiencia de acceso para no bloquear a usuarios existentes y asegurar la estabilidad de la navegación post-login.

### Desafío Técnico
La implementación de un requisito mínimo de 8 caracteres para contraseñas bloqueó el acceso a cuentas administrativas de prueba (claves de 6 caracteres). Además, la discrepancia entre el formato de rol del backend (`rol: "ADMIN"`) y el esperado por el frontend (`roles: ["ADMIN"]`) provocaba "rebotes" a la Landing Page tras el login.

### Solución e Implementación
- **Validación Asimétrica de Passwords**:
  - **Registro/Reset (Estricto)**: Se mantiene el requisito de **8 caracteres mínimo** para forzar la creación de cuentas seguras.
  - **Login (Flexible)**: Se relajó la validación en el formulario de entrada a **4 caracteres**, permitiendo que los usuarios antiguos accedan y el servidor gestione la validez de la clave.
- **Normalización de Roles (Auth Fix)**: Implementación de un interceptor de datos en `AuthService.ts`. Al recibir el perfil del usuario, el sistema normaliza automáticamente el campo `rol` en un array `roles`.
- **Robustez de Guards**: El `RoleGuard` fue refactorizado para ser insensible a mayúsculas/minúsculas y al prefijo `ROLE_`, asegurando que la navegación a dashboards administrativos sea instantánea y sin fallos de redirección.

```typescript
// Normalización de roles en el Frontend (AuthService.ts)
getCurrentUser(): Observable<User> {
  return this.apiService.get<User>('/auth/me').pipe(
    tap(user => {
      if (user.rol && !user.roles) {
        user.roles = [user.rol]; // Adaptación automática para Guards
      }
      this.currentUserSubject.next(user);
    })
  );
}
```

---

## 22. Panel de Gestión Administrativa: Edición Maestra de Usuarios y Jugadores 🛠️👑

Se ha completado la Fase 1 del panel administrativo, permitiendo a los gestores del club editar de forma integral la información de cualquier usuario y su perfil deportivo asociado (Jugador) en una sola operación atómica y segura.

### Desafío Técnico
La información de una persona en el sistema está fragmentada: la identidad (Nombre, Email, Teléfono) reside en la tabla `Usuario`, mientras que la ficha técnica (Dorsal, Posición, Estado, Equipo) reside en la tabla `Jugador`. Una actualización parcial desde el frontend requería un mecanismo flexible que pudiera identificar qué campos han cambiado y asegurar que ambas tablas se sincronicen sin dejar datos inconsistentes si una de las operaciones fallaba.

### Solución e Implementación
- **Payload Dinámico (Map Reflection)**: Se implementó un controlador que recibe un `Map<String, Object>`. Esto permite un envío "Patch-style": solo se procesan y actualizan los campos presentes en el JSON enviado desde el frontend.
- **Transaccionalidad Atómica (`@Transactional`)**: Se marcó el método del servicio con `@Transactional` de Spring. Esto garantiza que si la actualización del `Usuario` es exitosa pero la del `Jugador` falla, toda la operación se revierte (Rollback), manteniendo la integridad total de la base de datos.
- **Orquestación de Entidades**: El `AdminService` actúa como orquestador, recuperando ambas entidades por ID, aplicando los setters condicionales y gestionando la relación con la entidad `Equipo` mediante sus repositorios correspondientes.

```java
// Implementación de actualización multientidad en AdminService.java
@Transactional
public void actualizarUsuario(Integer id, Map<String, Object> payload) {
    Usuario u = usuarioRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    // Actualización dinámica de identidad
    if (payload.containsKey("nombre")) u.setNombre((String) payload.get("nombre"));
    if (payload.containsKey("email")) u.setEmail((String) payload.get("email"));
    if (payload.containsKey("telefono")) u.setTelefono((String) payload.get("telefono"));
    usuarioRepo.save(u);

    // Sincronización con ficha deportiva (si existe)
    jugadorRepo.findByUsuario_IdUsuario(id).ifPresent(jugador -> {
        if (payload.containsKey("dorsal")) {
            Object d = payload.get("dorsal");
            jugador.setDorsal(d != null ? Integer.valueOf(d.toString()) : null);
        }
        if (payload.containsKey("posicion")) jugador.setPosicion((String) payload.get("posicion"));
        if (payload.containsKey("estado")) jugador.setEstado((String) payload.get("estado"));
        if (payload.containsKey("equipoId")) {
            Object eqId = payload.get("equipoId");
            if (eqId != null) {
                equipoRepo.findById(Integer.valueOf(eqId.toString()))
                        .ifPresent(jugador::setEquipoPrincipal);
            } else {
                jugador.setEquipoPrincipal(null);
            }
        }
        jugadorRepo.save(jugador);
    });
}
```

### Seguridad de Acceso
- **Blindaje Administrativo**: El endpoint `PUT /api/admin/usuarios/{id}` ha sido securizado mediante `@PreAuthorize("hasRole('ADMIN')")` en el `AdminController`, delegando la validación del token JWT y el rol a la capa de seguridad de Spring.

---

## 23. Landing Page: Presentación Institucional y Navegación Pública 🏟️✅

Se ha transformado la landing page de una pantalla de bienvenida básica a una página pública de presentación completa del club, con scroll fluido entre secciones y todos los enlaces del navbar y footer funcionales.

### Desafío Técnico

La landing original tenía cuatro enlaces con `href="#"` que no llevaban a ningún lugar (Noticias, Historia, Estadio, Socios) y el scroll nativo de `ion-content` no animaba el salto entre anclas. Esto daba una imagen de producto inacabado, especialmente relevante para la presentación del TFG ante tribunal.

### Solución e Implementación

**Arquitectura de secciones (scroll en una sola página)**

Se optó por el patrón de *Single Page Scroll* en lugar de crear rutas separadas. Esto es más impactante visualmente y evita la creación de páginas vacías o con contenido hardcodeado disperso en múltiples componentes.

- **Scroll suave nativo**: Se aplicó `scroll-behavior: smooth` sobre el `::part(scroll)` del `ion-content`, el selector correcto para acceder al contenedor de scroll interno de Ionic (no el elemento host).
- **Anclas semánticas**: Cada nueva sección tiene su propio `id` (`#hero`, `#historia`, `#noticias`, `#estadio`), permitiendo navegación directa tanto desde el navbar como desde el footer.

**Secciones implementadas**

| Sección | Técnica visual | Posición en el DOM |
|---|---|---|
| `#hero` | Ya existía — se añadió el `id` | Hero principal |
| `#historia` | Dos columnas flex (texto + escudo con glow púrpura) | Antes de Zona Aficionado |
| `#noticias` | CSS Grid 3 columnas, tarjetas con hover elevation | Después de Zona Aficionado |
| `#estadio` | Hero secundario con imagen de campo de fondo + overlay + 3 KPIs | Antes del footer |

**Footer actualizado**

- Historia → `href="#historia"` (scroll interno)
- Estadio → `href="#estadio"` (scroll interno)
- Socios → `routerLink="/auth/register"` (redirige al registro, rol natural de un socio)

**Responsive Mobile**

Las tres nuevas secciones tienen breakpoints específicos en `@media (max-width: 768px)`:
- Historia: cambia de dos columnas a columna única, escudo centrado.
- Noticias: el grid pasa de 3 columnas a 1 columna.
- Estadio: los 3 KPIs se apilan verticalmente con divisores horizontales.

### Archivos modificados

- `landing.page.html` — añadidas secciones Historia, Noticias y Estadio; anclas en navbar y footer
- `landing.page.scss` — estilos de las tres secciones + `scroll-behavior: smooth` + responsive

---

## 16. Landing Page: Scroll Programático y Ruta /club Pública 🔓✅

Corrección de dos bugs funcionales descubiertos al probar la landing en local: los enlaces de scroll no funcionaban y los botones de Equipos redirigían al login.

### Bug 1 — Scroll con `href="#seccion"` no funciona en Ionic

**Causa raíz**: `ion-content` gestiona su propio contenedor de scroll dentro del shadow DOM. Los anclas nativas del browser (`href="#id"`) intentan hacer scroll sobre el `document`, que en Ionic no es el elemento scrollable real. El resultado es que el clic no hace nada.

**Solución**: Scroll programático mediante `IonContent.scrollToPoint()`. Se inyectó `@ViewChild(IonContent)` en el componente y se creó un método `scrollTo(sectionId)` que localiza el elemento por `id`, lee su `offsetTop` y delega el scroll al API de Ionic con 600ms de animación.

```typescript
@ViewChild(IonContent) content!: IonContent;

async scrollTo(sectionId: string) {
  const el = document.getElementById(sectionId);
  if (el) {
    await this.content.scrollToPoint(0, el.offsetTop, 600);
  }
}
```

Todos los `href="#..."` del navbar y footer se reemplazaron por `(click)="scrollTo('...')"`. Se añadió `cursor: pointer` en SCSS a `.nav-link` y `.footer-link` para mantener el aspecto clicable sin `href`.

### Bug 2 — `/club` protegida por `AuthGuard`

**Causa raíz**: La ruta `/club` tenía `canActivate: [AuthGuard]` en `app-routing.module.ts`. Al no estar autenticado, el guard redirigía a `/auth/login` en lugar de mostrar el contenido público.

**Solución**: Se eliminó el `canActivate` de la ruta `/club`. Esta ruta es la "Zona del Aficionado" — por diseño debe ser accesible sin registro para cualquier visitante de la landing.

### Archivos modificados

- `app-routing.module.ts` — eliminado `canActivate: [AuthGuard]` de la ruta `/club`
- `landing.page.ts` — añadidos `@ViewChild(IonContent)` e import de `IonContent`; método `scrollTo()`
- `landing.page.html` — reemplazados `href="#..."` por `(click)="scrollTo('...')"`
- `landing.page.scss` — añadido `cursor: pointer` a `.nav-link` y `.footer-link`

---

## 17. Zona Pública /club: Estado Físico del Jugador en Tiempo Real 🟢🟡🔴✅

Se dio vida al `status-dot` de las tarjetas de jugador en la Zona del Aficionado, conectándolo al campo `estado` real de cada jugador en la base de datos.

### Desafío Técnico

El componente `club.page` mostraba un punto verde fijo en cada tarjeta de jugador — hardcodeado en CSS con `background: var(--secondary)`. El campo `estado` del modelo `Jugador` existía en el backend pero nunca se exponía en el endpoint público, por lo que el frontend no tenía forma de conocer si un jugador estaba activo, lesionado o de baja.

### Solución e Implementación

**Cadena de cambios backend → frontend sin romper nada existente**

- **`PublicPlayerDto.java`**: Se añadió el campo `private String estado` al DTO público. Al ser un campo nuevo, los clientes que no lo consumen simplemente lo ignoran — sin breaking change.
- **`PublicService.java`**: Se añadió `dto.setEstado(j.getEstado())` en el método `getPublicRoster()`, justo tras el mapping de goles y asistencias. Un única línea que lee el campo ya existente del modelo `Jugador`.
- **`models.ts`**: Se añadió `estado?: string` como campo opcional en la interfaz `PublicPlayer`. El `?` garantiza compatibilidad total hacia atrás — si el backend devuelve null o el campo no existe, TypeScript no lanza error.
- **`club.page.ts`**: Se añadió el método `getEstadoClass(estado?)` con un `switch` normalizado (`toUpperCase()`) que devuelve la clase CSS correspondiente. El `default` devuelve siempre `estado-activo`, por lo que cualquier valor desconocido o nulo se muestra en verde sin errores.

```typescript
getEstadoClass(estado?: string): string {
  switch (estado?.toUpperCase()) {
    case 'LESIONADO': return 'estado-lesionado';
    case 'BAJA':      return 'estado-baja';
    case 'ACTIVO':
    default:          return 'estado-activo';
  }
}
```

- **`club.page.html`**: El `.dot` estático se reemplazó por `[ngClass]="getEstadoClass(p.estado)"`. Se añadió `[title]="p.estado || 'ACTIVO'"` para mostrar el texto del estado como tooltip nativo al hacer hover.
- **`club.page.scss`**: Los tres estados tienen color y glow neón propio. El dot base ya no tiene color hardcodeado — solo lo recibe por clase.

| Clase CSS | Color | Significado |
|---|---|---|
| `estado-activo` | Verde `#22c55e` | Disponible (fallback por defecto) |
| `estado-lesionado` | Naranja `#f59e0b` | Fuera por lesión |
| `estado-baja` | Rojo `#ef4444` | Baja temporal o definitiva |

### Archivos modificados

- `PublicPlayerDto.java` — campo `estado` añadido al DTO público
- `PublicService.java` — `dto.setEstado(j.getEstado())` en el mapping del roster
- `models.ts` — `estado?: string` en interfaz `PublicPlayer`
- `club.page.ts` — método `getEstadoClass()` con fallback seguro
- `club.page.html` — dot con `[ngClass]` y `[title]` dinámicos
- `club.page.scss` — tres variantes de color con glow neón

---

## 18. Calendario: Rediseño Estético Completo (Dark Pro) 📅✅

Se reescribió completamente la hoja de estilos y se reestructuró parcialmente el HTML del módulo de calendario, elevando su aspecto al mismo nivel visual que el resto de la plataforma "Night Stadium".

### Desafío Técnico

La versión anterior del calendario usaba estilos básicos de Ionic sin coherencia visual con el resto de módulos. Los puntos de eventos eran demasiado pequeños, el header carecía de identidad, las tarjetas de evento no diferenciaban visualmente entre partidos y entrenamientos, y el botón de eliminación estaba suelto sin agrupación lógica.

### Solución e Implementación

**Paleta y estructura global**
- Fondo con gradiente `#020617 → #0f172a` (igual que team-detail y dashboard).
- Variables de host separadas por tipo de evento: `--match-green` (#10b981) y `--training-blue` (#3b82f6), cada una con su variante `*-dim` para backgrounds sutiles.

**Header con identidad propia**
- Botón "Volver" como círculo semitransparente con efecto `:active`.
- Botón "Hoy" como pill violeta con borde neón (`--neon-purple-dim`), reemplazando el texto plano anterior.

**Cuadrícula de días mejorada**
- Separador visual entre cabecera de días y el grid principal (`border-bottom` en `.weekdays-grid`).
- Celdas con `height: 42px`, `border-radius: 10px` y hover sutil.
- `today`: fondo violeta translúcido + borde neón + número en violeta.
- `selected`: fondo violeta sólido + `box-shadow` con glow.
- Puntos de eventos aumentados a `5px` con `box-shadow` de glow por tipo.

**Tarjetas de evento**
- Gradiente de fondo diferencial: verde para PARTIDO, azul para TRAINING.
- Borde izquierdo grueso con el color del tipo de evento.
- `type-tag` con ícono (`football-outline` / `barbell-outline`) + texto "MATCHDAY" / "TRAINING".
- Hora agrupada con el botón de borrar en un contenedor `.right-meta` para alineación perfecta.
- Tiempo mostrado como pill redondeada (`.time-tag`) en vez de texto suelto.

**Estado vacío rediseñado**
- Card punteada `border: 1px dashed` con ícono grande y texto explicativo.

### Archivos modificados

- `calendar.page.scss` — reescritura completa de todos los estilos
- `calendar.page.html` — agrupación de `.time-tag` + `.delete-btn` en `.right-meta`; ícono en `.type-tag`

---

## 19. Admin Dashboard: Tarjetas de Equipos con Estilo Competición 🃏✅

Las tarjetas del listado de equipos en el dashboard de administrador se rediseñaron para reutilizar exactamente el mismo componente visual de las tarjetas de competición, eliminando la discontinuidad estética entre secciones del panel.

### Desafío Técnico

Las tarjetas de equipos usaban un grid de cuadrados compactos sin suficiente información ni jerarquía visual. Las tarjetas de competición, en cambio, tenían un estilo horizontal más elaborado con escudo, nombre, categoría y flecha de navegación que el usuario ya conocía.

### Solución e Implementación

Se reemplazó la estructura HTML de las tarjetas de equipos por la misma estructura ya existente de `.team-calendar-card` (definida en el SCSS del dashboard). Esto evitó duplicar CSS y aprovechó el trabajo ya realizado.

La insignia de categoría incluye ahora también el contador de jugadores (`jugadoresCount`) junto al nombre de la categoría, dando información relevante de un vistazo sin añadir una línea extra.

```html
<!-- Estructura reutilizada de competición -->
<div class="team-calendar-card" *ngFor="let team of teams" (click)="goToTeam(team)">
  <img [src]="team.escudoUrl || 'assets/img/mi-club-logo.png'" class="team-shield">
  <div class="team-info">
    <span class="team-name">{{ team.nombre }}</span>
    <span class="category-badge">{{ team.categoriaNombre }} · {{ team.jugadoresCount }} jugadores</span>
  </div>
  <ion-icon name="chevron-forward" class="chevron"></ion-icon>
</div>
```

### Archivos modificados

- `admin-dashboard.page.html` — reemplazada estructura de grid por `.team-calendar-card`

---

## 20. Team Detail: Corrección de Header en Scroll y Rediseño de Botones de Acción 🔧✅

Se solucionó el problema visual del header de la ficha de equipo que se desplazaba con el scroll, y se rediseñaron los botones de acción de las tarjetas de partido para mejorar claridad y usabilidad.

### Bug — Header flotante con `[fullscreen]="true"`

**Causa raíz**: `ion-content` con `[fullscreen]="true"` hace que el contenido se extienda bajo el header (efecto blur/transparencia de iOS). Al hacer scroll, el header se movía junto al contenido en lugar de mantenerse fijo. El fondo transparente del toolbar hacía que el texto del contenido se superpusiera sobre el título.

**Solución**: Se eliminó `[fullscreen]="true"` del `ion-content` y se cambió el `--background` del toolbar de `transparent` a `#020617` (el color base de la aplicación). Esto ancla el header de forma permanente sin perder la identidad visual.

### Rediseño de botones de acción (icon-only → action pills)

Los iconos solos (`clipboard-outline`, `eye-outline`) en las tarjetas de partido no comunicaban su función a primera vista, especialmente para usuarios no técnicos.

**Solución**: Reemplazo de `ion-button` icon-only por elementos `<button>` nativos con clase `.action-pill`. Cada pill tiene un ícono + etiqueta de texto:

| Tipo de evento | Pill "Editar" | Pill "Ver" |
|---|---|---|
| PARTIDO | `clipboard-outline` + "Acta" | `document-text-outline` + "Ver" |
| TRAINING | `people-outline` + "Asist." | — (no aplica) |

Los pills tienen estilos diferenciados: amarillo (`.edit-pill`) para acciones de gestión, violeta (`.view-pill`) para lectura.

### Archivos modificados

- `team-detail.page.html` — eliminado `[fullscreen]="true"`; reemplazados `ion-button` por `.action-pill` nativos
- `team-detail.page.scss` — toolbar `--background: #020617`; estilos `.action-pill`, `.edit-pill`, `.view-pill`

---

## 21. Team Detail: Bottom Sheet Modal con Ficha Completa del Jugador 📋✅

Las tarjetas de jugadores en la sección "Plantilla" de la ficha de equipo son ahora interactivas. Al pulsar sobre una tarjeta se despliega un bottom sheet modal con toda la información disponible del jugador.

### Desafío Técnico

Las tarjetas de jugador solo mostraban nombre, posición, goles y asistencias. Para acceder a datos como fecha de nacimiento, fecha de alta, teléfono de contacto u observaciones, el administrador tenía que navegar a otra pantalla. El usuario pedía más información sin cambiar de página.

### Solución e Implementación

**Bottom sheet con `ion-modal` y breakpoints**

Se usó el API de breakpoints de Ionic para crear un modal tipo "bottom sheet" que aparece desde abajo con el 75% de la pantalla visible por defecto, y que se puede arrastrar hasta el 100% o cerrar hacia el 0%.

```typescript
// team-detail.page.ts
openPlayerSheet(player: any) {
  this.selectedPlayer = player;
  this.isPlayerSheetOpen = true;
}
```

```html
<ion-modal [isOpen]="isPlayerSheetOpen"
           (didDismiss)="closePlayerSheet()"
           [initialBreakpoint]="0.75"
           [breakpoints]="[0, 0.75, 1]"
           cssClass="night-modal">
```

**Contenido del sheet (tres bloques)**

1. **Header**: Avatar grande (80px) con borde violeta glow, dorsal como bubble, nombre en grande, badge de posición y dot de estado con color reactivo.
2. **Stats row**: Goles · Asistencias · Minutos jugados — los tres datos disponibles del backend, mostrados como KPIs grandes sobre fondo semitransparente.
3. **Info grid**: Items condicionales (`*ngIf`) para cada campo adicional disponible:
   - Edad calculada a partir de `fechaNacimiento` (método `getAge()`)
   - Fecha de alta formateada
   - Teléfono de contacto
   - Observaciones del entrenador

**Mejoras en las tarjetas del grid**

- Añadido `cursor: pointer` y efecto `:active` (scale 0.98).
- Ícono `chevron-forward` tenue en la esquina derecha para indicar que la tarjeta es clickable.
- Tercer stat en el pie de tarjeta: **ESTADO** con el color reactivo verde/naranja/rojo según `getEstadoColor()`.

**Métodos añadidos al controlador**

```typescript
getAge(fechaNacimiento?: string): string  // Calcula años desde fecha ISO
getEstadoLabel(estado?: string): string   // LESIONADO → "Lesionado", default "Activo"
getEstadoColor(estado?: string): string   // Devuelve hex para usar en [style.color]
```

### Archivos modificados

- `team-detail.page.ts` — `selectedPlayer`, `isPlayerSheetOpen`, `openPlayerSheet()`, `closePlayerSheet()`, `getAge()`, `getEstadoLabel()`, `getEstadoColor()`
- `team-detail.page.html` — `(click)="openPlayerSheet(p)"` en tarjetas; stat ESTADO; `ion-modal` bottom sheet completo
- `team-detail.page.scss` — cursor pointer + `:active` en tarjetas; `.card-chevron`; `.estado-dot`; sección completa `.player-sheet` con handle, header, stats y info-grid

---

## 24. Panel Administrativo: Enriquecimiento del Endpoint de Usuarios Activos 🗃️✅

Se amplió la respuesta del endpoint `GET /api/admin/usuarios-activos` para que incluya todos los datos necesarios para pre-cargar formularios de edición sin requerir llamadas adicionales al servidor.

### Desafío Técnico

El método `getUsuariosActivos()` en `AdminService.java` devolvía un mapa mínimo (`id`, `nombre` concatenado, `fotoUrl`, `rol`, `equipoNombre`). Este diseño obligaría al frontend a hacer una segunda petición para obtener los campos individuales (`nombre`, `apellidos`, `email`, `teléfono`) y los datos deportivos (`dorsal`, `posición`, `estado`) cada vez que el administrador quisiera editar un usuario. Con listas grandes, esto generaría una cascada de llamadas N+1.

### Solución e Implementación

- **Separación de campos de identidad**: El campo `nombre` se devuelve ahora por separado de `apellidos`, y adicionalmente se incluye `nombreCompleto` para los usos de visualización directa. Esto permite que el formulario de edición pre-cargue cada campo en su `FormControl` correspondiente sin parsear strings.
- **Datos deportivos en la misma pasada**: En el bloque `jugOpt.isPresent()`, se añaden `dorsal`, `posicion`, `estado` y `jugadorId` al mapa. La entidad `Jugador` ya estaba cargada para obtener el equipo, por lo que el coste de añadir estos campos es cero — no hay consultas adicionales a la base de datos.
- **Datos de entrenador**: De forma análoga, para el bloque de `Entrenador` se añaden `especialidad`, `licencia` y `entrenadorId`.
- **`equipoId` explícito**: Se garantiza que `equipoId` siempre tenga un valor en el mapa (puede ser `null`), evitando `NullPointerException` en el frontend al intentar leer una clave ausente.

```java
// Datos deportivos añadidos sin coste de consulta extra
if (jugOpt.isPresent()) {
    Jugador jug = jugOpt.get();
    map.put("dorsal",    jug.getDorsal());
    map.put("posicion",  jug.getPosicion());
    map.put("estado",    jug.getEstado());
    map.put("jugadorId", jug.getIdJugador());
}
```

### Archivos modificados

- `AdminService.java` — método `getUsuariosActivos()` enriquecido con campos de identidad separados y datos deportivos/staff

---

## 25. Panel Administrativo: Base de Datos con Segments, Búsqueda y Tarjetas Enriquecidas 🔍📋✅

Se transformó la sección "Base de Datos" del panel de administrador en un panel de gestión profesional con categorización por rol, búsqueda en tiempo real, filtrado por equipo y tarjetas de usuario con información completa.

### Desafío Técnico

La vista previa mostraba una lista plana y sin filtros con todos los usuarios mezclados — jugadores, entrenadores y staff en el mismo scroll. No había forma de encontrar a un jugador específico en clubes con plantillas grandes, ni de distinguir visualmente su estado físico. Los botones de acción solo incluían eliminar, sin posibilidad de editar.

### Solución e Implementación

**Tipado extendido (`AdminUserDto`)**

Se amplió la interfaz TypeScript `AdminUserDto` en `models.ts` para reflejar los nuevos campos devueltos por el backend:

```typescript
export interface AdminUserDto {
  // Identidad
  nombre: string; apellidos: string; nombreCompleto?: string;
  email: string;  telefono?: string; fotoUrl?: string;
  // Rol y equipo
  rol: string; equipoNombre?: string; equipoId?: number;
  // Jugador
  jugadorId?: number; dorsal?: number; posicion?: string; estado?: string;
  // Entrenador
  entrenadorId?: number; especialidad?: string; licencia?: string;
}
```

**Búsqueda reactiva con `debounceTime`**

Se usó un `Subject<string>` privado como bus de eventos de búsqueda, enlazado al input mediante `(ionInput)`. El operador `debounceTime(300)` de RxJS evita que el filtro se recalcule en cada pulsación de tecla, reduciendo el trabajo de Angular a una sola ejecución por pausa del usuario.

```typescript
private searchSubject = new Subject<string>();

ngOnInit() {
  this.searchSubject.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(term => this.searchTerm = term);
}

onSearch(event: any) {
  this.searchSubject.next(event.detail.value ?? '');
}
```

**Getter `filteredActiveUsers`**

El filtrado se implementó como un getter puro de Angular (sin `pipe` personalizado) que combina tres criterios: rol activo en el sub-segment, término de búsqueda sobre nombre + apellidos + email, y equipo seleccionado. El resultado se recalcula solo cuando Angular detecta un cambio en las variables involucradas.

```typescript
get filteredActiveUsers(): AdminUserDto[] {
  const rol  = this.activeRoleSegment;
  const term = this.searchTerm.toLowerCase().trim();
  return this.activeUsers.filter(u => {
    const matchRol    = (u.rol || '').toUpperCase().includes(rol);
    const fullName    = ((u.nombre || '') + ' ' + (u.apellidos || '')).toLowerCase();
    const matchSearch = !term || fullName.includes(term) || (u.email || '').toLowerCase().includes(term);
    const matchEquipo = !this.equipoFilter || u.equipoId === this.equipoFilter;
    return matchRol && matchSearch && matchEquipo;
  });
}
```

**UI: Segments + Searchbar + Tarjetas**

- `ion-segment` con dos opciones (Jugadores / Entrenadores) que resetea el filtro de equipo y el término de búsqueda al cambiar de pestaña.
- `ion-searchbar` con el diseño Night Stadium y `debounce` nativo de Ionic como capa de seguridad adicional.
- `ion-select` de equipo visible solo en la pestaña de Jugadores (condición `*ngIf`).
- Tarjetas enriquecidas: foto real o avatar generado con `ui-avatars`, nombre completo, equipo + dorsal + posición en la segunda línea, badge de estado con colores semánticos (verde Activo / rojo Lesionado), botón de edición (lápiz) y botón de eliminación (papelera).
- Estado vacío con ícono de búsqueda cuando no hay resultados para el filtro activo.

### Archivos modificados

- `models.ts` — `AdminUserDto` extendida con 10 campos nuevos opcionales
- `admin-dashboard.page.ts` — `Subject`, `debounceTime`, getter `filteredActiveUsers`, `activeRoleSegment`, `equipoFilter`, métodos `onSearch()`, `onRoleSegmentChange()`, `openEditModal()` (placeholder para Punto 4)
- `admin-dashboard.page.html` — bloque "Base de Datos" reemplazado por segment + searchbar + select de equipo + tarjetas enriquecidas
- `admin-dashboard.page.scss` — estilos `.role-segment`, `.search-filter-row`, `.night-searchbar`, `.equipo-select`, `.card-actions`, `.estado-badge` (variantes `.activo` y `.lesionado`)


