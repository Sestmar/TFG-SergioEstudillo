# Frontend - Documentación Técnica Completa (Actualizada)

## Índice

1. [Estructura General del Proyecto](#estructura-general-del-proyecto)
2. [Stack Tecnológico y Dependencias](#stack-tecnológico-y-dependencias)
3. [Arquitectura General](#arquitectura-general)
4. [Core Module - Servicios, Guards e Interceptores](#core-module---servicios-guards-e-interceptores)
5. [Shared Module](#shared-module)
6. [Módulos Feature](#módulos-feature)
7. [Gestión de Estado con RxJS](#gestión-de-estado-con-rxjs)
8. [Configuración por Entorno](#configuración-por-entorno)
9. [Patrones y Buenas Prácticas](#patrones-y-buenas-prácticas)
10. [Guía de Desarrollo](#guía-de-desarrollo)

---

## Estructura General del Proyecto

### Árbol de Directorios Completo

```
frontend/
├── .angular/                          # Cache Angular CLI
├── .vscode/                           # Configuración VSCode
├── node_modules/                      # Dependencias npm
├── src/
│   ├── app/
│   │   ├── core/                      # Módulo Core - Servicios singleton
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts             # Guard autenticación
│   │   │   │   ├── no-auth.guard.ts          # Guard no autenticados
│   │   │   │   ├── role.guard.ts             # Guard por roles
│   │   │   │   └── index.ts                  # Barril de exports
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts       # Interceptor JWT
│   │   │   │   ├── error.interceptor.ts      # Interceptor errores HTTP
│   │   │   │   └── index.ts                  # Barril de exports
│   │   │   └── services/
│   │   │       ├── api/
│   │   │       │   └── api.service.ts        # Cliente HTTP base
│   │   │       ├── auth/
│   │   │       │   └── auth.service.ts       # Autenticación JWT
│   │   │       ├── user/
│   │   │       │   └── user.service.ts       # Gestión usuarios
│   │   │       ├── team/
│   │   │       │   └── team.service.ts       # Gestión equipos
│   │   │       ├── player/
│   │   │       │   └── player.service.ts     # Gestión jugadores
│   │   │       ├── request/
│   │   │       │   └── request.service.ts    # Solicitudes inscripción
│   │   │       ├── convocation/
│   │   │       │   └── convocation.service.ts # Convocatorias
│   │   │       ├── incident/
│   │   │       │   └── incident.service.ts   # Incidencias
│   │   │       ├── notification/
│   │   │       │   └── notification.service.ts # Notificaciones
│   │   │       ├── storage/
│   │   │       │   └── storage.service.ts    # Almacenamiento local
│   │   │       ├── state/
│   │   │       │   ├── team-state.service.ts # Estado global equipos
│   │   │       │   ├── user-state.service.ts # Estado global usuarios
│   │   │       │   └── index.ts              # Barril de exports
│   │   │       └── index.ts                  # Barril de exports servicios
│   │   │
│   │   ├── shared/                   # Módulo Shared - Componentes reutilizables
│   │   │   ├── components/           # (Expandir según componentes comunes)
│   │   │   ├── pipes/                # (Pipes personalizados)
│   │   │   ├── directives/           # (Directivas personalizadas)
│   │   │   ├── models/               # Interfaces y tipos
│   │   │   └── shared.module.ts      # Declaración del módulo
│   │   │
│   │   ├── modules/                  # Módulos Feature con lazy loading
│   │   │   ├── landing/
│   │   │   │   ├── components/
│   │   │   │   │   ├── hero-section/
│   │   │   │   │   │   ├── hero-section.component.ts
│   │   │   │   │   │   ├── hero-section.component.html
│   │   │   │   │   │   └── hero-section.component.scss
│   │   │   │   │   └── team-card/
│   │   │   │   │       ├── team-card.component.ts
│   │   │   │   │       ├── team-card.component.html
│   │   │   │   │       └── team-card.component.scss
│   │   │   │   ├── pages/
│   │   │   │   │   └── landing/
│   │   │   │   │       ├── landing.page.ts
│   │   │   │   │       ├── landing.page.html
│   │   │   │   │       └── landing.page.scss
│   │   │   │   ├── landing.module.ts
│   │   │   │   └── landing-routing.module.ts
│   │   │   │
│   │   │   ├── auth/                 # Módulo autenticación
│   │   │   │   ├── pages/
│   │   │   │   │   ├── login/        # (Por implementar)
│   │   │   │   │   ├── register/     # (Por implementar)
│   │   │   │   │   └── forgot-password/
│   │   │   │   ├── auth.module.ts
│   │   │   │   └── auth-routing.module.ts
│   │   │   │
│   │   │   ├── dashboard/            # Dashboard usuario general
│   │   │   │   ├── components/
│   │   │   │   │   └── dashboard-card/
│   │   │   │   │       ├── dashboard-card.component.ts
│   │   │   │   │       ├── dashboard-card.component.html
│   │   │   │   │       └── dashboard-card.component.scss
│   │   │   │   ├── pages/
│   │   │   │   │   └── dashboard/
│   │   │   │   │       ├── dashboard.page.ts
│   │   │   │   │       ├── dashboard.page.html
│   │   │   │   │       └── dashboard.page.scss
│   │   │   │   ├── dashboard.module.ts
│   │   │   │   └── dashboard-routing.module.ts
│   │   │   │
│   │   │   ├── admin/                # Panel administrativo
│   │   │   │   ├── pages/
│   │   │   │   │   └── admin-dashboard/
│   │   │   │   │       ├── admin-dashboard.page.ts
│   │   │   │   │       └── admin-dashboard.page.html
│   │   │   │   ├── admin.module.ts
│   │   │   │   └── admin-routing.module.ts
│   │   │   │
│   │   │   ├── coach/                # Dashboard entrenador
│   │   │   │   ├── pages/
│   │   │   │   │   └── coach-dashboard/
│   │   │   │   │       ├── coach-dashboard.page.ts
│   │   │   │   │       ├── coach-dashboard.page.html
│   │   │   │   │       └── coach-dashboard.page.scss
│   │   │   │   ├── coach.module.ts
│   │   │   │   └── coach-routing.module.ts
│   │   │   │
│   │   │   ├── players/              # Gestión jugadores
│   │   │   │   ├── pages/
│   │   │   │   │   └── player-dashboard/
│   │   │   │   │       ├── player-dashboard.page.ts
│   │   │   │   │       ├── player-dashboard.page.html
│   │   │   │   │       └── player-dashboard.page.scss
│   │   │   │   ├── players.module.ts
│   │   │   │   └── players-routing.module.ts
│   │   │   │
│   │   │   └── user/                 # Gestión perfil usuario
│   │   │       ├── pages/
│   │   │       │   └── user-dashboard/
│   │   │       │       ├── user-dashboard.page.ts
│   │   │       │       ├── user-dashboard.page.html
│   │   │       │       └── user-dashboard.page.scss
│   │   │       ├── user.module.ts
│   │   │       └── user-routing.module.ts
│   │   │
│   │   ├── app-routing.module.ts     # Enrutamiento principal
│   │   ├── app.component.ts          # Componente raíz
│   │   ├── app.component.html        # Template raíz
│   │   ├── app.component.scss        # Estilos raíz
│   │   └── app.module.ts             # Módulo raíz
│   │
│   ├── environments/                 # Configuración por entorno
│   │   ├── environment.ts            # Desarrollo
│   │   └── environment.prod.ts       # Producción
│   │
│   ├── theme/                        # Estilos globales e Ionic
│   │   ├── variables.scss            # Variables Ionic
│   │   └── global.scss               # Estilos globales
│   │
│   ├── assets/                       # Recursos estáticos
│   │   ├── images/
│   │   ├── icons/
│   │   └── data/
│   │
│   ├── docs/                         # Documentación del frontend
│   │   ├── API_INTEGRATION.md
│   │   └── ARCHITECTURE.md
│   │
│   ├── index.html                    # HTML de entrada
│   ├── main.ts                       # Punto de entrada
│   ├── polyfills.ts                  # Polyfills
│   └── styles.scss                   # Estilos globales (alternativo)
│
├── .editorconfig                     # Config editor
├── .eslintrc.json                    # ESLint config
├── .gitignore                        # Git ignore
├── angular.json                      # Configuración Angular CLI
├── ionic.config.json                 # Configuración Ionic
├── package.json                      # Dependencias npm
├── package-lock.json                 # Lock npm
├── tsconfig.json                     # TypeScript config base
├── tsconfig.app.json                 # TypeScript config app
├── tsconfig.spec.json                # TypeScript config tests
├── IMPLEMENTATION_SUMMARY.md         # Resumen implementación
├── PROJECT_SUMMARY.md                # Resumen proyecto
└── README.md                          # README local frontend
```

### Totales por Categoría

- **Guards:** 4 archivos (auth, no-auth, role + index)
- **Interceptores:** 3 archivos (auth, error + index)
- **Servicios:** 11 servicios principales + 2 de estado + index
- **Módulos Feature:** 7 módulos (landing, auth, dashboard, admin, coach, players, user)
- **Componentes:** 3 en landing + 1 en dashboard = 4 componentes específicos
- **Páginas/Views:** 7 páginas (landing, admin-dashboard, coach-dashboard, player-dashboard, user-dashboard, dashboard general)
- **Configuración:** 7 archivos raíz + environments + theme

---

## Stack Tecnológico y Dependencias

### Versiones Principales

```json
{
  "dependencies": {
    "@angular/animations": "^16.0.0",
    "@angular/common": "^16.0.0",
    "@angular/compiler": "^16.0.0",
    "@angular/core": "^16.0.0",
    "@angular/forms": "^16.0.0",
    "@angular/platform-browser": "^16.0.0",
    "@angular/platform-browser-dynamic": "^16.0.0",
    "@angular/router": "^16.0.0",
    "@ionic/angular": "^7.0.0",
    "@ionic/core": "^7.0.0",
    "ionicons": "^7.1.0",
    "rxjs": "^7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "^0.13.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^16.0.0",
    "@angular/cli": "^16.0.0",
    "@angular/compiler-cli": "^16.0.0",
    "@ionic/app-scripts": "^5.0.0",
    "@types/jasmine": "~4.3.0",
    "jasmine-core": "~4.6.0",
    "karma": "~6.4.0",
    "karma-chrome-launcher": "~3.2.0",
    "karma-coverage": "~2.2.0",
    "karma-jasmine": "~5.1.0",
    "karma-jasmine-html-reporter": "~2.0.0",
    "typescript": "~5.1.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

### Herramientas Principales

| Herramienta | Versión | Propósito |
|-------------|---------|----------|
| Angular CLI | 16+ | Build, serve, generate |
| Ionic CLI | 7+ | Mobile UI components |
| TypeScript | 5.1+ | Tipado estático |
| RxJS | 7.8+ | Programación reactiva |
| Karma/Jasmine | 4.6/6.4 | Testing unitario |
| ESLint | 8+ | Linting código |
| Prettier | 3+ | Code formatting |

---

## Arquitectura General

### Principios de Diseño

El frontend sigue una **arquitectura limpia** basada en separación de responsabilidades:

```
┌─────────────────────────────────────────┐
│         Presentación (Modules)          │
│  Landing│Auth│Dashboard│Admin│Etc      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Shared (Componentes comunes)       │
│    Pipes│Directives│Models│UI Base     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│        Core (Servicios Singleton)       │
│  Auth│API│User│Team│Guards│Interceptor │
└────────────────┬────────────────────────┘
                 │
                 ▼
          Backend API REST
         (Spring Boot)
```

### Flujo de Datos

```
Usuario Interactúa
    ↓
Componente Emite (Click, Submit)
    ↓
Servicio Ejecuta Lógica
    ↓
ApiService Prepara Petición HTTP
    ↓
AuthInterceptor Añade Token JWT
    ↓
ErrorInterceptor Captura Errores
    ↓
Backend REST API Procesa
    ↓
Respuesta Vuelve
    ↓
Servicio Mapea con RxJS
    ↓
Component Recibe vía Observable (async pipe)
    ↓
Vista Se Actualiza
```

### Lazy Loading Strategy

```
app-routing.module.ts
├── landing (precargado frecuentemente)
│   └── carga bajo demanda
├── auth (muy frecuente)
│   └── carga bajo demanda
├── dashboard (protegido AuthGuard)
│   └── carga tras login
├── admin (protegido RoleGuard ADMIN)
│   └── carga si es admin
├── coach (protegido RoleGuard COACH)
│   └── carga si es coach
├── players (protegido AuthGuard)
│   └── carga bajo demanda
└── user (protegido AuthGuard)
    └── carga bajo demanda
```

---

## Core Module - Servicios, Guards e Interceptores

### Organización del Core

```
core/
├── guards/
│   ├── auth.guard.ts          ✅ Protege rutas autenticadas
│   ├── no-auth.guard.ts       ✅ Protege rutas públicas (login, register)
│   ├── role.guard.ts          ✅ Protege por roles específicos
│   └── index.ts               ✅ Barril de exports
├── interceptors/
│   ├── auth.interceptor.ts    ✅ Añade JWT a headers
│   ├── error.interceptor.ts   ✅ Maneja errores HTTP
│   └── index.ts               ✅ Barril de exports
└── services/
    ├── api/
    │   └── api.service.ts     ✅ Cliente HTTP base
    ├── auth/
    │   └── auth.service.ts    ✅ Autenticación JWT
    ├── user/
    │   └── user.service.ts    ✅ Usuarios CRUD
    ├── team/
    │   └── team.service.ts    ✅ Equipos CRUD
    ├── player/
    │   └── player.service.ts  ✅ Jugadores CRUD
    ├── request/
    │   └── request.service.ts ✅ Solicitudes inscripción
    ├── convocation/
    │   └── convocation.service.ts ✅ Convocatorias CRUD
    ├── incident/
    │   └── incident.service.ts   ✅ Incidencias CRUD
    ├── notification/
    │   └── notification.service.ts ✅ Notificaciones
    ├── storage/
    │   └── storage.service.ts ✅ Persistencia local
    ├── state/
    │   ├── team-state.service.ts ✅ Estado global equipos
    │   ├── user-state.service.ts ✅ Estado global usuarios
    │   └── index.ts
    └── index.ts               ✅ Barril de exports
```

### Guards (Protección de Rutas)

#### 1. **auth.guard.ts** - Autenticación requerida

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, 
         Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

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
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }
}
```

#### 2. **no-auth.guard.ts** - Solo usuarios NO autenticados

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.auth.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/dashboard']);
    return false;
  }
}
```

#### 3. **role.guard.ts** - Control por roles

```typescript
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRoles = route.data['roles'] as string[];
    const currentUser = this.auth.getCurrentUserSync();

    if (!currentUser || !requiredRoles.includes(currentUser.rol)) {
      this.router.navigate(['/403-forbidden']);
      return false;
    }
    return true;
  }
}
```

**Uso en rutas:**

```typescript
{
  path: 'admin',
  loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['ADMIN'] }
}
```

### Interceptores HTTP

#### 1. **auth.interceptor.ts** - Gestión de JWT

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, 
         HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { StorageService } from '../services/storage/storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private storage: StorageService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.storage.getToken();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expirado o inválido
          this.auth.logout();
          // Redirigir a login automáticamente
        }
        return throwError(() => error);
      })
    );
  }
}
```

#### 2. **error.interceptor.ts** - Manejo centralizado de errores

```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, 
         HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private notification: NotificationService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMsg = this.getErrorMessage(error);
        this.notification.showError(errorMsg);
        return throwError(() => error);
      })
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      return error.error.message;
    }
    return error.error?.message || `Error: ${error.status}`;
  }
}
```

**Registro en app.module.ts:**

```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
]
```

### Servicios Core

#### 1. **api.service.ts** - Cliente HTTP Base

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    return throwError(() => error);
  }
}
```

#### 2. **auth.service.ts** - Autenticación

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../api/api.service';
import { StorageService } from '../storage/storage.service';
import { Usuario } from 'src/app/shared/models/usuario.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<Usuario | null>(null);
  private isAuthenticated$ = new BehaviorSubject<boolean>(false);

  constructor(
    private api: ApiService,
    private storage: StorageService,
    private http: HttpClient
  ) {
    this.checkStoredToken();
  }

  /**
   * Login con email/contraseña
   */
  login(email: string, password: string): Observable<{ token: string; usuario: Usuario }> {
    return this.api.post('/auth/login', { email, password }).pipe(
      tap(response => {
        this.storage.setToken(response.token);
        this.currentUser$.next(response.usuario);
        this.isAuthenticated$.next(true);
      })
    );
  }

  /**
   * Registro nuevo usuario
   */
  register(userData: any): Observable<{ token: string; usuario: Usuario }> {
    return this.api.post('/auth/register', userData).pipe(
      tap(response => {
        this.storage.setToken(response.token);
        this.currentUser$.next(response.usuario);
        this.isAuthenticated$.next(true);
      })
    );
  }

  /**
   * Logout
   */
  logout(): void {
    this.storage.removeToken();
    this.storage.removeCurrentUser();
    this.currentUser$.next(null);
    this.isAuthenticated$.next(false);
  }

  /**
   * Obtener usuario actual
   */
  getMe(): Observable<Usuario> {
    return this.api.get<Usuario>('/usuarios/me').pipe(
      tap(user => this.currentUser$.next(user))
    );
  }

  /**
   * Verificar autenticación
   */
  isAuthenticated(): boolean {
    return !!this.storage.getToken();
  }

  /**
   * Observable de autenticación
   */
  getIsAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  /**
   * Observable de usuario actual
   */
  getCurrentUser(): Observable<Usuario | null> {
    return this.currentUser$.asObservable();
  }

  /**
   * Get síncrono de usuario (para guards)
   */
  getCurrentUserSync(): Usuario | null {
    return this.currentUser$.value;
  }

  private checkStoredToken(): void {
    const token = this.storage.getToken();
    if (token) {
      this.isAuthenticated$.next(true);
      // Opcionalmente, cargar usuario desde backend
    }
  }
}
```

#### 3. **user.service.ts** - Gestión de Usuarios

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Usuario } from 'src/app/shared/models/usuario.interface';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  getUserById(id: number): Observable<Usuario> {
    return this.api.get<Usuario>(`/usuarios/${id}`);
  }

  updateProfile(id: number, userData: Partial<Usuario>): Observable<Usuario> {
    return this.api.put<Usuario>(`/usuarios/${id}`, userData);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.api.post<void>('/usuarios/change-password', {
      currentPassword,
      newPassword
    });
  }

  listAllUsers(): Observable<Usuario[]> {
    return this.api.get<Usuario[]>('/usuarios');
  }

  deleteUser(id: number): Observable<void> {
    return this.api.delete<void>(`/usuarios/${id}`);
  }
}
```

#### 4. **team.service.ts** - Gestión de Equipos

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../api/api.service';
import { Equipo } from 'src/app/shared/models/equipo.interface';

@Injectable({ providedIn: 'root' })
export class TeamService {
  constructor(private api: ApiService) {}

  getTeams(): Observable<Equipo[]> {
    return this.api.get<Equipo[]>('/equipos');
  }

  getTeamById(id: number): Observable<Equipo> {
    return this.api.get<Equipo>(`/equipos/${id}`);
  }

  createTeam(teamData: Partial<Equipo>): Observable<Equipo> {
    return this.api.post<Equipo>('/equipos', teamData);
  }

  updateTeam(id: number, teamData: Partial<Equipo>): Observable<Equipo> {
    return this.api.put<Equipo>(`/equipos/${id}`, teamData);
  }

  deleteTeam(id: number): Observable<void> {
    return this.api.delete<void>(`/equipos/${id}`);
  }

  getTeamsByCategory(categoryId: number): Observable<Equipo[]> {
    return this.api.get<Equipo[]>(`/equipos/categoria/${categoryId}`);
  }

  getFeaturedTeams(): Observable<Equipo[]> {
    return this.getTeams().pipe(
      map(teams => teams.slice(0, 6))
    );
  }
}
```

#### 5. **player.service.ts** - Gestión de Jugadores

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Jugador } from 'src/app/shared/models/jugador.interface';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  constructor(private api: ApiService) {}

  getPlayers(): Observable<Jugador[]> {
    return this.api.get<Jugador[]>('/jugadores');
  }

  getPlayerById(id: number): Observable<Jugador> {
    return this.api.get<Jugador>(`/jugadores/${id}`);
  }

  getPlayersByTeam(teamId: number): Observable<Jugador[]> {
    return this.api.get<Jugador[]>(`/jugadores/equipo/${teamId}`);
  }

  createPlayer(playerData: Partial<Jugador>): Observable<Jugador> {
    return this.api.post<Jugador>('/jugadores', playerData);
  }

  updatePlayer(id: number, playerData: Partial<Jugador>): Observable<Jugador> {
    return this.api.put<Jugador>(`/jugadores/${id}`, playerData);
  }

  deletePlayer(id: number): Observable<void> {
    return this.api.delete<void>(`/jugadores/${id}`);
  }
}
```

#### 6. **request.service.ts** - Solicitudes de Inscripción

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { SolicitudInscripcion } from 'src/app/shared/models/solicitud.interface';

@Injectable({ providedIn: 'root' })
export class RequestService {
  constructor(private api: ApiService) {}

  createRequest(data: Partial<SolicitudInscripcion>): Observable<SolicitudInscripcion> {
    return this.api.post<SolicitudInscripcion>('/solicitudinscripcion', data);
  }

  getMyRequests(): Observable<SolicitudInscripcion[]> {
    return this.api.get<SolicitudInscripcion[]>('/solicitudinscripcion/mis-solicitudes');
  }

  getUserRequests(userId: number): Observable<SolicitudInscripcion[]> {
    return this.api.get<SolicitudInscripcion[]>(`/solicitudinscripcion/usuario/${userId}`);
  }

  getPendingRequests(): Observable<SolicitudInscripcion[]> {
    return this.api.get<SolicitudInscripcion[]>('/solicitudinscripcion/pendientes');
  }

  approveRequest(id: number): Observable<SolicitudInscripcion> {
    return this.api.put<SolicitudInscripcion>(`/solicitudinscripcion/${id}/aprobar`, {});
  }

  rejectRequest(id: number, reason: string): Observable<SolicitudInscripcion> {
    return this.api.put<SolicitudInscripcion>(`/solicitudinscripcion/${id}/rechazar`, { reason });
  }
}
```

