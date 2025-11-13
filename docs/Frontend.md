# Frontend - Documentación Técnica Completa

## Índice

1. [Introducción y Contexto](#introducción-y-contexto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura General](#arquitectura-general)
4. [Estructura de Módulos](#estructura-de-módulos)
5. [Servicios Core](#servicios-core)
6. [Guards e Interceptores](#guards-e-interceptores)
7. [Módulo Landing](#módulo-landing)
8. [Gestión de Estado y RxJS](#gestión-de-estado-y-rxjs)
9. [Configuración por Entorno](#configuración-por-entorno)
10. [Patrones y Buenas Prácticas](#patrones-y-buenas-prácticas)
11. [Guía de Desarrollo](#guía-de-desarrollo)
12. [Testing y Validación](#testing-y-validación)

---

## Introducción y Contexto

Este documento describe la arquitectura, estructura y patrones implementados en el frontend de la aplicación de gestión de clubes de fútbol. El frontend está construido con **Angular 16+** e **Ionic 7**, optimizado para dispositivos móviles y responsive en desktop.

### Objetivos del Frontend

- Proporcionar una interfaz intuitiva para gestión de clubes, equipos, jugadores y eventos.
- Consumir la API REST del backend sin redundancias ni acoplamiento.
- Mantener escalabilidad mediante arquitectura modular.
- Garantizar seguridad mediante autenticación JWT y guards de rutas.
- Implementar buenas prácticas de Angular (RxJS, lazy loading, tree-shaking).

### Estado Actual

- ✅ Estructura base configurada
- ✅ Módulo Landing implementado y funcional
- ✅ Routing lazy-loaded en lugar
- 🔄 Servicios API en desarrollo
- 🔄 Sistema de autenticación en desarrollo

---

## Stack Tecnológico

### Dependencias Principales

```json
{
  "dependencies": {
    "@angular/common": "^16.0.0",
    "@angular/compiler": "^16.0.0",
    "@angular/core": "^16.0.0",
    "@angular/forms": "^16.0.0",
    "@angular/platform-browser": "^16.0.0",
    "@angular/platform-browser-dynamic": "^16.0.0",
    "@angular/router": "^16.0.0",
    "@ionic/angular": "^7.0.0",
    "rxjs": "^7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "^0.13.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^16.0.0",
    "@angular/cli": "^16.0.0",
    "@angular/compiler-cli": "^16.0.0",
    "@ionic/app-scripts": "^5.0.0",
    "typescript": "~5.1.0"
  }
}
```

### Herramientas de Desarrollo

- **IDE**: Visual Studio Code / IntelliJ IDEA
- **Package Manager**: npm / yarn
- **Build Tool**: Angular CLI, Ionic CLI
- **Testing**: Jasmine, Karma (planificado)
- **Linting**: ESLint, Prettier

---

## Arquitectura General

### Principios Arquitectónicos

El frontend sigue un patrón **clean architecture** con separación clara de responsabilidades:

```
src/app/
├── core/              # Servicios singleton, guards, interceptores
├── shared/            # Componentes, pipes, directives, modelos reutilizables
└── modules/           # Módulos de features con routing lazy-loaded
```

### Diagrama de Dependencias

```
App Component
    ↓
    ├─ App Routing Module
    │   ├─ Landing Module (lazy)
    │   ├─ Auth Module (lazy)
    │   ├─ Dashboard Module (lazy)
    │   └─ Admin Module (lazy)
    │
    ├─ Core Module (singleton)
    │   ├─ AuthService
    │   ├─ ApiService
    │   ├─ UserService
    │   ├─ TeamService
    │   ├─ AuthGuard
    │   └─ AuthInterceptor
    │
    └─ Shared Module (reutilizable)
        ├─ Components (Header, Footer, Loader)
        ├─ Pipes
        ├─ Directives
        └─ Models/Interfaces
```

### Flujo de Datos

```
Usuario Interactúa
    ↓
Componente Emite Evento
    ↓
Servicio Procesa Lógica
    ↓
ApiService Realiza Petición HTTP
    ↓
AuthInterceptor Añade Token
    ↓
Backend API Responde
    ↓
AuthInterceptor Procesa Respuesta
    ↓
Servicio Mapea Datos
    ↓
Componente Actualiza Vista
```

---

## Estructura de Módulos

### Convenciones de Nomenclatura

Todas las entidades siguen convenciones de Angular:

- **Módulos**: `*.module.ts` (ej: `landing.module.ts`)
- **Componentes**: `*.component.ts/html/scss` (ej: `hero-section.component.ts`)
- **Servicios**: `*.service.ts` (ej: `auth.service.ts`)
- **Rutas**: `*-routing.module.ts` (ej: `landing-routing.module.ts`)
- **Pipes**: `*.pipe.ts` (ej: `role-format.pipe.ts`)
- **Directivas**: `*.directive.ts` (ej: `has-role.directive.ts`)
- **Interfaces**: `*.interface.ts` o `*.model.ts` (ej: `user.interface.ts`)

### Organización de Módulos Feature

Cada módulo feature sigue esta estructura:

```
feature-name/
├── feature-name.module.ts              # Declaración de módulo
├── feature-name-routing.module.ts      # Rutas locales
├── pages/                              # Páginas/Componentes principales
│   └── feature-name-page/
│       ├── feature-name-page.component.ts
│       ├── feature-name-page.component.html
│       └── feature-name-page.component.scss
├── components/                         # Componentes secundarios
│   └── sub-component/
│       ├── sub-component.component.ts
│       ├── sub-component.component.html
│       └── sub-component.component.scss
└── services/                           # Servicios locales (si aplica)
    └── feature.service.ts
```

### Lazy Loading Configuration

El routing raíz implementa lazy loading para cada módulo:

```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'landing',
    loadChildren: () => import('./modules/landing/landing.module')
      .then(m => m.LandingModule)
    // El módulo se carga solo cuando se navega a /landing
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module')
      .then(m => m.AuthModule)
  }
];
```

### Beneficios del Lazy Loading

- **Reducción de tamaño de bundle inicial**: Solo se cargan módulos necesarios.
- **Mejora de rendimiento**: Carga diferida en tiempo de ejecución.
- **Escalabilidad**: Nuevos módulos no impactan performance actual.

---

## Servicios Core

### Ubicación

Todos los servicios core están centralizados en `src/app/core/services/` y se proporcionan en el inyector raíz usando `providedIn: 'root'`.

### 1. ApiService (Base HTTP Client)

**Archivo:** `src/app/core/services/api/api.service.ts`

**Responsabilidad:** Cliente HTTP base para todas las peticiones REST.

**Características:**
- Gestión centralizada de URLs base (por entorno)
- Métodos genéricos: GET, POST, PUT, DELETE
- Manejo de errores uniforme
- Logging de peticiones/respuestas

**Interfaz:**

```typescript
export class ApiService {
  // URL base configurada desde environment
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Realiza petición GET
   */
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`);
  }

  /**
   * Realiza petición POST
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body);
  }

  /**
   * Realiza petición PUT
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body);
  }

  /**
   * Realiza petición DELETE
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`);
  }
}
```

**Uso en Servicios:**

```typescript
@Injectable({ providedIn: 'root' })
export class TeamService {
  constructor(private api: ApiService) {}

  getTeams(): Observable<Equipo[]> {
    return this.api.get<Equipo[]>('/equipos');
  }

  getTeamById(id: number): Observable<Equipo> {
    return this.api.get<Equipo>(`/equipos/${id}`);
  }
}
```

### 2. AuthService (Autenticación y JWT)

**Archivo:** `src/app/core/services/auth/auth.service.ts`

**Responsabilidad:** Gestión de autenticación, tokens JWT y estado de usuario logeado.

**Características:**
- Almacenamiento seguro de tokens (localStorage/sessionStorage)
- Métodos: login(), register(), logout()
- Observable de usuario autenticado
- Validación de tokens (expiración, etc.)
- Recuperación de contraseña

**Interfaz:**

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<Usuario | null>(null);
  private token$ = new BehaviorSubject<string | null>(null);

  constructor(
    private api: ApiService,
    private storage: LocalStorageService
  ) {
    this.loadStoredToken();
  }

  /**
   * Login con email/contraseña
   * @returns Observable con token JWT
   */
  login(email: string, password: string): Observable<{ token: string }> {
    return this.api.post('/auth/login', { email, password }).pipe(
      tap(response => {
        this.storage.setToken(response.token);
        this.token$.next(response.token);
      })
    );
  }

  /**
   * Registro de nuevo usuario
   */
  register(userData: RegistroDto): Observable<{ token: string }> {
    return this.api.post('/auth/register', userData).pipe(
      tap(response => {
        this.storage.setToken(response.token);
        this.token$.next(response.token);
      })
    );
  }

  /**
   * Logout: limpia token y estado
   */
  logout(): void {
    this.storage.removeToken();
    this.token$.next(null);
    this.currentUser$.next(null);
  }

  /**
   * Obtiene usuario actual desde backend
   */
  getMe(): Observable<Usuario> {
    return this.api.get<Usuario>('/usuarios/me').pipe(
      tap(user => this.currentUser$.next(user))
    );
  }

  /**
   * Verifica si hay token válido
   */
  isAuthenticated(): boolean {
    const token = this.storage.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Observable del usuario actual
   */
  getCurrentUser(): Observable<Usuario | null> {
    return this.currentUser$.asObservable();
  }

  /**
   * Observable del token
   */
  getToken(): Observable<string | null> {
    return this.token$.asObservable();
  }

  private isTokenExpired(token: string): boolean {
    // Lógica para verificar expiración del JWT
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  private loadStoredToken(): void {
    const token = this.storage.getToken();
    if (token && !this.isTokenExpired(token)) {
      this.token$.next(token);
    }
  }
}
```

### 3. UserService (Gestión de Usuarios)

**Archivo:** `src/app/core/services/user/user.service.ts`

**Responsabilidad:** CRUD de usuarios y perfiles.

**Interfaz:**

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  /**
   * Obtener usuario por ID
   */
  getUserById(id: number): Observable<Usuario> {
    return this.api.get<Usuario>(`/usuarios/${id}`);
  }

  /**
   * Actualizar perfil de usuario
   */
  updateProfile(id: number, userData: Partial<Usuario>): Observable<Usuario> {
    return this.api.put<Usuario>(`/usuarios/${id}`, userData);
  }

  /**
   * Cambiar contraseña
   */
  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.api.post<void>('/usuarios/change-password', {
      currentPassword,
      newPassword
    });
  }

  /**
   * Listar todos los usuarios (solo admin)
   */
  listAllUsers(): Observable<Usuario[]> {
    return this.api.get<Usuario[]>('/usuarios');
  }
}
```

### 4. TeamService (Gestión de Equipos)

**Archivo:** `src/app/core/services/team/team.service.ts`

**Responsabilidad:** CRUD de equipos y operaciones relacionadas.

**Interfaz:**

```typescript
@Injectable({ providedIn: 'root' })
export class TeamService {
  constructor(private api: ApiService) {}

  /**
   * Obtener todos los equipos con filtros opcionales
   */
  getTeams(filters?: TeamFilters): Observable<Equipo[]> {
    let params = new HttpParams();
    if (filters?.categoria) {
      params = params.set('categoria', filters.categoria);
    }
    if (filters?.liga) {
      params = params.set('liga', filters.liga);
    }
    return this.api.get<Equipo[]>('/equipos');
  }

  /**
   * Obtener equipo por ID (con jugadores y entrenadores)
   */
  getTeamById(id: number): Observable<Equipo> {
    return this.api.get<Equipo>(`/equipos/${id}`);
  }

  /**
   * Crear nuevo equipo (admin)
   */
  createTeam(teamData: EquipoDto): Observable<Equipo> {
    return this.api.post<Equipo>('/equipos', teamData);
  }

  /**
   * Actualizar equipo (admin)
   */
  updateTeam(id: number, teamData: Partial<EquipoDto>): Observable<Equipo> {
    return this.api.put<Equipo>(`/equipos/${id}`, teamData);
  }

  /**
   * Eliminar equipo (admin)
   */
  deleteTeam(id: number): Observable<void> {
    return this.api.delete<void>(`/equipos/${id}`);
  }

  /**
   * Obtener equipos por categoría
   */
  getTeamsByCategory(categoryId: number): Observable<Equipo[]> {
    return this.api.get<Equipo[]>(`/equipos/categoria/${categoryId}`);
  }

  /**
   * Obtener equipos destacados para landing page
   */
  getFeaturedTeams(): Observable<Equipo[]> {
    return this.getTeams().pipe(
      map(teams => teams.slice(0, 6)) // Top 6 equipos
    );
  }
}
```

### 5. SolicitudService (Gestión de Inscripciones)

**Archivo:** `src/app/core/services/solicitud/solicitud.service.ts`

**Responsabilidad:** CRUD de solicitudes de inscripción.

**Interfaz:**

```typescript
@Injectable({ providedIn: 'root' })
export class SolicitudService {
  constructor(private api: ApiService) {}

  /**
   * Crear solicitud de inscripción
   */
  createSolicitud(data: SolicitudInscripcionDto): Observable<SolicitudInscripcion> {
    return this.api.post<SolicitudInscripcion>('/solicitudinscripcion', data);
  }

  /**
   * Obtener mis solicitudes (usuario actual)
   */
  getMySolicitudes(): Observable<SolicitudInscripcion[]> {
    return this.api.get<SolicitudInscripcion[]>('/solicitudinscripcion/mis-solicitudes');
  }

  /**
   * Obtener solicitudes de un usuario (admin)
   */
  getUserSolicitudes(userId: number): Observable<SolicitudInscripcion[]> {
    return this.api.get<SolicitudInscripcion[]>(`/solicitudinscripcion/usuario/${userId}`);
  }

  /**
   * Obtener todas las solicitudes pendientes (admin)
   */
  getPendingSolicitudes(): Observable<SolicitudInscripcion[]> {
    return this.api.get<SolicitudInscripcion[]>('/solicitudinscripcion/pendientes');
  }

  /**
   * Aprobar solicitud (admin)
   */
  approveSolicitud(id: number): Observable<SolicitudInscripcion> {
    return this.api.put<SolicitudInscripcion>(`/solicitudinscripcion/${id}/aprobar`, {});
  }

  /**
   * Rechazar solicitud (admin)
   */
  rejectSolicitud(id: number, reason: string): Observable<SolicitudInscripcion> {
    return this.api.put<SolicitudInscripcion>(`/solicitudinscripcion/${id}/rechazar`, { reason });
  }
}
```

### 6. LocalStorageService (Persistencia)

**Archivo:** `src/app/core/services/storage/local-storage.service.ts`

**Responsabilidad:** Gestión segura de almacenamiento local (tokens, preferencias).

**Interfaz:**

```typescript
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  private readonly PREFERENCES_KEY = 'user_preferences';

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  setCurrentUser(user: Usuario): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getCurrentUser(): Usuario | null {
    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  removeCurrentUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  setPreferences(preferences: any): void {
    localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
  }

  getPreferences(): any {
    const stored = localStorage.getItem(this.PREFERENCES_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  clear(): void {
    localStorage.clear();
  }
}
```

---

## Guards e Interceptores

### AuthGuard (Protección de Rutas)

**Archivo:** `src/app/core/guards/auth.guard.ts`

Previene acceso a rutas protegidas sin autenticación.

```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.auth.isAuthenticated()) {
      return true;
    }

    // Redirigir a login
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
```

**Uso en Routing:**

```typescript
{
  path: 'dashboard',
  loadChildren: () => import('./modules/dashboard/dashboard.module')
    .then(m => m.DashboardModule),
  canActivate: [AuthGuard]
}
```

### RoleGuard (Protección por Rol)

**Archivo:** `src/app/core/guards/role.guard.ts`

Restringe acceso según rol de usuario.

```typescript
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const requiredRoles = route.data['roles'] as string[];
    const currentUser = this.auth.getCurrentUserSync(); // O usar subscribe

    if (!currentUser || !requiredRoles.includes(currentUser.rol)) {
      this.router.navigate(['/403-forbidden']);
      return false;
    }

    return true;
  }
}
```

**Uso:**

```typescript
{
  path: 'admin',
  loadChildren: () => import('./modules/admin/admin.module')
    .then(m => m.AdminModule),
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['ADMIN'] }
}
```

### AuthInterceptor (Token en Headers)

**Archivo:** `src/app/core/interceptors/auth.interceptor.ts`

Añade token JWT automáticamente a todas las peticiones HTTP.

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private storage: LocalStorageService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.storage.getToken();

    // Clonar request y añadir header Authorization
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar errores de autenticación
        if (error.status === 401) {
          this.auth.logout();
          // Redirigir a login
        }
        return throwError(() => error);
      })
    );
  }
}
```

**Registro en AppModule:**

```typescript
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  }
]
```

---

## Módulo Landing

### Descripción General

El módulo Landing es la primera página que ve el usuario. Proporciona información sobre el club, catálogo de equipos y llamadas a la acción (CTA) para registro/login.

### Estructura Implementada

```
landing/
├── landing.module.ts
├── landing-routing.module.ts
├── pages/
│   └── landing/
│       ├── landing.page.ts
│       ├── landing.page.html
│       └── landing.page.scss
└── components/
    ├── hero-section/
    │   ├── hero-section.component.ts
    │   ├── hero-section.component.html
    │   └── hero-section.component.scss
    └── team-card/
        ├── team-card.component.ts
        ├── team-card.component.html
        └── team-card.component.scss
```

### Módulo Landing (landing.module.ts)

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LandingRoutingModule } from './landing-routing.module';
import { LandingPage } from './pages/landing/landing.page';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { TeamCardComponent } from './components/team-card/team-card.component';

@NgModule({
  declarations: [
    LandingPage,
    HeroSectionComponent,
    TeamCardComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    LandingRoutingModule
  ]
})
export class LandingModule { }
```

### Routing del Módulo (landing-routing.module.ts)

```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPage } from './pages/landing/landing.page';

const routes: Routes = [
  {
    path: '',
    component: LandingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule { }
```

### Página Principal (landing.page.ts)

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TeamService } from 'src/app/core/services/team/team.service';
import { Equipo } from 'src/app/shared/models/equipo.interface';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss']
})
export class LandingPage implements OnInit {
  featuredTeams$: Observable<Equipo[]>;
  isLoading = true;

