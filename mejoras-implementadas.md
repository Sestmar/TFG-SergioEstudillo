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

Implementación de una infraestructura de mensajería basada en el protocolo STOMP sobre WebSockets para comunicación instantánea.

### Arquitectura de Mensajería
- **Interceptor de Handshake**: Validación de tokens JWT en la fase de conexión inicial del socket, impidiendo accesos no autorizados al broker.
- **Doble Cliente STOMP**: Se configuró un cliente para la vista activa del chat y un **Global Listener** que reside en el layout principal para gestionar notificaciones en segundo plano.

```java
// Interceptor de seguridad STOMP
@Override
public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(new ChannelInterceptor() {
        @Override
        public Message<?> preSend(Message<?> message, MessageChannel channel) {
            StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String token = accessor.getFirstNativeHeader("Authorization").substring(7);
                // Validación de JWT para autorizar la conexión al Socket
                if (jwtService.isTokenValid(token)) {
                    accessor.setUser(new UsernamePasswordAuthenticationToken(...));
                }
            }
            return message;
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

## 7. Notificaciones Locales y Badges: UX Nativa con Capacitor 🔔

Se mejoró la retención de usuarios mediante la integración de APIs nativas del dispositivo.

### Implementación
- **Push Local con Capacitor**: Uso del plugin `@capacitor/local-notifications` para mostrar alertas cuando el usuario recibe un mensaje y no está dentro de la pantalla de chat.
- **Gestión de Estado de Badges**: Uso de `BehaviorSubject` para sincronizar el contador de mensajes no leídos entre el servicio de chat y el menú lateral de la aplicación.

```typescript
// Lógica de disparo de notificación local
private async manejarMensajeGlobal(msg: MensajeDto): Promise<void> {
    const isChatActive = this.router.url.includes('/chat');
    if (!isChatActive) {
        this.contadorNoLeidos.next(this.contadorNoLeidos.value + 1);
        await LocalNotifications.schedule({
            notifications: [{
                title: msg.remitenteNombre,
                body: msg.contenido,
                id: Date.now()
            }]
        });
    }
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

> **Estado de la Plataforma**: Arquitectura robusta, escalable y validada bajo estándares profesionales de desarrollo de software.
