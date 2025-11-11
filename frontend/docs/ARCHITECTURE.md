# Arquitectura del Sistema - Club de Fútbol Pro

## 🏗️ Visión General

Este documento describe la arquitectura técnica completa del sistema de gestión deportiva "Club de Fútbol Pro", desarrollado con Ionic Angular siguiendo las mejores prácticas empresariales.

## 📐 Principios de Arquitectura

### 1. **Separación de Responsabilidades**
- Cada módulo tiene una responsabilidad única y bien definida
- Separación clara entre lógica de negocio y presentación
- Servicios especializados para diferentes dominios

### 2. **Escalabilidad Horizontal**
- Arquitectura modular que permite crecimiento independiente
- Lazy loading de módulos para optimizar rendimiento
- State management centralizado con RxJS

### 3. **Mantenibilidad**
- Código TypeScript con tipado estricto
- Documentación exhaustiva con JSDoc
- Patrones de diseño consistentes
- Testing automatizado

### 4. **Seguridad**
- Autenticación JWT con refresco automático
- Autorización basada en roles (RBAC)
- Validación de datos en frontend y backend
- Protección contra vulnerabilidades comunes

## 🏢 Estructura de Capas

```
┌─────────────────────────────────────────┐
│           Capa de Presentación          │
│  - Components (Ionic)                   │
│  - Pages (Smart/Dumb Components)        │
│  - Templates HTML                       │
│  - Estilos SCSS                         │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         Capa de Lógica de Negocio       │
│  - Servicios de Aplicación              │
│  - Guards de Rutas                      │
│  - Interceptores HTTP                   │
│  - State Management                     │
└─────────────────────────────────────────┐
┌─────────────────────────────────────────┐
│         Capa de Dominio                 │
│  - Modelos de Datos                     │
│  - Interfaces TypeScript                │
│  - Enumeraciones                        │
│  - Utilidades                           │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│         Capa de Infraestructura         │
│  - Servicios API                        │
│  - Almacenamiento Local                 │
│  - Notificaciones                       │
│  - Configuración                        │
└─────────────────────────────────────────┘
```

## 🔄 Patrones de Diseño Implementados

### 1. **Singleton Pattern**
```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Servicio singleton para autenticación
}
```

### 2. **Observer Pattern**
```typescript
private currentUserSubject = new BehaviorSubject<User | null>(null);
public currentUser$ = this.currentUserSubject.asObservable();
```

### 3. **Factory Pattern**
```typescript
// Creación de diferentes tipos de notificaciones
this.notificationService.showSuccess('Operación exitosa');
this.notificationService.showError('Error en la operación');
```

### 4. **Strategy Pattern**
```typescript
// Diferentes estrategias de manejo de errores
private handleError(error: HttpErrorResponse): Observable<never> {
  // Estrategia de manejo de errores
}
```

### 5. **Repository Pattern**
```typescript
// Servicios que actúan como repositorios de datos
export class UserService {
  getAllUsers(): Observable<User[]>
  getUserById(id: number): Observable<User>
  createUser(user: UserCreateDto): Observable<User>
}
```

## 🏛️ Arquitectura de Módulos

### Módulos Core (`app/core/`)

#### Servicios Fundamentales
```typescript
// Servicio API base - punto central de comunicación
export class ApiService {
  get<T>(endpoint: string): Observable<T>
  post<T>(endpoint: string, data: any): Observable<T>
  put<T>(endpoint: string, data: any): Observable<T>
  delete<T>(endpoint: string): Observable<T>
}

// Servicio de autenticación
export class AuthService {
  login(credentials: UserLoginDto): Observable<User>
  logout(): void
  refreshToken(): Observable<AuthResponse>
  hasRole(role: string): boolean
}

// Servicio de almacenamiento
export class StorageService {
  set(key: string, value: any): boolean
  get(key: string): any
  remove(key: string): boolean
}
```

#### Interceptores
```typescript
// Interceptor de autenticación JWT
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
}

// Interceptor de manejo de errores
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
}
```