  constructor(
    private teamService: TeamService,
    private router: Router
  ) {
    this.featuredTeams$ = this.teamService.getFeaturedTeams();
  }

  ngOnInit(): void {
    // Cargar equipos destacados
    this.featuredTeams$.subscribe(() => {
      this.isLoading = false;
    });
  }

  onRegisterClick(): void {
    this.router.navigate(['/auth/register']);
  }

  onLoginClick(): void {
    this.router.navigate(['/auth/login']);
  }

  onViewAllTeams(): void {
    this.router.navigate(['/teams']);
  }

  trackByTeamId(index: number, team: Equipo): number {
    return team.id;
  }
}
```

### Plantilla Landing (landing.page.html)

```html
<ion-content class="landing-content">
  <!-- Hero Section -->
  <app-hero-section 
    (onRegisterClick)="onRegisterClick()"
    (onLoginClick)="onLoginClick()">
  </app-hero-section>

  <!-- About Section -->
  <ion-section class="about-section">
    <ion-grid>
      <ion-row>
        <ion-col size="12" sizeMd="6">
          <h2>Sobre Nuestro Club</h2>
          <p>
            Somos un club de fútbol profesional dedicado a la formación de 
            jóvenes talentos. Con más de 20 años de trayectoria, hemos 
            desarrollado jugadores de nivel nacional e internacional.
          </p>
        </ion-col>
        <ion-col size="12" sizeMd="6">
          <ion-img src="assets/images/about-club.png"></ion-img>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-section>

  <!-- Featured Teams Section -->
  <ion-section class="teams-section">
    <ion-grid>
      <ion-row>
        <ion-col size="12">
          <h2 class="section-title">Nuestros Equipos</h2>
        </ion-col>
      </ion-row>
      
      <!-- Loading State -->
      <ion-row *ngIf="isLoading" class="ion-text-center">
        <ion-col size="12">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </ion-col>
      </ion-row>

      <!-- Teams Grid -->
      <ion-row *ngIf="!isLoading" class="teams-grid">
        <ion-col 
          size="12" 
          sizeSm="6" 
          sizeMd="4"
          *ngFor="let team of featuredTeams$ | async; trackBy: trackByTeamId">
          <app-team-card [team]="team"></app-team-card>
        </ion-col>
      </ion-row>

      <!-- CTA Button -->
      <ion-row class="ion-margin-top">
        <ion-col size="12" class="ion-text-center">
          <ion-button 
            size="large" 
            color="primary"
            (click)="onViewAllTeams()">
            Ver Todos los Equipos
          </ion-button>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-section>

  <!-- Stats Section -->
  <ion-section class="stats-section">
    <ion-grid>
      <ion-row>
        <ion-col size="6" sizeSm="3" class="stat-item">
          <div class="stat-number">50+</div>
          <div class="stat-label">Equipos</div>
        </ion-col>
        <ion-col size="6" sizeSm="3" class="stat-item">
          <div class="stat-number">1000+</div>
          <div class="stat-label">Jugadores</div>
        </ion-col>
        <ion-col size="6" sizeSm="3" class="stat-item">
          <div class="stat-number">20+</div>
          <div class="stat-label">Años</div>
        </ion-col>
        <ion-col size="6" sizeSm="3" class="stat-item">
          <div class="stat-number">15</div>
          <div class="stat-label">Trofeos</div>
        </ion-col>
      </ion-row>
    </ion-grid>
  </ion-section>
