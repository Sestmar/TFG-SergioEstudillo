# Documentación Técnica Backend — Spring Boot
## TFG Club de Fútbol - Sergio Estudillo

---

## Índice

1. [Resumen ejecutivo del backend](#resumen-ejecutivo-del-backend)
2. [Arquitectura técnica y decisiones de diseño](#arquitectura-técnica-y-decisiones-de-diseño)
3. [Estructura completa del proyecto](#estructura-completa-del-proyecto)
4. [Modelo de datos: Entidades y relaciones](#modelo-de-datos-entidades-y-relaciones)
5. [Gestión Multimedia y Recursos Estáticos](#gestión-multimedia-y-recursos-estáticos)
6. [Patrón DTO: Justificación e implementación](#patrón-dto-justificación-e-implementación)
7. [Controladores REST: Implementación completa](#controladores-rest-implementación-completa)
8. [Configuración Cloud (NeonDB) y Seguridad](#configuración-cloud-neondb-y-seguridad)
9. [🔐 Sistema de Autenticación JWT y Spring Security](#sistema-de-autenticación-jwt-y-spring-security)
10. [Documentación API (Swagger/OpenAPI)](#documentación-api-swaggeropenapi)
11. [Problemas técnicos y soluciones aplicadas](#problemas-técnicos-y-soluciones-aplicadas)

---

## Resumen ejecutivo del backend

El backend del TFG ha sido desarrollado bajo una arquitectura **Cloud-First**, utilizando **Spring Boot 3.5.7** sobre **Java 22**. A diferencia de las arquitecturas tradicionales monolíticas locales, este sistema desacopla la persistencia de datos llevándola a la nube con **PostgreSQL (NeonDB)**, lo que garantiza disponibilidad 24/7 y facilita el despliegue continuo.

### Estado Final del Desarrollo
- ✅ **Persistencia Cloud:** Migración exitosa de MySQL local a PostgreSQL Serverless (NeonDB).
- ✅ **Gestión Multimedia:** Sistema híbrido de almacenamiento de imágenes (Local File System + Referencia en BD) con acceso público configurado.
- ✅ **Seguridad de Grado Militar:** Implementación de JWT (JSON Web Tokens) con firma HMAC-SHA256 y Spring Security 6.
- **Documentación Viva:** Integración de **SpringDoc OpenAPI 2.8.3** (Swagger UI) para pruebas interactivas y documentación automática.

---

## Arquitectura técnica y decisiones de diseño

### 1. Migración a PostgreSQL (NeonDB)
Se sustituyó MySQL por **PostgreSQL** alojado en NeonDB.
* **Motivo:** PostgreSQL ofrece mejor soporte para tipos de datos complejos y concurrencia. Al usar NeonDB (Serverless Postgres), eliminamos la dependencia de tener un servidor de base de datos corriendo en la máquina de desarrollo, permitiendo trabajar desde cualquier entorno sin configuraciones adicionales.

### 2. Gestión de Imágenes (MediaController)
Se optó por un controlador dedicado (`MediaController`) que maneja cargas `multipart/form-data`.
* **Decisión:** En lugar de guardar las imágenes como BLOBs en la base de datos (lo cual penaliza el rendimiento), se guardan en el sistema de archivos del servidor (`/uploads`) y se almacena la URL relativa en la base de datos (`foto_url`).
* **Acceso:** Se configuró `WebConfig` para exponer el directorio local como recursos estáticos web.

### 3. Seguridad Stateless (Sin Estado)
El backend no mantiene sesiones de usuario (`HttpSession`). Cada petición es validada individualmente mediante el token JWT en la cabecera `Authorization`. Esto permite escalar el backend horizontalmente sin problemas de sincronización de sesiones.

---

## Estructura completa del proyecto

La estructura sigue el patrón **MVC (Modelo-Vista-Controlador)** adaptado a API REST (sin vistas HTML), organizado por capas de responsabilidad:

```text
src/backend-tfg/
├── src/main/java/com/DAMUnitedFC/backend_tfg/
│   ├── config/
│   │   ├── GlobalExceptionHandler.java  # Manejo centralizado de errores (JSON response)
│   │   ├── OpenApiConfig.java         # Configuración Swagger v2.8.3 + Bearer Auth
│   │   ├── SecurityConfig.java        # Configuración JWT, CORS global y rutas públicas
│   │   └── WebConfig.java             # Mapeo de recursos estáticos /uploads/**
│   │
│   ├── controller/
│   │   ├── MediaController.java       # (NUEVO) Endpoint para subida de imágenes
│   │   ├── UsuarioController.java
│   │   ├── EquipoController.java
│   │   ├── ... (Controladores por entidad)
│   │
│   ├── dto/                           # Data Transfer Objects (Request/Response)
│   │   ├── AuthResponseDto.java
│   │   ├── LoginDto.java
│   │   ├── EquipoDto.java
│   │   ├── ...
│   │
│   ├── model/                         # Entidades JPA (Hibernate)
│   │   ├── Usuario.java               # Implementa UserDetails
│   │   ├── Equipo.java                # Campo foto_url añadido
│   │   ├── Jugador.java
│   │   ├── ...
│   │
│   ├── repository/                    # Interfaces de acceso a datos (DAO)
│   │   ├── UsuarioRepository.java
│   │   ├── ...
│   │
│   ├── security/
│   │   ├── CustomUserDetails.java     # (Deprecado a favor de Usuario implements UserDetails)
│   │   └── JwtAuthenticationFilter.java # Filtro principal de seguridad
│   │
│   ├── service/                       # Lógica de Negocio
│   │   ├── AuthService.java
│   │   ├── JwtService.java
│   │   ├── ...
│   │
│   └── BackendTfgApplication.java

Modelo de datos: Entidades y relaciones
El modelo se ha actualizado para soportar la nueva arquitectura multimedia. Las relaciones principales (@OneToMany, @ManyToOne) se mantienen, pero se han enriquecido los atributos.

Modificaciones recientes
Usuario / Jugador / Equipo: Se ha añadido el campo @Column(name = "foto_url") private String fotoUrl; para almacenar la referencia a la imagen de perfil o escudo.

Usuario: Ahora implementa la interfaz UserDetails de Spring Security, conteniendo métodos como getAuthorities(), getPassword(), etc., directamente en la entidad.

Gestión Multimedia y Recursos Estáticos
Para permitir que los usuarios suban fotos y escudos, se ha implementado un sistema completo de gestión de archivos.

1. Controlador de Subida (MediaController)
Este controlador expone el endpoint POST /api/media/upload. Utiliza MediaType.MULTIPART_FORM_DATA_VALUE para procesar archivos binarios.

Flujo:

Recibe MultipartFile.

Genera un nombre único (UUID) para evitar colisiones.

Guarda el archivo físicamente en la carpeta uploads/ raíz del proyecto.

Devuelve un JSON con la URL pública: http://localhost:8080/uploads/uuid_archivo.jpg.

2. Exposición de Recursos (WebConfig)
Por defecto, Spring Boot no permite acceder a archivos fuera del classpath. Se configuró un ResourceHandler para mapear las peticiones HTTP a la carpeta física:

registry.addResourceHandler("/uploads/**")
        .addResourceLocations("file:uploads/");

Patrón DTO: Justificación e implementación
Se mantiene el uso estricto de DTOs (Data Transfer Objects) para desacoplar la base de datos de la API pública.

Beneficios:

Seguridad: Evita exponer datos sensibles (como password_hash o datos de auditoría) en las respuestas JSON.

Validación: Permite usar anotaciones @NotNull, @Size, @Email específicas para la entrada de datos.

Flexibilidad: Permite recibir IDs (id_equipo) en el JSON y convertirlos a entidades completas (Equipo) en la capa de servicio.

Configuración Cloud (NeonDB) y Seguridad
application.properties
La configuración de base de datos apunta ahora al clúster de NeonDB. Se utiliza JDBC sobre SSL.

# --- CONEXIÓN NEON DB (PostgreSQL) ---
spring.datasource.url=jdbc:postgresql://ep-misty-poetry-....aws.neon.tech/neondb?sslmode=require
spring.datasource.username=neondb_owner
spring.datasource.password=[HIDDEN]

# --- JPA / HIBERNATE ---
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# --- JWT CONFIG ---
application.security.jwt.secret-key=[BASE64_KEY]
application.security.jwt.expiration=3600000

SecurityConfig (Actualizado)
Se ha refactorizado para permitir el acceso a recursos estáticos y habilitar CORS globalmente.

Public: /api/auth/** (Login/Register) y /uploads/** (Imágenes).

Private: /api/** (Resto de endpoints).

CORS: Configurado explícitamente para orígenes http://localhost:4200 y http://localhost:8100, permitiendo métodos GET, POST, PUT, DELETE, OPTIONS.

🔐 Sistema de Autenticación JWT y Spring Security
El núcleo de la seguridad reside en la implementación de JWT.

Filtro (JwtAuthenticationFilter): Intercepta cada petición HTTP.

Extracción: Busca la cabecera Authorization: Bearer <token>.

Validación: Usa JwtService para verificar la firma digital y la fecha de expiración.

Autenticación: Si es válido, carga el usuario en el SecurityContextHolder, permitiendo el acceso al controlador.

Mejora Fase Final: Se eliminó la clase intermedia CustomUserDetails. Ahora UsuarioRepository devuelve directamente objetos que Spring Security entiende, simplificando el código.

Documentación API (Swagger/OpenAPI)
Se ha migrado a SpringDoc OpenAPI 2.8.3 para solucionar conflictos con Spring Boot 3.5.

Acceso: http://localhost:8080/swagger-ui/index.html

Funcionalidades:

Authorize Button: Permite introducir el token Bearer globalmente.

File Upload UI: Interfaz gráfica nativa para seleccionar archivos en endpoints multipart/form-data.

Schemas: Visualización de todos los DTOs y modelos de datos.

Problemas técnicos y soluciones aplicadas
1. "Dependency Hell" con Swagger
Síntoma: Error NoSuchMethodError al arrancar la aplicación. Causa: La versión 2.3.0 de SpringDoc invocaba métodos obsoletos en Spring Boot 3.5.7. Solución: Actualización forzada a springdoc-openapi-starter-webmvc-ui:2.8.3 en pom.xml.

2. Incompatibilidad de Dumps MySQL -> PostgreSQL
Síntoma: Errores de sintaxis al importar datos (LOCK TABLES, comillas invertidas). Solución: Se optó por dejar que Hibernate (ddl-auto=update) crease la estructura en NeonDB automáticamente y se limpió manualmente el script de datos (INSERT INTO) para adaptarlo a la sintaxis estándar SQL de Postgres.

3. Bloqueo de Imágenes por Seguridad (403 Forbidden)
Síntoma: Las imágenes subidas existían en el servidor pero devolvían 403 al intentar verlas en el navegador. Solución: Se añadió una regla explícita en SecurityFilterChain para permitir tráfico anónimo a /uploads/**.

Autor: Sergio Estudillo

Versión: 4.0 (Final Backend Release)