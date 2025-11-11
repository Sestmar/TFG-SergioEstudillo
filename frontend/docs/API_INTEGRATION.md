# Integración API - Club de Fútbol Pro

## 📋 Descripción

Este documento describe la integración completa con la API REST del backend, incluyendo endpoints, modelos de datos, flujos de autenticación y manejo de errores.

## 🔗 Endpoints de la API

### Base URL
```typescript
// Development
const API_URL = 'http://localhost:8080/api';

// Production
const API_URL = 'https://api.tuclubfutbol.com/api';
```

### Endpoints Principales

#### 1. Autenticación
```typescript
// Login
POST /api/auth/login
{
  username: string;
  password: string;
}
Response: {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

// Refresh token
POST /api/auth/refresh
{
  refreshToken: string;
}

// Logout
POST /api/auth/logout

// Forgot password
POST /api/auth/forgot-password
{
  email: string;
}

// Reset password
POST /api/auth/reset-password
{
  token: string;
  newPassword: string;
}
```

#### 2. Usuarios
```typescript
// Get current user
GET /api/usuarios/current
Response: User

// Get user by ID
GET /api/usuarios/{id}
Response: User

// Get all users (paginated)
GET /api/usuarios?page=0&size=20&role=JUGADOR
Response: {
  users: User[];
  total: number;
  page: number;
  size: number;
}

// Create user
POST /api/usuarios
{
  username: string;
  email: string;
  password: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  fechaNacimiento?: Date;
}

// Update user
PUT /api/usuarios/{id}
{
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  fechaNacimiento?: Date;
  fotoPerfil?: string;
}

// Deactivate user
PUT /api/usuarios/{id}/deactivate

// Activate user
PUT /api/usuarios/{id}/activate

// Change user role
PUT /api/usuarios/{id}/role
{
  role: UserRole;
}
```

#### 3. Equipos
```typescript
// Get all teams
GET /api/equipos?categoriaId=1&activo=true
Response: {
  teams: Team[];
  total: number;
}

// Get team by ID
GET /api/equipos/{id}
Response: Team

// Create team
POST /api/equipos
{
  nombre: string;
  categoriaId: number;
  ligaId: number;
  colorPrincipal: string;
  colorSecundario: string;
  escudo?: string;
}

// Update team
PUT /api/equipos/{id}
{
  nombre?: string;
  colorPrincipal?: string;
  colorSecundario?: string;
  escudo?: string;
}

// Assign coach
PUT /api/equipos/{id}/coach
{
  coachId: number;
  isAssistant: boolean;
}

// Get team players
GET /api/equipos/{id}/jugadores
Response: Player[]

// Get team stats
GET /api/equipos/{id}/stats
Response: TeamStats
```

#### 4. Jugadores
```typescript
// Get all players
GET /api/jugadores?equipoId=1&disponible=true
Response: {
  players: Player[];
  total: number;
}

// Get player by ID
GET /api/jugadores/{id}
Response: Player

// Create player
POST /api/jugadores
{
  usuarioId: number;
  equipoId?: number;
  dorsal?: number;
  posicion: PlayerPosition;
  altura?: number;
  peso?: number;
  pieDominante: 'IZQUIERDO' | 'DERECHO' | 'AMBIDIESTRO';
}

// Update player
PUT /api/jugadores/{id}
{
  dorsal?: number;
  posicion?: PlayerPosition;
  altura?: number;
  peso?: number;
  disponible?: boolean;
  lesionado?: boolean;
}

// Assign to team
PUT /api/jugadores/{id}/team
{
  teamId: number;
  dorsal?: number;
}

// Update availability
PUT /api/jugadores/{id}/availability
{
  disponible: boolean;
}

// Report injury
PUT /api/jugadores/{id}/injury
{
  lesionado: boolean;
  descripcion?: string;
}

// Get player stats
GET /api/jugadores/{id}/stats
Response: PlayerStats

// Get player history
GET /api/jugadores/{id}/history
Response: PlayerTeamHistory[]
```

