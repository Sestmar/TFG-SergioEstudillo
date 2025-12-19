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

## Backend: Spring Boot & NeonDB

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

## Frontend: Angular & Ionic
Integrado completamente con el backend Cloud.

##Arquitectura Modular
El frontend utiliza módulos Lazy Loaded y una estrategia de Rutas Planas para la navegación post-login:

    - AuthModule: Login y Registro.

    - DashboardModule: Redirección inteligente según rol.

    - AdminModule: Gestión integral (Ruta: /admin-dashboard).

    - CoachModule: Gestión de equipos (Ruta: /coach-dashboard).

    - PlayerModule: Vista de jugador (Ruta: /player-dashboard).

## Servicios Core (Actualizados v4.1)

    - AuthService: Consume /auth/me y gestiona la redirección.

    - StorageService: CRÍTICO: Guarda el token como String puro (sin JSON.stringify) para evitar SignatureException.

    - Interceptor: Inyecta el token Bearer en cabeceras HTTP.

    - Convención de URLs: environment.ts sin barra final; servicios añaden la barra inicial (ej: /jugadores).

## Seguridad y Autenticación JWT
La seguridad ha sido una prioridad máxima y se ha estabilizado en la v4.1.

    - Encriptación: Las contraseñas se almacenan hasheadas con BCrypt.

    - Stateless: No se usan cookies de sesión. Todo se valida mediante token JWT.

    - Corrección de Firma: El frontend envía el token limpio, sin comillas extra, permitiendo que el backend valide la firma correctamente.

    - Roles: El sistema distingue entre ADMIN, ENTRENADOR y JUGADOR.

    - CORS: Configuración permisiva para desarrollo (localhost:4200, localhost:8100) y soporte de métodos OPTIONS/POST/GET/PUT/DELETE.

## Integración y Flujos de Datos
Flujo de Login Típico

    - Frontend: Usuario envía credenciales en LoginPage.

    - Backend: AuthController valida y devuelve { "token": "ey..." }.

    - Frontend: StorageService guarda el token tal cual (Raw String).

    - Frontend: AuthService llama inmediatamente a /api/auth/me.

    - Frontend: Según el rol recibido en la respuesta, redirige al dashboard correspondiente.

## Flujo de Acceso a Datos

    - Frontend: Interceptor añade Authorization: Bearer <token_string>.

    - Backend: JwtAuthenticationFilter valida la firma del token (ahora exitoso tras corrección de formato).

    - Backend: Valida roles y permisos.

    - Backend: Devuelve JSON limpio (sin campos sensibles ignorados).

## Guía de Instalación y Despliegue
Gracias a la arquitectura Cloud, la puesta en marcha es inmediata.

Requisitos

    - Java 22 JDK

    - Node.js 18+ (para el frontend)

    - IntelliJ IDEA (recomendado)

    - Conexión a Internet (Imprescindible para conectar con NeonDB)

## Pasos para Ejecutar (Backend)

    1. Clonar el repositorio.

    2. Abrir la carpeta src/backend-tfg en IntelliJ IDEA.

    3. Permitir que Maven descargue las dependencias.

    4. Ejecutar la clase principal BackendTfgApplication.

Acceder a la documentación: http://localhost:8080/swagger-ui/index.html.

## Pasos para Ejecutar (Frontend)

    1. Abrir terminal en src/frontend-tfg.

    2. Ejecutar npm install.

    3. Ejecutar ng serve.

Acceder a http://localhost:8100.

## Autor y contacto
Sergio Estudillo - Estudiante de 2º DAM (Desarrollo de Aplicaciones Multiplataforma) Proyecto: TFG Gestión Deportiva - Curso 2024/2025

Documentación actualizada a la Versión 4.1 - Integración Completada