#### 7. **convocation.service.ts** - Convocatorias

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Convocatoria } from 'src/app/shared/models/convocatoria.interface';

@Injectable({ providedIn: 'root' })
export class ConvocationService {
  constructor(private api: ApiService) {}

  getConvocations(): Observable<Convocatoria[]> {
    return this.api.get<Convocatoria[]>('/convocatorias');
  }

  getConvocationById(id: number): Observable<Convocatoria> {
    return this.api.get<Convocatoria>(`/convocatorias/${id}`);
  }

  getTeamConvocations(teamId: number): Observable<Convocatoria[]> {
    return this.api.get<Convocatoria[]>(`/convocatorias/equipo/${teamId}`);
  }

  createConvocation(data: Partial<Convocatoria>): Observable<Convocatoria> {
    return this.api.post<Convocatoria>('/convocatorias', data);
  }

  updateConvocation(id: number, data: Partial<Convocatoria>): Observable<Convocatoria> {
    return this.api.put<Convocatoria>(`/convocatorias/${id}`, data);
  }

  deleteConvocation(id: number): Observable<void> {
    return this.api.delete<void>(`/convocatorias/${id}`);
  }
}
```

#### 8. **incident.service.ts** - Incidencias

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { Incidencia } from 'src/app/shared/models/incidencia.interface';

@Injectable({ providedIn: 'root' })
export class IncidentService {
  constructor(private api: ApiService) {}

  getIncidents(): Observable<Incidencia[]> {
    return this.api.get<Incidencia[]>('/incidencias');
  }

  getIncidentById(id: number): Observable<Incidencia> {
    return this.api.get<Incidencia>(`/incidencias/${id}`);
  }

  getPlayerIncidents(playerId: number): Observable<Incidencia[]> {
    return this.api.get<Incidencia[]>(`/incidencias/jugador/${playerId}`);
  }

  createIncident(data: Partial<Incidencia>): Observable<Incidencia> {
    return this.api.post<Incidencia>('/incidencias', data);
  }

  updateIncident(id: number, data: Partial<Incidencia>): Observable<Incidencia> {
    return this.api.put<Incidencia>(`/incidencias/${id}`, data);
  }

  deleteIncident(id: number): Observable<void> {
    return this.api.delete<void>(`/incidencias/${id}`);
  }
}
```