#### 5. Convocatorias
```typescript
// Get all convocations
GET /api/convocatoria?equipoId=1&tipo=PARTIDO_OFICIAL
Response: {
  convocations: Convocation[];
  total: number;
}

// Get convocation by ID
GET /api/convocatoria/{id}
Response: Convocation

// Create convocation
POST /api/convocatoria
{
  equipoId: number;
  tipo: ConvocationType;
  titulo: string;
  descripcion?: string;
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
  lugar: string;
  jugadoresIds: number[];
  notasTacticas?: string;
}

// Update convocation
PUT /api/convocatoria/{id}
{
  titulo?: string;
  descripcion?: string;
  fechaHoraInicio?: Date;
  fechaHoraFin?: Date;
  lugar?: string;
  notasTacticas?: string;
}

// Cancel convocation
PUT /api/convocatoria/{id}/cancel
{
  motivo: string;
}

// Finish convocation
PUT /api/convocatoria/{id}/finish
{
  resultado?: MatchResult;
}

// Update attendance
PUT /api/convocatoria/attendance
{
  convokedPlayerId: number;
  estadoAsistencia: AttendanceStatus;
  notas?: string;
}

// Get player convocations
GET /api/convocatoria/jugador/{jugadorId}
Response: Convocation[]

// Get team convocations
GET /api/convocatoria/equipo/{equipoId}
Response: Convocation[]

// Get upcoming convocations
GET /api/convocatoria/upcoming?days=7
Response: Convocation[]

// Get pending confirmations
GET /api/convocatoria/pending-confirmations
Response: ConvokedPlayer[]
```

#### 6. Solicitudes de Inscripción
```typescript
// Create inscription request
POST /api/solicitudinscripcion
{
  usuarioId: number;
  mensajeSolicitud?: string;
  datosJugador: PlayerRequestData;
  historialDeportivo: SportHistory[];
}

// Get all requests
GET /api/solicitudinscripcion?estado=PENDIENTE&page=0&size=20
Response: {
  requests: InscriptionRequest[];
  total: number;
}

// Get request by ID
GET /api/solicitudinscripcion/{id}
Response: InscriptionRequest

// Get user requests
GET /api/solicitudinscripcion/usuario/{usuarioId}
Response: InscriptionRequest[]

// Get current user request
GET /api/solicitudinscripcion/current
Response: InscriptionRequest | null

// Approve request
PUT /api/solicitudinscripcion/{id}/approve
{
  mensaje?: string;
}

// Reject request
PUT /api/solicitudinscripcion/{id}/reject
{
  motivo: string;
}

// Cancel request
PUT /api/solicitudinscripcion/{id}/cancel
{
  motivo?: string;
}

// Get request stats
GET /api/solicitudinscripcion/stats
Response: {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  requestsThisMonth: number;
}
```

#### 7. Incidencias
```typescript
// Create incident
POST /api/incidencia
{
  tipo: IncidentType;
  gravedad: IncidentSeverity;
  titulo: string;
  descripcion: string;
  jugadorAfectadoId?: number;
  equipoId: number;
  convocatoriaId?: number;
  fechaOcurrencia: Date;
  lugar: string;
  testigo?: string;
  accionesTomadas: string[];
  recomendaciones?: string;
}

// Get all incidents
GET /api/incidencia?tipo=LESION&estado=ABIERTA
Response: {
  incidents: Incident[];
  total: number;
}

// Get incident by ID
GET /api/incidencia/{id}
Response: Incident

// Update incident
PUT /api/incidencia/{id}
{
  titulo?: string;
  descripcion?: string;
  estado?: IncidentStatus;
  recomendaciones?: string;
}

// Add follow-up
PUT /api/incidencia/{id}/follow-up
{
  fecha: Date;
  descripcion: string;
  profesional?: string;
  accionesRealizadas: string[];
  estadoPaciente?: string;
  proximaRevision?: Date;
}

// Close incident
PUT /api/incidencia/{id}/close
{
  resolucion: string;
}

// Get team incidents
GET /api/incidencia/equipo/{equipoId}
Response: Incident[]

// Get player incidents
GET /api/incidencia/jugador/{jugadorId}
Response: Incident[]

// Get incident stats
GET /api/incidencia/stats
Response: {
  totalIncidents: number;
  openIncidents: number;
  incidentsByType: { [key: string]: number };
  incidentsBySeverity: { [key: string]: number };
  incidentsThisMonth: number;
}
```