</ion-content>
```

### HeroSectionComponent

```typescript
// hero-section.component.ts
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  @Output() onRegisterClick = new EventEmitter<void>();
  @Output() onLoginClick = new EventEmitter<void>();

  handleRegister(): void {
    this.onRegisterClick.emit();
  }

  handleLogin(): void {
    this.onLoginClick.emit();
  }
}
```

```html
<!-- hero-section.component.html -->
<ion-card class="hero-card">
  <ion-card-header>
    <ion-card-title class="hero-title">
      Bienvenido al DAM United FC
    </ion-card-title>
  </ion-card-header>
  <ion-card-content class="hero-content">
    <h2>Gestiona tu club de fútbol de forma profesional</h2>
    <p>
      Plataforma completa para administración de equipos, jugadores, 
      entrenadores y eventos deportivos.
    </p>
    <div class="button-group">
      <ion-button 
        expand="block" 
        color="success"
        (click)="handleRegister()">
        Regístrate Ahora
      </ion-button>
      <ion-button 
        expand="block" 
        fill="outline"
        color="primary"
        (click)="handleLogin()">
        Iniciar Sesión
      </ion-button>
    </div>
  </ion-card-content>
</ion-card>
```

### TeamCardComponent

```typescript
// team-card.component.ts
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Equipo } from 'src/app/shared/models/equipo.interface';