#### Guards
```typescript
// Protección de rutas autenticadas
export class AuthGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>
}

// Control de acceso por roles
export class RoleGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean>
}
```

### Módulos de Funcionalidad (`app/modules/`)

#### Estructura de Cada Módulo
```
modules/[nombre-modulo]/
├── pages/           # Páginas del módulo
├── components/      # Componentes específicos
├── services/        # Servicios del módulo
└── [nombre-modulo].module.ts
```

#### Ejemplo: Módulo de Equipos
```typescript
@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([
      { path: '', component: TeamsListPage },
      { path: ':id', component: TeamDetailPage }
    ])
  ],
  declarations: [
    TeamsListPage,
    TeamDetailPage,
    TeamCardComponent
  ]
})
export class TeamsModule {}
```

### Módulos Compartidos (`app/shared/`)

#### Modelos de Datos
```typescript
// Modelo de usuario
export interface User {
  id: number;
  username: string;
  email: string;
  roles: UserRole[];
  // ... otros campos
}

// Modelo de equipo
export interface Team {
  id: number;
  nombre: string;
  categoria: Category;
  jugadores: Player[];
  estadisticas?: TeamStats;
}
```

#### Componentes Reutilizables
```typescript
// Componente de tarjeta de equipo
@Component({
  selector: 'app-team-card',
  templateUrl: './team-card.component.html'
})
export class TeamCardComponent {
  @Input() team: Team;
  @Output() cardClick = new EventEmitter<number>();
}
```

## 🔄 Gestión de Estado

### Servicios de Estado
```typescript
// Estado de usuario
export class UserStateService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  loadCurrentUser(): Observable<User>
  updateCurrentUser(user: User): void
  hasRole(role: UserRole): Observable<boolean>
}

// Estado de equipos
export class TeamStateService {
  private teamsSubject = new BehaviorSubject<Team[]>([]);
  public teams$ = this.teamsSubject.asObservable();
  
  loadAllTeams(): Observable<Team[]>
  updateTeamInList(team: Team): void
}
```

### Patrón Observable
```typescript
// Componente consumiendo estado
export class DashboardComponent implements OnInit {
  currentUser$ = this.userStateService.currentUser$;
  teams$ = this.teamStateService.teams$;
  
  ngOnInit() {
    this.userStateService.loadCurrentUser();
    this.teamStateService.loadAllTeams();
  }
}
```

## 🌐 Integración con Backend

### API REST Integration
```typescript
// Servicio específico para usuarios
export class UserService {
  constructor(private apiService: ApiService) {}
  
  getCurrentUser(): Observable<User> {
    return this.apiService.get<User>('usuarios/current');
  }
  
  updateProfile(userId: number, data: UserUpdateDto): Observable<User> {
    return this.apiService.put<User>(`usuarios/${userId}`, data);
  }
}
```

### Manejo de Errores
```typescript
// Manejo centralizado de errores
private handleError(error: HttpErrorResponse): Observable<never> {
  switch (error.status) {
    case 401:
      return this.handleUnauthorizedError();
    case 403:
      return this.handleForbiddenError();
    case 404:
      return this.handleNotFoundError();
    default:
      return this.handleGenericError(error);
  }
}
```

## 🎨 Sistema de Diseño