## 🔐 Flujo de Autenticación

### 1. Login Inicial
```typescript
// Cliente envía credenciales
const credentials: UserLoginDto = {
  username: 'usuario@ejemplo.com',
  password: 'contraseñaSegura123'
};

// Backend responde con tokens
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { /* datos del usuario */ },
  "expiresIn": 3600
}
```

### 2. Almacenamiento de Tokens
```typescript
// Almacenamiento seguro en localStorage
this.storageService.set(environment.jwtConfig.tokenKey, response.token);
this.storageService.set(environment.jwtConfig.refreshTokenKey, response.refreshToken);
```

### 3. Interceptor JWT
```typescript
// Interceptor añade token a todas las peticiones
intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  const token = this.storageService.get(environment.jwtConfig.tokenKey);
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next.handle(req);
}
```

### 4. Refresco Automático de Token
```typescript
// Programar refresco antes de expirar
private scheduleTokenRefresh(token: string): void {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    const expirationTime = payload.exp * 1000;
    const refreshTime = expirationTime - (environment.jwtConfig.tokenExpirationOffset * 1000);
    const delay = refreshTime - Date.now();

    if (delay > 0) {
      this.tokenRefreshTimer = setTimeout(() => {
        this.refreshToken().subscribe();
      }, delay);
    }
  } catch (error) {
    console.error('Error scheduling token refresh:', error);
  }
}
```

### 5. Manejo de Errores 401
```typescript
// Reintentar con token refrescado
private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  if (!this.isRefreshing) {
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.authService.refreshToken().pipe(
      switchMap((response: any) => {
        this.isRefreshing = false;
        this.refreshTokenSubject.next(response.token);
        return next.handle(this.addToken(req, response.token));
      }),
      catchError(error => {
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => error);
      })
    );
  }
}
```

## 📊 Manejo de Errores

### Tipos de Errores HTTP
```typescript
// Mapeo de códigos de error a mensajes de usuario
private handleError(error: HttpErrorResponse): void {
  let message = 'Ha ocurrido un error inesperado';
  
  switch (error.status) {
    case 0:
      message = 'No se pudo conectar con el servidor';
      break;
    case 400:
      message = this.getValidationErrorMessage(error);
      break;
    case 401:
      // Manejado por AuthInterceptor
      return;
    case 403:
      message = 'No tienes permisos para realizar esta acción';
      break;
    case 404:
      message = 'El recurso solicitado no fue encontrado';
      break;
    case 409:
      message = 'Conflicto: El recurso ya existe o está en uso';
      break;
    case 422:
      message = this.getValidationErrorMessage(error);
      break;
    case 429:
      message = 'Demasiadas solicitudes. Por favor, inténtalo más tarde';
      break;
    case 500:
      message = 'Error interno del servidor. Por favor, inténtalo más tarde';
      break;
    case 503:
      message = 'El servicio no está disponible temporalmente';
      break;
    default:
      if (error.error?.message) {
        message = error.error.message;
      }
  }
  
  this.notificationService.showError(message);
}
```

### Validación de Errores
```typescript
private getValidationErrorMessage(error: HttpErrorResponse): string {
  if (error.error?.errors) {
    const errors = error.error.errors;
    const messages = Object.values(errors).flat() as string[];
    return messages.join('. ') || 'Error de validación';
  }
  
  if (error.error?.message) {
    return error.error.message;
  }
  
  return 'Datos inválidos. Por favor, verifica la información';
}
```

