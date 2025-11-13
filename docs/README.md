# TFG Club de Fútbol — Sergio Estudillo

## Índice

1. [Introducción](#introducción)
2. [Modelo Entidad-Relación y Base de Datos](#modelo-entidad-relación-y-base-de-datos)
    1. [Justificación del modelo](#justificación-del-modelo)
    2. [Objetivos y alcance](#objetivos-y-alcance)
    3. [Entidades principales y relaciones](#entidades-principales-y-relaciones)
    4. [Claves y restricciones](#claves-y-restricciones)
    5. [Ventajas del diseño](#ventajas-del-diseño)
    6. [Diagrama ER](#diagrama-er)
    7. [Verificación y pruebas BBDD](#verificación-y-pruebas-bbdd)
3. [Tecnologías, Herramientas e Integración](#tecnologías-herramientas-e-integración)
4. [Estructura del Repositorio y Organización del Código](#estructura-del-repositorio-y-organización-del-código)
5. [Backend - Spring Boot](#backend---spring-boot)
    1. [Arquitectura, Convenciones y Estándares](#arquitectura-convenciones-y-estándares)
    2. [Implementación Profesional: Código y Lógica](#implementación-profesional-código-y-lógica)
    3. [Seguridad y Acceso API REST](#seguridad-y-acceso-api-rest)
    4. [Validación y Pruebas](#validación-y-pruebas)
    5. [Documentación y Buenas Prácticas](#documentación-y-buenas-prácticas)
6. [Frontend - Angular/Ionic](#frontend---angularionic)
    1. [Arquitectura y Estructura Modular](#arquitectura-y-estructura-modular)
    2. [Módulos Implementados](#módulos-implementados)
    3. [Componentes Base](#componentes-base)
    4. [Routing y Navegación](#routing-y-navegación)
    5. [Integración con Backend](#integración-con-backend)
7. [Roadmap: Siguientes pasos y evolución prevista](#roadmap-siguientes-pasos-y-evolución-prevista)
8. [Guía de Ejecución Local](#guía-de-ejecución-local)
9. [Autor y contacto](#autor-y-contacto)

---

## Introducción

Este proyecto constituye una solución profesional y escalable para la gestión integral de clubes de fútbol base, orientada a modernizar procesos administrativos, deportivos y de comunicación. La plataforma abarca la gestión de usuarios, equipos, jugadores, entrenadores, inscripciones, incidencias, convocatorias y más, facilitando la digitalización total de un club.

**Estado actual:** 
- ✅ Backend completamente implementado y validado con pruebas exhaustivas en Postman (Fase 1 completada)
- ✅ Frontend inicial con estructura modular Ionic-Angular (Fase 2 en progreso)
- ✅ Landing page funcional con componentes reutilizables (HeroSection, TeamCard)
- 🔄 Próximos pasos: Sistema de autenticación, servicios API, dashboard multi-rol

---

## Modelo Entidad-Relación y Base de Datos

### Justificación del modelo

- Refleja la complejidad real del día a día en clubes de fútbol (roles, movimientos, inscripciones, sanciones).
- Ágil ante futuros cambios, manteniendo integridad y flexibilidad.
- Cubre procesos clave: inscribir jugadores, convocarlos, gestionar incidencias y roles, con trazabilidad total.

### Objetivos y alcance

- Estandarizar los datos imprescindibles para gestión deportiva y administrativa.
- Garantizar la integridad referencial y coherencia de la información.
- Habilitar la ampliación con nuevas entidades (estadísticas, facturación, comunicación con familias, etc.).

### Entidades principales y relaciones

- **Usuario**: Abstracción única de persona (jugador, entrenador, admin…).
- **Jugador**: Futbolista, atributos deportivos, vinculado a usuario y equipos.
- **Entrenador**: Técnico responsable, con licencia/especialidad, vinculado a usuario.
- **Equipo**: Agrega jugadores y entrenadores, asociados a una categoría de edad y a una liga.
- **Categoría**: Rango de edades (Prebenjamín, Alevín, Infantil…).
- **Liga**: Representa competición/división en la que puede participar un equipo (relacionada con categoría y equipos).
- **SolicitudInscripción**: Gestiona el proceso de inscripción de nuevos jugadores.
- **Convocatoria**: Organiza eventos deportivos (partidos, entrenamientos, pruebas).
- **Incidencia**: Sanciones, lesiones, bloqueos y observaciones sobre jugadores/usuarios.

#### Relaciones clave

- Un usuario puede tener varios roles.
- Un jugador puede estar en varios equipos (historial/convocatorias).
- Un equipo pertenece a **una categoría y una liga**.
- Liga y Equipo referencian a Categoría mediante FK.
- Relaciones ManyToOne gestionadas por **DTO** en POST/PUT.

**Relaciones muchos-a-muchos (por tablas de unión):**
- `jugador_equipo`
- `equipo_entrenador`
- `convocatoria_jugador`

### Claves y restricciones

- Uso sistemático de claves primarias y foráneas, restricciones NOT NULL.
- ON DELETE/UPDATE ajustadas a lógica de negocio (protección de histórico, cascadas…).
- Validación exhaustiva de duplicados y referencias.

### Ventajas del diseño

- **Escalabilidad:** Soporta nuevas funcionalidades y entidades fácilmente.
- **Robustez:** Evita inconsistencias y errores, respeta la lógica de negocio.
- **Flexibilidad:** Preparado para evolucionar con nuevas reglas de negocio/módulos.

### Diagrama ER

*Coloca aquí tu diagrama final (usa [dbdiagram.io](https://dbdiagram.io/) para claridad)*

### Verificación y pruebas BBDD

- Scripts de inserción, actualización y borrado validados en MySQL Workbench.
- Pruebas JOIN complejas para validar las consultas backend/frontend.
- Validación de restricciones por FK (equipos solo pueden pertenecer a categorías y ligas existentes).
- Generación/borrado masivo de datos de ejemplo: usuarios, jugadores, equipos, entrenadores.

---

## Tecnologías, Herramientas e Integración

- **Backend:** Spring Boot 3.5.7 (Java 21/22 LTS)
- **ORM:** Spring Data JPA + Hibernate
- **Frontend:** Angular 16+, Ionic 7, TypeScript, RxJS
- **Base de datos:** MySQL 8.x
- **Testing & docs:** Postman, Swagger (previsto), JUnit
- **Modelado ER:** dbdiagram.io, MySQL Workbench
- **DevOps/GitHub:** Git, GitHub Desktop, CI/CD opcional, .gitignore personalizado
- **IDE:** IntelliJ IDEA, Visual Studio Code

---

## Estructura del Repositorio y Organización del Código

```
/
├── docs/
│   ├── diagrama-er.png
│   └── Documentacion-TFG-Sergio-Estudillo.pdf
├── src/
│   ├── backend-tfg/
│   │   ├── src/main/java/com/DAMUnitedFC/backend_tfg/
│   │   │   ├── controller/          # Controladores REST
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── model/               # Entidades JPA
│   │   │   ├── repository/          # Interfaces JpaRepository
│   │   │   └── config/              # Configuración Spring/Seguridad
│   │   └── resources/application.properties
│   └── frontend-tfg/                # NUEVO: Frontend Angular/Ionic
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/            # Servicios, interceptores, guards
│       │   │   ├── shared/          # Componentes reutilizables, pipes, modelos
│       │   │   ├── modules/         # Módulos de features (landing, auth, dashboard)
│       │   │   │   ├── landing/     # ✅ IMPLEMENTADO
│       │   │   │   ├── auth/        # 🔄 En desarrollo
│       │   │   │   ├── dashboard/   # 📋 Planificado
│       │   │   │   ├── teams/       # 📋 Planificado
│       │   │   │   └── admin/       # 📋 Planificado
│       │   │   ├── app-routing.module.ts
│       │   │   ├── app.component.ts
│       │   │   └── app.module.ts
│       │   ├── environments/        # Configuración por entorno
│       │   └── styles/              # Estilos globales
│       ├── angular.json
│       ├── ionic.config.json
│       └── package.json
├── backend.md                       # Documentación técnica del backend
├── frontend.md                      # Documentación técnica del frontend
├── README.md
├── .gitignore
└── planificacion.txt
```

### Descripción de carpetas

**Backend:**
- **controller/**: Rutas y lógica REST completa (GET, POST, PUT, DELETE).
- **dto/**: DTOs usados en endpoints POST y PUT para controlar relaciones ManyToOne y validación de FKs.
- **model/**: Entidades JPA que reflejan la estructura real de la base de datos.
- **repository/**: Interfaces JpaRepository para acceso a datos.
- **config/**: Configuración personalizada (seguridad, CORS, beans).

**Frontend:**
- **core/**: Servicios centralizados (AuthService, ApiService), interceptores HTTP, guards de autenticación.
- **shared/**: Componentes reutilizables (headers, footers, loaders), pipes personalizados, interfaces de modelos.
- **modules/**: Módulos de features organizados por funcionalidad (landing, auth, dashboard, teams, admin).
- **environments/**: Configuración de URLs base y variables por entorno (dev, prod).

---

## Backend - Spring Boot

### Arquitectura, Convenciones y Estándares

- Arquitectura en capas (controller, dto, repository, model, config).
- Uso sistemático de entidades, controladores REST y DTOs.
- Rutas RESTful robustas: `/api/usuarios`, `/api/equipos/{id}`, `/api/ligas`, etc.
- **Todas las relaciones ManyToOne aseguradas usando DTOs** (nunca objetos anidados sin id en POST/PUT).
- Inyección de dependencias por constructor.

### Implementación Profesional: Código y Lógica

**Patrón DTO para relaciones:**
- Insertar o actualizar equipos, ligas, etc. siempre vía DTO: `{ "idCategoria": 5, "idLiga": 2, ... }` en el body.
- El controlador busca la entidad por id y la asigna antes de `save()`.

**Ejemplo de petición POST:**

```json
{
    "nombre": "Cadete B",
    "fechaCreacion": "2025-11-10",
    "observaciones": "Equipo cadete segundo nivel",
    "idCategoria": 5,
    "idLiga": 2
}
```

En las respuestas, los objetos de liga y categoría se muestran completamente anidados.

### Seguridad y Acceso API REST

- Acceso abierto temporalmente en desarrollo (`SecurityConfig` con `permitAll()`).
- Preparado para activar autenticación JWT y roles específicos en producción.

### Validación y Pruebas

- **Pruebas exhaustivas con Postman:** validados todos los endpoints CRUD de todas las entidades.
- **Flujo completo validado:** Usuario → SolicitudInscripcion → Jugador → Equipo → Convocatoria.
- Monitorización SQL (`spring.jpa.show-sql=true`).
- Validación JPA (`ddl-auto=validate`).
- Integridad verificada en todas las relaciones ManyToOne y ManyToMany.

### Documentación y Buenas Prácticas

- README.md y backend.md actualizados con toda la información técnica.
- Manejo robusto de errores en endpoints y validación previa de ids.
- Código limpio, comentado y siguiendo convenciones Spring Boot profesionales.

---

## Frontend - Angular/Ionic

### Arquitectura y Estructura Modular

El frontend sigue una **arquitectura modular y escalable** basada en **lazy loading**, permitiendo que cada funcionalidad se cargue bajo demanda. La estructura separa preocupaciones claramente en tres capas principales:

- **core/**: Servicios singleton, interceptores HTTP, guards de autenticación y utilidades globales.
- **shared/**: Componentes reutilizables, pipes, directivas, e interfaces de datos compartidas.
- **modules/**: Módulos de features independientes, cada uno con su propio routing, componentes y servicios locales.

Esta arquitectura garantiza escalabilidad, mantenibilidad y reutilización de código.

### Módulos Implementados

#### 1. **Landing Module** ✅ (Completado)

**Propósito:** Página de bienvenida con información general del club, catálogo de equipos y llamadas a la acción.

**Estructura:**
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

**Componentes:**
- **HeroSectionComponent**: Sección hero con imagen destacada, título, descripción y botón "Regístrate Ahora" que navega a `/auth/register`.
- **TeamCardComponent**: Tarjeta reutilizable para mostrar equipos con datos mock. Presenta nombre del equipo, categoría, número de jugadores y botón de acción.
- **LandingPage**: Página principal que integra componentes y gestiona Observable `featuredTeams$` con lista de equipos destacados.

**Características:**
- Routing lazy-loaded en `app-routing.module.ts`.
- Uso de Ionic components (ion-card, ion-button, ion-grid, ion-text).
- Responsive mobile-first design.
- Observable basado en RxJS para datos dinámicos.

### Módulos Planificados

#### 2. **Auth Module** 🔄 (En Desarrollo)

**Propósito:** Autenticación y autorización con JWT, login/registro, recuperación de contraseña.

**Estructura esperada:**
```
auth/
├── auth.module.ts
├── auth-routing.module.ts
├── pages/
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── components/
│   └── auth-form/
└── services/
    └── auth.service.ts (en core/)
```

#### 3. **Dashboard Module** 📋 (Planificado)

**Propósito:** Panel de control multi-rol con perfil de usuario, navegación según rol (jugador/entrenador/admin).

#### 4. **Teams Module** 📋 (Planificado)

**Propósito:** Listado completo de equipos, detalle, filtros por categoría.

#### 5. **Admin Module** 📋 (Planificado)

**Propósito:** Panel administrativo para gestionar usuarios, equipos, incidencias y configuraciones.

### Componentes Base

**Ubicación:** `src/app/shared/components/`

Componentes reutilizables compartidos entre módulos:

- **HeaderComponent**: Barra de navegación con logo, menú y usuario logeado.
- **FooterComponent**: Pie de página con enlaces y redes sociales.
- **LoadingSpinnerComponent**: Indicador de carga genérico.
- **ErrorMessageComponent**: Componente para mostrar mensajes de error.
- **UserCardComponent**: Tarjeta de usuario con foto y datos.

### Routing y Navegación

**Archivo:** `src/app/app-routing.module.ts`

```typescript
const routes: Routes = [
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full'
  },
  {
    path: 'landing',
    loadChildren: () => import('./modules/landing/landing.module')
      .then(m => m.LandingModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module')
      .then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./modules/dashboard/dashboard.module')
      .then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  }
  // ... más rutas
];
```

**Características:**
- Lazy loading de módulos para optimizar carga inicial.
- Guards de autenticación en rutas protegidas.
- Redirección a landing por defecto.

### Integración con Backend

#### Servicios Principales

**ApiService** (`src/app/core/services/api/api.service.ts`):
- Cliente HTTP base para comunicación con la API REST.
- URLs configurables por entorno.
- Métodos genéricos: GET, POST, PUT, DELETE.

**AuthService** (`src/app/core/services/auth/auth.service.ts`):
- Gestión de tokens JWT (almacenamiento, validación).
- Métodos: login(), register(), logout(), isAuthenticated().
- Observable de usuario logeado.

**UserService** (`src/app/core/services/user/user.service.ts`):
- CRUD de usuarios: obtener perfil, actualizar datos.

**TeamService** (`src/app/core/services/team/team.service.ts`):
- CRUD de equipos: listar, obtener por ID, crear, actualizar, eliminar.

**SolicitudService** (`src/app/core/services/solicitud/solicitud.service.ts`):
- Gestión de solicitudes de inscripción: crear, listar por usuario.

#### Endpoints Consumidos

| Módulo | Método | Endpoint | Descripción |
|--------|--------|----------|-------------|
| Auth | POST | `/api/auth/login` | Autenticación |
| Auth | POST | `/api/auth/register` | Registro nuevo usuario |
| Auth | GET | `/api/usuarios/me` | Obtener usuario actual |
| Teams | GET | `/api/equipos` | Listar todos los equipos |
| Teams | GET | `/api/equipos/{id}` | Obtener equipo por ID |
| Teams | POST | `/api/equipos` | Crear equipo (admin) |
| Players | GET | `/api/jugadores` | Listar jugadores |
| Solicitudes | POST | `/api/solicitudinscripcion` | Crear solicitud inscripción |
| Solicitudes | GET | `/api/solicitudinscripcion/usuario/{id}` | Mis solicitudes |

#### Interceptor HTTP

**Archivo:** `src/app/core/interceptors/auth.interceptor.ts`

Interceptor que añade automáticamente el token JWT en el header de todas las peticiones:

```typescript
// Authorization: Bearer {token}
```

#### Tipos e Interfaces

**Ubicación:** `src/app/shared/models/`

```typescript
// user.interface.ts
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  fechaCreacion: Date;
  rol: 'JUGADOR' | 'ENTRENADOR' | 'ADMIN';
}

// team.interface.ts
export interface Equipo {
  id: number;
  nombre: string;
  fechaCreacion: Date;
  observaciones: string;
  categoria: Categoria;
  liga: Liga;
}

// categoria.interface.ts
export interface Categoria {
  id: number;
  nombre: string;
  rangoEdadMin: number;
  rangoEdadMax: number;
}
```

---

## Roadmap: Siguientes pasos y evolución prevista

### Fase 1: ✅ Completada
- Backend completamente funcional con API REST
- Base de datos diseñada y poblada
- Endpoints CRUD para todas las entidades

### Fase 2: 🔄 En progreso (Frontend)
- [x] Landing page funcional
- [ ] Sistema de autenticación completo (AuthService + Auth Module)
- [ ] Servicios API para consumir endpoints del backend
- [ ] Dashboard multi-rol
- [ ] Conexión real de botones landing page

### Fase 3: 📋 Próximas mejoras
- Módulo de gestión de equipos (CRUD completo)
- Módulo de jugadores (perfiles, estadísticas)
- Módulo de convocatorias y confirmaciones
- Notificaciones en tiempo real (sockets)
- Formularios de incidencias y lesiones

### Fase 4: 🚀 Producción
- Autenticación JWT robusta
- Pruebas unitarias e integración
- Documentación OpenAPI/Swagger
- CI/CD pipeline
- Despliegue en servidor

---

## Guía de Ejecución Local

### Backend (Spring Boot)

```bash
# Clonar y entrar en el directorio
cd src/backend-tfg

# Configurar base de datos en application.properties
# spring.datasource.url=jdbc:mysql://localhost:3306/tfg_club_futbol
# spring.datasource.username=root
# spring.datasource.password=tu_contraseña

# Ejecutar con Maven
mvn spring-boot:run

# API disponible en http://localhost:8080
```

### Frontend (Angular/Ionic)

```bash
# Clonar y entrar en el directorio
cd src/frontend-tfg

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
ionic serve

# O con Angular CLI
ng serve

# Frontend disponible en http://localhost:4200
```

### Pruebas de Integración

1. Asegurar que el backend está corriendo en `http://localhost:8080`.
2. Actualizar URL base en `src/environments/environment.ts` si es necesario.
3. Abrir el navegador en `http://localhost:4200`.
4. Navegar a `/landing` para ver la página de bienvenida.

---

## Autor y contacto

**Sergio Estudillo**  
Estudiante de 2º DAM (Desarrollo de Aplicaciones Multiplataforma)  
Repositorio GitHub: [sestmar/TFG-SergioEstudillo](https://github.com/sestmar/TFG-SergioEstudillo)

---

*Documentación viva y profesional. Para documentación técnica detallada del backend, consulta `backend.md`. Para frontend, consulta `frontend.md`.*