### Variables de Tema
```scss
:root {
  // Colores principales del club
  --ion-color-primary: #1e3a8a;    // Azul marino
  --ion-color-secondary: #059669;   // Verde esmeralda
  --ion-color-tertiary: #7c3aed;    // Púrpura
  --ion-color-warning: #f59e0b;     // Ámbar
  --ion-color-danger: #ef4444;      // Rojo
  
  // Tipografía
  --ion-font-family: 'Inter', sans-serif;
  
  // Espaciado
  --ion-spacing-xs: 4px;
  --ion-spacing-sm: 8px;
  --ion-spacing-md: 16px;
  --ion-spacing-lg: 24px;
  --ion-spacing-xl: 32px;
  
  // Sombras
  --ion-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --ion-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --ion-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

### Componentes de Diseño
```typescript
// Sistema de notificaciones consistente
export class NotificationService {
  showToast(message: string, duration: number = 3000, color: string = 'primary')
  showSuccess(message: string)
  showError(message: string)
  showLoading(message: string)
  showConfirm(header: string, message: string): Promise<boolean>
}
```

## 🔒 Seguridad

### Autenticación JWT
```typescript
// Flujo de autenticación
1. Usuario inicia sesión → AuthService.login()
2. Backend retorna JWT → Almacenado en localStorage
3. Interceptor añade token → Authorization: Bearer [token]
4. Token expira → Refresco automático
5. Token inválido → Logout y redirección
```

### Autorización RBAC
```typescript
// Control de acceso por roles
export class RoleGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const expectedRoles = route.data['roles'] as string[];
    return this.authService.currentUser$.pipe(
      map(user => {
        const hasRole = user?.roles?.some(role => expectedRoles.includes(role));
        if (!hasRole) {
          this.redirectByRole(user?.roles || []);
        }
        return hasRole || false;
      })
    );
  }
}
```

## 📈 Rendimiento

### Optimizaciones Implementadas
1. **Lazy Loading**: Módulos cargados bajo demanda
2. **OnPush Strategy**: Detección de cambios optimizada
3. **Virtual Scrolling**: Para listas largas
4. **Image Lazy Loading**: Carga diferida de imágenes
5. **Bundle Splitting**: División de código por rutas
6. **Preloading Strategy**: Precarga estratégica de módulos

### Métricas Objetivo
- **Tiempo de carga inicial**: < 3 segundos
- **Performance Score**: > 90 en Lighthouse
- **Bundle size**: < 500KB inicial
- **Time to Interactive**: < 5 segundos

## 🧪 Testing Strategy

### Estructura de Testing
```
├── unit/                    # Tests unitarios
│   ├── services/           # Tests de servicios
│   ├── components/         # Tests de componentes
│   └── guards/             # Tests de guards
├── integration/            # Tests de integración
└── e2e/                    # Tests end-to-end
```

### Herramientas de Testing
- **Jasmine**: Framework de testing
- **Karma**: Test runner
- **Protractor**: E2E testing
- **Istanbul**: Code coverage

## 🚀 Despliegue

### Estrategia de Despliegue
1. **Development**: `ionic serve`
2. **Testing**: `ionic build --configuration=test`
3. **Staging**: `ionic build --configuration=staging`
4. **Production**: `ionic build --prod`

### CI/CD Pipeline
```yaml
# GitHub Actions example
name: CI/CD Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:ci
      - name: Build
        run: npm run build:prod
```

## 📚 Mejores Prácticas

### Código
- TypeScript strict mode habilitado
- Interfaces para todos los modelos
- Documentación JSDoc obligatoria
- Nomenclatura consistente (camelCase)

### Git
- Commits descriptivos con convención
- Branches por feature/bugfix
- Pull requests con revisión obligatoria
- Tags para versiones estables

### Performance
- Lazy loading de módulos
- OnPush change detection donde sea posible
- Optimización de imágenes
- Minimización de bundle size

### Seguridad
- Validación de entrada obligatoria
- Sanitización de datos
- HTTPS siempre
- Headers de seguridad apropiados

## 🔮 Roadmap

### Fase 1 - MVP (Completado)
- ✅ Sistema de autenticación
- ✅ Gestión básica de equipos y jugadores
- ✅ Convocatorias y solicitudes
- ✅ Dashboard personalizado

### Fase 2 - Mejoras (En progreso)
- 🔄 Sistema de notificaciones push
- 🔄 Chat en tiempo real
- 🔄 Análisis avanzado de datos
- 🔄 Integración con dispositivos wearables

### Fase 3 - Escalabilidad (Planeado)
- 📋 Microfrontend architecture
- 📋 Server-side rendering (SSR)
- 📋 Progressive Web App (PWA) avanzada
- 📋 Integración con sistemas externos

---

**Documento mantenido por**: Equipo de Arquitectura Frontend
**Última actualización**: Noviembre 2024
**Versión**: 1.0.0