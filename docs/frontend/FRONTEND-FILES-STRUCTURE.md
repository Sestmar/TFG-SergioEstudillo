# Documentación de Archivos del Frontend

## Árbol Completo de Archivos y Carpetas

Este documento detalla cada archivo y carpeta del proyecto frontend actual, reflejando exactamente la estructura mostrada en las capturas.

---

## src/app/ - Estructura Principal

### src/app/core/ - Módulo Central (Servicios Singleton)

#### src/app/core/guards/ - Guardias de Rutas
```
guards/
├── auth.guard.ts              ✅ Protege rutas que requieren autenticación
│                                 - Valida AuthService.isAuthenticated()
│                                 - Redirige a /auth/login si no autenticado
│                                 - Guarda URL de retorno en queryParams
│
├── no-auth.guard.ts           ✅ Protege rutas solo para NO autenticados
│                                 - Previene acceso a login/register si ya estás logeado
│                                 - Redirige a /dashboard si autenticado
│
├── role.guard.ts              ✅ Protege por roles específicos
│                                 - Valida roles en route.data['roles']
│                                 - Redirige a 403 si rol no permitido
│                                 - Soporta múltiples roles
│
└── index.ts                   ✅ Barril de exports
                                 export * from './auth.guard';
                                 export * from './no-auth.guard';
                                 export * from './role.guard';
```

#### src/app/core/interceptors/ - Interceptadores HTTP
```
interceptors/
├── auth.interceptor.ts        ✅ Gestión de JWT
│                                 - Obtiene token de StorageService
│                                 - Añade Authorization: Bearer {token}
│                                 - Maneja 401 (token expirado)
│                                 - Auto logout si 401
│
├── error.interceptor.ts       ✅ Manejo centralizado de errores
│                                 - Captura HTTP errors
│                                 - Muestra notificación de error
│                                 - Logging centralizado
│                                 - Retry logic (opcional)
│
└── index.ts                   ✅ Barril de exports
                                 export * from './auth.interceptor';
                                 export * from './error.interceptor';
```

#### src/app/core/services/ - Servicios Principales

