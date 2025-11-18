# TFG Club de Fútbol — Sergio Estudillo

## Índice

1. [Introducción](#introducción)
2. [Modelo Entidad-Relación y Base de Datos](#modelo-entidad-relación-y-base-de-datos)
3. [Tecnologías, Herramientas e Integración](#tecnologías-herramientas-e-integración)
4. [Estructura del Repositorio](#estructura-del-repositorio)
5. [Backend - Spring Boot](#backend---spring-boot)
6. [Frontend - Angular/Ionic](#frontend---angularionic)
7. [Integración Backend-Frontend](#integración-backend-frontend)
8. [🔐 Sistema de Autenticación JWT (NUEVO)](#sistema-de-autenticación-jwt)
9. [Roadmap y Evolución](#roadmap-y-evolución)
10. [Guía de Ejecución Local](#guía-de-ejecución-local)
11. [Autor y contacto](#autor-y-contacto)

---

## Introducción

Este proyecto constituye una solución profesional y escalable para la gestión integral de clubes de fútbol base. La plataforma abarca la gestión de usuarios, equipos, jugadores, entrenadores, inscripciones, incidencias, convocatorias y más, facilitando la digitalización total de un club de fútbol.

**Estado Actual del Proyecto:**
- ✅ **Backend:** Completamente implementado (Spring Boot 3.5.7 + MySQL)
- ✅ **API REST:** 12+ entidades con CRUD completo, 30+ endpoints validados
- ✅ **Autenticación JWT:** Sistema seguro de autenticación implementado y funcional
- ✅ **Estructura Frontend:** Modular con 7 módulos feature y lazy loading
- ✅ **Landing Page:** Funcional con componentes reutilizables
- ✅ **Sistema Login/Register:** Integrado con backend y JWT funcional
- ✅ **Guards e Interceptores:** Protección de rutas y gestión automática de tokens
- 📋 **Módulos Dashboard:** Estructura lista para implementación (Admin, Coach, Players, User)

**Fases del Proyecto:**
1. **Fase 1 (Completada):** Backend REST + Base de datos
2. **Fase 2 (Completada):** Frontend con arquitectura modular + Autenticación JWT
3. **Fase 3 (En progreso):** Integración completa + Módulos funcionales por rol
4. **Fase 4 (Próxima):** Testing, documentación completa, despliegue

---

## Modelo Entidad-Relación y Base de Datos

### Entidades Principales

- **Usuario**: Persona en el sistema (jugador, entrenador, admin)
- **Jugador**: Futbolista con atributos deportivos
- **Entrenador**: Técnico responsable de equipos
- **Equipo**: Grupo de jugadores y entrenadores
- **Categoría**: Rango de edades (Prebenjamín, Alevín, Infantil, etc.)
- **Liga**: Competición/división donde participa un equipo
- **SolicitudInscripción**: Proceso de inscripción de nuevos jugadores
- **Convocatoria**: Eventos deportivos (partidos, entrenamientos)
- **Incidencia**: Sanciones, lesiones, bloqueos y observaciones

### Relaciones Clave

- Un usuario puede tener varios roles
- Un jugador puede estar en varios equipos (histórico)
- Un equipo pertenece a una categoría y una liga
- Relaciones ManyToMany: `jugador_equipo`, `equipo_entrenador`, `convocatoria_jugador`

### Validación y Seguridad

- Restricciones NOT NULL en campos críticos
- ON DELETE/UPDATE configuradas por lógica de negocio
- Integridad referencial mediante FK
- Validación exhaustiva de duplicados en MySQL
- Contraseñas hasheadas con BCrypt

---

## Tecnologías, Herramientas e Integración

### Stack Principal

| Capa | Tecnología | Versión |
|------|-----------|---------| 
| **Backend** | Spring Boot | 3.5.7 |
| **Seguridad Backend** | Spring Security + JWT | 6.5.6 |
| **Frontend** | Angular | 16+ |
| **Mobile** | Ionic | 7 |
| **Base de datos** | MySQL | 8.x |
| **Lenguaje (Backend)** | Java | 21/22 LTS |
| **Lenguaje (Frontend)** | TypeScript | 5.1+ |
| **ORM** | Spring Data JPA | Hibernate |
| **Cliente HTTP (Frontend)** | HttpClient | Angular 16 |
| **Programación Reactiva** | RxJS | 7.8+ |
| **Autenticación** | JWT (JJWT) | 0.9.1 |
| **Password Hashing** | BCrypt | Spring Security |

### Herramientas de Desarrollo

- **IDE Backend:** IntelliJ IDEA
- **IDE Frontend:** Visual Studio Code / IntelliJ IDEA
- **Testing API:** Postman
- **Base de datos:** MySQL Workbench
- **Versionado:** Git + GitHub
- **Build Tools:** Maven (Backend), Angular CLI (Frontend)
- **Package Manager:** npm (Frontend)

---

## Estructura del Repositorio

### Estructura Completa

```
PROYECTO-TFG/
├── src/
│   ├── backend-tfg/                   # Backend Spring Boot
│   │   ├── src/main/java/
│   │   │   └── com/DAMUnitedFC/backend_tfg/
│   │   │       ├── controller/        # Controladores REST
│   │   │       ├── dto/               # Data Transfer Objects
│   │   │       ├── model/             # Entidades JPA
│   │   │       ├── repository/        # JpaRepository interfaces
│   │   │       ├── service/           # Lógica de negocio (Auth, JWT)
│   │   │       ├── security/          # Filtros JWT, UserDetails
│   │   │       └── config/            # Configuración Spring Security
│   │   ├── src/main/resources/
│   │   │   └── application.properties # Config BD + JWT
│   │   ├── pom.xml                    # Dependencias Maven
│   │   └── README.md                  # README Backend
│   │
│   └── frontend-tfg/                  # Frontend Angular/Ionic
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/              # Servicios, guards, interceptores
│       │   │   │   ├── guards/        # AuthGuard, NoAuthGuard, RoleGuard
│       │   │   │   ├── interceptors/  # AuthInterceptor, ErrorInterceptor
│       │   │   │   └── services/      # AuthService, StorageService, etc.
│       │   │   ├── shared/            # Componentes, pipes, modelos
│       │   │   ├── modules/           # 7 módulos feature
│       │   │   │   ├── landing/       # ✅ Landing page
│       │   │   │   ├── auth/          # ✅ Login/Register funcional
│       │   │   │   ├── dashboard/     # Dashboard general
│       │   │   │   ├── admin/         # Panel administrativo
│       │   │   │   ├── coach/         # Dashboard entrenador
│       │   │   │   ├── players/       # Gestión jugadores
│       │   │   │   └── user/          # Perfil usuario
│       │   │   ├── app-routing.module.ts
│       │   │   ├── app.component.*
│       │   │   └── app.module.ts
│       │   ├── environments/          # Configuración por entorno
│       │   ├── theme/                 # Estilos Ionic globales
│       │   └── assets/                # Recursos estáticos
│       ├── angular.json               # Config Angular CLI
│       ├── ionic.config.json          # Config Ionic
│       ├── package.json               # Dependencias npm
│       ├── tsconfig.json              # Config TypeScript
│       └── README.md                  # README Frontend
│
├── docs/                              # Documentación general
│   ├── ARCHITECTURE.md
│   ├── API_INTEGRATION.md
│   └── diagrama-er.png
├── README.md                          # Este archivo
├── Backend.md                         # Documentación técnica Backend
├── Frontend.md                        # Documentación técnica Frontend
├── IMPLEMENTATION_SUMMARY.md          # Resumen de implementación
├── PROJECT_SUMMARY.md                 # Resumen general proyecto
├── planificacion.txt                  # Planning y timeline
└── .gitignore                         # Git ignore
```

---

## Backend - Spring Boot

### Características Principales

- **Arquitectura en capas:** Controller → Service → Repository → Model
- **API REST completa** con CRUD para todas las entidades
- **DTOs para validación:** Control de relaciones ManyToOne
- **Autenticación JWT profesional:** Spring Security 6 + JWT
- **Validación JPA:** ddl-auto=validate
- **SQL Logging:** spring.jpa.show-sql=true para debug

### Base de Datos

- **Motor:** MySQL 8.x
- **Entidades:** 12 tablas principales
- **Relaciones:** ManyToOne, ManyToMany con tablas de unión
- **Claves:** FK en todas las relaciones, índices en campos frecuentes
- **Seguridad:** Contraseñas hasheadas con BCrypt

### Endpoints Principales

| Método | Endpoint | Descripción | Protección |
|--------|----------|-------------|------------|
| POST | `/api/auth/register` | Registro usuario | Público |
| POST | `/api/auth/login` | Login (devuelve JWT) | Público |
| GET | `/api/auth/users` | Listar usuarios | JWT requerido |
| GET | `/api/usuarios` | Listar usuarios | JWT requerido |
| GET | `/api/usuarios/{id}` | Usuario por ID | JWT requerido |
| GET | `/api/usuarios/me` | Usuario actual | JWT requerido |
| GET | `/api/equipos` | Listar equipos | JWT requerido |
| GET | `/api/equipos/{id}` | Equipo por ID | JWT requerido |
| POST | `/api/equipos` | Crear equipo | JWT requerido |
| GET | `/api/jugadores` | Listar jugadores | JWT requerido |
| GET | `/api/jugadores/equipo/{equipoId}` | Jugadores de un equipo | JWT requerido |
| POST | `/api/solicitudinscripcion` | Crear solicitud | JWT requerido |
| GET | `/api/convocatorias` | Listar convocatorias | JWT requerido |
| POST | `/api/incidencias` | Crear incidencia | JWT requerido |

### Validación

✅ Todos los endpoints testeados con Postman  
✅ Flujos completos validados (Usuario → Solicitud → Jugador → Equipo)  
✅ Restricciones FK verificadas  
✅ Manejo de errores implementado  
✅ Ciclo completo de autenticación JWT validado  
✅ Tokens firmados y con expiración funcionales  

---

## Frontend - Angular/Ionic

### Arquitectura Modular

El frontend sigue una arquitectura **limpia y escalable** basada en separación de responsabilidades:

```
App (Root Module)
│
├── Core Module (Singleton)
│   ├── Guards (auth, no-auth, role)
│   ├── Interceptores (jwt, error)
│   └── Servicios (11+)
│       ├── AuthService (login, register, logout)
│       ├── StorageService (token, usuario)
│       ├── ApiService (HTTP base)
│       └── Otros servicios (Team, Player, etc.)
│
├── Shared Module
│   ├── Componentes reutilizables
│   ├── Pipes personalizados
│   ├── Modelos/Interfaces (models.ts consolidado)
│   └── Directivas
│
└── Feature Modules (Lazy Loaded)
    ├── Landing (funcional)
    ├── Auth (login/register funcionales)
    ├── Dashboard
    ├── Admin
    ├── Coach
    ├── Players
    └── User
```

### Módulos Feature

| Módulo | Estado | Propósito |
|--------|--------|----------| 
| **Landing** | ✅ Completo | Página de bienvenida con catálogo de equipos |
| **Auth** | ✅ Funcional | Login y registro integrados con JWT |
| **Dashboard** | 📋 Planificado | Panel general para usuarios |
| **Admin** | 📋 Planificado | Panel administrativo (solo ADMIN) |
| **Coach** | 📋 Planificado | Dashboard entrenador (solo ENTRENADOR) |
| **Players** | 📋 Planificado | Gestión y perfil de jugadores |
| **User** | 📋 Planificado | Perfil y configuración de usuario |

### Servicios Core (11+)

- **AuthService:** Login, registro, logout, gestión de usuario autenticado
- **StorageService:** Persistencia de token y datos de usuario en localStorage
- **ApiService:** Cliente HTTP base con manejo de errores
- **UserService:** CRUD usuarios
- **TeamService:** CRUD equipos
- **PlayerService:** CRUD jugadores
- **RequestService:** Solicitudes inscripción
- **ConvocationService:** Convocatorias
- **IncidentService:** Incidencias
- **NotificationService:** Sistema notificaciones
- **TeamStateService & UserStateService:** Estado global

### Guards (3)

- **AuthGuard:** Requiere autenticación (token válido)
- **NoAuthGuard:** Solo usuarios NO autenticados (bloquea login si ya está logueado)
- **RoleGuard:** Control por roles específicos (Admin, Coach, etc.)

### Interceptores (2)

- **AuthInterceptor:** Añade `Authorization: Bearer <token>` automáticamente a todas las peticiones HTTP
- **ErrorInterceptor:** Manejo centralizado de errores HTTP, logout automático en 401

---

## Integración Backend-Frontend

### Flujo de Comunicación

```
Frontend (Angular)
    ↓
Component Dispara Acción (ej: login)
    ↓
AuthService.login(email, password)
    ↓
HTTP POST /api/auth/login
    ↓
AuthInterceptor NO añade token (ruta pública)
    ↓
Backend API REST (Spring Boot)
    ↓
SecurityConfig permite acceso público a /api/auth/**
    ↓
AuthService (Backend) valida credenciales
    ↓
JwtService genera token firmado
    ↓
Response: { "token": "eyJhbGciOiJI..." }
    ↓
AuthService (Frontend) guarda token en StorageService
    ↓
Usuario navega a /dashboard (ruta protegida)
    ↓
AuthGuard verifica token en storage
    ↓
Component carga datos: teamService.getTeams()
    ↓
HTTP GET /api/equipos
    ↓
AuthInterceptor añade header: Authorization: Bearer <token>
    ↓
Backend JwtAuthenticationFilter valida token
    ↓
Spring Security autoriza petición
    ↓
Controller procesa y responde con datos
    ↓
Component recibe datos vía Observable
    ↓
Template renderiza con async pipe
```

### Configuración por Entorno

**src/environments/environment.ts (Desarrollo):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  logLevel: 'debug'
};
```

**src/environments/environment.prod.ts (Producción):**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.damunited.com/api',
  logLevel: 'error'
};
```

### Validación de Integración

✅ Landing page carga equipos desde backend  
✅ Registro de usuario funcional (POST /api/auth/register)  
✅ Login funcional (POST /api/auth/login) con token JWT  
✅ Token guardado en localStorage  
✅ AuthInterceptor añade header Authorization automáticamente  
✅ Endpoints protegidos accesibles con token válido  
✅ Error 401 manejado (logout + redirect a login)  
✅ AuthGuard protege rutas privadas correctamente  
✅ Componentes reutilizables funcionan correctamente  
✅ Routing lazy-loaded implementado  

---

## 🔐 Sistema de Autenticación JWT

### Fecha de implementación completa: 18/11/2025
### Estado: ✅ Completado y validado en backend y frontend

### Arquitectura de autenticación

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENTE (Angular/Ionic)               │
├─────────────────────────────────────────────────────────┤
│  LoginPage/RegisterPage                                 │
│  │                                                       │
│  ├─► AuthService.login(email, password)                 │
│  │   │                                                   │
│  │   └─► POST /api/auth/login                          │
│  │       Body: { email, password }                      │
│  │                                                       │
│  ├─► Response: { token: "eyJ..." }                     │
│  │                                                       │
│  └─► StorageService.setToken(token)                    │
│      localStorage.setItem('auth_token', token)          │
│                                                          │
│  Petición a recurso protegido:                          │
│  TeamService.getTeams()                                 │
│  │                                                       │
│  └─► AuthInterceptor intercepta                        │
│      Añade header: Authorization: Bearer <token>        │
└─────────────────────────────────────────────────────────┘
                            │
                            │ HTTP Request con JWT
                            ▼
┌─────────────────────────────────────────────────────────┐
│                SERVIDOR (Spring Boot + MySQL)           │
├─────────────────────────────────────────────────────────┤
│  JwtAuthenticationFilter valida token                   │
│  │                                                       │
│  ├─► JwtService.isTokenValid(token)                    │
│  │   │                                                   │
│  │   ├─► Verifica firma HMAC-SHA256                    │
│  │   ├─► Verifica expiración                           │
│  │   └─► Extrae email del subject                      │
│  │                                                       │
│  ├─► Si válido: Spring Security autoriza               │
│  │                                                       │
│  ├─► Controller procesa petición                       │
│  │                                                       │
│  └─► Response con datos solicitados                    │
└─────────────────────────────────────────────────────────┘
```

### Componentes clave

**Backend:**
- `SecurityConfig`: Configuración de Spring Security (rutas públicas/privadas)
- `JwtService`: Generación y validación de tokens JWT
- `JwtAuthenticationFilter`: Filtro que intercepta requests y valida tokens
- `AuthService`: Lógica de registro y autenticación
- `UsuarioController`: Endpoints `/api/auth/register` y `/api/auth/login`

**Frontend:**
- `AuthService`: Gestión de login, registro, logout y estado de usuario
- `StorageService`: Persistencia de token y usuario en localStorage
- `AuthInterceptor`: Interceptor HTTP que añade token automáticamente
- `AuthGuard`: Guard que protege rutas privadas
- `LoginPage` y `RegisterPage`: Páginas de autenticación

### Flujo de registro y login

**1. Registro:**
```
Usuario → RegisterPage → AuthService.register(datos)
  → POST /api/auth/register
  → Backend crea usuario (password hasheado con BCrypt)
  → Response: Usuario creado (201 CREATED)
  → Frontend redirige a LoginPage
```

**2. Login:**
```
Usuario → LoginPage → AuthService.login(email, password)
  → POST /api/auth/login
  → Backend valida credenciales
  → JwtService genera token firmado (expiración 1 hora)
  → Response: { "token": "eyJ..." }
  → AuthService guarda token en StorageService
  → Frontend redirige a Dashboard
```

**3. Acceso a recurso protegido:**
```
Usuario → DashboardPage → TeamService.getTeams()
  → GET /api/equipos
  → AuthInterceptor añade header: Authorization: Bearer <token>
  → JwtAuthenticationFilter valida token
  → Si válido: Controller procesa y responde
  → Si inválido/expirado: Error 401 → Logout + redirect a login
```

### Seguridad implementada

✅ Contraseñas hasheadas con BCrypt (nunca en texto plano)  
✅ Tokens JWT firmados con HMAC-SHA256  
✅ Tokens con expiración configurable (1 hora por defecto)  
✅ Endpoints públicos: `/api/auth/**`  
✅ Endpoints protegidos: Resto de `/api/**`  
✅ CORS configurado para frontend en localhost:4200  
✅ Logout elimina token del storage  
✅ Error 401 manejado con logout automático y redirect  

### Pruebas realizadas

| Escenario | Estado |
|-----------|--------|
| Registro de usuario nuevo | ✅ Funcional |
| Login con credenciales correctas | ✅ Funcional |
| Login con credenciales incorrectas | ✅ Error 401 manejado |
| Acceso a ruta pública sin token | ✅ Permitido |
| Acceso a ruta protegida con token válido | ✅ Permitido |
| Acceso a ruta protegida sin token | ✅ Bloqueado (401) |
| Acceso a ruta protegida con token expirado | ✅ Bloqueado (401) + Logout |
| AuthGuard protege rutas privadas | ✅ Funcional |
| AuthInterceptor añade token automáticamente | ✅ Funcional |
| Logout elimina sesión correctamente | ✅ Funcional |

---

## Roadmap y Evolución

### Fase 1: ✅ Backend Completado
- [x] Base de datos diseñada y poblada
- [x] 12+ entidades con relaciones complejas
- [x] API REST con 30+ endpoints
- [x] Validación exhaustiva con Postman
- [x] Documentación Backend.md

### Fase 2: ✅ Frontend + Autenticación JWT Completado
- [x] Estructura modular Angular/Ionic
- [x] 7 módulos feature planificados
- [x] Landing page funcional
- [x] Servicios core preparados
- [x] Guards e interceptores implementados
- [x] Sistema de autenticación JWT completo
- [x] Login/Register funcionales
- [x] Integración backend-frontend validada
- [x] Formularios con validaciones reactivas

### Fase 3: 📋 Funcionalidad Completa por Roles
- [ ] Dashboard general funcional
- [ ] Módulo Admin: Gestión usuarios, equipos, incidencias
- [ ] Módulo Coach: Convocatorias, lista de jugadores, entrenamientos
- [ ] Módulo Players: Perfil, estadísticas, historial
- [ ] Módulo User: Configuración, edición de perfil
- [ ] RoleGuard implementado y funcional
- [ ] Notificaciones en tiempo real (WebSocket - opcional)
- [ ] Búsqueda y filtros avanzados
- [ ] Exportación de reportes (PDF/Excel)

### Fase 4: 🚀 Producción y Despliegue
- [ ] Testing unitario (Jasmine/Karma)
- [ ] Testing E2E (Cypress/Protractor)
- [ ] Documentación OpenAPI/Swagger
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Despliegue backend en servidor cloud (AWS/Azure/Digital Ocean)
- [ ] Despliegue frontend en Netlify/Vercel
- [ ] HTTPS/SSL configurado
- [ ] Monitoreo y logging (ELK Stack - opcional)
- [ ] Backup automático de base de datos
- [ ] Optimización de performance
- [ ] SEO y accesibilidad

---

## Guía de Ejecución Local

### Requisitos Previos

- **Java 21/22 LTS** instalado
- **Node.js 18+** y npm
- **MySQL 8.x** corriendo localmente
- **Git** configurado
- **VSCode** o **IntelliJ IDEA**
- **Postman** (opcional, para testing de API)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/sestmar/TFG-SergioEstudillo.git
cd TFG-SergioEstudillo
```

### 2. Configurar Base de Datos

```sql
-- En MySQL Workbench o terminal MySQL
CREATE DATABASE tfg_club_futbol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verificar que existe
SHOW DATABASES;
```

### 3. Ejecutar Backend

```bash
# Entrar en carpeta backend
cd src/backend-tfg

# Configurar application.properties
# Editar: src/main/resources/application.properties

# spring.datasource.url=jdbc:mysql://localhost:3306/tfg_club_futbol
# spring.datasource.username=root
# spring.datasource.password=tu_contraseña

# application.security.jwt.secret-key=TuClaveSecretaAqui (mínimo 256 bits)

# Ejecutar con Maven
mvn spring-boot:run

# O desde IDE (IntelliJ):
# Click en Play en BackendTfgApplication.java
```

**Backend disponible en:** `http://localhost:8080`

**Nota importante:** Si obtienes el error `NoClassDefFoundError: javax/xml/bind/DatatypeConverter`, descarga e importa el JAR `jaxb-api-2.3.1.jar` en las librerías del proyecto.

### 4. Ejecutar Frontend

```bash
# Entrar en carpeta frontend
cd src/frontend-tfg

# Instalar dependencias (primera vez)
npm install

# Verificar que environment.ts apunta a localhost:8080
# src/environments/environment.ts
# apiUrl: 'http://localhost:8080/api'

# Ejecutar servidor de desarrollo
ng serve

# O con Ionic CLI
ionic serve

# O con npm
npm start
```

**Frontend disponible en:** `http://localhost:4200`

### 5. Verificación de Integración

1. Abre navegador en `http://localhost:4200`
2. Deberías ver la Landing Page
3. Click en "Regístrate Ahora"
4. Completa el formulario de registro
5. Verifica en consola del navegador (F12 → Network) la petición POST a `http://localhost:8080/api/auth/register`
6. Haz login con el usuario creado
7. Verifica que recibes el token JWT en la respuesta
8. Navega a una ruta protegida (ej: `/dashboard`)
9. Verifica que AuthGuard permite el acceso
10. Abre Network tab y verifica que las peticiones HTTP llevan el header `Authorization: Bearer <token>`

### 6. Pruebas con Postman

**Colección de pruebas recomendadas:**

**1. Registro:**
```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "nombre": "Juan",
  "apellidos": "Pérez García",
  "email": "juan@example.com",
  "password": "password123",
  "telefono": "123456789"
}
```

**2. Login:**
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqdWFuQGV4YW1wbGUuY29tIiwiaWF0IjoxNzMxOTUzNDc3LCJleHAiOjE3MzE5NTcwNzd9.abc123..."
}
```

**3. Acceder a endpoint protegido:**
```http
GET http://localhost:8080/api/equipos
Authorization: Bearer <tu_token_aquí>
```

### Solución de Problemas

**Error: "Cannot GET /api/equipos"**
- Verificar que MySQL está corriendo
- Verificar que la base de datos tiene datos insertados
- Ver logs de Spring Boot para errores SQL
- Verificar credenciales en application.properties

**Error: "Cannot connect to backend"**
- Verificar que puerto 8080 no está ocupado
- Ejecutar `lsof -i :8080` (Mac/Linux) o `netstat -ano | findstr :8080` (Windows)
- Verificar CORS en SecurityConfig configurado correctamente

**Error: "ng: command not found"**
- Instalar Angular CLI: `npm install -g @angular/cli`
- Verificar Node.js: `node --version`
- Reiniciar terminal

**Error: "NoClassDefFoundError javax/xml/bind/DatatypeConverter"**
- Descargar `jaxb-api-2.3.1.jar` desde [Maven Central](https://repo1.maven.org/maven2/javax/xml/bind/jaxb-api/2.3.1/jaxb-api-2.3.1.jar)
- Añadir a librerías del proyecto en IntelliJ (File → Project Structure → Libraries → + → Java)
- Rebuild proyecto

**Error 401 al acceder a endpoint protegido:**
- Verificar que el token no ha expirado (1 hora de validez)
- Verificar que el header `Authorization` tiene el formato: `Bearer <token>` (con espacio)
- Hacer login de nuevo para obtener un token fresco

---

## Documentación Detallada

Para información técnica detallada, consulta:

- **📘 Backend.md:** Arquitectura, código, endpoints, autenticación JWT, validación del backend
- **📗 Frontend.md:** Servicios, componentes, RxJS, autenticación JWT, patrones de Angular/Ionic
- **📙 API_INTEGRATION.md:** Detalles de integración entre capas
- **📕 ARCHITECTURE.md:** Diseño general del sistema

---

## Autor y contacto

**Sergio Estudillo**  
Estudiante de 2º DAM (Desarrollo de Aplicaciones Multiplataforma)  
**Email:** sergio.estudillo@example.com  
**GitHub:** [github.com/sestmar/TFG-SergioEstudillo](https://github.com/sestmar/TFG-SergioEstudillo)

---

## Licencia

Este proyecto es un Trabajo Final de Grado (TFG) para fines educativos.

---

*Documentación actualizada: 18/11/2025*  
*Versión: 3.0 (Autenticación JWT completada)*  
*Próxima actualización: Implementación de dashboards por rol*