## 🔄 Paginación

### Implementación de Paginación
```typescript
// Parámetros de paginación
interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

// Respuesta paginada
interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Uso en servicios
export class UserService {
  getAllUsers(params: PaginationParams): Observable<PaginatedResponse<User>> {
    return this.apiService.get<PaginatedResponse<User>>('usuarios', params);
  }
}
```

## 📱 Optimización Mobile

### Estrategias de Caché
```typescript
// Caché con expiración
export class StorageService {
  setWithExpiry(key: string, value: any, ttlMinutes: number): boolean {
    const item = {
      value: value,
      expiry: Date.now() + (ttlMinutes * 60 * 1000)
    };
    return this.set(key, item);
  }
  
  getWithExpiry(key: string): any {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    try {
      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        this.remove(key);
        return null;
      }
      return item.value;
    } catch (error) {
      this.remove(key);
      return null;
    }
  }
}
```

### Gestión de Estado Offline
```typescript
// Detección de conexión
export class NetworkService {
  private onlineStatusSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public onlineStatus$ = this.onlineStatusSubject.asObservable();
  
  constructor() {
    window.addEventListener('online', () => {
      this.onlineStatusSubject.next(true);
    });
    
    window.addEventListener('offline', () => {
      this.onlineStatusSubject.next(false);
    });
  }
}
```

## 🧪 Testing de Integración

### Tests de Servicios
```typescript
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService, ApiService]
    });
    
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should get current user', () => {
    const mockUser: User = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      // ... otros campos
    };
    
    service.getCurrentUser().subscribe(user => {
      expect(user).toEqual(mockUser);
    });
    
    const req = httpMock.expectOne('http://localhost:8080/api/usuarios/current');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });
});
```

## 📚 Modelos de Datos

### Interfaces TypeScript Principales
```typescript
// Modelo de usuario
export interface User {
  id: number;
  username: string;
  email: string;
  nombre: string;
  apellidos: string;
  telefono?: string;
  fechaNacimiento?: Date;
  fotoPerfil?: string;
  activo: boolean;
  fechaRegistro: Date;
  fechaActualizacion: Date;
  roles: UserRole[];
}

// Modelo de equipo
export interface Team {
  id: number;
  nombre: string;
  categoria: Category;
  liga: Liga;
  entrenadorPrincipal?: Coach;
  entrenadorAsistente?: Coach;
  jugadores: Player[];
  escudo?: string;
  colorPrincipal: string;
  colorSecundario: string;
  fechaFundacion: Date;
  activo: boolean;
  estadisticas?: TeamStats;
}

// Modelo de convocatoria
export interface Convocation {
  id: number;
  equipo: Team;
  tipo: ConvocationType;
  titulo: string;
  descripcion?: string;
  fechaHoraInicio: Date;
  fechaHoraFin: Date;
  lugar: string;
  jugadoresConvocados: ConvokedPlayer[];
  entrenadorPrincipal: Coach;
  estado: ConvocationStatus;
  notasTacticas?: string;
  resultado?: MatchResult;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔧 Configuración de Entornos

### Environment Files
```typescript
// environment.ts (development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  appName: 'Club de Fútbol Pro',
  version: '1.0.0',
  defaultLocale: 'es-ES',
  enableDebug: true,
  jwtConfig: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpirationOffset: 300 // 5 minutos
  }
};

// environment.prod.ts (production)
export const environment = {
  production: true,
  apiUrl: 'https://api.tuclubfutbol.com/api',
  appName: 'Club de Fútbol Pro',
  version: '1.0.0',
  defaultLocale: 'es-ES',
  enableDebug: false,
  jwtConfig: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpirationOffset: 300
  }
};
```

---

**Documento mantenido por**: Equipo de Backend Integration
**Última actualización**: Noviembre 2024
**Versión**: 1.0.0