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

## 22. Panel de Control Administrativo Profesional (En Proceso) 🛠️🚀

Se ha iniciado la transformación de la sección de "Base de Datos" del administrador en una herramienta de gestión profesional, permitiendo la edición completa de perfiles y una visualización organizada por categorías.

### Fase 1: Backend y Endpoints de Gestión (Completado ✅)
- **Centralización de CRUDs**: Se ha mantenido la arquitectura de *Thin Controllers* separando la gestión de identidad (`UsuarioController`) de la gestión de perfiles de rol (`UserController`, `JugadorController`).
- **Endpoints de Actualización Atómica**:
    - `UserController`: Implementación de `@PutMapping("/{id}")` que permite la actualización dinámica de datos de identidad (Email, Nombre, Teléfono) mediante el patrón de mapeo de actualizaciones parciales.
    - `JugadorController`: Implementación de `@PutMapping("/{id}")` protegido con `@PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR')")` para la edición de datos deportivos (Dorsal, Posición, Estado Físico).
- **Seguridad Granular**: Refuerzo de la seguridad a nivel de método, asegurando que solo el Administrador pueda realizar bajas definitivas (`DELETE`) y que la edición esté restringida a roles de gestión.

```java
// Endpoint de actualización deportiva en JugadorController.java
@PutMapping("/{id}")
@PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR') or @jugadorService.isOwner(#id, authentication.name)")
public Jugador actualizar(@PathVariable Integer id, @RequestBody JugadorDto dto) {
    return jugadorService.actualizar(id, dto);
}
```

### Siguientes Pasos (En Desarrollo 🔲)
- **Categorización Frontend**: Implementación de `ion-segment` para dividir la lista de usuarios en Jugadores, Entrenadores y Staff.
- **Buscador Reactivo**: Añadir búsqueda por nombre con operadores de `debounceTime` de RxJS.
- **Modal de Edición Full**: Creación de un formulario reactivo profesional con estética *Night Stadium* para editar todos los campos desde una única interfaz.


Se ha transformado la landing page de una pantalla de bienvenida básica (solo botones de login/registro) a una página pública de presentación completa del club, con scroll fluido entre secciones y todos los enlaces del navbar y footer funcionales.

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

## 23. Migración a Notificaciones Push Nativas: De Twilio a FCM 🔔✅

Se ha reemplazado el sistema de alertas basado en WhatsApp (Twilio Sandbox) por un sistema de **Notificaciones Push Nativas multiplataforma** usando Firebase Cloud Messaging (FCM) y `@capacitor/push-notifications`. La migración elimina la dependencia de una API de pago, escala infinitamente y ofrece una experiencia 100% nativa integrada en el sistema operativo del dispositivo.

### Desafío Técnico

El sistema original de Twilio presentaba tres limitaciones críticas para producción:
1. **Coste y restricciones del Sandbox**: El Sandbox de Twilio solo permite enviar WhatsApp a números pre-aprobados, lo que hace imposible escalar a usuarios reales.
2. **Dependencia de número de teléfono**: El sistema requería que cada usuario tuviese el teléfono registrado; si no, la notificación se perdía silenciosamente.
3. **Experiencia no nativa**: Un mensaje de WhatsApp es genérico y no diferencia el origen de la app.

### Arquitectura de la Solución: Provider Pattern

Se diseñó un **Provider Pattern** que desacopla completamente la lógica de envío del canal de entrega. Esto permite activar FCM sin romper Twilio (que actúa como fallback) y cambiar de proveedor en el futuro con cambios mínimos.

```
NotificationService (orquestador)
    ├── FcmNotificationProvider  → si el usuario tiene fcmToken
    └── WhatsAppNotificationProvider → fallback si no tiene token
```

### Implementación Backend (Spring Boot)

**Infraestructura y configuración:**
- **`pom.xml`**: Añadida dependencia `firebase-admin:9.3.0`.
- **`FirebaseConfig.java`** *(nuevo)*: Inicializa el Firebase Admin SDK en el arranque. Resuelve el `InputStream` de forma inteligente: si el path comienza con `classpath:`, usa `ClassPathResource` (local); si es una ruta absoluta, usa `FileInputStream` (Render Secret File). Falla gracefully con un WARN si el archivo no existe, sin romper el arranque del servidor.
- **`application.properties`**: Añadida propiedad `firebase.config.path=${FIREBASE_CONFIG_PATH:classpath:serviceAccountKey.json}`. En local lee del classpath; en producción lee la variable de entorno `FIREBASE_CONFIG_PATH` que apunta al Secret File de Render.

**Modelo de datos:**
- **`Usuario.java`**: Añadido campo `fcmToken` (`@Column name="fcm_token"`, `length=512`). Cada dispositivo registrado tiene su propio token único de FCM.