#### 9. **notification.service.ts** - Notificaciones

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notification$ = new BehaviorSubject<Notification | null>(null);

  showSuccess(message: string, duration = 3000): void {
    this.show({ type: 'success', message, duration });
  }

  showError(message: string, duration = 5000): void {
    this.show({ type: 'error', message, duration });
  }

  showWarning(message: string, duration = 4000): void {
    this.show({ type: 'warning', message, duration });
  }

  showInfo(message: string, duration = 3000): void {
    this.show({ type: 'info', message, duration });
  }

  getNotification(): Observable<Notification | null> {
    return this.notification$.asObservable();
  }

  private show(notification: Notification): void {
    this.notification$.next(notification);
    if (notification.duration) {
      setTimeout(() => this.notification$.next(null), notification.duration);
    }
  }
}
```

#### 10. **storage.service.ts** - Almacenamiento Local

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
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

  setCurrentUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getCurrentUser(): any {
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

#### 11. **State Services** - Gestión de Estado Global

**team-state.service.ts:**

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Equipo } from 'src/app/shared/models/equipo.interface';
import { TeamService } from '../team/team.service';

@Injectable({ providedIn: 'root' })
export class TeamStateService {
  private teams$ = new BehaviorSubject<Equipo[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);

  constructor(private teamService: TeamService) {}

  loadTeams(): void {
    this.loading$.next(true);
    this.teamService.getTeams().subscribe({
      next: teams => {
        this.teams$.next(teams);
        this.loading$.next(false);
      },
      error: err => {
        this.error$.next(err.message);
        this.loading$.next(false);
      }
    });
  }

  getTeams(): Observable<Equipo[]> {
    return this.teams$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  getError(): Observable<string | null> {
    return this.error$.asObservable();
  }
}
```