@Component({
  selector: 'app-team-card',
  templateUrl: './team-card.component.html',
  styleUrls: ['./team-card.component.scss']
})
export class TeamCardComponent {
  @Input() team!: Equipo;

  constructor(private router: Router) {}

  viewTeamDetails(): void {
    this.router.navigate(['/teams', this.team.id]);
  }
}
```

```html
<!-- team-card.component.html -->
<ion-card class="team-card">
  <ion-card-header>
    <ion-card-title class="team-name">{{ team.nombre }}</ion-card-title>
    <ion-card-subtitle>{{ team.categoria.nombre }}</ion-card-subtitle>
  </ion-card-header>
  <ion-card-content>
    <div class="team-info">
      <div class="info-item">
        <span class="label">Liga:</span>
        <span class="value">{{ team.liga.nombre }}</span>
      </div>
      <div class="info-item">
        <span class="label">Categoria:</span>
        <span class="value">{{ team.categoria.rangoEdadMin }}-{{ team.categoria.rangoEdadMax }}</span>
      </div>
    </div>
    <ion-button 
      expand="block" 
      size="small"
      (click)="viewTeamDetails()">
      Ver Detalles
    </ion-button>
  </ion-card-content>
</ion-card>
```

---

## Gestión de Estado y RxJS

### Patrones Observable

#### 1. BehaviorSubject para Estado Compartido

```typescript
// auth.service.ts
export class AuthService {
  private currentUser$ = new BehaviorSubject<Usuario | null>(null);

