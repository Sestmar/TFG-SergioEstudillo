# Frontend - Documentación Técnica v4.1 (Integrada)

## 📋 Índice

1. [Estructura General del Proyecto](#estructura-general-del-proyecto)
2. [Stack Tecnológico y Dependencias](#stack-tecnológico-y-dependencias)
3. [Arquitectura General](#arquitectura-general)
4. [Core Module - Servicios, Guards e Interceptores](#core-module---servicios-guards-e-interceptores)
5. [Shared Module - Componentes Reutilizables](#shared-module---componentes-reutilizables)
6. [Módulos Feature y Navegación](#módulos-feature-y-navegación)
7. [🔐 Sistema de Autenticación JWT (Integrado v4.1)](#-sistema-de-autenticación-jwt-integrado-v41)
8. [Gestión de Estado y Redirección](#gestión-de-estado-y-redirección)
9. [Configuración y Convenciones Críticas](#configuración-y-convenciones-críticas)
10. [Guía de Desarrollo y Buenas Prácticas](#guía-de-desarrollo-y-buenas-prácticas)

---

## Estructura General del Proyecto

El proyecto sigue una **arquitectura escalable basada en módulos (Modular Architecture)**, separando claramente:

- **Core:** Lógica de negocio (Servicios, Guards, Interceptores) - Se cargan UNA ÚNICA VEZ
- **Shared:** Componentes visuales reutilizables por múltiples módulos
- **Modules:** Vistas específicas de cada rol (Lazy Loaded bajo demanda)

```
src/app/
├── core/                  # SINGLETONS: Cargados una única vez al inicio
│   ├── guards/
│   │   └── auth.guard.ts                # Protección de rutas (CanActivate)
│   │
│   ├── interceptors/
│   │   ├── auth.interceptor.ts          # Inyecta Authorization header Bearer
│   │   └── error.interceptor.ts         # Maneja errores HTTP globales
│   │
│   ├── services/
│   │   ├── auth/
│   │   │   └── auth.service.ts          # Login, Logout, getMe(), Observables de estado
│   │   ├── storage/
│   │   │   └── storage.service.ts       # Gestión de localStorage (Token + Usuario)
│   │   └── api/
│   │       └── api.service.ts           # HTTP Client base (opcional)
│   │
│   └── mocks/
│       └── mock-data.ts                 # Datos falsos para testing unitario
│
├── shared/                # REUTILIZABLES: Importados por múltiples módulos
│   ├── components/
│   │   ├── header/
│   │   │   ├── header.component.ts
│   │   │   ├── header.component.html
│   │   │   └── header.component.scss
│   │   ├── loading-spinner/
│   │   ├── error-message/
│   │   ├── player-card/
│   │   └── [otros componentes reutilizables]
│   │
│   ├── models/
│   │   └── models.ts                    # Interfaces TypeScript (Usuario, Equipo, Jugador)
│   │
│   ├── pipes/
│   │   └── [pipes de transformación de datos]
│   │
│   └── directives/
│       └── [directivas personalizadas]
│
├── modules/               # VISTAS (Lazy Loaded - se cargan bajo demanda)
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   │   ├── login.page.ts
│   │   │   │   ├── login.page.html
│   │   │   │   └── login.page.scss
│   │   │   └── register/
│   │   │       ├── register.page.ts
│   │   │       ├── register.page.html
│   │   │       └── register.page.scss
│   │   ├── auth.module.ts
│   │   └── auth-routing.module.ts
│   │
│   ├── admin/
│   │   ├── pages/
│   │   │   └── dashboard/               # Dashboard administrativo
│   │   ├── admin.module.ts
│   │   └── admin-routing.module.ts
│   │
│   ├── coach/
│   │   ├── pages/
│   │   │   └── dashboard/               # Dashboard de entrenador
│   │   ├── coach.module.ts
│   │   └── coach-routing.module.ts
│   │
│   ├── player/
│   │   ├── pages/
│   │   │   └── dashboard/               # Dashboard de jugador
│   │   ├── player.module.ts
│   │   └── player-routing.module.ts
│   │
│   └── home/
│       └── [landing page pública]
│
├── environments/
│   ├── environment.ts                   # Desarrollo
│   └── environment.prod.ts              # Producción
│
├── theme/
│   └── variables.scss                   # Estilos globales e Ionic variables
│
├── app.module.ts                        # Módulo raíz
├── app-routing.module.ts                # Rutas principales (lazy loading)
└── app.component.ts
```

---

## Stack Tecnológico y Dependencias

El frontend está diseñado siguiendo **Mobile-First**, utilizando tecnologías web modernas para crear una aplicación híbrida compatible con web y dispositivos móviles.

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| **Angular** | 16+ | Framework SPA (Single Page Application) |
| **Ionic Framework** | 7.x | Biblioteca de componentes UI nativos y grid adaptativo |
| **TypeScript** | 5.x | Lenguaje tipado para máyor seguridad |
| **RxJS** | 7.x | Programación reactiva (Observables, Subjects, Operators) |
| **Angular HttpClient** | 16+ | Cliente HTTP para consumo de API REST |
| **Angular Forms** | 16+ | Validación reactiva (FormBuilder, FormGroup) |
| **Ionic Icons** | 7.x | Iconografía profesional |
| **SCSS** | - | Preprocesador CSS para estilos modulares |

---

## Arquitectura General

### Patrón de Diseño: Smart-Dumb Components

Se utiliza el patrón **Smart-Dumb Components** (o Container-Presentational):

- **Smart Components (Pages):** Gestionan la lógica, llaman a los servicios, manejan estado
- **Dumb Components (Shared):** Solo reciben datos vía @Input, emiten eventos vía @Output, reutilizables

**Ventajas:**
- Separación de responsabilidades clara
- Componentes compartidos de verdad reutilizables
- Testeo más fácil
- Escalabilidad

### Estrategia de Carga: Lazy Loading

Para optimizar el rendimiento inicial:

- **AppModule (raíz):** Solo carga lo imprescindible (Header, Router)
- **Auth Module:** Cargado al navegar a `/auth/login` o `/auth/register`
- **Admin, Coach, Player Modules:** Cargados bajo demanda tras login exitoso
- **Shared Module:** Cargado por referencia explícita en cada feature module

**Resultado:** La app inicial pesa ~200KB, el resto se descarga bajo demanda.

---

## Core Module - Servicios, Guards e Interceptores

El CoreModule es el **motor de la aplicación**. Aquí reside toda la comunicación con el backend y la lógica de seguridad.

### 4.1 AuthService (Actualizado v4.1)

Servicio encargado de la **gestión completa de sesión y autenticación**.

#### Cambios en v4.1:

✅ Implementación de la **Slash Rule** (endpoints inician con `/`)

✅ Endpoint `/auth/me` para obtener usuario actual

✅ **Observables reactivos** para estado de sesión

✅ Integración automática con StorageService

#### Implementación Completa

```typescript
// src/app/core/services/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, switchMap } from 'rxjs';
import { StorageService } from '../storage/storage.service';
import { Usuario } from 'src/app/shared/models/models';
import { environment } from 'src/environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // CONVENCIÓN: environment.apiUrl NO tiene barra final (http://localhost:8080/api)
  private apiUrl = environment.apiUrl;

  // Observables reactivos del estado
  private currentUser$ = new BehaviorSubject<Usuario | null>(null);
  private isAuthenticated$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    this.checkStoredToken();
  }

  /**
   * Login con email/contraseña
   * CONVENCIÓN: El endpoint empieza con barra (/auth/login)
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = { email, password };
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginData).pipe(
      tap(response => {
        // Guardar token como STRING PURO (FIX v4.1: sin JSON.stringify!)
        this.storage.setToken(response.token);
        this.isAuthenticated$.next(true);
      })
    );
  }

  /**
   * Obtener datos del usuario actual autenticado
   * Endpoint: /auth/me
   */
  getMe(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/auth/me`).pipe(
      tap(user => {
        this.currentUser$.next(user);
        this.storage.setCurrentUser(user);
      })
    );
  }

  /**
   * Registro de nuevo usuario
   */
  register(userData: RegisterRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/auth/register`, userData).pipe(
      tap(user => {
        console.log('Usuario registrado exitosamente:', user);
      })
    );
  }

  /**
   * Logout del usuario
   */
  logout(): void {
    this.storage.clear();
    this.currentUser$.next(null);
    this.isAuthenticated$.next(false);
  }

  /**
   * Getters para Observables
   */
  isAuthenticated(): boolean {
    return !!this.storage.getToken();
  }

  getIsAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  getCurrentUser(): Observable<Usuario | null> {
    return this.currentUser$.asObservable();
  }

  getCurrentUserSync(): Usuario | null {
    return this.currentUser$.value;
  }

  /**
   * Verificar si hay token válido al iniciar la app
   */
  private checkStoredToken(): void {
    const token = this.storage.getToken();
    if (token) {
      this.isAuthenticated$.next(true);
    }
  }
}
```

### 4.2 StorageService (CORRECCIÓN CRÍTICA v4.1)

Gestiona localStorage de forma segura.

#### Fix de Seguridad v4.1:

⚠️ **Se eliminó JSON.stringify para el token JWT**

**Por qué es crítico:** El token JWT ya es string base64. Si lo serializas con JSON.stringify(), añade comillas dobles extra que rompen la firma en el backend (SignatureException: Signature verification failed).

```typescript
// src/app/core/services/storage/storage.service.ts
import { Injectable } from '@angular/core';
import { Usuario } from 'src/app/shared/models/models';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  constructor() {}

  /**
   * Guardar Token JWT
   * IMPORTANTE: Guardar como string puro (RAW), sin JSON.stringify
   * Esto es crítico para que el backend pueda validar la firma correctamente
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Obtener token JWT
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Eliminar token JWT
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Guardar datos del usuario actual
   * Para objetos complejos SÍ usamos JSON.stringify
   */
  setCurrentUser(user: Usuario): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Obtener datos del usuario actual
   */
  getCurrentUser(): Usuario | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Eliminar datos del usuario
   */
  removeCurrentUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Limpiar todo el storage
   */
  clear(): void {
    localStorage.clear();
  }
}
```

### 4.3 AuthInterceptor

Intercepta **todas** las peticiones HTTP salientes para inyectar automáticamente la cabecera de autorización.

```typescript
// src/app/core/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage/storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private storage: StorageService,
    private router: Router
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Obtener token del storage
    const token = this.storage.getToken();

    let authReq = req;
    if (token) {
      // Clonar la petición e inyectar el header Authorization
      // CONVENCIÓN: "Bearer " + token (el espacio es obligatorio)
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    // Enviar la petición y manejar errores
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si error 401 (Unauthorized), el token es inválido/expirado
        if (error.status === 401) {
          // Limpiar storage y redirigir a login
          this.storage.clear();
          this.router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
```

#### Registro del Interceptor en app.module.ts

```typescript
// src/app/app.module.ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    IonicModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true  // ✅ Crítico: permite múltiples interceptores
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

---

## Shared Module - Componentes Reutilizables

Este módulo exporta componentes UI que garantizan **consistencia visual** en toda la aplicación.

### 5.1 Modelos de Datos (/shared/models)

Interfaces TypeScript que reflejan las entidades de la base de datos NeonDB.

```typescript
// src/app/shared/models/models.ts
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'ENTRENADOR' | 'JUGADOR';
  avatar?: string;
  fechaCreacion?: Date;
  // passwordHash NO se incluye en el frontend por seguridad
}

export interface Equipo {
  id: number;
  nombre: string;
  categoria: string;  // U8, U10, U12, etc.
  escudoUrl?: string;
  entrenadorId: number;
  fechaCreacion?: Date;
}

export interface Jugador {
  id: number;
  nombre: string;
  apellidos: string;
  email?: string;
  dorsal: number;
  posicion: 'PORTERO' | 'DEFENSA' | 'CENTROCAMPISTA' | 'DELANTERO';
  equipoId: number;
  avatarUrl?: string;
  fechaCreacion?: Date;
}

export interface Entrenamiento {
  id: number;
  equipoId: number;
  fecha: Date;
  hora: string;
  lugar: string;
  descripcion?: string;
}
```

### 5.2 Componentes UI Principales

- **HeaderComponent:** Barra superior con menú hamburguesa, perfil del usuario y botón logout
- **LoadingComponent:** Spinner centralizado para operaciones asíncronas
- **PlayerCardComponent:** Tarjeta visual para mostrar resumen de jugador (foto, dorsal, posición)
- **ErrorMsgComponent:** Visualización estandarizada de errores de validación en formularios
- **EmptyStateComponent:** Mensaje cuando no hay datos para mostrar

---

## Módulos Feature y Navegación

La aplicación se estructura en **módulos funcionales según el rol del usuario**.

### 6.1 Estructura de Rutas Planas (v4.1)

Se ha simplificado el routing para evitar anidamientos profundos y problemas de redirección.

```typescript
// src/app/app-routing.module.ts
const routes: Routes = [
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
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  }
];
```

### 6.2 Módulos y sus Propósitos

| Módulo | Ruta Base | Rol | Descripción |
|--------|-----------|-----|-------------|
| **auth** | `/auth/login` | Público | Login y Registro |
| **admin** | `/admin-dashboard` | ADMIN | Gestión total (Club, Usuarios, Equipos, Pagos) |
| **coach** | `/coach-dashboard` | ENTRENADOR | Gestión técnica (Alineaciones, Entrenamientos) |
| **player** | `/player-dashboard` | JUGADOR | Vista personal (Estadísticas, Convocatorias) |

---

## 🔐 Sistema de Autenticación JWT (Integrado v4.1)

**Estado:** ✅ Integrado y Estable

Esta sección documenta el flujo completo de autenticación sincronizado con el backend Spring Boot 3.

### 7.1 Flujo de Autenticación Optimizado

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario completa formulario (email/password) en LoginPage │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ 2. AuthService.login()       │
        │    POST /auth/login          │
        └──────────┬───────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────┐
    │ 3. Backend valida credenciales con     │
    │    BCrypt y devuelve token JWT         │
    │    { "token": "eyJhb..." }             │
    └──────────────┬────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────┐
    │ 4. StorageService.setToken(token)      │
    │    ⚠️ String PURO, sin JSON.stringify() │
    │    (FIX v4.1)                          │
    └──────────────┬────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────┐
    │ 5. AuthService.getMe() automáticamente │
    │    GET /auth/me (con header Bearer)    │
    └──────────────┬────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────┐
    │ 6. Backend valida JWT y retorna Usuario │
    │    actual (sin passwordHash)            │
    └──────────────┬────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────────┐
    │ 7. LoginPage.redirectBasedOnRole()      │
    │    según user.rol                       │
    └──────────────┬────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        │          │          │          │
        ▼          ▼          ▼          ▼
    /admin-   /coach-   /player-   /home
    dashboard dashboard dashboard
```

### 7.2 Implementación en LoginPage

```typescript
// src/app/modules/auth/pages/login/login.page.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ToastController } from '@ionic/angular';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  loginForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;

    const { email, password } = this.loginForm.value;

    // switchMap encadena automáticamente:
    // 1. login() para obtener token
    // 2. getMe() para obtener datos del usuario
    this.authService.login(email, password).pipe(
      switchMap(() => this.authService.getMe())
    ).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.redirectBasedOnRole(user.rol);
      },
      error: async (err) => {
        this.isLoading = false;
        await this.showToast('Credenciales incorrectas o error de servidor', 'danger');
      }
    });
  }

  /**
   * Redirección basada en ROLES estandarizados (v4.1)
   */
  private redirectBasedOnRole(rol: string) {
    const userRole = rol ? rol.toUpperCase() : '';

    switch (userRole) {
      case 'ADMIN':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'ENTRENADOR':
      case 'COACH':  // Soporte para legacy naming
        this.router.navigate(['/coach-dashboard']);
        break;
      case 'JUGADOR':
      case 'PLAYER':  // Soporte para legacy naming
        this.router.navigate(['/player-dashboard']);
        break;
      default:
        this.router.navigate(['/home']);
    }
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
```

### 7.3 AuthGuard - Protección de Rutas

```typescript
// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Guardar la URL que intentaba acceder para redirigir después del login
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
}
```

---

## Gestión de Estado y Redirección

Aunque la aplicación utiliza principalmente servicios para la gestión de datos, el estado de la Sesión de Usuario se maneja de forma **reactiva con RxJS**.

### 8.1 Observables Principales (AuthService)

- **currentUser$:** BehaviorSubject que emite Usuario actual o null. Los componentes se suscriben para mostrar nombre/avatar en UI
- **isAuthenticated$:** BehaviorSubject booleano para lógica simple (mostrar/ocultar menús)

### 8.2 Ejemplo: HeaderComponent consume AuthService

```typescript
// src/app/shared/components/header/header.component.ts
import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Usuario } from 'src/app/shared/models/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  currentUser$: Observable<Usuario | null>;
  isMenuOpen = false;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
    // Redirigir manejado por interceptor (error 401)
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
```

```html
<!-- src/app/shared/components/header/header.component.html -->
<ion-header>
  <ion-toolbar>
    <ion-title>TFG Club Deportivo</ion-title>
    <ion-buttons slot="end">
      <ion-button *ngIf="currentUser$ | async as user" (click)="logout()">
        {{ user.nombre }}
        <ion-icon name="log-out"></ion-icon>
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
```

---

## Configuración y Convenciones Críticas

Para mantener la **estabilidad lograda en v4.1** y evitar regresiones, es obligatorio respetar estas normas.

### 9.1 La "Regla de la Barra" (Slash Rule) — CRÍTICA

**Para prevenir errores 404 por URLs mal concatenadas (ej: `.../apiusuarios`):**

**Environment:**
```typescript
// ✅ CORRECTO
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'  // SIN barra final
};

// ❌ INCORRECTO
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/'  // Con barra final
};
```

**Servicios:**
```typescript
// ✅ CORRECTO
this.http.get(`${this.apiUrl}/equipos`);      // CON barra inicial

// ❌ INCORRECTO
this.http.get(`${this.apiUrl}equipos`);       // SIN barra inicial
// Resultado: GET http://localhost:8080/apiequipos (404)
```

### 9.2 Integridad del Token JWT — CRÍTICA

```typescript
// ❌ NUNCA HAGAS ESTO
setToken(token: string): void {
  localStorage.setItem('auth_token', JSON.stringify(token));
  // ¡MAL! Añade comillas extra que rompen la firma en backend
}

// ✅ CORRECTO (v4.1)
setToken(token: string): void {
  localStorage.setItem('auth_token', token);
  // String PURO, sin serialización JSON
}
```

### 9.3 Prevención de Bucles en Serialización (Backend)

Si el Dashboard se congela o hay error 500 al cargar usuario:

**Diagnóstico:** Jackson ha entrado en bucle infinito serializado relaciones bidireccionales

**Solución:** Verificar que `Usuario.java` en Spring Boot tiene `@JsonIgnore`:

```java
@Entity
public class Usuario {
    @Id
    @GeneratedValue
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

---

## Guía de Desarrollo y Buenas Prácticas

### 10.1 Pasos para Crear una Nueva Feature

#### 1. Backend (Spring Boot)

1. Crear Entidad JPA (`model/NuevaEntidad.java`)
2. Crear Repositorio (`repository/NuevaEntidadRepository.java`)
3. Crear Servicio (`service/NuevaEntidadService.java`)
4. Crear Controller REST (`controller/NuevaEntidadController.java`)
5. Crear DTOs para request/response (`dto/NuevaEntidadDTO.java`)

#### 2. Frontend (Angular)

**Shared:**
1. Crear interfaz en `shared/models/models.ts`

**Core:**
2. Crear servicio en `core/services/nueva-feature/nueva-feature.service.ts`
   - Respetar Slash Rule
   - Inyectar HttpClient

**Modules:**
3. Generar módulo: `ionic g module modules/nueva-feature`
4. Generar página: `ionic g page modules/nueva-feature/pages/listado`
5. Configurar routing en `nueva-feature-routing.module.ts`
6. Importar SharedModule para componentes reutilizables

### 10.2 Convenciones de Código

| Aspecto | Convención | Ejemplo |
|--------|-----------|---------|
| **Variables** | camelCase | `nombreUsuario`, `listaEquipos` |
| **Constantes** | UPPERCASE | `MAX_USUARIOS`, `API_VERSION` |
| **Observables** | Sufijo $ | `equipos$`, `usuarios$`, `isLoading$` |
| **Componentes** | PascalCase (clase), prefijo app- | `PlayerCardComponent` → `app-player-card` |
| **Métodos privados** | prefijo # o private | `#initForm()`, `private formatDate()` |
| **Métodos públicos** | camelCase | `getPlayers()`, `onSubmit()` |
| **HTML** | Componentes Ionic nativos | `ion-content`, `ion-item`, `ion-button` |
| **SCSS** | BEM (Block Element Modifier) | `.player-card`, `.player-card__avatar`, `.player-card--selected` |

### 10.3 Importancia de Ionic Components

**Usa SIEMPRE componentes nativos de Ionic** en lugar de HTML estándar:

```typescript
// ✅ CORRECTO
<ion-content>
  <ion-item>
    <ion-label>Nombre</ion-label>
    <ion-input></ion-input>
  </ion-item>
  <ion-button expand="block">Enviar</ion-button>
</ion-content>

// ❌ INCORRECTO
<div class="content">
  <div class="item">
    <label>Nombre</label>
    <input>
  </div>
  <button>Enviar</button>
</div>
```

**Por qué:** Los componentes de Ionic se adaptan automáticamente al sistema operativo (iOS vs Android) y garantizan UX consistente en móvil.

---

## 📊 Resumen de Cambios v4.1 vs v4.0

| Aspecto | v4.0 | v4.1 | Estado |
|--------|------|------|--------|
| **JWT Backend** | Implementado | ✅ Estable | Integrado |
| **Token Storage** | JSON.stringify() | ✅ String puro (FIX) | Crítico |
| **Endpoint /auth/me** | No existía | ✅ Implementado | Funcional |
| **Redirección por rol** | Planeada | ✅ Implementada (Slash Rule) | Estable |
| **AuthGuard** | No funcional | ✅ Funcional | Protege rutas |
| **AuthInterceptor** | No funcional | ✅ Funcional | Inyecta Bearer |
| **StorageService** | Básico | ✅ Completo | Robusto |
| **Integración E2E** | Parcial | ✅ Completa | Testeada |

---

## ✅ Checklist de Estabilidad v4.1

- [x] Login con credenciales reales del backend
- [x] Token JWT guardado sin serialización
- [x] getMe() obtiene usuario actual autenticado
- [x] AuthGuard protege rutas no autenticadas
- [x] AuthInterceptor inyecta Bearer token automáticamente
- [x] Redirección inteligente por rol (Admin/Coach/Player)
- [x] Error 401 maneja logout forzado
- [x] StorageService cumple Slash Rule
- [x] CORS configurado para localhost:4200 y localhost:8100
- [x] Swagger UI documenta todos los endpoints

---

## 📞 Contacto y Recursos

**Autor:** Sergio Estudillo

**Centro:** 2º DAM (Desarrollo de Aplicaciones Multiplataforma)

**Documentación relacionada:**
- [README-v4.1.md](./README-v4.1.md) - Visión general del proyecto
- [Backend.md](./BACKEND.md) - Documentación del servidor Spring Boot
- [CORRECCIONES-v4.1.md](./CORRECCIONES-v4.1.md) - Log de bugs y fixes

---

**Última actualización:** 19/12/2025

**Versión:** 4.1 (Integrada, JWT Estable)

**Status:** ✅ Production-Ready para Fase 2 (Carga de datos reales)
