# TFG Gestión Integral de Club Deportivo — README v4.1

## 📋 Índice

1. [Visión General del Proyecto](#visión-general-del-proyecto)
2. [Estado Actual (v4.1)](#estado-actual-v41)
3. [Arquitectura Cloud y Stack Tecnológico](#arquitectura-cloud-y-stack-tecnológico)
4. [Estructura del Repositorio](#estructura-del-repositorio)
5. [Backend: Spring Boot 3 + PostgreSQL NeonDB](#backend-spring-boot-3--postgresql-neondb)
6. [Frontend: Angular 16 + Ionic 7](#frontend-angular-16--ionic-7)
7. [Integración Frontend-Backend (JWT Completo)](#integración-frontend-backend-jwt-completo)
8. [Flujos de Datos Críticos](#flujos-de-datos-críticos)
9. [Convenciones y Correcciones Críticas](#convenciones-y-correcciones-críticas)
10. [Guía de Instalación y Ejecución](#guía-de-instalación-y-ejecución)
11. [Roadmap y Próximos Pasos](#roadmap-y-próximos-pasos)

---

## Visión General del Proyecto

**TFG Gestión Integral de Club Deportivo** es una plataforma cloud-native y mobile-first que digitaliza completamente la operación de un club de fútbol base.

### Funcionalidades Principales

- ✅ **Autenticación JWT Stateless** - Login, Registro y Autorización por roles.
- ✅ **Gestión de Usuarios** - Admin, Entrenador, Jugador con permisos granulares.
- ✅ **CRUD de Equipos y Jugadores** - Gestión integral de plantillas.
- ✅ **Sistema Multimedia** - Avatares y escudos almacenados en servidor.
- ✅ **API REST Documentada** - Swagger UI interactivo.
- ✅ **Dashboard Reactivo** - Redirección inteligente por rol.
- ✅ **Gestión de Entrenadores** - Asignación N:M Entrenador–Equipo y carga dinámica del equipo en el CoachDashboard.
- ✅ **Módulo de Convocatorias** - Creación de partidos y entrenamientos desde el rol Entrenador, con formulario reactivo y adaptación de fechas de formato ISO (Ionic) a timestamp/fecha válida para Spring Boot antes de llamar a `/api/convocatorias` [web:9][web:22].
- ✅ **Panel de Jugador centrado en Equipo** - El Dashboard de jugador muestra automáticamente todas las convocatorias asociadas al equipo del jugador (Team-First), sin requerir registros explícitos en `convocatoria_jugador`.
- ✅ **Visualización Simplificada de Convocatorias** - Estado por defecto “Convocado” (azul) y acceso a los detalles de la convocatoria, eliminando la lógica de confirmación/rechazo en el frontend.

---

## Estado Actual (v4.2 - Fase 2 Completada)

| Componente | Estado | Fecha | Notas |
|------------|--------|-------|-------|
| **Backend (Spring Boot 3)** | ✅ Finalizado | 20/12/2025 | API REST robusta, JWT integrado, NeonDB operacional. |
| **Frontend (Angular/Ionic)** | ✅ Integrado | 20/12/2025 | Dashboards por rol, gestión de convocatorias y lógica Coach/Player completadas. |
| **Base de Datos (NeonDB)** | ✅ Activa | 20/12/2025 | PostgreSQL 16+, 12+ entidades, relación N:M Entrenador–Equipo asumida para permisos. |
| **Seguridad JWT** | ✅ Estable | 19/12/2025 | Token limpio (sin JSON.stringify), firma validada correctamente. |
| **Documentación API** | ✅ Completa | 19/12/2025 | Swagger UI en `/swagger-ui/index.html`. |
| **Gestión de Convocatorias** | ✅ Fase 2 completada | 20/12/2025 | Creación desde Coach, consumo automático en Player por equipo. |

---

## Arquitectura Cloud y Stack Tecnológico

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO FINAL                           │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
        ▼                            ▼
┌───────────────────┐       ┌────────────────────┐
│   WEB BROWSER     │       │   MOBILE (iOS/AND) │
│  (Angular SPA)    │       │  (Ionic Hybrid)    │
└────────┬──────────┘       └──────────┬─────────┘
         │                             │
         │   HTTP/HTTPS               │
         └──────────────┬──────────────┘
                        │
                        ▼
      ┌────────────────────────────────────────┐
      │     BACKEND API (Spring Boot 3)        │
      │  ├─ REST Endpoints (/api/...)          │
      │  ├─ JWT Authentication Filter          │
      │  ├─ CORS Configuration                 │
      │  └─ Global Exception Handler           │
      └────────┬───────────────────────────────┘
               │
               │ JDBC
               ▼
      ┌────────────────────────────────────────┐
      │  PostgreSQL 16+ (Neon Cloud)           │
      │  ├─ Usuarios (Rol, Hash)               │
      │  ├─ Equipos (Nombre, Categoría)        │
      │  ├─ Jugadores (Ficha completa)         │
      │  ├─ Entrenamientos, Incidencias...     │
      │  └─ Multimedia (Rutas a imágenes)      │
      └────────────────────────────────────────┘
```

### Stack Completo

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| **UI (Web)** | Angular | 16+ | SPA administrativa |
| **UI (Mobile)** | Ionic | 7.x | App híbrida iOS/Android |
| **Framework** | Spring Boot | 3.5.7 | REST API |
| **Seguridad** | Spring Security 6 + JWT | - | Autenticación Stateless |
| **ORM** | Hibernate/JPA | 6.x | Mapeo Objeto-Relacional |
| **Database** | PostgreSQL | 16+ | Persistencia Cloud (Neon) |
| **Lenguaje (Backend)** | Java | 22 | Servidor |
| **Lenguaje (Frontend)** | TypeScript | 5.x | Cliente |
| **HTTP Client** | RxJS Observable | 7.x | Comunicación async |
| **Validación** | Bean Validation (Jakarta) | 3.x | Validación de DTOs |
| **Documentación** | Swagger/OpenAPI | 2.8.3 | Interactive API docs |

---

## Estructura del Repositorio

```
PROYECTO-TFG/
├── src/
│   ├── backend-tfg/                          # SERVIDOR (Spring Boot 3)
│   │   ├── src/main/java/com/backend_tfg/
│   │   │   ├── config/                       # Configuraciones globales
│   │   │   │   ├── SecurityConfig.java       # Spring Security + JWT
│   │   │   │   ├── WebConfig.java            # CORS, Web settings
│   │   │   │   └── SwaggerConfig.java        # Swagger/OpenAPI
│   │   │   │
│   │   │   ├── controller/                   # API REST Endpoints
│   │   │   │   ├── AuthController.java       # /api/auth/login, /auth/me
│   │   │   │   ├── EquipoController.java     # /api/equipos
│   │   │   │   ├── JugadorController.java    # /api/jugadores
│   │   │   │   ├── MediaController.java      # /api/media/upload
│   │   │   │   └── [otros controllers...]
│   │   │   │
│   │   │   ├── model/                        # Entidades JPA
│   │   │   │   ├── Usuario.java              # @JsonIgnore: passwordHash, getAuthorities
│   │   │   │   ├── Equipo.java
│   │   │   │   ├── Jugador.java
│   │   │   │   └── [otras entidades...]
│   │   │   │
│   │   │   ├── repository/                   # JPA Repositories
│   │   │   │   ├── UsuarioRepository.java
│   │   │   │   ├── EquipoRepository.java
│   │   │   │   └── [otros repositories...]
│   │   │   │
│   │   │   ├── security/                     # Lógica JWT
│   │   │   │   ├── JwtUtil.java              # Generación y validación de tokens
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   └── CustomUserDetailsService.java
│   │   │   │
│   │   │   ├── service/                      # Lógica de negocio
│   │   │   │   ├── UsuarioService.java
│   │   │   │   ├── EquipoService.java
│   │   │   │   ├── JugadorService.java
│   │   │   │   ├── MediaService.java         # Gestión de imágenes
│   │   │   │   └── [otros servicios...]
│   │   │   │
│   │   │   ├── dto/                          # Data Transfer Objects
│   │   │   │   ├── LoginRequestDTO.java
│   │   │   │   ├── LoginResponseDTO.java
│   │   │   │   ├── UsuarioDTO.java
│   │   │   │   └── [otros DTOs...]
│   │   │   │
│   │   │   ├── exception/                    # Excepciones personalizadas
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   └── [otras excepciones...]
│   │   │   │
│   │   │   └── BackendTfgApplication.java    # Main class
│   │   │
│   │   ├── src/main/resources/
│   │   │   ├── application.properties        # ⚠️ CRÍTICO: Contiene NeonDB credentials
│   │   │   └── static/uploads/               # Almacenamiento local de imágenes
│   │   │
│   │   └── pom.xml                           # Maven dependencies
│   │
│   ├── frontend-tfg/                         # CLIENTE (Angular/Ionic)
│   │   ├── src/app/
│   │   │   ├── core/                         # SINGLETONS (cargados una única vez)
│   │   │   │   ├── services/
│   │   │   │   │   ├── auth/
│   │   │   │   │   │   └── auth.service.ts   # Login, Logout, Redirección
│   │   │   │   │   ├── storage/
│   │   │   │   │   │   └── storage.service.ts # Token y usuario en localStorage
│   │   │   │   │   └── api/
│   │   │   │   │       └── api.service.ts    # Client HTTP base
│   │   │   │   │
│   │   │   │   ├── guards/
│   │   │   │   │   └── auth.guard.ts         # CanActivate protección de rutas
│   │   │   │   │
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── auth.interceptor.ts   # Inyecta Authorization header
│   │   │   │   │   └── error.interceptor.ts  # Maneja errores HTTP
│   │   │   │   │
│   │   │   │   └── mocks/
│   │   │   │       └── mock-data.ts          # Datos falsos para testing
│   │   │   │
│   │   │   ├── shared/                       # REUTILIZABLES (importados por múltiples módulos)
│   │   │   │   ├── components/
│   │   │   │   │   ├── header/
│   │   │   │   │   ├── footer/
│   │   │   │   │   ├── loading-spinner/
│   │   │   │   │   ├── error-message/
│   │   │   │   │   └── player-card/
│   │   │   │   │
│   │   │   │   ├── models/
│   │   │   │   │   └── models.ts             # Interfaces TypeScript (Usuario, Equipo, Jugador, etc.)
│   │   │   │   │
│   │   │   │   ├── pipes/
│   │   │   │   │   └── [pipes de transformación]
│   │   │   │   │
│   │   │   │   └── directives/
│   │   │   │       └── [directivas personalizadas]
│   │   │   │
│   │   │   ├── modules/                      # VISTAS (Feature Modules - Lazy Loaded)
│   │   │   │   ├── auth/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── login/            # Formulario de login
│   │   │   │   │   │   └── register/         # Formulario de registro
│   │   │   │   │   └── auth-routing.module.ts
│   │   │   │   │
│   │   │   │   ├── admin/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── dashboard/        # Dashboard administrativo
│   │   │   │   │   └── admin-routing.module.ts
│   │   │   │   │
│   │   │   │   ├── coach/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── dashboard/        # Dashboard de entrenador
│   │   │   │   │   └── coach-routing.module.ts
│   │   │   │   │
│   │   │   │   ├── player/
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   └── dashboard/        # Dashboard de jugador
│   │   │   │   │   └── player-routing.module.ts
│   │   │   │   │
│   │   │   │   └── home/
│   │   │   │       └── [landing page]
│   │   │   │
│   │   │   ├── app.module.ts                 # Módulo raíz
│   │   │   ├── app-routing.module.ts         # Rutas principales (lazy loading)
│   │   │   └── app.component.ts
│   │   │
│   │   ├── src/environments/
│   │   │   ├── environment.ts                # Desarrollo (http://localhost:8080/api)
│   │   │   └── environment.prod.ts           # Producción
│   │   │
│   │   ├── src/theme/
│   │   │   └── variables.scss                # Estilos globales e Ionic variables
│   │   │
│   │   ├── angular.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
├── docs/
│   ├── README-v4.1.md                        # Este archivo
│   ├── FRONTEND-v4.1.md                      # Documentación técnica del frontend
│   ├── BACKEND.md                            # Documentación técnica del backend
│   └── CORRECCIONES-CRITICAS-v4.1.md         # Log de bugs y fixes
│
└── .gitignore

```

---

## Backend: Spring Boot 3 + PostgreSQL NeonDB

### Funcionalidades Implementadas

#### 1. **Autenticación JWT**

- Endpoint `/api/auth/login` - POST con email/password
- Genera token JWT válido por 24h
- Respuesta: `{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }`
- Clave secreta almacenada en `application.properties` (segura)

#### 2. **Endpoint de Identidad**

- GET `/api/auth/me` - Obtiene datos del usuario actual autenticado
- Requiere header `Authorization: Bearer <token>`
- Devuelve objeto Usuario sin campos sensibles (password hasheado no se retorna)
- **Crítico:** Tiene `@JsonIgnore` en `passwordHash` y `getAuthorities()` para evitar bucles infinitos

#### 3. **CRUD Completo**

| Entidad | Endpoints | Descrición |
|---------|-----------|-----------|
| **Equipos** | GET/POST/PUT/DELETE `/api/equipos` | Gestión de teams |
| **Jugadores** | GET/POST/PUT/DELETE `/api/jugadores` | Fichas de jugadores |
| **Usuarios** | GET/POST/PUT/DELETE `/api/usuarios` | Gestión de roles |
| **Entrenamientos** | GET/POST `/api/entrenamientos` | Planificación |
| **Incidencias** | GET/POST `/api/incidencias` | Registro de problemas |

#### 4. **Multimedia**

- POST `/api/media/upload` - Multipart form-data
- Almacena archivos en `src/main/resources/static/uploads/`
- Devuelve URL accesible: `http://localhost:8080/uploads/avatar-usuario-123.jpg`

#### 5. **Documentación Interactiva**

- URL: `http://localhost:8080/swagger-ui/index.html`
- Todos los endpoints documentados con @ApiOperation
- Permite pruebas directas desde el navegador

#### 6. **Validación Global**

- `GlobalExceptionHandler` captura todas las excepciones
- Respuestas estándar JSON con status codes correctos
- Bean Validation en DTOs (@NotNull, @Email, @Size, etc.)

### Configuración Crítica (application.properties)

```properties
# ⚠️ CREDENCIALES NEONDB - NO VERSIONADO EN GIT
spring.datasource.url=postgresql://[user]:[password]@[host]:5432/[database]
spring.datasource.username=[user]
spring.datasource.password=[password]

# JWT Secret (mínimo 256 bits para HS256)
app.jwt.secret=tu_super_secreto_minimo_32_caracteres_aleatorios

# CORS para desarrollo
spring.web.cors.allowed-origins=http://localhost:4200,http://localhost:8100
```

---

## Frontend: Angular 16 + Ionic 7

### Arquitetura Modular (v4.1)

La aplicación sigue **Smart-Dumb Components** con separación clara:

- **Smart Components (Pages):** Gestionan lógica, llaman servicios
- **Dumb Components (Shared):** Solo reciben @Input, emiten @Output

### Módulos Feature (Lazy Loaded)

Cada módulo se carga bajo demanda en la navegación:

```typescript
// app-routing.module.ts (RUTAS PLANAS v4.1)
{
  path: 'auth',
  loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
},
{
  path: 'admin-dashboard',
  loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
  canActivate: [AuthGuard]
},
{
  path: 'coach-dashboard',
  loadChildren: () => import('./modules/coach/coach.module').then(m => m.CoachModule),
  canActivate: [AuthGuard]
},
{
  path: 'player-dashboard',
  loadChildren: () => import('./modules/player/player.module').then(m => m.PlayerModule),
  canActivate: [AuthGuard]
}
```

### Modelo de Datos (shared/models/models.ts)

```typescript
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'ENTRENADOR' | 'JUGADOR';
  avatar?: string;
  // passwordHash: NO se incluye por seguridad
}

export interface Equipo {
  id: number;
  nombre: string;
  categoria: string;
  escudoUrl?: string;
  entrenadorId: number;
}

export interface Jugador {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  dorsal: number;
  posicion: 'PORTERO' | 'DEFENSA' | 'CENTROCAMPISTA' | 'DELANTERO';
  equipoId: number;
  avatarUrl?: string;
}
```

---

## Integración Frontend-Backend (JWT Completo)

### 🔐 Flujo de Autenticación Sincronizado (v4.1)

```
USUARIO escribe email/password en LoginPage
            ↓
AuthService.login(email, password)
            ↓
POST /api/auth/login
            ↓
Backend valida con BCrypt
            ↓
Devuelve { "token": "eyJh..." }
            ↓
StorageService.setToken(token)  ← ⚠️ SIN JSON.stringify() (FIX v4.1)
            ↓
AuthService.getMe() automáticamente
            ↓
GET /api/auth/me (con Authorization header)
            ↓
Backend valida JWT y retorna Usuario actual
            ↓
LoginPage.redirectBasedOnRole(user.rol)
            ↓
Navega a /admin-dashboard, /coach-dashboard, o /player-dashboard
            ↓
AuthGuard verifica token en StorageService
            ↓
AuthInterceptor inyecta header automáticamente en TODAS las peticiones
            ↓
App lista con datos del usuario autenticado
```

### Convención de URLs (Slash Rule - Crítica)

**REGLA OBLIGATORIA v4.1:**

```typescript
// ✅ CORRECTO
environment.apiUrl = 'http://localhost:8080/api'  // SIN barra final
this.http.get(`${this.apiUrl}/equipos`)           // CON barra inicial

// ❌ INCORRECTO
environment.apiUrl = 'http://localhost:8080/api/' // Barra final
this.http.get(`${this.apiUrl}equipos`)            // Error: apijugadores (404)
```

**Por qué:** Evita errores 404 por concatenación de URLs (ej: `apijugadores` en lugar de `api/jugadores`).

### Corrección Crítica: Token JWT (v4.1)

```typescript
// ❌ VIEJO (Causaba SignatureException en backend)
setToken(token: string): void {
  localStorage.setItem('auth_token', JSON.stringify(token)); // ¡MAL!
}

// ✅ NUEVO (Fix v4.1)
setToken(token: string): void {
  localStorage.setItem('auth_token', token);  // String puro
}

// Por qué: El token JWT ya es string base64.
// JSON.stringify() añade comillas extra que rompen la firma.
```

### Corrección Crítica: Serialización Backend

```java
// Usuario.java - CRÍTICO para evitar bucles infinitos
@Entity
public class Usuario {
    @Id @GeneratedValue
    private Long id;
    
    private String nombre;
    private String email;
    
    @JsonIgnore  // ⚠️ OBLIGATORIO
    private String passwordHash;
    
    @JsonIgnore  // ⚠️ OBLIGATORIO
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }
}
```

Sin `@JsonIgnore`, Jackson intenta serializar recursivamente causando error 500.

---

## Flujos de Datos Críticos

### 1. Login → Obtención de Usuario → Redirección

**LoginPage (ts)**
```typescript
onSubmit() {
  this.authService.login(email, password).pipe(
    switchMap(() => this.authService.getMe())  // Encadenado automático
  ).subscribe({
    next: (user) => this.redirectBasedOnRole(user.rol),
    error: (err) => this.showError('Credenciales incorrectas')
  });
}
```

**Redirección inteligente**
```typescript
private redirectBasedOnRole(rol: string) {
  switch(rol.toUpperCase()) {
    case 'ADMIN': this.router.navigate(['/admin-dashboard']); break;
    case 'ENTRENADOR': this.router.navigate(['/coach-dashboard']); break;
    case 'JUGADOR': this.router.navigate(['/player-dashboard']); break;
  }
}
```

### 2. Acceso a Endpoint Protegido

**Componente**
```typescript
constructor(private playerService: PlayerService) {}

ngOnInit() {
  this.playerService.getPlayers().subscribe(
    players => this.players = players
  );
}
```

**Servicio**
```typescript
@Injectable({ providedIn: 'root' })
export class PlayerService {
  private apiUrl = environment.apiUrl;  // http://localhost:8080/api (sin barra)
  
  constructor(private http: HttpClient) {}
  
  getPlayers(): Observable<Jugador[]> {
    return this.http.get<Jugador[]>(`${this.apiUrl}/jugadores`);
  }
}
```

**Interceptor (automático)**
```typescript
intercept(req: HttpRequest<any>, next: HttpHandler) {
  const token = this.storage.getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }  // ✅ Automático
    });
  }
  return next.handle(req);
}
```

**Backend (validación)**
```java
@GetMapping("/api/jugadores")
@PreAuthorize("hasAnyRole('ADMIN', 'ENTRENADOR', 'JUGADOR')")
public List<Jugador> getJugadores() {
  // JWT ya validado por JwtAuthenticationFilter
  return jugadorService.getAll();
}
```

---

## Convenciones y Correcciones Críticas

### ✅ Checklist de Estabilidad v4.1

| Aspecto | Confirmado | Detalles |
|--------|-----------|----------|
| **Token JWT** | ✅ Raw String | StorageService.setToken() sin JSON.stringify() |
| **URL API** | ✅ Slash Rule | environment sin barra; servicios con barra inicial |
| **@JsonIgnore** | ✅ Implementado | Usuario.java ignora passwordHash y getAuthorities() |
| **Redirección** | ✅ Rutas Planas | /admin-dashboard, /coach-dashboard, /player-dashboard |
| **AuthGuard** | ✅ Funcional | Protege rutas y guarda returnUrl |
| **AuthInterceptor** | ✅ Automático | Inyecta Bearer token en todas las peticiones |
| **CORS** | ✅ Configurado | localhost:4200 y localhost:8100 permitidos |
| **Base de Datos** | ✅ NeonDB | PostgreSQL cloud, credenciales en application.properties |

### 🚫 Prohibiciones Críticas

```typescript
// ❌ NUNCA HAGAS ESTO
localStorage.setItem('token', JSON.stringify(token));    // ¡PROHIBIDO!
environment.apiUrl = 'http://localhost:8080/api/';       // ¡PROHIBIDO!
authReq.clone({ setHeaders: { 'Authorization': token }}); // ¡PROHIBIDO! (falta "Bearer ")
```

---

## Guía de Instalación y Ejecución

### Requisitos Previos

- **Java 22 JDK** - Descargar desde oracle.com o adoptopenjdk.com
- **Node.js 18+** - Incluye npm
- **Git** - Control de versiones
- **IDE:**
  - Backend: IntelliJ IDEA Community (recomendado)
  - Frontend: Visual Studio Code o IntelliJ
- **Conexión a Internet** - Para conectar con NeonDB

### Backend (Spring Boot 3)

**1. Abrir proyecto**
```bash
cd src/backend-tfg
# Abrir en IntelliJ IDEA
```

**2. Configurar NeonDB**

Editar `src/main/resources/application.properties`:
```properties
spring.datasource.url=postgresql://user:password@host:5432/database
spring.datasource.username=user
spring.datasource.password=password
app.jwt.secret=MinoClave32CaracteresAleatoriossssss
```

**3. Ejecutar**

En IntelliJ:
- Clic en "Run" → "BackendTfgApplication"
- O presionar `Shift + F10`

En terminal:
```bash
mvn spring-boot:run
```

**4. Verificar**

Acceder a: `http://localhost:8080/swagger-ui/index.html`

Deberías ver la documentación interactiva de la API.

### Frontend (Angular/Ionic)

**1. Instalar dependencias**
```bash
cd src/frontend-tfg
npm install
```

**2. Actualizar environment**

Verificar `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'  // ✅ Sin barra final
};
```

**3. Ejecutar**
```bash
ng serve
# o
ionic serve
```

**4. Acceder**

Abrir navegador: `http://localhost:4200`

O dispositivo móvil: `http://[tu-ip-local]:4200` (ej: `http://192.168.1.100:4200`)

---

## Roadmap y Próximos Pasos

### 🎯 Fase 2: Datos Reales (En Progreso - 19/12/2025)

**Objetivos:**

1. ✅ **Poblar Equipos**
   - Crear 2-3 equipos de prueba vía Swagger o script SQL
   - Verificar visualización en Dashboard Admin

2. ✅ **Poblar Jugadores**
   - Asignar jugadores a equipos
   - Subir avatares vía `/api/media/upload`

3. ✅ **Validar Flujos Completos**
   - Login → Dashboard → Listar equipos/jugadores
   - Verificar permisos por rol

4. 🔄 **Gestión de Entrenamientos**
   - Crear entrenamientos (solo Entrenador)
   - Visualizar en Dashboard

### 📋 Fase 3: Features Avanzadas (Planificado Q1 2025)

- [ ] Refresh Token automático
- [ ] Estadísticas de jugadores (goles, asistencias)
- [ ] Sistema de convocatorias
- [ ] Chat en directo (WebSocket)
- [ ] Notificaciones push
- [ ] Exportar reportes (PDF)
- [ ] PWA (Progressive Web App)

### 🚀 Fase 4: Despliegue (Q2 2025)

- [ ] Hosting Backend (AWS, Azure, Render)
- [ ] Hosting Frontend (Vercel, Netlify)
- [ ] Custom domain
- [ ] Certificado SSL
- [ ] CI/CD con GitHub Actions

---

## 📞 Información de Contacto

**Autor:** Sergio Estudillo

**Programa:** 2º DAM (Desarrollo de Aplicaciones Multiplataforma)

**Centro:** [Institución educativa]

**Período:** Curso 2024/2025

**Email:** [tu-email]

**GitHub:** [tu-repositorio]

---

**Documentación Actualizada a v4.1 - 19/12/2025**

**Estado:** ✅ Backend + Frontend INTEGRADOS. JWT ESTABLE. Lista para Fase 2 (datos reales).

**Versión Anterior:** v4.0 (Backend finalizado sin integración frontend)

**Próxima Actualización:** Tras poblar datos reales y validar Fase 2.
