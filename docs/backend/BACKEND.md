# 📘 BACKEND.md — Documentación Técnica del Backend

<div align="center">

**DAM United FC · Spring Boot 3.5.7 · Java 21 · PostgreSQL**

</div>

---

## 📋 Índice

1. [Arquitectura en Capas](#-arquitectura-en-capas)
2. [Entidades JPA](#-entidades-jpa)
3. [Data Transfer Objects (DTOs)](#-data-transfer-objects)
4. [Controladores REST](#-controladores-rest)
5. [Seguridad (Spring Security 6 + JWT)](#-seguridad)
6. [Lógica de Negocio Clave](#-lógica-de-negocio-clave)
7. [Configuración](#-configuración)

---

## 🏗️ Arquitectura en Capas (Refactorizada)

El backend sigue una arquitectura de **Capa de Servicio (Service Layer)** para centralizar la lógica de negocio y desacoplar los controladores de la persistencia:

```mermaid
graph TB
    subgraph Presentacion["Capa de Presentación (REST)"]
        C1["AdminController"]
        C2["UsuarioController"]
        C3["UserController"]
        C4["PartidoController"]
        C5["...19 Controllers"]
    end

    subgraph Seguridad["Capa de Seguridad"]
        SF["JwtAuthenticationFilter"]
        JS["JwtService"]
        SC["SecurityConfig"]
    end

    subgraph Negocio["Capa de Servicio (Dominio)"]
        S1["AdminService"]
        S2["AuthService"]
        S3["AlineacionService"]
        S4["JugadorService"]
        S5["...19 Services"]
        DTO["DTOs (19)"]
    end

    subgraph Persistencia["Capa de Persistencia (JPA)"]
        R1["EquipoRepository"]
        R2["JugadorRepository"]
        R3["AlineacionRepository"]
        R4["...15 Repositories"]
    end

    subgraph BD["Base de Datos"]
        PG[("PostgreSQL NeonDB")]
    end

    C1 & C2 & C3 & C4 & C5 --> S1 & S2 & S3 & S4 & S5
    S1 & S2 & S3 & S4 & S5 --> DTO
    S1 & S2 & S3 & S4 & S5 --> R1 & R2 & R3 & R4
    SF --> JS
    SC --> SF
    R1 & R2 & R3 & R4 --> PG

    style Presentacion fill:#1a1a2e,stroke:#e94560,color:#e0e0e0
    style Seguridad fill:#16213e,stroke:#e94560,color:#e0e0e0
    style Negocio fill:#0f3460,stroke:#e94560,color:#e0e0e0
    style Persistencia fill:#533483,stroke:#e94560,color:#e0e0e0
    style BD fill:#2c003e,stroke:#e94560,color:#e0e0e0
```

### Paquete raíz: `com.DAMUnitedFC.backend_tfg`

```
com.DAMUnitedFC.backend_tfg/
├── config/               # Configuración de Seguridad, CORS y OpenAPI
├── controller/           # Controladores REST (Delegación a Capa de Servicio)
├── dto/                  # Objetos de Transferencia de Datos
├── model/                # Entidades JPA (Persistencia)
├── repository/           # Interfaces de Acceso a Datos (Spring Data JPA)
├── security/             # Componentes de Seguridad (JWT y Auth)
└── service/              # 19 Servicios de Dominio (Lógica de Negocio)
```

### Patrones Implementados

- **Service Layer**: Toda la lógica de negocio y orquestación se encuentra en servicios.
- **Inyección de Dependencias**: Inyección por Constructor **total y absoluta** en los 19 servicios de dominio (uso de campos `final` y constructores explícitos), eliminando por completo el uso de `@Autowired` en campos para una mejor testeabilidad y robustez.
- **Transaccionalidad**: Control de transacciones centrado en la capa de servicios mediante `@Transactional`.

---

## ⚙️ Servicios de Dominio (Service Layer)

Se han implementado **19 servicios** para orquestar la funcionalidad del club:

| Servicio | Propósito Clave |
|----------|-----------------|
| `AdminService` | Gestión administrativa de usuarios, equipos y cierre de actas. |
| `AuthService` | Manejo de registro, roles automáticos y autenticación. |
| `AlineacionService` | Gestión de fichas de partido, titulares y estadísticas. |
| `JugadorService` | Gestión de perfiles deportivos y estadísticas de jugadores. |
| `EntrenadorService` | Gestión de técnicos y asignaciones a equipos. |
| `EquipoService` | Gestión de la estructura de equipos y categorías. |
| `PartidoService` | Calendario de eventos, partidos y entrenamientos. |
| `UsuarioService` | Gestión de identidad y perfiles. Incluye lógica de recuperación de cuenta (`findByEmail`, `resetPassword`). |
| `PublicService` | Suministro de datos optimizados para vistas públicas. |
| `EmailService` | Notificaciones y comunicaciones vía correo electrónico. |
| `JwtService` | Generación y validación de tokens de seguridad JWT. |

---

## 🌐 Controladores REST

El API está organizado en controladores especializados que delegan la lógica de negocio a la capa de servicios. Se ha eliminado el acceso directo a repositorios desde los controladores.

### Mapa de Endpoints Principal

| Controller | Base Path | Responsabilidad Primaria | Acceso |
|-----------|-----------|--------------------------|--------|
| `UsuarioController` | `/api/auth/**` | Identidad, Auth y Recuperación | Público |
| `UserController` | `/api/usuarios/**` | CRUD de perfiles y administración | JWT |
| `PublicController` | `/api/public/**` | Datos optimizados para vistas públicas | Público |
| `AdminController` | `/api/admin/**` | Operaciones de gestión avanzada | JWT (ADMIN) |
| `EquipoController` | `/api/equipos/**` | Consulta de estructura de equipos | Público (GET) |
| `JugadorController` | `/api/jugadores/**` | Consulta y filtrado de deportistas | Público (GET) |
| `PartidoController` | `/api/partidos/**` | Gestión de calendario y eventos | JWT |
| `AlineacionController` | `/api/alineaciones/**` | Gestión de actas y estadísticas | JWT |
| `FileController` | `/api/uploads/**` | Servido de archivos estáticos (sin `@CrossOrigin` redundante) | Público |

> **💡 Nota Semántica sobre Usuarios:**
> - **`UsuarioController` (`/api/auth`)**: Se encarga del ciclo de vida de la **identidad** del usuario (login, registro, "quién soy yo", recuperar contraseña). Delega toda la lógica a `UsuarioService`.
> - **`UserController` (`/api/usuarios`)**: Se encarga del **perfil y la gestión** (listar usuarios, ver detalles de un perfil, actualizar datos de contacto).

### Endpoints Detallados del `AdminController`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/usuarios` | Todos los usuarios activos con sus perfiles |
| POST | `/api/admin/usuarios` | Crear usuario con rol específico |
| DELETE | `/api/admin/usuarios/{id}` | Eliminación en cascada de cuenta y perfiles |
| POST | `/api/admin/asignar-equipo` | Vinculación de jugador a equipo |
| POST | `/api/admin/cerrar-acta` | Proceso transaccional de finalización de partido |
| POST | `/api/admin/asistencia` | Registro de presencia en entrenamientos/eventos |

---

## 🗄️ Entidades JPA

El modelo de datos consta de **18 entidades** mapeadas con Hibernate/JPA:

### Entidades Core

| Entidad | Tabla | Descripción | Relaciones Principales |
|---------|-------|-------------|----------------------|
| `Usuario` | `usuario` | Base del sistema de usuarios. Implementa `UserDetails` | → Jugador, → Entrenador |
| `Jugador` | `jugador` | Perfil deportivo del jugador | → Usuario (M:1), → Equipo (M:1), → Alineacion (1:N) |
| `Entrenador` | `entrenador` | Técnico responsable de equipos | → Usuario (M:1), → Equipo (1:N) |
| `Equipo` | `equipo` | Grupo deportivo | → Categoría (M:1), → Entrenador (M:1), → Jugadores (1:N) |
| `Partido` | `partido` | Evento deportivo (partido o entrenamiento) | → Equipo (M:1), → Alineaciones (1:N) |
| `Alineacion` | `alineacion` | Registro de participación en partido | → Partido (M:1), → Jugador (M:1), → Equipo (M:1) |
| `Asistencia` | `asistencia` | Registro de asistencia a entrenamientos | → Partido (M:1), → Jugador (M:1) |
| `Categoria` | `categoria` | Rango de edad (Prebenjamín, Alevín, etc.) | → Equipos (1:N) |
| `Liga` | `liga` | Competición/división | — |
| `Incidencia` | `incidencia` | Sanciones, lesiones, observaciones | — |
| `Convocatoria` | `convocatoria` | Convocatoria de evento | → Jugadores (M:N) |
| `SolicitudInscripcion` | `solicitud_inscripcion` | Proceso de alta de nuevos jugadores | — |

### Entidades de Relación (Tablas Join)

| Entidad | Propósito |
|---------|-----------|
| `JugadorEquipo` / `JugadorEquipoId` | Histórico de equipos de un jugador (M:N) |
| `EquipoEntrenador` / `EquipoEntrenadorId` | Relación equipo-entrenador (M:N) |
| `ConvocatoriaJugador` / `ConvocatoriaJugadorId` | Jugadores en una convocatoria (M:N) |

### Modelo `Usuario` — Integración con Spring Security

La entidad `Usuario` implementa `UserDetails` para integrarse con Spring Security:

```java
@Entity
@Data
public class Usuario implements UserDetails {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idUsuario;
    private String nombre, apellidos;

    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore                      // Evita serializacion del hash
    private String passwordHash;

    private String rol;              // ADMIN | ENTRENADOR | JUGADOR

    @Override @JsonIgnore            // Evita bucle infinito de serializacion
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.rol));
    }

    @Override @JsonIgnore
    public String getPassword() { return this.passwordHash; }

    @Override @JsonIgnore
    public String getUsername() { return this.email; }
}
```

> **`@JsonIgnore` estratégico:** Previene la serialización recursiva de campos confidenciales y métodos de `UserDetails` que causarían un Error 500. Ver [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#3-bucles-infinitos-de-serialización-json-error-500).

### Modelo `Alineacion` — Centro de Datos de Rendimiento

```java
@Entity
@Table(name = "alineacion")
@Data
public class Alineacion {

    @Id @GeneratedValue
    private Long id;

    @ManyToOne private Partido partido;
    @ManyToOne private Jugador jugador;
    @ManyToOne private Equipo equipo;

    private Boolean esTitular;
    private Integer goles = 0;
    private Integer asistencias = 0;
    private Integer minutosJugados = 0;
    private Boolean tarjetaAmarilla = false;
    private Boolean tarjetaRoja = false;
    private Integer minutoEntrada, minutoSalida;
    private Boolean esCapitan = false;
    private Boolean esLanzadorPenaltis = false;
    private Boolean esLanzadorFaltas = false;
}
```

---

## 📦 Data Transfer Objects

Se utilizan **19 DTOs** para controlar la información que entra y sale del API:

| DTO | Propósito |
|-----|-----------|
| `LoginDto` | Credenciales de login (email + password) |
| `RegistroUsuario` | Datos de registro de nuevo usuario |
| `AuthResponseDto` | Token JWT de respuesta |
| `PublicTeamDto` | Equipo sin datos sensibles (vista pública) |
| `PublicPlayerDto` | Jugador con estadísticas calculadas (vista pública) |
| `EstadisticasJugadorDto` | Estadísticas agregadas por jugador |
| `AlineacionDto` / `AlineacionResponseDto` | Datos de alineación (entrada/salida) |
| `ActaDto` | Datos para cerrar un acta de partido |
| `EquipoDto` | Datos de equipo para Admin |
| `JugadorDto` | Datos de jugador para Admin |
| `EntrenadorDto` | Datos de entrenador |
| `ConvocatoriaDto` / `ConvocatoriaJugadorDto` | Convocatorias |
| `IncidenciaDto` | Incidencias |
| `PartidoDto` (implícito en Map) | Datos de partido |

---

## 🔐 Seguridad

### Cadena de Filtros (`SecurityConfig`)

```java
http
    .cors(cors -> cors.configurationSource(corsConfigurationSource()))
    .csrf(AbstractHttpConfigurer::disable)
    .authorizeHttpRequests(auth -> auth
        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
        .requestMatchers("/api/auth/**").permitAll()
        .requestMatchers(HttpMethod.GET, "/api/equipos/**").permitAll()
        .requestMatchers(HttpMethod.GET, "/api/jugadores/**").permitAll()
        .requestMatchers("/api/public/**").permitAll()
        .requestMatchers(HttpMethod.GET, "/api/entrenadores/**").permitAll()
        .requestMatchers("/api/uploads/**", "/uploads/**").permitAll()
        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll()
        .anyRequest().authenticated()
    )
    .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
```

### Configuración CORS

```java
configuration.setAllowedOriginPatterns(Collections.singletonList("*"));
configuration.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","OPTIONS","PATCH"));
configuration.setAllowCredentials(true);
```

### Dependencias JWT (pom.xml)

```xml
<!-- JJWT 0.12.3 -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
</dependency>
```

---

## 💡 Lógica de Negocio Clave

### Cálculo Dinámico de Estadísticas

En el `PublicController`, las estadísticas de un jugador se **calculan en tiempo real** sumando los registros de `Alineacion`:

```java
List<Alineacion> participaciones = alineacionRepo.findByJugador(j);
int totalGoles = participaciones.stream()
    .mapToInt(a -> a.getGoles() != null ? a.getGoles() : 0).sum();
int totalAsist = participaciones.stream()
    .mapToInt(a -> a.getAsistencias() != null ? a.getAsistencias() : 0).sum();
```

**¿Por qué?** → Una sola fuente de verdad (`Alineacion`). Sin duplicados, sin inconsistencias.

### Cierre de Acta con Transaccionalidad

El método `cerrarActaAdmin` en `AdminController` es **transaccional**:

1. Actualiza el resultado del partido (goles favor/contra).
2. Guarda todas las entradas de `Alineacion` con sus estadísticas.
3. Cambia el estado del partido a `FINALIZADO`.
4. Todo dentro de una transacción: si falla algo, se revierte todo.

### Creación de Partidos con Multipart Flexible

```java
@PostMapping("/partidos")
public ResponseEntity<?> crearPartido(
    @RequestParam("idEquipo") Integer idEquipo,
    @RequestParam("rival") String rival,
    @RequestParam("lugar") String lugar,
    @RequestParam("fechaHora") String fechaHoraStr,
    @RequestParam("tipo") String tipo,
    @RequestParam(value = "escudoRivalUrl", required = false) String escudoRivalUrl,
    @RequestParam(value = "file", required = false) MultipartFile file
)
```

> Acepta tanto URL externa como archivo subido. Ver [TROUBLESHOOTING.md](./TROUBLESHOOTING.md#2-error-415-unsupported-media-type-en-formularios-flexibles) para el contexto del diseño.

---

## ⚙️ Configuración

### `application.properties` (Estructura)

```properties
# Base de Datos (NeonDB)
spring.datasource.url=jdbc:postgresql://<host>.neon.tech/<database>?sslmode=require
spring.datasource.username=<usuario>
spring.datasource.password=<contrasena>
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT
application.security.jwt.secret-key=<clave-secreta-256-bits>
application.security.jwt.expiration=86400000

# Servidor
server.port=8080
```

### `pom.xml` — Dependencias Principales

| Dependencia | Propósito |
|------------|-----------|
| `spring-boot-starter-web` | REST API |
| `spring-boot-starter-data-jpa` | ORM/Hibernate |
| `spring-boot-starter-security` | Spring Security 6 |
| `spring-boot-starter-validation` | Bean Validation |
| `postgresql` | Driver PostgreSQL |
| `jjwt-api/impl/jackson` (0.12.3) | JWT tokens |
| `lombok` | Reducción de boilerplate |
| `springdoc-openapi-starter-webmvc-ui` (2.8.3) | Swagger/OpenAPI |

---

<div align="center">

[← Volver al README](./README.md) · [Frontend →](./FRONTEND.md) · [Troubleshooting →](./TROUBLESHOOTING.md)

</div>
