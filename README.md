# TFG Club de Fútbol — Sergio Estudillo

## Índice

1. [Introducción](#introducción)
2. [Modelo Entidad-Relación y Base de Datos](#modelo-entidad-relación-y-base-de-datos)
3. [Tecnologías, Herramientas e Integración](#tecnologías-herramientas-e-integración)
4. [Estructura del Repositorio](#estructura-del-repositorio)
5. [Backend - Spring Boot](#backend---spring-boot)
6. [Frontend - Angular/Ionic](#frontend---angularionic)
7. [Integración Backend-Frontend](#integración-backend-frontend)
8. [Roadmap y Evolución](#roadmap-y-evolución)
9. [Guía de Ejecución Local](#guía-de-ejecución-local)
10. [Autor y contacto](#autor-y-contacto)

---

## Introducción

Este proyecto constituye una solución profesional y escalable para la gestión integral de clubes de fútbol base. La plataforma abarca la gestión de usuarios, equipos, jugadores, entrenadores, inscripciones, incidencias, convocatorias y más, facilitando la digitalización total de un club de fútbol.

**Estado Actual del Proyecto:**
- ✅ **Backend:** Completamente implementado (Spring Boot 3.5.7 + MySQL)
- ✅ **API REST:** 12+ entidades con CRUD completo, 30+ endpoints validados
- ✅ **Estructura Frontend:** Modular con 7 módulos feature y lazy loading
- ✅ **Landing Page:** Funcional con componentes reutilizables
- 🔄 **Sistema de Autenticación:** En desarrollo (JWT, guards, interceptores)
- 📋 **Módulos Dashboard:** Estructura lista para implementación (Admin, Coach, Players, User)

**Fases del Proyecto:**
1. **Fase 1 (Completada):** Backend REST + Base de datos
2. **Fase 2 (En progreso):** Frontend con arquitectura modular
3. **Fase 3 (Próxima):** Integración completa + Módulos funcionales
4. **Fase 4 (Final):** Testing, documentación, despliegue

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

---

## Tecnologías, Herramientas e Integración

### Stack Principal

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Backend** | Spring Boot | 3.5.7 |
| **Frontend** | Angular | 16+ |
| **Mobile** | Ionic | 7 |
| **Base de datos** | MySQL | 8.x |
| **Lenguaje (Backend)** | Java | 21/22 LTS |
| **Lenguaje (Frontend)** | TypeScript | 5.1+ |
| **ORM** | Spring Data JPA | Hibernate |
| **Cliente HTTP (Frontend)** | HttpClient | Angular 16 |
| **Programación Reactiva** | RxJS | 7.8+ |

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
│   │   │       └── config/            # Configuración Spring
│   │   ├── src/main/resources/
│   │   │   └── application.properties # Config base de datos
│   │   ├── pom.xml                    # Dependencias Maven
│   │   └── README.md                  # README Backend
│   │
│   └── frontend-tfg/                  # Frontend Angular/Ionic
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/              # Servicios, guards, interceptores
│       │   │   │   ├── guards/        # 4 guards (auth, no-auth, role, etc.)
│       │   │   │   ├── interceptors/  # 2 interceptores (auth, error)
│       │   │   │   └── services/      # 11+ servicios (api, auth, user, team, etc.)
│       │   │   ├── shared/            # Componentes, pipes, modelos reutilizables
│       │   │   ├── modules/           # 7 módulos feature
│       │   │   │   ├── landing/       # ✅ Landing page (completa)
│       │   │   │   ├── auth/          # 🔄 Autenticación (en desarrollo)
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
├── backend.md                         # Documentación técnica Backend
├── frontend.md                        # Documentación técnica Frontend
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
- **Acceso abierto en desarrollo:** Preparado para JWT en producción
- **Validación JPA:** ddl-auto=validate
- **SQL Logging:** spring.jpa.show-sql=true para debug

### Base de Datos

- **Motor:** MySQL 8.x
- **Entidades:** 12 tablas principales
- **Relaciones:** ManyToOne, ManyToMany con tablas de unión
- **Claves:** FK en todas las relaciones, índices en campos frecuentes

### Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Autenticación (JWT en futuro) |
| POST | `/api/auth/register` | Registro usuario |
| GET | `/api/usuarios` | Listar usuarios |
| GET | `/api/usuarios/{id}` | Usuario por ID |
| GET | `/api/usuarios/me` | Usuario actual (con token) |
| GET | `/api/equipos` | Listar equipos |
| GET | `/api/equipos/{id}` | Equipo por ID |
| POST | `/api/equipos` | Crear equipo (admin) |
| GET | `/api/jugadores` | Listar jugadores |
| GET | `/api/jugadores/equipo/{equipoId}` | Jugadores de un equipo |
| POST | `/api/solicitudinscripcion` | Crear solicitud inscripción |
| GET | `/api/convocatorias` | Listar convocatorias |
| POST | `/api/incidencias` | Crear incidencia |

### Validación

✅ Todos los endpoints testeados con Postman  
✅ Flujos completos validados (Usuario → Solicitud → Jugador → Equipo)  
✅ Restricciones FK verificadas  
✅ Manejo de errores implementado  

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
│
├── Shared Module
│   ├── Componentes reutilizables
│   ├── Pipes personalizados
│   ├── Modelos/Interfaces
│   └── Directivas
│
└── Feature Modules (Lazy Loaded)
    ├── Landing
    ├── Auth
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
| **Auth** | 🔄 Desarrollo | Login, registro, recuperación contraseña |
| **Dashboard** | 📋 Planificado | Panel general para usuarios |
| **Admin** | 📋 Planificado | Panel administrativo (solo ADMIN) |
| **Coach** | 📋 Planificado | Dashboard entrenador (solo ENTRENADOR) |
| **Players** | 📋 Planificado | Gestión y perfil de jugadores |
| **User** | 📋 Planificado | Perfil y configuración de usuario |

### Servicios Core (11+)

- **ApiService:** Cliente HTTP base
- **AuthService:** Autenticación y JWT
- **UserService:** CRUD usuarios
- **TeamService:** CRUD equipos
- **PlayerService:** CRUD jugadores
- **RequestService:** Solicitudes inscripción
- **ConvocationService:** Convocatorias
- **IncidentService:** Incidencias
- **NotificationService:** Sistema notificaciones
- **StorageService:** Almacenamiento local
- **TeamStateService & UserStateService:** Estado global

### Guards (4)

- **AuthGuard:** Requiere autenticación
- **NoAuthGuard:** Solo usuarios NO autenticados
- **RoleGuard:** Control por roles específicos
- **index.ts:** Barril de exports

### Interceptores (2)

- **AuthInterceptor:** Añade JWT a headers automáticamente
- **ErrorInterceptor:** Manejo centralizado de errores HTTP

### Componentes Principales

**Landing Page:**
- HeroSectionComponent: Banner principal con CTA
- TeamCardComponent: Tarjeta reutilizable de equipos

**Dashboard:**
- DashboardCardComponent: Tarjeta de información

*Más componentes se añadirán en próximas fases*

---

## Integración Backend-Frontend

### Flujo de Comunicación

```
Frontend (Angular)
    ↓
Component Dispara Acción
    ↓
Service (TeamService, UserService, etc.)
    ↓
ApiService Prepara Petición HTTP
    ↓
AuthInterceptor Añade Token JWT
    ↓
ErrorInterceptor Captura Errores
    ↓
Backend API REST (Spring Boot)
    ↓
Controller Procesa Solicitud
    ↓
Repository CRUD + SQL
    ↓
MySQL Database
    ↓
Response Vuelve con Data
    ↓
ErrorInterceptor Procesa Respuesta
    ↓
Service Mapea RxJS
    ↓
Component Recibe Observable
    ↓
Template Renderiza (async pipe)
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
✅ Componentes reutilizables funcionan correctamente  
✅ Routing lazy-loaded implementado  
✅ Servicios preparados para consumir todos los endpoints  

---

## Roadmap y Evolución

### Fase 1: ✅ Backend Completado (Completa)
- [x] Base de datos diseñada y poblada
- [x] 12+ entidades con relaciones complejas
- [x] API REST con 30+ endpoints
- [x] Validación exhaustiva con Postman
- [x] Documentación backend.md

### Fase 2: 🔄 Frontend en Progreso
- [x] Estructura modular Angular/Ionic
- [x] 7 módulos feature planificados
- [x] Landing page funcional
- [x] Servicios core preparados
- [x] Guards e interceptores implementados
- [ ] Sistema de autenticación completo
- [ ] Login/Register funcionales
- [ ] Dashboard por roles
- [ ] Formularios validados

### Fase 3: 📋 Funcionalidad Completa
- [ ] Módulo Admin: Gestión usuarios, equipos, incidencias
- [ ] Módulo Coach: Convocatorias, lista de jugadores
- [ ] Módulo Players: Perfil, estadísticas
- [ ] Módulo User: Configuración, perfil
- [ ] Notificaciones en tiempo real (WebSocket)
- [ ] Búsqueda y filtros avanzados
- [ ] Exportación de reportes

### Fase 4: 🚀 Producción
- [ ] Autenticación JWT robusta
- [ ] HTTPS/SSL en servidor
- [ ] Testing unitario e integración
- [ ] Documentación OpenAPI/Swagger
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Despliegue en servidor (AWS/Azure/Digital Ocean)
- [ ] Monitoreo y logging
- [ ] Backup automático

---

## Guía de Ejecución Local

### Requisitos Previos

- **Java 21/22 LTS** instalado
- **Node.js 18+** y npm
- **MySQL 8.x** corriendo localmente
- **Git** configurado
- **VSCode** o **IntelliJ IDEA**

### 1. Clonar el Repositorio

```bash
git clone https://github.com/sestmar/TFG-SergioEstudillo.git
cd TFG-SergioEstudillo
```

### 2. Ejecutar Backend

```bash
# Entrar en carpeta backend
cd src/backend-tfg

# Configurar base de datos en application.properties
# Editar: src/main/resources/application.properties
# spring.datasource.url=jdbc:mysql://localhost:3306/tfg_club_futbol
# spring.datasource.username=root
# spring.datasource.password=tu_contraseña

# Ejecutar con Maven
mvn spring-boot:run

# O desde IDE (IntelliJ):
# Click en Play en la clase Main
```

**Backend disponible en:** `http://localhost:8080`

**Documentación API:** `http://localhost:8080/swagger-ui.html` (si Swagger está implementado)

### 3. Ejecutar Frontend

```bash
# Entrar en carpeta frontend
cd src/frontend-tfg

# Instalar dependencias (primera vez)
npm install

# Ejecutar servidor de desarrollo
ng serve

# O con Ionic CLI
ionic serve

# O con npm
npm start
```

**Frontend disponible en:** `http://localhost:4200`

### 4. Verificación de Integración

1. Abre navegador en `http://localhost:4200`
2. Deberías ver la Landing Page
3. Verifica que se cargan los equipos desde el backend
4. Abre Developer Tools (F12) → Network para ver peticiones a `http://localhost:8080/api/equipos`

### 5. Pruebas con Postman

1. Abre Postman
2. Importa colección de endpoints desde `docs/` (si existe)
3. Verifica endpoints:
   - `GET http://localhost:8080/api/equipos`
   - `GET http://localhost:8080/api/usuarios`
   - `GET http://localhost:8080/api/jugadores`

### Solución de Problemas

**Error: "Cannot GET /api/equipos"**
- Verificar que MySQL está corriendo
- Verificar que los datos están insertados en la BD
- Ver logs de Spring Boot para errores SQL

**Error: "Cannot connect to backend"**
- Verificar Puerto 8080 no está ocupado
- Ejecutar `lsof -i :8080` (Mac/Linux) o `netstat -ano | findstr :8080` (Windows)
- Verificar CORS en Backend configurado correctamente

**Error: "ng: command not found"**
- Instalar Angular CLI: `npm install -g @angular/cli`
- Verificar Node.js: `node --version`

---

## Documentación Detallada

Para información técnica detallada, consulta:

- **📘 backend.md:** Arquitectura, código, endpoints, validación del backend
- **📗 frontend.md:** Servicios, componentes, RxJS, patrones de Angular/Ionic
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

*Documentación actualizada: 13/11/2025*  
*Versión: 2.0 (Estructura real del proyecto)*  
*Próxima actualización: Cuando se implemente autenticación JWT*