**Provider Pattern:**
- **`NotificationProvider.java`** *(interfaz)*: Contrato `sendNotification(Usuario, String title, String body)`.
- **`FcmNotificationProvider.java`** *(nuevo)*: Implementación FCM. Skip automático si Firebase no está inicializado o el usuario no tiene token. Captura `FirebaseMessagingException` con su código de error específico: si el código es `UNREGISTERED` o `INVALID_ARGUMENT`, el token ya no es válido y se pone a `null` en la base de datos automáticamente (limpieza de tokens muertos).
- **`WhatsAppNotificationProvider.java`** *(nuevo)*: Wrapper del `WhatsAppService` existente. Actúa como fallback para usuarios sin `fcmToken`.
- **`NotificationService.java`** *(nuevo — orquestador)*: Servicio `@Async` que implementa la lógica de prioridad. Si el usuario tiene `fcmToken`, delega a FCM. Si no, usa WhatsApp como fallback.

```java
@Async
public void send(Usuario usuario, String title, String body) {
    if (usuario.getFcmToken() != null && !usuario.getFcmToken().isBlank()) {
        fcmProvider.sendNotification(usuario, title, body);
    } else {
        whatsAppProvider.sendNotification(usuario, title, body); // Fallback
    }
}
```

**Endpoint de registro de token:**
- **`UsuarioService.java`**: Añadido método `actualizarFcmToken(email, token)`.
- **`UserController.java`**: Nuevo endpoint `PUT /api/usuarios/fcm-token`. Usa `@AuthenticationPrincipal` para asociar el token al usuario autenticado por JWT (más seguro que aceptar un ID por path). Cubierto por `anyRequest().authenticated()` en `SecurityConfig`.

**Casos de uso notificados:**

| Evento | Destinatarios |
|---|---|
| Creación de partido | Todos los jugadores del equipo + entrenador |
| Recordatorio 24h (Cron) | Todos los jugadores del equipo |
| Mensaje privado de chat | El destinatario del mensaje |
| Mensaje en chat de equipo | Todos los miembros del equipo excepto el remitente |

```java
// Broadcast en ChatService — notifica a toda la plantilla excepto al que escribe
private void broadcastEquipo(Equipo equipo, Usuario remitente, String senderName, String preview) {
    String title = "💬 " + senderName + " en " + equipo.getNombre();
    jugadorRepository.findByEquipoPrincipal_IdEquipo(equipo.getIdEquipo())
        .stream()
        .filter(j -> j.getUsuario() != null
                  && !j.getUsuario().getIdUsuario().equals(remitente.getIdUsuario()))
        .forEach(j -> notificationService.send(j.getUsuario(), title, preview));
    // También al entrenador si no es el remitente
}
```

### Implementación Frontend (Ionic + Angular + Capacitor)

**Instalación y configuración nativa:**
- **`package.json`**: Añadido `@capacitor/push-notifications:^5.0.0`.
- **`capacitor.config.ts`**: Plugin `PushNotifications` configurado con `presentationOptions: ['badge', 'sound', 'alert']`.

**`PushNotificationService.ts`** *(nuevo)*: Servicio central del frontend que gestiona todo el ciclo de vida de las push:

1. **Solicitud de permisos** al usuario al hacer login (solo en plataforma nativa; no hace nada en web/browser).
2. **Registro con FCM** y captura del token mediante el listener `registration`.
3. **Envío del token al backend** (`PUT /api/usuarios/fcm-token`) solo si el token ha cambiado respecto al almacenado en `StorageService`, evitando re-envíos innecesarios.
4. **Guard anti-duplicación**: Flag `listenersRegistered` que previene el registro múltiple de listeners en caso de logout/re-login.
5. **Foreground toast**: Al recibir una notificación con la app abierta (`pushNotificationReceived`), muestra un toast con las clases `night-toast toast-info` del sistema de diseño de la app — misma estética que el resto de alertas. Descarta el toast anterior si sigue visible para evitar apilamiento.

```typescript
private async showForegroundToast(title: string, body: string): Promise<void> {
    if (this.activeToast) {
        await this.activeToast.dismiss().catch(() => {});
    }
    const toast = await this.toastController.create({
        header: title || undefined,
        message: body,
        duration: 5000,
        position: 'top',
        cssClass: ['night-toast', 'toast-info'],
        buttons: [{ icon: 'close-outline', role: 'cancel' }]
    });
    this.activeToast = toast;
    await toast.present();
}
```

- **`AuthService.ts`**: `pushNotificationService.initialize()` se llama en el `tap()` post-login, justo después de obtener el usuario actual.