  constructor(private api: ApiService) {}

  getMe(): Observable<Usuario> {
    return this.api.get<Usuario>('/usuarios/me').pipe(
      tap(user => this.currentUser$.next(user))
    );
  }

  getCurrentUser(): Observable<Usuario | null> {
    return this.currentUser$.asObservable();
  }
}
```

**Uso en componentes:**

```typescript
export class ProfileComponent implements OnInit {
  currentUser$: Observable<Usuario | null>;

  constructor(private auth: AuthService) {
    this.currentUser$ = this.auth.getCurrentUser();
  }

  ngOnInit(): void {
    // El observable se actualiza automáticamente
  }
}
```

**En template con async pipe:**

```html
<div *ngIf="(currentUser$ | async) as user; else loading">
  <p>Bienvenido {{ user.nombre }}</p>
</div>

<ng-template #loading>
  <p>Cargando...</p>
</ng-template>
```

#### 2. Operadores RxJS Comunes

**switchMap** - Cambiar entre observables:

```typescript
loadTeamWithPlayers(teamId: number): Observable<Equipo> {
  return this.teamService.getTeamById(teamId).pipe(
    switchMap(team => 
      this.playerService.getPlayersInTeam(team.id).pipe(
        map(players => ({ ...team, players }))
      )
    )
  );
}
```

**map** - Transformar datos:

```typescript
getTeamsWithStats(): Observable<EquipoConStats[]> {
  return this.api.get<Equipo[]>('/equipos').pipe(
    map(teams => teams.map(team => ({
      ...team,
      playerCount: team.jugadores.length,
      trainerCount: team.entrenadores.length
    })))
  );
}
```

**filter** - Filtrar valores:

```typescript
getApprovedRequests(): Observable<SolicitudInscripcion[]> {
  return this.api.get<SolicitudInscripcion[]>('/solicitudinscripcion').pipe(
    map(requests => requests.filter(r => r.estado === 'APROBADA'))
  );
}
```

**catchError** - Manejo de errores:

```typescript
getTeams(): Observable<Equipo[]> {
  return this.api.get<Equipo[]>('/equipos').pipe(
    catchError(error => {
      console.error('Error fetching teams:', error);
      return of([]); // Retornar array vacío en caso de error
    })
  );
}
```

**combineLatest** - Combinar múltiples observables:

```typescript
getDashboardData(): Observable<DashboardData> {
  return combineLatest([
    this.userService.getMe(),
    this.teamService.getFeaturedTeams(),
    this.solicitudService.getMySolicitudes()
  ]).pipe(
    map(([user, teams, solicitudes]) => ({
      user,
      teams,
      solicitudes
    }))
  );
}
```

#### 3. Unsubscribe Pattern

**Usar takeUntil para limpiar suscripciones:**

```typescript
export class TeamListComponent implements OnInit, OnDestroy {
  teams$: Observable<Equipo[]>;
  private destroy$ = new Subject<void>();

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.teams$ = this.teamService.getTeams().pipe(
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## Configuración por Entorno

### Environment Files

**src/environments/environment.ts (Desarrollo):**

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  logLevel: 'debug',
  tokenKey: 'auth_token'
};
```

**src/environments/environment.prod.ts (Producción):**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.damunited.com/api',
  logLevel: 'error',
  tokenKey: 'auth_token'
};
```

**Uso en servicios:**

```typescript
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`);
  }
}
```

### Build Configuration

**angular.json:**

```json
{
  "projects": {
    "frontend-tfg": {
      "architect": {
        "build": {
          "configurations": {
            "development": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.ts"
                }
              ]
            },
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

**Build para producción:**

```bash
ng build --configuration production
```

---

## Patrones y Buenas Prácticas

### 1. Smart vs Presentational Components

**Smart Components (Contenedores):**
- Manejan lógica y estado
- Se conectan a servicios
- Cargan datos

```typescript
// team-list.component.ts (Smart)
export class TeamListComponent implements OnInit {
  teams$: Observable<Equipo[]>;

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    this.teams$ = this.teamService.getTeams();
  }
}
```

**Presentational Components (Dumb):**
- Solo reciben datos vía @Input
- Emiten eventos vía @Output
- No tienen lógica

```typescript
// team-card.component.ts (Presentational)
@Component({
  selector: 'app-team-card',
  template: '...'
})
export class TeamCardComponent {
  @Input() team!: Equipo;
  @Output() viewDetails = new EventEmitter<number>();

  onViewDetails(): void {
    this.viewDetails.emit(this.team.id);
  }
}
```

### 2. OnPush Change Detection

```typescript
@Component({
  selector: 'app-team-card',
  templateUrl: './team-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamCardComponent {
  @Input() team!: Equipo;
}
```

**Beneficios:**
- Mejor rendimiento
- Evita checks innecesarios
- Más predecible

### 3. Strict Mode TypeScript

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true
  }
}
```

### 4. Naming Conventions

| Entidad | Convención | Ejemplo |
|---------|-----------|---------|
| Módulo | camelCase + Module | `landingModule.ts` |
| Componente | kebab-case en archivos | `hero-section.component.ts` |
| Clase Componente | PascalCase + Component | `HeroSectionComponent` |
| Servicio | camelCase + Service | `teamService.ts` |
| Clase Servicio | PascalCase + Service | `TeamService` |
| Pipe | camelCase + Pipe | `rolePipe.ts` |
| Guard | camelCase + Guard | `authGuard.ts` |
| Interface | PascalCase + Interface | `Equipo.interface.ts` |

### 5. Error Handling

**En servicios:**

```typescript
getTeams(): Observable<Equipo[]> {
  return this.api.get<Equipo[]>('/equipos').pipe(
    catchError(error => {
      const errorMsg = error.error?.message || 'Error desconocido';
      this.notificationService.showError(errorMsg);
      return throwError(() => error);
    })
  );
}
```

**En componentes:**

```typescript
loadTeams(): void {
  this.isLoading = true;
  this.teamService.getTeams().subscribe({
    next: (teams) => {
      this.teams = teams;
      this.isLoading = false;
    },
    error: (error) => {
      this.error = 'No se pudieron cargar los equipos';
      this.isLoading = false;
      console.error(error);
    }
  });
}
```

---

## Guía de Desarrollo

### Crear Nuevo Módulo Feature

```bash
# Generar módulo con Angular CLI
ng generate module modules/teams --routing

# Estructura generada:
# src/app/modules/teams/
# ├── teams-routing.module.ts
# └── teams.module.ts
```

**Editar teams.module.ts:**

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { TeamsRoutingModule } from './teams-routing.module';
import { TeamsPage } from './pages/teams/teams.page';
import { TeamDetailComponent } from './components/team-detail/team-detail.component';

@NgModule({
  declarations: [
    TeamsPage,
    TeamDetailComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    TeamsRoutingModule
  ]
})
export class TeamsModule { }
```

**Registrar en app-routing.module.ts:**

```typescript
const routes: Routes = [
  {
    path: 'teams',
    loadChildren: () => import('./modules/teams/teams.module')
      .then(m => m.TeamsModule)
  }
];
```

### Crear Componente

```bash
# Generar componente dentro de un módulo
ng generate component modules/teams/pages/teams

# Genera:
# src/app/modules/teams/pages/teams/
# ├── teams.component.ts
# ├── teams.component.html
# ├── teams.component.scss
# └── teams.component.spec.ts
```

### Crear Servicio

```bash
# Generar servicio en core
ng generate service core/services/team/team

# Genera:
# src/app/core/services/team/
# ├── team.service.ts
# └── team.service.spec.ts
```

---

## Testing y Validación

### Unit Testing con Jasmine

**Archivo de test básico:**

```typescript
// team.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } 
  from '@angular/common/http/testing';
import { TeamService } from './team.service';
import { ApiService } from '../api/api.service';

describe('TeamService', () => {
  let service: TeamService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeamService, ApiService]
    });
    service = TestBed.inject(TeamService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch teams', () => {
    const mockTeams = [
      { id: 1, nombre: 'Team A', categoria: {}, liga: {} }
    ];

    service.getTeams().subscribe(teams => {
      expect(teams.length).toBe(1);
      expect(teams[0].nombre).toBe('Team A');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/equipos');
    expect(req.request.method).toBe('GET');
    req.flush(mockTeams);
  });
});
```

### Ejecución de Tests

```bash
# Ejecutar todos los tests
ng test

# Ejecutar tests con coverage
ng test --code-coverage

# Ejecutar tests específicos
ng test --include='**/team.service.spec.ts'
```

### Linting con ESLint

```bash
# Verificar código
ng lint

# Corregir automáticamente
ng lint --fix
```

---

**Documentación actualizada: 13/11/2025**  
**Para información del backend, consulta `backend.md`**