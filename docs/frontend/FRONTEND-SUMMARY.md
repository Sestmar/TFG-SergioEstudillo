# Resumen de Estructura del Proyecto Frontend

## Visión General Rápida

```
┌─────────────────────────────────────────────────┐
│         APLICACIÓN PRINCIPAL (App Module)       │
│         Angular 16 + Ionic 7 + RxJS             │
└────────────────┬────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌──────────────┐      ┌───────────────┐
│ CORE MODULE  │      │ SHARED MODULE │
│ (Singleton)  │      │ (Reutilizable)│
└──────────────┘      └───────────────┘
    │                         │
    ├─ Guards (4)            ├─ Components
    ├─ Interceptores (2)     ├─ Pipes
    ├─ Services (11+)        ├─ Directives
    └─ State (2)             └─ Models/Interfaces
                              
    │                         │
    └────────────┬────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │  FEATURE MODULES   │
        │  (Lazy Loading)    │
        ├────────────────────┤
        │ ✅ Landing Module  │
        │ 🔄 Auth Module     │
        │ 📋 Dashboard       │
        │ 📋 Admin           │
        │ 📋 Coach           │
        │ 📋 Players         │
        │ 📋 User            │
        └────────────────────┘
                 │
                 ▼
         ┌──────────────────┐
         │  Spring Boot API │
         │  (Backend REST)  │
         └──────────────────┘
```

---

## Números Clave del Proyecto

### Core Services
- **Total:** 11 servicios principales
- **Ubicación:** `src/app/core/services/`
- **Composición:**
  - 1 ApiService (base HTTP)
  - 1 AuthService (autenticación)
  - 9 Servicios específicos (User, Team, Player, Request, Convocation, Incident, Notification, Storage)
  - 2 State Services (Team, User)

### Guards
- **Total:** 4 guards
- **Protección:** Autenticación, roles, rutas públicas
- **Archivos:**
  - `auth.guard.ts` → Requiere usuario logeado
  - `no-auth.guard.ts` → Solo sin autenticar
  - `role.guard.ts` → Por rol específico
  - `index.ts` → Barril exports

### Interceptores
- **Total:** 2 interceptores HTTP
- **Funcionalidad:**
  - `auth.interceptor.ts` → Añade JWT automáticamente
  - `error.interceptor.ts` → Maneja errores centralizados
  - `index.ts` → Barril exports

### Módulos Feature
- **Total:** 7 módulos
- **Estado:**
  - 1 Completo (Landing)
  - 1 En desarrollo (Auth)
  - 5 Planificados (Dashboard, Admin, Coach, Players, User)
- **Estructura:** Cada módulo con routing lazy-loaded

### Componentes
- **Landing:** 3 componentes (Landing Page + Hero Section + Team Card)
- **Dashboard:** 2 componentes (Dashboard Page + Card)
- **Otros:** Planificados

### Servicios por Endpoint Backend

| Servicio | Endpoint Base | Métodos |
|----------|--------------|---------|
| AuthService | `/api/auth/*`, `/api/usuarios/me` | login, register, logout, getMe |
| UserService | `/api/usuarios` | get, update, list, delete |
| TeamService | `/api/equipos` | get, getAll, create, update, delete |
| PlayerService | `/api/jugadores` | get, getAll, getByTeam, create |
| RequestService | `/api/solicitudinscripcion` | create, getMyRequests, approve, reject |
| ConvocationService | `/api/convocatorias` | get, getAll, create, update, delete |
| IncidentService | `/api/incidencias` | get, getAll, create, update, delete |

---

## Flujo de Datos Completo

### Ejemplo: Listar Equipos en Landing Page

```
1. LandingPage (Component)
   ↓
   Inyecta TeamService
   ↓
2. TeamService.getFeaturedTeams()
   ↓
   Inyecta ApiService
   ↓
3. ApiService.get('/equipos')
   ↓
   Crea HttpRequest
   ↓
4. AuthInterceptor
   ├─ Obtiene token de StorageService
   ├─ Añade header: Authorization: Bearer {token}
   └─ Pasa petición al siguiente interceptor
   ↓
5. ErrorInterceptor
   ├─ Pasa petición al backend
   ├─ Espera respuesta
   └─ Si error 401 → AuthService.logout()
   ↓
6. Backend (Spring Boot)
   ├─ http://localhost:8080/api/equipos (GET)
   └─ Retorna JSON con lista de equipos
   ↓
7. ErrorInterceptor (Respuesta)
   ├─ Verifica HTTP status
   └─ Pasa al siguiente
   ↓
8. Observable response
   ├─ map() en TeamService
   ├─ filter(), slice() para destacados
   └─ Retorna Observable<Equipo[]>
   ↓
9. LandingPage Component
   ├─ Recibe Observable
   ├─ Template: *ngFor con async pipe
   └─ Renderiza tarjetas
   ↓
10. Vista actualizada
    └─ Muestra equipos en página
```

---

## Rutas Implementadas

```typescript
// app-routing.module.ts

'/' → redirect '/landing'

'/landing' → LandingModule (lazy)
  └─ Componente: LandingPage
  └─ Componentes internos: HeroSection, TeamCard

'/auth' → AuthModule (lazy) [NoAuthGuard]
  ├─ /auth/login → LoginPage (por hacer)
  ├─ /auth/register → RegisterPage (por hacer)
  └─ /auth/forgot-password → ForgotPasswordPage (por hacer)

'/dashboard' → DashboardModule (lazy) [AuthGuard]
  └─ Componentes: DashboardPage, DashboardCard

'/admin' → AdminModule (lazy) [AuthGuard, RoleGuard(ADMIN)]
  └─ Componentes: AdminDashboardPage

'/coach' → CoachModule (lazy) [AuthGuard, RoleGuard(ENTRENADOR)]
  └─ Componentes: CoachDashboardPage

'/players' → PlayersModule (lazy) [AuthGuard]
  └─ Componentes: PlayerDashboardPage

'/user' → UserModule (lazy) [AuthGuard]
  └─ Componentes: UserDashboardPage
```