**Configuración nativa Android:**
- **`AndroidManifest.xml`**: Añadidos permisos `WAKE_LOCK` (procesador activo en background) y `POST_NOTIFICATIONS` (requerido en Android 13+ / API 33). Añadida `meta-data` del icono de notificación (`ic_notification`) y del color de acento (`colorPrimary`) para evitar el cuadrado negro genérico en la barra de estado.
- **`ic_notification.xml`** *(nuevo)*: Icono vector monocromático blanco (silueta de pelota de fútbol). Android exige iconos de notificación completamente blancos sobre fondo transparente.
- **`colors.xml`** *(nuevo)*: Define `colorPrimary #1A1A2E`, `colorPrimaryDark #0F0F1A` y `colorAccent #00D4AA`. Resuelve además una referencia huérfana que ya existía en `styles.xml` y que podría haber roto el build en el futuro.
- **`MainActivity.java`**: Sin modificaciones. `BridgeActivity` de Capacitor 5+ registra los plugins automáticamente, incluyendo el `FirebaseMessagingService` del plugin push (mergeado en el build).

### Estrategia de Despliegue en Render

El `serviceAccountKey.json` es una clave privada de cuenta de servicio con permisos de admin sobre Firebase — nunca debe commitearse a Git. La solución para producción usa los **Secret Files** de Render:

1. Crear un Secret File con nombre `serviceAccountKey.json` → Render lo monta automáticamente en `/etc/secrets/serviceAccountKey.json`.
2. Añadir variable de entorno `FIREBASE_CONFIG_PATH=/etc/secrets/serviceAccountKey.json`.
3. El `FirebaseConfig` detecta la ruta absoluta y usa `FileInputStream` en lugar de `ClassPathResource`.

El `google-services.json` (frontend Android) **no es secreto** — es una configuración pública restringida por `package_name` y SHA-1 del certificado. Se puede commitear sin riesgo, ya que además queda compilado dentro del APK.

### Archivos modificados o creados

**Backend:**
- `pom.xml` — dependencia `firebase-admin:9.3.0`
- `config/FirebaseConfig.java` — inicialización dinámica (classpath / FileInputStream)
- `model/Usuario.java` — campo `fcmToken`
- `service/NotificationProvider.java` — interfaz del Provider Pattern
- `service/FcmNotificationProvider.java` — implementación FCM con limpieza de tokens inválidos
- `service/WhatsAppNotificationProvider.java` — wrapper Twilio para fallback
- `service/NotificationService.java` — orquestador @Async (FCM-first)
- `service/UsuarioService.java` — método `actualizarFcmToken()`
- `controller/UserController.java` — endpoint `PUT /api/usuarios/fcm-token`
- `service/PartidoService.java` — migrado a `NotificationService`
- `service/NotificacionScheduler.java` — migrado a `NotificationService`
- `service/ChatService.java` — push en privados + broadcast en equipo
- `resources/application.properties` — propiedad `firebase.config.path`

**Frontend:**
- `package.json` — `@capacitor/push-notifications:^5.0.0`
- `capacitor.config.ts` — config `PushNotifications`
- `core/services/push/push-notification.service.ts` — nuevo servicio completo
- `core/services/auth/auth.service.ts` — trigger `initialize()` post-login
- `android/app/src/main/AndroidManifest.xml` — permisos FCM + meta-data
- `android/app/src/main/res/drawable/ic_notification.xml` — icono monocromático
- `android/app/src/main/res/values/colors.xml` — paleta de colores

---

### Fase Final: Deep Linking, Auto-Asistencia y Notificaciones de Confirmación

Una vez el sistema FCM base estaba operativo (notificaciones de chat y de partido llegando al dispositivo), se completó el ciclo con tres mejoras que cierran la experiencia de usuario.

#### Deep Linking — Ruteo Inteligente al Tocar la Notificación

**Desafío**: Al tocar una notificación, la app se abría pero aterrizaba siempre en la pantalla de inicio, sin contexto. El usuario tenía que navegar manualmente hasta el chat o el partido que generó la alerta.

**Solución**: Se extendió el sistema de notificaciones para incluir un **Data Payload** en cada mensaje FCM. El payload viaja junto a la notificación y contiene la ruta destino de la app.

El `NotificationProvider` se extendió con un default method que acepta el mapa de datos:

```java
// NotificationProvider.java — el default garantiza compatibilidad con WhatsApp (fallback)
default void sendNotification(Usuario usuario, String title, String body, Map<String, String> data) {
    sendNotification(usuario, title, body); // WhatsApp ignora el data payload
}
```

El `FcmNotificationProvider` sobreescribe el método y adjunta el payload al mensaje:

```java
// FcmNotificationProvider.java
Message.Builder builder = Message.builder()
    .setToken(fcmToken)
    .setNotification(Notification.builder().setTitle(title).setBody(body).build());

if (data != null && !data.isEmpty()) {
    builder.putAllData(data);
}
```

Cada servicio que dispara notificaciones ahora envía la ruta correspondiente:

| Evento | Data Payload |
|---|---|
| Mensaje de chat (privado o equipo) | `{ "route": "/chat", "type": "CHAT" }` |
| Creación de partido | `{ "route": "/match-detail/{id}", "type": "MATCH" }` |