**user-state.service.ts:**

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario } from 'src/app/shared/models/usuario.interface';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class UserStateService {
  private currentUser$ = new BehaviorSubject<Usuario | null>(null);
  private loading$ = new BehaviorSubject<boolean>(false);

  constructor(private auth: AuthService) {}

  loadCurrentUser(): void {
    this.loading$.next(true);
    this.auth.getMe().subscribe({
      next: user => {
        this.currentUser$.next(user);
        this.loading$.next(false);
      },
      error: () => this.loading$.next(false)
    });
  }

  getCurrentUser(): Observable<Usuario | null> {
    return this.currentUser$.asObservable();
  }

  getLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  updateUser(user: Usuario): void {
    this.currentUser$.next(user);
  }

  clear(): void {
    this.currentUser$.next(null);
  }
}
```

---

## Shared Module

### Estructura del Shared

```
shared/
├── components/          # Componentes reutilizables
│   ├── ui/
│   │   ├── loading-spinner/
│   │   ├── error-message/
│   │   └── modal-base/
│   ├── forms/
│   │   ├── search-bar/
│   │   └── date-picker/
│   └── layout/
│       ├── header/
│       └── footer/
├── pipes/               # Pipes personalizados
│   ├── role-format.pipe.ts
│   ├── date-format.pipe.ts
│   └── truncate.pipe.ts
├── directives/          # Directivas personalizadas
│   ├── has-role.directive.ts
│   └── permission.directive.ts
├── models/              # Interfaces y tipos
│   ├── usuario.interface.ts
│   ├── equipo.interface.ts
│   ├── jugador.interface.ts
│   ├── solicitud.interface.ts
│   ├── convocatoria.interface.ts
│   ├── incidencia.interface.ts
│   └── index.ts
└── shared.module.ts     # Declaración del módulo
```

### Interfaces de Modelos (shared/models)

```typescript
// usuario.interface.ts
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  fechaCreacion: Date;
  rol: 'JUGADOR' | 'ENTRENADOR' | 'ADMIN';
}

