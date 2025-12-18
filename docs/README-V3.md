# TFG Club de Fútbol — Gestión Integral Deportiva

## Índice

1. [Introducción y Visión del Proyecto](#introducción-y-visión-del-proyecto)
2. [Arquitectura Cloud y Stack Tecnológico](#arquitectura-cloud-y-stack-tecnológico)
3. [Estructura del Repositorio](#estructura-del-repositorio)
4. [Backend: Spring Boot & NeonDB](#backend-spring-boot--neondb)
5. [Frontend: Angular & Ionic](#frontend-angular--ionic)
6. [Seguridad y Autenticación JWT](#seguridad-y-autenticación-jwt)
7. [Integración y Flujos de Datos](#integración-y-flujos-de-datos)
8. [Guía de Instalación y Despliegue](#guía-de-instalación-y-despliegue)
9. [Autor y contacto](#autor-y-contacto)

---

## Introducción y Visión del Proyecto

Este proyecto constituye una solución profesional, escalable y moderna para la gestión integral de clubes de fútbol base. La plataforma digitaliza todos los procesos del club: gestión de usuarios, equipos, fichas de jugadores, planificación de entrenadores, inscripciones, incidencias y convocatorias.

**Estado Actual del Proyecto (Backend Finalizado - v4.0):**
- ✅ **Backend:** Spring Boot 3.5.7 robusto y testeado.
- ✅ **Cloud Database:** Migración completa a **PostgreSQL en NeonDB**.
- ✅ **Multimedia:** Sistema de gestión de imágenes (avatares/escudos) funcional.
- ✅ **API Doc:** Documentación interactiva con **Swagger UI 2.8.3**.
- ✅ **Seguridad:** JWT, BCrypt y CORS global configurados.
- 🔄 **Frontend:** Arquitectura modular Angular/Ionic lista para integración.

---

## Arquitectura Cloud y Stack Tecnológico

El proyecto sigue una arquitectura **Cloud-First** para los datos y **Mobile-First** para el frontend.

### Stack Principal

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| **Backend** | Spring Boot | 3.5.7 | Núcleo de la API REST |
| **Lenguaje** | Java | 22 | Lógica de servidor |
| **Base de Datos** | **PostgreSQL (Neon Cloud)** | **16+** | Persistencia de datos en la nube |
| **Seguridad** | Spring Security + JWT | 6.x | Autenticación y Autorización Stateless |
| **Documentación** | Swagger UI (SpringDoc) | 2.8.3 | Pruebas de API y documentación viva |
| **Frontend** | Angular | 16+ | SPA Web Administrativa |
| **Mobile** | Ionic | 7 | Aplicación móvil híbrida |
| **ORM** | Hibernate (JPA) | 6.x | Mapeo Objeto-Relacional |

---

## Estructura del Repositorio

El proyecto se divide en dos grandes monolitos dentro del mismo repositorio:

```text
PROYECTO-TFG/
├── src/
│   ├── backend-tfg/                   # SERVIDOR (Spring Boot)
│   │   ├── src/main/java/.../backend_tfg/
│   │   │   ├── config/                # Configuraciones (Security, Web, Swagger)
│   │   │   ├── controller/            # API REST (Incluye MediaController)
│   │   │   ├── model/                 # Entidades (Usuario, Jugador, Equipo...)
│   │   │   ├── repository/            # Interfaces JPA
│   │   │   ├── security/              # Lógica JWT
│   │   │   └── service/               # Lógica de negocio
│   │   └── src/main/resources/
│   │       └── application.properties # Credenciales NeonDB
│   │
│   ├── frontend-tfg/                  # CLIENTE (Angular/Ionic)
│   │   ├── src/app/
│   │   │   ├── core/                  # Singleton (Auth, Guards, Interceptors)
│   │   │   ├── modules/               # Módulos Lazy-Loaded (Auth, Admin, Dashboard...)
│   │   │   └── shared/                # Componentes reutilizables
│   │
├── docs/                              # Documentación detallada
│   ├── Backend.md                     # Manual Técnico del Backend
│   └── ...
└── README.md                          # Este archivo
Backend: Spring Boot & NeonDB
El backend actúa como una API REST pura. Gracias a la migración a NeonDB, el backend es agnóstico del entorno de despliegue.

Funcionalidades Clave Implementadas
CRUD Completo: Gestión de 12 entidades (Usuarios, Jugadores, Ligas, etc.).

Gestión Multimedia: Subida de imágenes vía multipart/form-data con servido estático seguro.

Manejo de Errores Global: GlobalExceptionHandler captura excepciones y devuelve respuestas JSON estandarizadas (status 400, 401, 404, 500).

Validación de Datos: Uso de Bean Validation (Jakarta) en los DTOs.

Método   Endpoint            Protección   Descripción
POST     /api/auth/login     Público      Autenticación y entrega de JWT
POST     /api/media/upload   JWT          Subida de imágenes al servidor
GET      /api/equipos        JWT          Listado de equipos del club
POST     /api/solicitudes    JWT          Inscripción de nuevos jugadores

Frontend: Angular & Ionic
(En fase de integración con el nuevo backend Cloud).

Arquitectura Modular
El frontend está diseñado con módulos Lazy Loaded para optimizar el rendimiento:

AuthModule: Login y Registro.

DashboardModule: Vista principal según rol.

AdminModule: Gestión integral (solo administradores).

Coach/PlayerModule: Vistas específicas por rol.

Servicios Core (Preparados)
AuthService: Gestionará el token JWT y el estado del usuario.

Interceptor: Inyectará automáticamente el token Bearer en cada petición HTTP hacia el backend.

Seguridad y Autenticación JWT
La seguridad ha sido una prioridad máxima en el desarrollo.

Encriptación: Las contraseñas se almacenan hasheadas con BCrypt.

Stateless: No se usan cookies de sesión. Todo se valida mediante el token.

Roles: El sistema distingue entre ADMIN, ENTRENADOR y JUGADOR (preparado en el modelo de datos).

CORS: Configuración permisiva para desarrollo (localhost:4200, localhost:8100) permitiendo el intercambio de recursos cruzados, vital para la app móvil.

Integración y Flujos de Datos
Flujo de Login Típico
Frontend: Usuario envía credenciales.

Backend: AuthController recibe petición.

Database: AuthenticationManager verifica hash en NeonDB.

Security: Si es correcto, JwtService firma un token válido por 24h.

Frontend: Recibe token y lo guarda en localStorage.

Flujo de Acceso a Datos (ej: Ver Equipos)
Frontend: Interceptor añade Authorization: Bearer <token>.

Backend: JwtAuthenticationFilter valida la firma del token.

Backend: Si es válido, EquipoController consulta a NeonDB y devuelve JSON.

Frontend: Muestra la lista de equipos.

Guía de Instalación y Despliegue
Gracias a la arquitectura Cloud, la puesta en marcha es inmediata.

Requisitos
Java 22 JDK

Node.js 18+ (para el frontend)

IntelliJ IDEA (recomendado)

Conexión a Internet (Imprescindible para conectar con NeonDB)

Pasos para Ejecutar (Backend)
Clonar el repositorio.

Abrir la carpeta src/backend-tfg en IntelliJ IDEA.

Permitir que Maven descargue las dependencias.

Ejecutar la clase principal BackendTfgApplication.

Nota: No es necesario instalar PostgreSQL localmente.

Acceder a la documentación: http://localhost:8080/swagger-ui/index.html.

Pasos para Ejecutar (Frontend)
Abrir terminal en src/frontend-tfg.

Ejecutar npm install.

Ejecutar ng serve.

Autor y contacto
Sergio Estudillo Estudiante de 2º DAM (Desarrollo de Aplicaciones Multiplataforma)

Proyecto: TFG Gestión Deportiva - Curso 2024/2025

Documentación generada tras la migración completa a Cloud PostgreSQL - Versión 4.0