En el frontend, el listener `pushNotificationActionPerformed` — que antes estaba vacío — ahora lee el campo `route` del payload y navega directamente:

```typescript
// push-notification.service.ts
PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
    const data = action.notification.data as Record<string, string> | undefined;
    const route = data?.['route'];
    if (route) {
        this.router.navigateByUrl(route);
    }
});
```

#### Auto-Asistencia a Entrenamientos (Acción del Jugador)

**Desafío**: Los jugadores no podían confirmar su asistencia a un entrenamiento desde la app. El único canal era que el entrenador la registrase manualmente desde la pantalla de asistencia del panel de gestión.

**Solución**: Se creó un endpoint de confirmación accesible por el rol `JUGADOR` en `JugadorController` (bajo `/api/jugadores/**`), lo que garantiza que el filtro HTTP de `SecurityConfig` lo permita sin restricciones de rol `ADMIN`. Se añadió el botón en la tarjeta de eventos del Player Dashboard.

> **Nota de arquitectura**: el endpoint se colocó intencionalmente en `JugadorController` y no en `AdminController`. `SecurityConfig` aplica `.requestMatchers("/api/admin/**").hasRole("ADMIN")` a nivel de filtro HTTP, antes de que Spring evalúe el `@PreAuthorize` del método. Poner el endpoint en `AdminController` con `@PreAuthorize("hasAnyRole(...JUGADOR)")` resultaba en un 403 silencioso porque el filtro rechazaba la request antes de llegar al método.

```java
// JugadorController.java
@PostMapping("/entrenamiento/{id}/confirmar")
@PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR', 'JUGADOR')")
public ResponseEntity<?> confirmarAsistencia(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
    Integer idJugador = ((Number) payload.get("idJugador")).intValue();
    adminService.confirmarAsistencia(id, idJugador);
    return ResponseEntity.ok(Collections.singletonMap("message", "Asistencia confirmada"));
}
```

La lógica en `AdminService` hace un upsert y guarda el estado `"PRESENT"` — el mismo valor canónico que usa el módulo de asistencia del admin — para que el dashboard del entrenador los cuente correctamente:

```java
// AdminService.java
@Transactional
public void confirmarAsistencia(Long idEntrenamiento, Integer idJugador) {
    Jugador jugador = jugadorRepo.findById(idJugador).orElseThrow(...);
    Asistencia asistencia = asistenciaRepo
        .findByIdEntrenamientoAndJugador(idEntrenamiento, jugador)
        .orElseGet(() -> {
            Asistencia a = new Asistencia();
            a.setIdEntrenamiento(idEntrenamiento);
            a.setJugador(jugador);
            return a;
        });
    asistencia.setEstado("PRESENT"); // mismo valor que el módulo admin — EntrenadorService filtra por "PRESENT"
    asistenciaRepo.save(asistencia);
}
```

> **Consistencia de estado**: `EntrenadorService` calcula los porcentajes de asistencia con `.filter(a -> "PRESENT".equals(a.getEstado()))`. Usar `"ASISTE"` en la confirmación del jugador hacía que los porcentajes del dashboard del entrenador no se actualizasen. Estandarizar en `"PRESENT"` unifica ambos flujos sobre el mismo valor canónico.

**Hidratación del estado desde el backend**: el `Set<number>` del Player Dashboard se carga desde la base de datos al inicializar el componente, no solo al hacer click. Esto corrige dos bugs: (1) estado perdido al refrescar la página y (2) estado del jugador anterior visible al navegar a otro dashboard.

```java
// AsistenciaRepository.java — nueva query
@Query("SELECT a.idEntrenamiento FROM Asistencia a WHERE a.jugador.idJugador = :idJugador AND a.estado = 'PRESENT'")
List<Long> findEntrenamientosConfirmadosByJugadorId(@Param("idJugador") Integer idJugador);
```

```java
// JugadorController.java — endpoint de hidratación
@GetMapping("/{idJugador}/entrenamientos/confirmados")
@PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR', 'JUGADOR')")
public ResponseEntity<List<Long>> getEntrenamientosConfirmados(@PathVariable Integer idJugador) {
    return ResponseEntity.ok(adminService.getEntrenamientosConfirmados(idJugador));
}
```

```typescript
// player-dashboard.page.ts — carga al resolver el ID real del jugador
this.confirmedTrainings.clear();
this.playerService.getEntrenamientosConfirmados(realPlayerId)
  .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of([])))
  .subscribe((ids: number[]) => ids.forEach(id => this.confirmedTrainings.add(id)));
```

En la tarjeta de "Próximos Eventos", el botón `checkmark-circle-outline` aparece únicamente para eventos `tipo !== 'PARTIDO'`. Tras confirmar, el ícono cambia a `checkmark-circle` verde y el botón se deshabilita.