// equipo.interface.ts
export interface Equipo {
  id: number;
  nombre: string;
  fechaCreacion: Date;
  observaciones?: string;
  categoria: Categoria;
  liga: Liga;
  jugadores?: Jugador[];
  entrenadores?: Usuario[];
}

// jugador.interface.ts
export interface Jugador {
  id: number;
  usuario: Usuario;
  dorsal?: number;
  posicion: string;
  equipo: Equipo;
  activo: boolean;
}

// solicitud.interface.ts
export interface SolicitudInscripcion {
  id: number;
  usuario: Usuario;
  equipo: Equipo;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  fechaSolicitud: Date;
}

// convocatoria.interface.ts
export interface Convocatoria {
  id: number;
  equipo: Equipo;
  tipo: 'ENTRENAMIENTO' | 'PARTIDO' | 'AMISTOSO';
  fecha: Date;
  lugar?: string;
  observaciones?: string;
}

// incidencia.interface.ts
export interface Incidencia {
  id: number;
  jugador: Jugador;
  tipo: 'LESION' | 'SANCION' | 'BLOQUEO' | 'OTRO';
  descripcion: string;
  fecha: Date;
}
```

---

## Módulos Feature

### 1. Landing Module ✅ (Completado)

**landing.module.ts:**

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

**landing-routing.module.ts:**

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

**landing.page.ts:**

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

**landing.page.html:**

```html
<ion-content class="landing-content">
  <!-- Hero Section -->
  <app-hero-section 
    (onRegisterClick)="onRegisterClick()"
    (onLoginClick)="onLoginClick()">
  </app-hero-section>

  <!-- Featured Teams Section -->
  <ion-section class="teams-section">
    <ion-grid>
      <ion-row>
        <ion-col size="12">
          <h2 class="section-title">Nuestros Equipos Destacados</h2>
        </ion-col>
      </ion-row>
      
      <ion-row *ngIf="isLoading" class="ion-text-center">
        <ion-col size="12">
          <ion-spinner name="crescent" color="primary"></ion-spinner>
        </ion-col>
      </ion-row>

      <ion-row *ngIf="!isLoading" class="teams-grid">
        <ion-col 
          size="12" 
          sizeSm="6" 
          sizeMd="4"
          *ngFor="let team of featuredTeams$ | async; trackBy: trackByTeamId">
          <app-team-card [team]="team"></app-team-card>
        </ion-col>
      </ion-row>

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
</ion-content>
```

### 2. Auth Module 🔄 (En Desarrollo)

**auth.module.ts:**

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
```

