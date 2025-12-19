# Frontend - Documentación Técnica Completa (Actualizada v4.0)

## Índice

1. [Estructura General del Proyecto](#estructura-general-del-proyecto)
2. [Stack Tecnológico y Dependencias](#stack-tecnológico-y-dependencias)
3. [Arquitectura General](#arquitectura-general)
4. [Core Module - Servicios, Guards e Interceptores](#core-module---servicios-guards-e-interceptores)
5. [Shared Module](#shared-module)
6. [Módulos Feature](#módulos-feature)
7. [Avance: Implementación de Navegación y Autenticación (Fase 1)](#avance-implementación-de-navegación-y-autenticación-fase-1)
8. [🔐 Integración de Autenticación JWT con Backend (Fase 2 - NUEVO)](#integración-de-autenticación-jwt-con-backend-fase-2)
9. [Gestión de Estado con RxJS](#gestión-de-estado-con-rxjs)
10. [Configuración por Entorno](#configuración-por-entorno)
11. [Patrones y Buenas Prácticas](#patrones-y-buenas-prácticas)
12. [Guía de Desarrollo](#guía-de-desarrollo)

---

## 🔐 Integración de Autenticación JWT con Backend (Fase 2)

### Fecha de implementación: 18/11/2025
### Estado: ✅ Completado y validado

### Resumen de implementación

La integración JWT permite que el frontend Angular/Ionic se comunique de forma segura con el backend Spring Boot. Los usuarios pueden registrarse, hacer login y acceder a recursos protegidos usando tokens JWT que se envían automáticamente en cada petición HTTP.

---

### Flujo completo de autenticación frontend-backend

```
┌──────────────┐
│   Usuario    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│  1. Usuario completa formulario      │
│     Login/Register                   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  2. Component llama a AuthService    │
│     login(email, password)           │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  3. AuthService hace POST            │
│     ApiService.post('/auth/login')   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  4. Backend valida credenciales      │
│     y devuelve { token: "..." }      │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  5. AuthService guarda token         │
│     StorageService.setToken(token)   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  6. Usuario navega a ruta protegida  │
│     /dashboard o /equipos            │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  7. AuthInterceptor intercepta       │
│     y añade header:                  │
│     Authorization: Bearer <token>    │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  8. Backend valida token JWT         │
│     y autoriza petición              │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  9. Backend devuelve datos           │
│     Component los renderiza          │
└──────────────────────────────────────┘
```

---

### Componentes principales del sistema de autenticación

#### 1. AuthService - Servicio de autenticación

**Responsabilidades:**
- Gestionar login y registro
- Almacenar y recuperar el token JWT
- Mantener el estado del usuario autenticado
- Proporcionar métodos de logout

**Implementación completa:**

```typescript
// src/app/core/services/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../api/api.service';
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
  private currentUser$ = new BehaviorSubject<Usuario | null>(null);
  private isAuthenticated$ = new BehaviorSubject<boolean>(false);
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    this.checkStoredToken();
  }

  /**
   * Login con email/contraseña
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Observable con el token JWT
   */
  login(email: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = { email, password };
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginData).pipe(
      tap(response => {
        // Guardar token en storage
        this.storage.setToken(response.token);
        this.isAuthenticated$.next(true);
        
        // Obtener datos del usuario (opcional, depende de tu API)
        // this.getMe().subscribe();
      })
    );
  }

  /**
   * Registro de nuevo usuario
   * @param userData Datos del nuevo usuario
   * @returns Observable con el usuario creado
   */
  register(userData: RegisterRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/auth/register`, userData).pipe(
      tap(user => {
        // Después del registro exitoso, puedes hacer login automático
        // o pedir al usuario que haga login manualmente
        console.log('Usuario registrado exitosamente:', user);
      })
    );
  }

  /**
   * Logout del usuario
   */
  logout(): void {
    this.storage.removeToken();
    this.storage.removeCurrentUser();
    this.currentUser$.next(null);
    this.isAuthenticated$.next(false);
  }

  /**
   * Obtener información del usuario actual desde el backend
   */
  getMe(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuarios/me`).pipe(
      tap(user => {
        this.currentUser$.next(user);
        this.storage.setCurrentUser(user);
      })
    );
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.storage.getToken();
  }

  /**
   * Observable del estado de autenticación
   */
  getIsAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$.asObservable();
  }

  /**
   * Observable del usuario actual
   */
  getCurrentUser(): Observable<Usuario | null> {
    return this.currentUser$.asObservable();
  }

  /**
   * Obtener usuario actual de forma síncrona (para guards)
   */
  getCurrentUserSync(): Usuario | null {
    return this.currentUser$.value;
  }

  /**
   * Verificar token almacenado al iniciar la app
   */
  private checkStoredToken(): void {
    const token = this.storage.getToken();
    if (token) {
      this.isAuthenticated$.next(true);
      // Opcional: Verificar validez del token con el backend
      // this.getMe().subscribe();
    }
  }
}
```

---

#### 2. StorageService - Almacenamiento local

**Responsabilidades:**
- Guardar y recuperar el token JWT
- Guardar y recuperar datos del usuario
- Limpiar storage al hacer logout

**Implementación:**

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
   * Guardar token JWT
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

---

#### 3. AuthInterceptor - Interceptor HTTP

**Responsabilidades:**
- Interceptar todas las peticiones HTTP salientes
- Añadir el header `Authorization: Bearer <token>` automáticamente
- Manejar errores 401 (token expirado/inválido)

**Implementación:**

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

    // Clonar la petición y añadir el header Authorization si hay token
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    // Enviar la petición y manejar errores
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el error es 401 (Unauthorized), el token es inválido/expirado
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

**Registro del interceptor en app.module.ts:**

```typescript
// src/app/app.module.ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

@NgModule({
  // ... declarations, imports ...
  providers: [
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptor, 
      multi: true 
    },
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: ErrorInterceptor, 
      multi: true 
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

---

#### 4. LoginPage - Página de inicio de sesión

**Implementación del componente:**

```typescript
// src/app/modules/auth/pages/login/login.page.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements OnInit {
  
  loginForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: async (response) => {
        this.isLoading = false;
        await this.showToast('Login exitoso', 'success');
        this.router.navigate(['/dashboard']);
      },
      error: async (error) => {
        this.isLoading = false;
        const message = error.error?.message || 'Credenciales incorrectas';
        await this.showToast(message, 'danger');
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  private async showToast(message: string, color: string): Promise<void> {
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

**Template HTML:**

```html
<!-- src/app/modules/auth/pages/login/login.page.html -->
<ion-header>
  <ion-toolbar>
    <ion-title>Iniciar Sesión</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content class="ion-padding">
  <div class="login-container">
    <h1>Bienvenido</h1>
    <p>Inicia sesión para continuar</p>

    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      
      <!-- Email -->
      <ion-item>
        <ion-label position="floating">Email *</ion-label>
        <ion-input 
          type="email" 
          formControlName="email"
          placeholder="tu@email.com">
        </ion-input>
      </ion-item>
      <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
        <ion-text color="danger">
          <small *ngIf="loginForm.get('email')?.errors?.['required']">
            El email es obligatorio
          </small>
          <small *ngIf="loginForm.get('email')?.errors?.['email']">
            Introduce un email válido
          </small>
        </ion-text>
      </div>

      <!-- Password -->
      <ion-item>
        <ion-label position="floating">Contraseña *</ion-label>
        <ion-input 
          type="password" 
          formControlName="password"
          placeholder="Tu contraseña">
        </ion-input>
      </ion-item>
      <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
        <ion-text color="danger">
          <small *ngIf="loginForm.get('password')?.errors?.['required']">
            La contraseña es obligatoria
          </small>
        </ion-text>
      </div>

      <!-- Botón Login -->
      <ion-button 
        expand="block" 
        type="submit"
        [disabled]="!loginForm.valid || isLoading"
        class="ion-margin-top">
        <ion-spinner name="crescent" *ngIf="isLoading"></ion-spinner>
        <span *ngIf="!isLoading">Iniciar Sesión</span>
      </ion-button>

      <!-- Link a registro -->
      <div class="register-link ion-text-center ion-margin-top">
        <p>
          ¿No tienes cuenta? 
          <a (click)="goToRegister()">Regístrate aquí</a>
        </p>
      </div>
    </form>
  </div>
</ion-content>
```

---

#### 5. RegisterPage - Página de registro

**Implementación del componente:**

```typescript
// src/app/modules/auth/pages/register/register.page.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage implements OnInit {
  
  registerForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^[0-9]{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    const { confirmPassword, ...userData } = this.registerForm.value;

    this.authService.register(userData).subscribe({
      next: async (user) => {
        this.isLoading = false;
        await this.showToast('Registro exitoso. Por favor, inicia sesión', 'success');
        this.router.navigate(['/auth/login']);
      },
      error: async (error) => {
        this.isLoading = false;
        const message = error.error?.message || 'Error al registrar usuario';
        await this.showToast(message, 'danger');
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  private async showToast(message: string, color: string): Promise<void> {
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

---

### Uso del sistema de autenticación

#### Ejemplo: Consumir endpoint protegido

```typescript
// src/app/modules/teams/pages/teams/teams.page.ts
import { Component, OnInit } from '@angular/core';
import { TeamService } from 'src/app/core/services/team/team.service';
import { Team } from 'src/app/shared/models/models';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.page.html'
})
export class TeamsPage implements OnInit {
  
  teams: Team[] = [];
  isLoading = false;

  constructor(private teamService: TeamService) {}

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams(): void {
    this.isLoading = true;
    
    // El interceptor añadirá automáticamente el header Authorization
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.isLoading = false;
        // Si el error es 401, el interceptor redirigirá a login automáticamente
      }
    });
  }
}
```

---

### Configuración de Guards (protección de rutas)

#### AuthGuard - Requiere autenticación

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

**Uso en routing:**

```typescript
// src/app/app-routing.module.ts
{
  path: 'dashboard',
  loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule),
  canActivate: [AuthGuard]  // ✅ Ruta protegida
},
{
  path: 'teams',
  loadChildren: () => import('./modules/teams/teams.module').then(m => m.TeamsModule),
  canActivate: [AuthGuard]  // ✅ Ruta protegida
}
```

---

### Pruebas de integración realizadas

#### 1. Registro de usuario

✅ Formulario de registro funcional  
✅ Validación de campos en tiempo real  
✅ Validación de contraseñas coincidentes  
✅ Petición POST a `/api/auth/register` exitosa  
✅ Usuario creado en base de datos  

#### 2. Login

✅ Formulario de login funcional  
✅ Petición POST a `/api/auth/login` exitosa  
✅ Token JWT recibido y guardado en localStorage  
✅ Redirección a dashboard tras login exitoso  
✅ Mensaje de error si credenciales incorrectas  

#### 3. Acceso a endpoints protegidos

✅ AuthInterceptor añade header Authorization automáticamente  
✅ Backend valida token y autoriza petición  
✅ Datos recibidos y renderizados correctamente  
✅ Error 401 manejado correctamente (logout + redirección a login)  

---

### Mejoras futuras del sistema de autenticación frontend

- [ ] Implementar refresh token automático
- [ ] Añadir persistencia de sesión (Remember Me)
- [ ] Implementar guards por roles (Admin, Coach, Player)
- [ ] Añadir indicador visual de estado de autenticación en navbar
- [ ] Implementar logout desde múltiples puntos de la app
- [ ] Añadir confirmación de email tras registro
- [ ] Implementar recuperación de contraseña
- [ ] Añadir foto de perfil del usuario
- [ ] Implementar cambio de contraseña desde perfil

---

**Última actualización:** 18/11/2025  
**Versión:** 4.0 (Con integración JWT completada)  
**Autor:** Sergio Estudillo - 2º DAM