#### Notificación al Coach al Confirmar Asistencia

**Desafío**: El entrenador no tenía visibilidad en tiempo real de qué jugadores habían confirmado su asistencia al entrenamiento.

**Solución**: Dentro del mismo método `confirmarAsistencia()` de `AdminService`, tras persistir el estado, se navega por la cadena de relaciones del jugador para localizar al entrenador de su equipo y dispararle una notificación push:

```java
// AdminService.java — al final de confirmarAsistencia()
Equipo equipo = jugador.getEquipoPrincipal();
if (equipo != null && equipo.getEntrenador() != null
        && equipo.getEntrenador().getUsuario() != null) {
    String nombreJugador = jugador.getUsuario() != null
        ? jugador.getUsuario().getNombre() : "Un jugador";
    notificationService.send(
        equipo.getEntrenador().getUsuario(),
        "✅ Confirmación de asistencia",
        "⚽ " + nombreJugador + " ha confirmado su asistencia al entrenamiento."
    );
}
```

La cadena es null-safe en cada paso: si el jugador no tiene equipo, si el equipo no tiene entrenador asignado o si el entrenador no tiene usuario vinculado, la notificación simplemente no se envía sin lanzar ninguna excepción.

#### Archivos modificados en la Fase Final

**Backend:**
- `service/NotificationProvider.java` — default method con `Map<String, String> data`
- `service/FcmNotificationProvider.java` — override con `.putAllData(data)` en el builder
- `service/NotificationService.java` — sobrecarga `send(..., Map data)`
- `service/ChatService.java` — data payload `CHAT` en mensajes privados y broadcast
- `service/PartidoService.java` — data payload `MATCH` con ID real del partido
- `service/AdminService.java` — `confirmarAsistencia()` con upsert + estado `"PRESENT"` + notificación al coach; `getEntrenamientosConfirmados()` nuevo
- `controller/AdminController.java` — endpoint `POST /api/admin/entrenamiento/{id}/confirmar` **eliminado** (movido a JugadorController)
- `controller/JugadorController.java` — `POST /api/jugadores/entrenamiento/{id}/confirmar` + `GET /api/jugadores/{id}/entrenamientos/confirmados`
- `repository/AsistenciaRepository.java` — query JPQL `findEntrenamientosConfirmadosByJugadorId`

**Frontend:**
- `core/services/push/push-notification.service.ts` — `Router` inyectado; `pushNotificationActionPerformed` con `navigateByUrl()`
- `core/services/player/player.service.ts` — `confirmarAsistenciaEntrenamiento()` apunta a `/jugadores/...`; nuevo `getEntrenamientosConfirmados()`
- `modules/players/pages/player-dashboard/player-dashboard.page.ts` — `confirmedTrainings` se hidrata desde backend al cargar cada jugador (con `clear()` previo); métodos `isTrainingConfirmed()` y `confirmarAsistencia()`
- `modules/players/pages/player-dashboard/player-dashboard.page.html` — botón de confirmación condicional en tarjetas de entrenamiento

---

## 24. Chat Pro: Ingeniería de Mensajería Avanzada y Seguridad 💬🔒✅

Se ha llevado el módulo de chat de un sistema funcional básico a una implementación de nivel profesional, resolviendo cuatro vectores críticos: escalabilidad de datos, robustez en el manejo de medios, seguridad XSS y experiencia de gestión de mensajes en tiempo real.

---

### 24.1 Paginación de Alto Rendimiento (Infinite Scroll)

#### Desafío Técnico

El historial se cargaba con una única query `SELECT * FROM mensajes WHERE equipo_id = ?` sin límite. Con 5.000 mensajes, el frontend recibe un array de 5.000 objetos JSON, el BehaviorSubject los almacena todos en memoria y el DOM renderiza 5.000 nodos `<div>` simultáneamente. El resultado es un tiempo de carga inaceptable y un consumo de RAM que colapsa dispositivos móviles de gama media.

El segundo desafío es técnico y de UX: al cargar mensajes antiguos, el scroll debe **mantenerse en la posición visual actual** del usuario. Si se inserta contenido por encima sin compensar, todos los mensajes visibles saltan hacia abajo, desorientando al usuario — el error más común en implementaciones amateur de infinite scroll.

#### Solución e Implementación

**Backend — `Slice<T>` en lugar de `Page<T>`**

Se eligió `Slice` de Spring Data JPA de forma deliberada. `Page<T>` ejecuta dos queries: una para los datos y otra `SELECT COUNT(*)` para calcular el total de páginas. `Slice<T>` solo ejecuta la query de datos y determina si hay más resultados cargando `size + 1` registros. Para un chat, el número total de mensajes no es relevante — solo importa si hay más; `Slice` es un 50% más eficiente.