### 3. Dashboard Module - Usuarios Generales

**dashboard.module.ts:**

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardPage } from './pages/dashboard/dashboard.page';
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component';

@NgModule({
  declarations: [
    DashboardPage,
    DashboardCardComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
```

### 4. Admin Module 🔐

Panel administrativo (acceso solo ADMIN).

**admin.module.ts:**

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardPage } from './pages/admin-dashboard/admin-dashboard.page';

@NgModule({
  declarations: [AdminDashboardPage],
  imports: [CommonModule, IonicModule, AdminRoutingModule]
})
export class AdminModule { }
```

### 5. Coach Module 🚴

Dashboard para entrenadores (acceso ENTRENADOR).

**coach.module.ts:**

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CoachRoutingModule } from './coach-routing.module';
import { CoachDashboardPage } from './pages/coach-dashboard/coach-dashboard.page';

@NgModule({
  declarations: [CoachDashboardPage],
  imports: [CommonModule, IonicModule, CoachRoutingModule]
})
export class CoachModule { }
```

### 6. Players Module ⚽

Gestión de jugadores.

**players.module.ts:**

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PlayersRoutingModule } from './players-routing.module';
import { PlayerDashboardPage } from './pages/player-dashboard/player-dashboard.page';

@NgModule({
  declarations: [PlayerDashboardPage],
  imports: [CommonModule, IonicModule, PlayersRoutingModule]
})
export class PlayersModule { }
```

### 7. User Module 👤

Perfil y dashboard de usuario.

**user.module.ts:**

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { UserRoutingModule } from './user-routing.module';
import { UserDashboardPage } from './pages/user-dashboard/user-dashboard.page';

@NgModule({
  declarations: [UserDashboardPage],
  imports: [CommonModule, IonicModule, UserRoutingModule]
})
export class UserModule { }
```

---

## Gestión de Estado con RxJS

### Patrones Observable

#### 1. BehaviorSubject para Estado Compartido

```typescript
export class AuthService {
  private currentUser$ = new BehaviorSubject<Usuario | null>(null);

  getCurrentUser(): Observable<Usuario | null> {
    return this.currentUser$.asObservable();
  }

  // En componente
  ngOnInit() {
    this.auth.getCurrentUser().subscribe(user => {
      // Se ejecuta cuando hay cambios
    });
  }
}
```

#### 2. Operadores RxJS Clave

**switchMap** - Cambiar streams:

```typescript
loadTeamWithPlayers(teamId: number): Observable<Equipo> {
  return this.teamService.getTeamById(teamId).pipe(
    switchMap(team => 
      this.playerService.getPlayersByTeam(team.id).pipe(
        map(players => ({ ...team, players }))
      )
    )
  );
}
```

**map** - Transformar:

```typescript
getTeamsWithCount(): Observable<any[]> {
  return this.teamService.getTeams().pipe(
    map(teams => teams.map(t => ({
      ...t,
      playerCount: t.jugadores?.length || 0
    })))
  );
}
```

**filter** - Filtrar:

```typescript
getApprovedRequests(): Observable<SolicitudInscripcion[]> {
  return this.requestService.getMyRequests().pipe(
    map(reqs => reqs.filter(r => r.estado === 'APROBADA'))
  );
}
```

**catchError** - Manejo errores:

```typescript
getTeams(): Observable<Equipo[]> {
  return this.api.get<Equipo[]>('/equipos').pipe(
    catchError(error => {
      console.error('Error:', error);
      return of([]);
    })
  );
}
```

**combineLatest** - Combinar múltiples:

```typescript
getDashboardData(): Observable<any> {
  return combineLatest([
    this.userService.getMe(),
    this.teamService.getTeams(),
    this.requestService.getMyRequests()
  ]).pipe(
    map(([user, teams, requests]) => ({
      user, teams, requests
    }))
  );
}
```

#### 3. Async Pipe en Templates

```html
<!-- Auto suscripción y unsuscripción -->
<div *ngIf="(currentUser$ | async) as user; else loading">
  <p>Bienvenido {{ user.nombre }}</p>
</div>

<ng-template #loading>
  <p>Cargando...</p>
</ng-template>

<!-- Con trackBy para ngFor -->
<ion-card *ngFor="let team of teams$ | async; trackBy: trackByTeamId">
  {{ team.nombre }}
</ion-card>
```

#### 4. takeUntil para Limpiar Suscripciones

```typescript
export class TeamListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  teams$: Observable<Equipo[]>;

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
  tokenKey: 'auth_token_dev',
  cachingEnabled: true
};
```

**src/environments/environment.prod.ts (Producción):**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.damunited.com/api',
  logLevel: 'error',
  tokenKey: 'auth_token',
  cachingEnabled: true
};
```

**Uso en servicios:**

```typescript
import { environment } from 'src/environments/environment';

export class ApiService {
  private apiUrl = environment.apiUrl;
  private logLevel = environment.logLevel;

  constructor(private http: HttpClient) {
    if (this.logLevel === 'debug') {
      console.log('API URL:', this.apiUrl);
    }
  }
}
```

### Build por Entorno

```bash
# Desarrollo (por defecto)
ng serve

# Producción
ng build --configuration production

# Configuración personalizada
ng build --configuration=custom
```

---

## Patrones y Buenas Prácticas

### 1. Smart vs Presentational Components

**Smart Component (Contenedor):**

```typescript
// dashboard.component.ts
@Component({
  selector: 'app-dashboard',
  template: '<app-dashboard-card [data]="dashboardData$ | async"></app-dashboard-card>'
})
export class DashboardComponent {
  dashboardData$: Observable<DashboardData>;

  constructor(private service: DashboardService) {
    this.dashboardData$ = this.service.getDashboardData();
  }
}
```

**Presentational Component (Presentador):**

```typescript
// dashboard-card.component.ts
@Component({
  selector: 'app-dashboard-card',
  template: '{{ data.title }}'
})
export class DashboardCardComponent {
  @Input() data!: DashboardData;
  @Output() action = new EventEmitter<string>();

  onAction(): void {
    this.action.emit('clicked');
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

**Beneficios:** Mejor rendimiento, menos checks innecesarios.

### 3. Strict Mode TypeScript

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true
  }
}
```

### 4. Convenciones de Nomenclatura

| Entidad | Patrón | Ejemplo |
|---------|--------|---------|
| Módulo | camelCase.module.ts | `landing.module.ts` |
| Componente (archivo) | kebab-case | `hero-section.component.ts` |
| Componente (clase) | PascalCase | `HeroSectionComponent` |
| Servicio (archivo) | camelCase.service.ts | `team.service.ts` |
| Servicio (clase) | PascalCase | `TeamService` |
| Pipe | camelCase.pipe.ts | `date-format.pipe.ts` |
| Guard | camelCase.guard.ts | `auth.guard.ts` |
| Interface | PascalCase.interface.ts | `usuario.interface.ts` |
| Observable | camelCase$ | `teams$`, `currentUser$` |

### 5. Error Handling

**En servicios:**

```typescript
getTeams(): Observable<Equipo[]> {
  return this.api.get<Equipo[]>('/equipos').pipe(
    catchError(error => {
      console.error('Error fetching teams:', error);
      this.notification.showError('No se pudieron cargar los equipos');
      return of([]);
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
      this.error = 'Error cargando equipos';
      this.isLoading = false;
    }
  });
}
```

---

## Guía de Desarrollo

### Crear Nuevo Módulo Feature

```bash
ng generate module modules/teams --routing
ng generate component modules/teams/pages/teams-page
ng generate service core/services/teams/teams
```

Estructura resultante:

```
teams/
├── teams.module.ts
├── teams-routing.module.ts
├── pages/
│   └── teams-page/
│       ├── teams-page.component.ts
│       ├── teams-page.component.html
│       └── teams-page.component.scss
```

### Crear Componente

```bash
ng generate component modules/teams/components/team-list --skip-tests
```

### Crear Servicio

```bash
ng generate service core/services/teams/team
```

### Agregar Guard

```bash
ng generate guard core/guards/teams-access
```

### Integrar en App Routing

**app-routing.module.ts:**

```typescript
{
  path: 'teams',
  loadChildren: () => import('./modules/teams/teams.module')
    .then(m => m.TeamsModule),
  canActivate: [AuthGuard]
}
```

---

**Última actualización:** 13/11/2025  
**Versión:** 2.0 (Refactorizada con estructura real del proyecto)  
**Autor:** Sergio Estudillo - 2º DAM