---

## Modelos de Datos (Interfaces)

```typescript
// shared/models/usuario.interface.ts
Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  fechaCreacion: Date;
  rol: 'JUGADOR' | 'ENTRENADOR' | 'ADMIN';
}

// shared/models/equipo.interface.ts
Equipo {
  id: number;
  nombre: string;
  fechaCreacion: Date;
  observaciones?: string;
  categoria: Categoria;
  liga: Liga;
  jugadores?: Jugador[];
  entrenadores?: Usuario[];
}

// shared/models/jugador.interface.ts
Jugador {
  id: number;
  usuario: Usuario;
  dorsal?: number;
  posicion: string;
  equipo: Equipo;
  activo: boolean;
}

// shared/models/solicitud.interface.ts
SolicitudInscripcion {
  id: number;
  usuario: Usuario;
  equipo: Equipo;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  fechaSolicitud: Date;
}

// shared/models/convocatoria.interface.ts
Convocatoria {
  id: number;
  equipo: Equipo;
  tipo: 'ENTRENAMIENTO' | 'PARTIDO' | 'AMISTOSO';
  fecha: Date;
  lugar?: string;
  observaciones?: string;
}

// shared/models/incidencia.interface.ts
Incidencia {
  id: number;
  jugador: Jugador;
  tipo: 'LESION' | 'SANCION' | 'BLOQUEO' | 'OTRO';
  descripcion: string;
  fecha: Date;
}
```

---

## Estados de Implementación

### ✅ Completado (Production Ready)

- **Landing Module:** 100% funcional
  - ✅ Estructura modular correcta
  - ✅ Componentes reutilizables (HeroSection, TeamCard)
  - ✅ Integración con backend (getFeaturedTeams)
  - ✅ Routing lazy-loaded
  - ✅ Responsive design

- **Core Guards:** 100% implementados
  - ✅ AuthGuard (protege rutas autenticadas)
  - ✅ NoAuthGuard (protege rutas públicas)
  - ✅ RoleGuard (control por roles)

- **Interceptores:** 100% implementados
  - ✅ AuthInterceptor (JWT en headers)
  - ✅ ErrorInterceptor (manejo centralizado)

- **Servicios Base:** 100% estructura
  - ✅ ApiService (cliente HTTP)
  - ✅ AuthService (autenticación framework)
  - ✅ StorageService (persistencia)
  - ✅ NotificationService (UI messages)
  - ✅ Servicios específicos (Team, User, Player, etc.)

### 🔄 En Desarrollo (Partial)

- **Auth Module:** 30% avance
  - ✅ Módulo creado
  - ✅ Routing configurado
  - ❌ Login page (por hacer)
  - ❌ Register page (por hacer)
  - ❌ Forgot password page (por hacer)
  - ❌ Validaciones de formularios (por hacer)

### 📋 Planificado (Not Started)

- **Dashboard Module:** 0% avance
- **Admin Module:** 0% avance
- **Coach Module:** 0% avance
- **Players Module:** 0% avance
- **User Module:** 0% avance

---

## Dependencias Clave (package.json)

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
    "typescript": "~5.1.0"
  }
}
```

---

## Comandos Angular CLI Útiles

```bash
# Generar módulo con routing
ng generate module modules/nombreModulo --routing

# Generar componente
ng generate component modules/nombreModulo/pages/nombrePagina

# Generar servicio en core
ng generate service core/services/nombreServicio/nombreServicio

# Generar guard
ng generate guard core/guards/nombreGuard

# Servir en desarrollo
ng serve

# Build para producción
ng build --configuration production

# Ejecutar tests
ng test

# Lint código
ng lint

# Ver dependencias
npm list --depth=0
```

---

## Próximos Pasos Recomendados

### Corto Plazo (Próxima Semana)
1. Completar Auth Module (login, register)
2. Implementar validaciones en formularios
3. Integrar JWT en AuthService
4. Testear flujo completo de autenticación

### Mediano Plazo (Próximas 2-3 Semanas)
1. Crear Dashboard Module
2. Crear Admin Module con RoleGuard
3. Crear Coach Dashboard
4. Implementar listados de usuarios/equipos/jugadores

### Largo Plazo (Próximas 4+ Semanas)
1. Módulo Players completo
2. Módulo User con perfil editable
3. Sistema de incidencias
4. Sistema de convocatorias
5. Notificaciones en tiempo real
6. Testing unitario completo

---

## Archivos de Configuración Importante

```
tsconfig.json           → Config TypeScript strict mode
tsconfig.app.json       → Específica para app
angular.json            → Config Angular CLI
ionic.config.json       → Config Ionic
package.json            → Dependencias npm
.eslintrc.json          → Linting rules
.editorconfig           → Editor preferences
.gitignore              → Git ignore patterns
environments/           → Config por entorno
  ├── environment.ts    → Desarrollo
  └── environment.prod.ts → Producción
```

---

## Referencias Rápidas

- **Documentación Angular:** https://angular.io/docs
- **Documentación Ionic:** https://ionicframework.com/docs
- **RxJS Operators:** https://rxjs.dev/api
- **TypeScript:** https://www.typescriptlang.org/docs/
- **Material Design:** https://material.io/design
- **API Backend:** http://localhost:8080/api (local)

---

*Documento de referencia rápida*  
*Última actualización: 13/11/2025*  
*Para detalles técnicos completos ver: frontend.md*