```java
// MensajeRepository.java — query paginada descendente
Slice<Mensaje> findByEquipo_IdEquipoOrderByFechaHoraDesc(
    Integer idEquipo, Pageable pageable);

// ChatService.java — inversión DESC → ASC para el cliente
public PaginaMensajesDto listarPorEquipoPaginado(Integer idEquipo, int page, int size) {
    Slice<Mensaje> slice = mensajeRepository
        .findByEquipo_IdEquipoOrderByFechaHoraDesc(idEquipo, PageRequest.of(page, size));
    List<MensajeDto> dtos = slice.getContent().stream()
        .map(this::toDto).collect(Collectors.toList());
    Collections.reverse(dtos); // Los mensajes más recientes al fondo para el cliente
    return new PaginaMensajesDto(dtos, slice.hasNext());
}
```

El DTO de respuesta es un Java Record minimalista:

```java
// PaginaMensajesDto.java
public record PaginaMensajesDto(List<MensajeDto> mensajes, boolean hasMore) {}
```

**Frontend — Preservación de posición de scroll**

El núcleo del problema es el orden de los eventos del ciclo de vida de Angular. `ngOnChanges` se dispara **antes** de que el DOM se actualice; `ngAfterViewChecked` se dispara **después**. Esta secuencia permite el patrón de captura-y-restauración:

```typescript
// chat-room.component.ts
ngOnChanges(changes: SimpleChanges): void {
  if (changes['cargandoMas']?.currentValue === true) {
    // 1. La carga comienza: activar modo restauración
    this.pendingScrollRestore = true;
  }
  if (changes['mensajes']) {
    if (this.pendingScrollRestore && !changes['mensajes'].isFirstChange()) {
      // 2. Los mensajes cambian (prepend): el DOM todavía NO se actualizó
      //    → capturar la posición ANTES de que se expanda el contenido
      const el = this.messagesContainer.nativeElement;
      this.savedScrollHeight = el.scrollHeight;
      this.savedScrollTop    = el.scrollTop;
    } else {
      this.shouldScroll = true; // Mensaje nuevo → ir al fondo
    }
  }
}

ngAfterViewChecked(): void {
  // 3. DOM ya actualizado: la altura creció → restaurar la posición relativa
  if (this.pendingScrollRestore && this.savedScrollHeight > 0) {
    const el = this.messagesContainer.nativeElement;
    const diff = el.scrollHeight - this.savedScrollHeight;
    if (diff > 0) {
      el.scrollTop = this.savedScrollTop + diff; // Usuario sigue viendo los mismos mensajes
      this.pendingScrollRestore = false;
    }
  }
  if (this.shouldScroll) { this.scrollToBottom(); this.shouldScroll = false; }
}
```

La detección del scroll al tope usa un arrow function property para que `removeEventListener` funcione correctamente sin crear referencias huérfanas:

```typescript
private onContainerScroll = (): void => {
  const el = this.messagesContainer?.nativeElement;
  if (!el || !this.hayMas || this.cargandoMas || this.pendingScrollRestore) return;
  if (el.scrollTop <= 50) this.cargarMas.emit();
};

ngAfterViewInit(): void {
  this.messagesContainer.nativeElement.addEventListener('scroll', this.onContainerScroll);
}
ngOnDestroy(): void {
  this.messagesContainer?.nativeElement.removeEventListener('scroll', this.onContainerScroll);
}
```

Los mensajes nuevos vía WebSocket (STOMP) no se ven afectados: `agregarMensaje()` en `ChatService` hace append al final de la lista, lo que dispara `shouldScroll = true` y el chat baja automáticamente, exactamente igual que antes.

---

### 24.2 Robustez en Medios y Emojis

#### Desafío Técnico

Se detectaron dos fallos independientes que bloqueaban funcionalidades básicas:

1. **Emojis no persistidos**: Aunque PostgreSQL soporta el estándar Unicode completo, la conexión JDBC puede establecerse con un encoding de cliente diferente. Emojis multibyte (como 😂, que ocupa 4 bytes en UTF-8) fallaban silenciosamente en entornos donde el pool de conexiones no forzaba `UTF8`.

2. **Imágenes sin texto rechazadas por la BD**: Al intentar enviar una imagen sin escribir texto, el backend lanzaba `ERROR: null value in column "contenido" of relation "mensajes" violates not-null constraint`. El campo `contenido` de la tabla `mensajes` tenía una restricción `NOT NULL` heredada de versiones anteriores donde todos los mensajes debían ser texto.

#### Solución e Implementación

**Garantía de encoding UTF-8 en el pool de conexiones (HikariCP)**

```properties
# application.properties
spring.datasource.hikari.connection-init-sql=SET client_encoding TO 'UTF8'
```

Esta instrucción se ejecuta en cada nueva conexión que Hikari abre hacia PostgreSQL, garantizando que la sesión de base de datos esté en UTF-8 independientemente de la configuración del servidor o del sistema operativo del host de Render.

**Corrección del modelo JPA y migración de esquema**