**api/** - Cliente HTTP Base
```
services/api/
└── api.service.ts            ✅ Cliente HTTP centralizado
                                 - Métodos: get<T>, post<T>, put<T>, delete<T>
                                 - URL base desde environment
                                 - Error handling base
                                 - Tipado completo con generics
```

**auth/** - Autenticación y Tokens
```
services/auth/
└── auth.service.ts           ✅ Gestión de autenticación
                                 - login(email, password): login con credenciales
                                 - register(userData): registro nuevo usuario
                                 - logout(): limpia estado
                                 - getMe(): obtiene usuario actual
                                 - isAuthenticated(): verifica token
                                 - BehaviorSubject de usuario
                                 - BehaviorSubject de autenticación
```

**user/** - Gestión de Usuarios
```
services/user/
└── user.service.ts           ✅ CRUD de usuarios
                                 - getUserById(id)
                                 - updateProfile(id, data)
                                 - changePassword(old, new)
                                 - listAllUsers() [admin]
                                 - deleteUser(id)
```

**team/** - Gestión de Equipos
```
services/team/
└── team.service.ts           ✅ CRUD de equipos
                                 - getTeams(): listar todos
                                 - getTeamById(id): equipo específico
                                 - createTeam(data): crear nuevo
                                 - updateTeam(id, data): actualizar
                                 - deleteTeam(id): eliminar
                                 - getTeamsByCategory(catId)
                                 - getFeaturedTeams(): top 6 para landing
```

**player/** - Gestión de Jugadores
```
services/player/
└── player.service.ts         ✅ CRUD de jugadores
                                 - getPlayers(): listar todos
                                 - getPlayerById(id)
                                 - getPlayersByTeam(teamId)
                                 - createPlayer(data)
                                 - updatePlayer(id, data)
                                 - deletePlayer(id)
```

**request/** - Solicitudes de Inscripción
```
services/request/
└── request.service.ts        ✅ Gestión solicitudes inscripción
                                 - createRequest(data): crear solicitud
                                 - getMyRequests(): mis solicitudes
                                 - getUserRequests(userId) [admin]
                                 - getPendingRequests() [admin]
                                 - approveRequest(id) [admin]
                                 - rejectRequest(id, reason) [admin]
```

**convocation/** - Convocatorias y Eventos
```
services/convocation/
└── convocation.service.ts    ✅ CRUD de convocatorias
                                 - getConvocations()
                                 - getConvocationById(id)
                                 - getTeamConvocations(teamId)
                                 - createConvocation(data)
                                 - updateConvocation(id, data)
                                 - deleteConvocation(id)
```

**incident/** - Incidencias y Sanciones
```
services/incident/
└── incident.service.ts       ✅ CRUD de incidencias
                                 - getIncidents()
                                 - getIncidentById(id)
                                 - getPlayerIncidents(playerId)
                                 - createIncident(data)
                                 - updateIncident(id, data)
                                 - deleteIncident(id)
```

**notification/** - Sistema de Notificaciones
```
services/notification/
└── notification.service.ts   ✅ Notificaciones en UI
                                 - showSuccess(message)
                                 - showError(message)
                                 - showWarning(message)
                                 - showInfo(message)
                                 - getNotification(): Observable
                                 - BehaviorSubject con duración automática
```

**storage/** - Almacenamiento Local
```
services/storage/
└── storage.service.ts        ✅ LocalStorage management
                                 - setToken/getToken/removeToken
                                 - setCurrentUser/getCurrentUser
                                 - setPreferences/getPreferences
                                 - clear(): limpia todo
                                 - Manejo seguro de JSON
```

**state/** - Gestión de Estado Global
```
services/state/
├── team-state.service.ts     ✅ Estado global de equipos
│                                 - BehaviorSubject teams$
│                                 - BehaviorSubject loading$
│                                 - BehaviorSubject error$
│                                 - loadTeams(): carga desde backend
│
├── user-state.service.ts     ✅ Estado global de usuarios
│                                 - BehaviorSubject currentUser$
│                                 - BehaviorSubject loading$
│                                 - loadCurrentUser(): de backend
│                                 - updateUser()
│
└── index.ts                  ✅ Barril de exports
                                export * from './team-state.service';
                                export * from './user-state.service';
```

**index.ts** - Barril Central de Servicios
```
services/
└── index.ts                  ✅ Centraliza todos los servicios
                                export * from './api/api.service';
                                export * from './auth/auth.service';
                                export * from './user/user.service';
                                ... y más
```

---

### src/app/shared/ - Módulo Compartido

```
shared/
├── components/               # Componentes reutilizables (expandible)
│   ├── ui/                   # Componentes de UI base
│   │   ├── loading-spinner/
│   │   ├── error-message/
│   │   └── modal-base/
│   ├── forms/                # Componentes de formularios
│   │   ├── search-bar/
│   │   └── date-picker/
│   └── layout/               # Componentes de layout
│       ├── header/
│       └── footer/
├── pipes/                    # Pipes personalizados
│   ├── role-format.pipe.ts   # Formatea rol de usuario
│   ├── date-format.pipe.ts   # Formatea fechas
│   └── truncate.pipe.ts      # Trunca strings largos
├── directives/               # Directivas personalizadas
│   ├── has-role.directive.ts # *appHasRole="ADMIN"
│   └── permission.directive.ts
├── models/                   # Interfaces TypeScript
│   ├── usuario.interface.ts
│   ├── equipo.interface.ts
│   ├── jugador.interface.ts
│   ├── solicitud.interface.ts
│   ├── convocatoria.interface.ts
│   ├── incidencia.interface.ts
│   └── index.ts              # Barril de exports
└── shared.module.ts          # Declaración SharedModule
                                - Imports: CommonModule, IonicModule
                                - Declarations: componentes, pipes, directives
                                - Exports: todo lo anterior
```

---

### src/app/modules/ - Módulos Feature (Lazy Loaded)

#### landing/ - Página de Bienvenida ✅
```
modules/landing/
├── components/
│   ├── hero-section/
│   │   ├── hero-section.component.ts
│   │   │   - @Component selector: 'app-hero-section'
│   │   │   - @Output onRegisterClick, onLoginClick
│   │   │   - Botones principales de CTA
│   │   ├── hero-section.component.html
│   │   │   - ion-card con hero image
│   │   │   - Título y descripción
│   │   │   - Botones "Regístrate" y "Iniciar Sesión"
│   │   └── hero-section.component.scss
│   │       - Estilos del banner principal
│   │
│   └── team-card/
│       ├── team-card.component.ts
│       │   - @Component selector: 'app-team-card'
│       │   - @Input team: Equipo
│       │   - Método: viewTeamDetails()
│       ├── team-card.component.html
│       │   - ion-card con datos del equipo
│       │   - Nombre, categoría, liga
│       │   - Botón "Ver Detalles"
│       └── team-card.component.scss
│           - Estilos de tarjeta
│
├── pages/
│   └── landing/
│       ├── landing.page.ts
│       │   - Inyecta: TeamService, Router
│       │   - Observable: featuredTeams$
│       │   - isLoading: boolean
│       │   - Métodos: onRegisterClick(), onLoginClick(), onViewAllTeams()
│       ├── landing.page.html
│       │   - HeroSectionComponent
│       │   - About section
│       │   - Teams grid con *ngFor
│       │   - Stats section
│       └── landing.page.scss
│           - Estilos de página
│
├── landing.module.ts
│   - Declarations: LandingPage, HeroSection, TeamCard
│   - Imports: CommonModule, IonicModule
│
└── landing-routing.module.ts
    - Ruta: '' → LandingPage
    - En app-routing.ts:
      {
        path: 'landing',
        loadChildren: () => import('./modules/landing/landing.module')
          .then(m => m.LandingModule)
      }
```

#### auth/ - Autenticación 🔄
```
modules/auth/
├── pages/
│   ├── login/                # (Por implementar)
│   ├── register/             # (Por implementar)
│   └── forgot-password/      # (Por implementar)
│
├── auth.module.ts
│   - Imports: CommonModule, IonicModule, ReactiveFormsModule
│
└── auth-routing.module.ts
    - Rutas: login, register, forgot-password
    - Guards: NoAuthGuard en login/register
```

#### dashboard/ - Panel General 📋
```
modules/dashboard/
├── components/
│   └── dashboard-card/
│       ├── dashboard-card.component.ts
│       │   - @Input data
│       ├── dashboard-card.component.html
│       └── dashboard-card.component.scss
│
├── pages/
│   └── dashboard/
│       ├── dashboard.page.ts
│       │   - Inyecta servicios necesarios
│       ├── dashboard.page.html
│       └── dashboard.page.scss
│
├── dashboard.module.ts
└── dashboard-routing.module.ts
    - Guard: [AuthGuard]
```

#### admin/ - Panel Administrativo 📋
```
modules/admin/
├── pages/
│   └── admin-dashboard/
│       ├── admin-dashboard.page.ts
│       ├── admin-dashboard.page.html
│       └── (no scss en captura)
│
├── admin.module.ts
└── admin-routing.module.ts
    - Guards: [AuthGuard, RoleGuard]
    - data: { roles: ['ADMIN'] }
```

#### coach/ - Dashboard Entrenador 📋
```
modules/coach/
├── pages/
│   └── coach-dashboard/
│       ├── coach-dashboard.page.ts
│       ├── coach-dashboard.page.html
│       └── coach-dashboard.page.scss
│
├── coach.module.ts
└── coach-routing.module.ts
    - Guards: [AuthGuard, RoleGuard]
    - data: { roles: ['ENTRENADOR'] }
```

#### players/ - Gestión Jugadores 📋
```
modules/players/
├── pages/
│   └── player-dashboard/
│       ├── player-dashboard.page.ts
│       ├── player-dashboard.page.html
│       └── player-dashboard.page.scss
│
├── players.module.ts
└── players-routing.module.ts
    - Guards: [AuthGuard]
```

#### user/ - Perfil Usuario 📋
```
modules/user/
├── pages/
│   └── user-dashboard/
│       ├── user-dashboard.page.ts
│       ├── user-dashboard.page.html
│       └── user-dashboard.page.scss
│
├── user.module.ts
└── user-routing.module.ts
    - Guards: [AuthGuard]
```

---

### src/app/ - Archivos Raíz

```
app/
├── app-routing.module.ts      ✅ Enrutamiento principal
                                  const routes: Routes = [
                                    { path: '', redirectTo: '/landing', pathMatch: 'full' },
                                    { 
                                      path: 'landing',
                                      loadChildren: () => import('./modules/landing/landing.module')
                                        .then(m => m.LandingModule)
                                    },
                                    { 
                                      path: 'auth',
                                      loadChildren: () => import('./modules/auth/auth.module')
                                        .then(m => m.AuthModule),
                                      canActivate: [NoAuthGuard]
                                    },
                                    // ... más rutas
                                  ];

├── app.component.ts           ✅ Componente raíz
                                  - @Component selector: 'app-root'
                                  - Inyecta AuthService para estado global
                                  - Inyecta Router para navegación
                                  
├── app.component.html         ✅ Template raíz
                                  <ion-app>
                                    <ion-router-outlet></ion-router-outlet>
                                  </ion-app>

├── app.component.scss         ✅ Estilos raíz
                                  - Estilos globales del app

├── app.module.ts              ✅ Módulo raíz
                                  imports: [
                                    BrowserModule,
                                    IonicModule.forRoot(),
                                    AppRoutingModule,
                                    CoreModule,
                                    SharedModule
                                  ],
                                  providers: [
                                    { provide: HTTP_INTERCEPTORS, 
                                      useClass: AuthInterceptor, 
                                      multi: true },
                                    { provide: HTTP_INTERCEPTORS, 
                                      useClass: ErrorInterceptor, 
                                      multi: true }
                                  ]
```

---

### src/environments/ - Configuración por Entorno

```
environments/
├── environment.ts            ✅ Desarrollo
│                                export const environment = {
│                                  production: false,
│                                  apiUrl: 'http://localhost:8080/api',
│                                  logLevel: 'debug',
│                                  tokenKey: 'auth_token_dev',
│                                  cachingEnabled: true
│                                };
│
└── environment.prod.ts       ✅ Producción
                                export const environment = {
                                  production: true,
                                  apiUrl: 'https://api.damunited.com/api',
                                  logLevel: 'error',
                                  tokenKey: 'auth_token',
                                  cachingEnabled: true
                                };
```

---

### src/theme/ - Estilos Globales

```
theme/
├── variables.scss            ✅ Variables Ionic
                                 - Colores primarios, secundarios, etc.
                                 - Fuentes y tipografía
                                 - Espaciado y grid
                                 - Tema dark/light
│
└── global.scss               ✅ Estilos globales
                                 - Reset CSS
                                 - Clases de utilidad
                                 - Body, html, * globals
                                 - Breakpoints media queries
```

---

### src/ - Archivos de Entrada

```
src/
├── index.html               ✅ Punto de entrada HTML
│                               <!DOCTYPE html>
│                               <html>
│                               <head>
│                                 <meta charset="utf-8">
│                                 <meta name="viewport">
│                               </head>
│                               <body>
│                                 <app-root></app-root>
│                               </body>
│                               </html>
│
├── main.ts                  ✅ Punto de entrada TypeScript
│                               import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
│                               import { AppModule } from './app/app.module';
│                               platformBrowserDynamic()
│                                 .bootstrapModule(AppModule)
│                                 .catch(err => console.error(err));
│
├── polyfills.ts             ✅ Polyfills para compatibilidad
│                               import 'zone.js';
│                               // Más polyfills si es necesario
│
└── styles.scss              ✅ Estilos globales (alternativo)
                                - O usa theme/global.scss
```

---

### docs/ - Documentación Interna

```
docs/
├── API_INTEGRATION.md       ✅ Guía de integración API
│                               - Patrones de consumo
│                               - Ejemplos de servicios
│                               - Error handling
│
└── ARCHITECTURE.md          ✅ Arquitectura del proyecto
                                - Diagramas
                                - Flujos de datos
                                - Patrones utilizados
```

---

## Archivos de Configuración Raíz

```
frontend/
├── .angular/                Cache de Angular CLI
├── .vscode/                 Configuración VSCode
├── node_modules/            Dependencias npm (ignorado en git)
│
├── .editorconfig            ✅ Configuración editor
│                               [*.ts]
│                               indent_style = space
│                               indent_size = 2
│
├── .eslintrc.json           ✅ ESLint configuración
│                               - Reglas de linting
│                               - Parser: @typescript-eslint/parser
│
├── .gitignore               ✅ Git ignore patterns
│                               node_modules/
│                               dist/
│                               .angular/
│                               .env
│
├── angular.json             ✅ Configuración Angular CLI
│                               - Build options
│                               - Serve options
│                               - File replacements para entornos
│
├── ionic.config.json        ✅ Configuración Ionic
│                               - App name
│                               - Integrations
│                               - Web preview config
│
├── package.json             ✅ Dependencias npm
│                               - dependencies
│                               - devDependencies
│                               - scripts
│
├── package-lock.json        ✅ Lock file npm
│                               Versiones exactas de dependencias
│
├── tsconfig.json            ✅ TypeScript base config
│                               {
│                                 "compileOnSave": false,
│                                 "compilerOptions": {
│                                   "strict": true,
│                                   "target": "ES2022",
│                                   "module": "ES2022",
│                                   ...
│                                 }
│                               }
│
├── tsconfig.app.json        ✅ TypeScript app config
│                               - Extends tsconfig.json
│                               - Includes/excludes
│                               - Paths aliases
│
├── tsconfig.spec.json       ✅ TypeScript test config
│                               - Para tests
│                               - Jasmine types
│
├── IMPLEMENTATION_SUMMARY.md ✅ Resumen de implementación
                                 - Estado actual
                                 - Checklist de tareas
                                 - Próximos pasos
│
├── PROJECT_SUMMARY.md       ✅ Resumen del proyecto
                                 - Visión general
                                 - Objetivos
                                 - Fases
│
└── README.md                ✅ README local
                                 - Instrucciones setup
                                 - Guía rápida
                                 - Troubleshooting
```

---

## Totales y Estadísticas

### Archivos TypeScript (.ts)
- **Guards:** 4 archivos
- **Interceptores:** 3 archivos (2 + index)
- **Servicios:** 12 archivos (11 servicios + index)
- **Componentes:** 8+ archivos (7 componentes + index)
- **Módulos:** 10+ archivos (7 módulos + core/shared + app)
- **Configuración:** 8 archivos
- **Total estimado:** 45+ archivos .ts

### Archivos HTML (.html)
- **Páginas:** 7 archivos (landing, admin, coach, player, user, dashboard, + app)
- **Componentes:** 3+ archivos (hero-section, team-card, dashboard-card)
- **Total:** 10+ archivos .html

### Archivos SCSS (.scss)
- **Páginas:** 7 archivos
- **Componentes:** 3+ archivos
- **Tema global:** 2 archivos
- **Total:** 12+ archivos .scss

### Archivos de Configuración
- 13+ archivos raíz de configuración

---

*Actualizado: 13/11/2025*  
*Versión: 2.0 (Estructura Real del Proyecto)*