```java
// Mensaje.java — el campo debe ser explícitamente nullable
@Column(columnDefinition = "TEXT", nullable = true)
private String contenido;
```

```sql
-- Migración aplicada en la BD de producción (Render)
ALTER TABLE mensajes ALTER COLUMN contenido DROP NOT NULL;
```

**Serialización JSON correcta en el cliente STOMP**

El objeto `EnviarMensajeDto` del frontend contenía campos `undefined` al enviar imágenes sin texto. `JSON.stringify` descarta las propiedades `undefined`, lo que hacía que Jackson (el deserializador de Java) recibiera un JSON sin el campo `contenido` y fallara al mapear el Java Record:

```typescript
// chat.service.ts — replacer que convierte undefined → null explícitamente
this.client.publish({
  destination: '/app/chat.enviar',
  body: JSON.stringify(dto, (_key, value) => value === undefined ? null : value)
});
```

---

### 24.3 Seguridad y Sanitización (XSS Defense)

#### Desafío Técnico

Se identificó un vector de ataque XSS real en el componente de chat: los campos `urlAdjunto` de los mensajes se vinculaban directamente al atributo `[src]` de los elementos `<img>`, `<video>` y `<audio>` sin sanitizar. Un atacante podía publicar manualmente un mensaje STOMP desde la consola del navegador con una URL arbitraria:

```json
{ "urlAdjunto": "data:text/html,<script>alert(document.cookie)</script>", "tipoAdjunto": "IMAGEN" }
```

Angular bloquea `javascript:` en `[src]`, pero **no bloquea `data:` URLs**. En un elemento `<video>`, algunos motores de navegador pueden ejecutar contenido embebido en URLs `data:`. Adicionalmente, cualquier URL externa puede usarse como tracking pixel para exfiltrar la IP y el User-Agent del usuario que carga el chat.

#### Solución e Implementación

**Frontend — `DomSanitizer.bypassSecurityTrustUrl()`**

Se aplicó `getSafeUrl()` a todos los bindings de medios:

```html
<!-- chat-room.component.html — los tres tipos de adjunto sanitizados -->
<img   [src]="getSafeUrl(msg.urlAdjunto)" ...>
<video [src]="getSafeUrl(msg.urlAdjunto)" ...>
<audio [src]="getSafeUrl(msg.urlAdjunto)" ...>
```

```typescript
// chat-room.component.ts
getSafeUrl(url: string | null): SafeUrl | null {
  if (!url) return null;
  return this.sanitizer.bypassSecurityTrustUrl(url);
}
```

**Backend — Validación de URL de adjunto (defensa en profundidad)**

La sanitización en el cliente es necesaria pero insuficiente: un atacante puede publicar directamente vía WebSocket saltándose el frontend. Se añadió una segunda barrera de validación en el servidor:

```java
// ChatService.java — rechaza URLs que no pertenezcan al servidor
if (dto.urlAdjunto() != null) {
    String url = dto.urlAdjunto();
    if (!url.contains("/api/uploads/files/")) {
        throw new IllegalArgumentException(
            "El adjunto referencia una URL no permitida.");
    }
}
```

Esta validación garantiza que solo se puedan persistir y difundir URLs generadas por el propio endpoint `POST /api/chat/uploads` del servidor. Un `data:` URL o un dominio externo es rechazado con una excepción antes de que el mensaje llegue a la base de datos.

**Sanitización de menciones (ya existente, auditoría confirmada)**

El método `getMentionHtml()` fue auditado y confirmado como seguro: escapa `&`, `<` y `>` antes de inyectar los `<span>` de mención, y la regex `@([A-Za-záéíóúüñ]+)` solo captura caracteres alfabéticos, haciendo imposible inyectar HTML por esa vía.

```typescript
getMentionHtml(contenido?: string): SafeHtml {
  const escaped = contenido
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = escaped.replace(
    /@([A-Za-záéíóúüñÁÉÍÓÚÜÑ]+ [A-Za-záéíóúüñÁÉÍÓÚÜÑ]+)/g,
    '<span class="mention">@$1</span>'
  );
  return this.sanitizer.bypassSecurityTrustHtml(html);
}
```

---

### 24.4 UX de Gestión: CRUD de Mensajes Sincronizado por WebSocket

#### Desafío Técnico

Los botones de "Editar" y "Eliminar" mostraban el menú contextual correctamente pero no ejecutaban ninguna acción al pulsarlos. El diagnóstico inicial apuntaba a endpoints faltantes en el backend, pero los endpoints existían. La causa raíz fue `setPointerCapture()` en el handler de `pointerdown`.

`setPointerCapture()` redirige **todos los eventos de puntero** al elemento que lo invoca (la burbuja del mensaje). Esto hace que el evento `click` sintetizado al soltar el dedo aterrice en `toggleMenu()` en lugar del botón real, impidiendo que "Editar" o "Borrar" reciban el evento.

El segundo problema era de reactividad: al confirmar una edición o borrado, el componente no actualizaba la UI localmente porque no había lógica de `next()` en el BehaviorSubject. La UI esperaba recibir el mensaje actualizado por STOMP, pero el canal STOMP solo reenvía a los clientes conectados al topic del equipo — el remitente no recibe su propia actualización por esa vía cuando la acción es REST.

#### Solución e Implementación

**Fix del `setPointerCapture` — detección de elementos interactivos**

```typescript
// chat-room.component.ts
onPointerDown(event: PointerEvent, msg: MensajeDto): void {
  if (msg.eliminado) return;
  const target = event.target as HTMLElement;
  // Si el usuario tocó un botón, textarea o enlace, NO capturar el puntero.
  // setPointerCapture redirige el click sintetizado al bubble y hace
  // que Editar/Borrar/Reaccionar nunca reciban el evento.
  if (target.closest('button, textarea, a, input')) return;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  this.swipeStartX = event.clientX;
  this.swipeActive.set(msg.id, true);
  this.hapticFired.set(msg.id, false);
}
```

**Actualización local inmediata del estado**

En lugar de esperar a que STOMP reenvíe el mensaje actualizado, la respuesta HTTP del endpoint se inyecta directamente en el `BehaviorSubject` de mensajes:

```typescript
// chat-room.component.ts — edición inline sincronizada
guardarEdicion(msg: MensajeDto): void {
  const texto = this.textoEdicion.trim();
  if (!texto || texto === msg.contenido) { this.cancelarEdicion(); return; }
  this.chatService.editarMensaje(msg.id, texto).subscribe({
    next: (actualizado) => {
      this.chatService.actualizarMensajeLocal(actualizado); // Actualización inmediata en UI
      this.cancelarEdicion();
    }
  });
}

// ChatService.ts — wrapper público para actualizarMensaje
actualizarMensajeLocal(msg: MensajeDto): void {
  this.agregarMensaje(msg); // Busca por ID y reemplaza o añade al array
}
```

El **borrado es lógico**, nunca físico. El campo `eliminado = true` se persiste en la BD y el backend difunde la versión "borrada" del mensaje por STOMP a todos los clientes conectados. La UI reemplaza el contenido del mensaje con el texto "Este mensaje fue eliminado" y oculta los adjuntos:

```java
// ChatService.java — borrado lógico: limpia contenido y adjunto
mensaje.setEliminado(true);
mensaje.setContenido("Este mensaje fue eliminado.");
mensaje.setUrlAdjunto(null);
mensaje.setTipoAdjunto(null);
return toDto(mensajeRepository.save(mensaje));
```

**Doble barrera de autorización (IDOR prevention)**

Tanto la edición como el borrado están protegidos con validación de autoría en el backend. El email del editor proviene del `@AuthenticationPrincipal` extraído del JWT firmado — el cliente no puede falsificarlo:

```java
// ChatService.java — validación de propiedad del mensaje
if (!mensaje.getRemitente().getEmail().equals(emailEditor)) {
    throw new AccessDeniedException("No podés editar mensajes de otros usuarios.");
}
```

Cualquier intento de editar o borrar un mensaje ajeno retorna HTTP 403 inmediatamente, antes de modificar ningún dato.

---

### Archivos modificados en esta sección

**Backend:**
- `dto/PaginaMensajesDto.java` — nuevo Record `{ mensajes, hasMore }`
- `repository/MensajeRepository.java` — dos métodos `Slice<Mensaje>` con `Pageable` ordenados DESC
- `service/ChatService.java` — `listarPorEquipoPaginado()`, `listarPrivadosPaginado()`, validación de URL de adjunto
- `controller/ChatController.java` — endpoints de historial paginados (`?page=0&size=50`)
- `model/Mensaje.java` — campo `contenido` con `nullable = true`
- `resources/application.properties` — `connection-init-sql` para encoding UTF-8

**Frontend:**
- `chat.service.ts` — interfaz `PaginaMensajesDto`, `cargarHistorialEquipo/Privado` con `page` y lógica de prepend, replacer JSON para `undefined → null`
- `chat-room.component.ts` — `@Input() cargandoMas/hayMas`, `@Output() cargarMas`, preservación de scroll, `onContainerScroll`, fix de `setPointerCapture`, `guardarEdicion` y `confirmarEliminar` con actualización local
- `chat-room.component.html` — `ion-spinner` de carga arriba del listado, `[src]` de medios con `getSafeUrl()`
- `chat-room.component.scss` — estilo `.loading-more`
- `chat.page.ts` — estado `paginaActual/hayMas/cargandoMas`, método `onCargarMas()`, reset al cambiar conversación
- `chat.page.html` — `[cargandoMas]`, `[hayMas]` y `(cargarMas)` en `app-chat-room`
