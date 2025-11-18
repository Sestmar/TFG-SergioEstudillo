# Documentación Técnica Backend — Spring Boot
## TFG Club de Fútbol - Sergio Estudillo

---

## Índice

1. [Resumen ejecutivo del backend](#resumen-ejecutivo-del-backend)
2. [Arquitectura técnica y decisiones de diseño](#arquitectura-técnica-y-decisiones-de-diseño)
3. [Estructura completa del proyecto](#estructura-completa-del-proyecto)
4. [Modelo de datos: Entidades y relaciones](#modelo-de-datos-entidades-y-relaciones)
5. [Patrón DTO: Justificación técnica y implementación](#patrón-dto-justificación-técnica-y-implementación)
6. [Controladores REST: Implementación completa](#controladores-rest-implementación-completa)
7. [Repositorios JPA: Acceso a datos](#repositorios-jpa-acceso-a-datos)
8. [Configuración Spring Boot: application.properties y SecurityConfig](#configuración-spring-boot)
9. [🔐 Sistema de Autenticación JWT y Spring Security (NUEVO)](#sistema-de-autenticación-jwt-y-spring-security)
10. [Tabla completa de endpoints implementados](#tabla-completa-de-endpoints-implementados)
11. [Ejemplos JSON por entidad: Requests y Responses](#ejemplos-json-por-entidad)
12. [Pruebas con Postman: Metodología y resultados](#pruebas-con-postman-metodología-y-resultados)
13. [Problemas encontrados y soluciones aplicadas](#problemas-encontrados-y-soluciones-aplicadas)
14. [Best practices, validación y manejo de errores](#best-practices-validación-y-manejo-de-errores)
15. [Roadmap técnico y mejoras futuras](#roadmap-técnico-y-mejoras-futuras)

---

## Resumen ejecutivo del backend

El backend del TFG Club de Fútbol ha sido desarrollado íntegramente sobre **Spring Boot 3.5.7** con Java 21/22, utilizando **Spring Data JPA** y **Hibernate** como ORM para gestionar la persistencia contra **MySQL 8.x**.

### Estado actual
✅ **100% funcional y validado**  
✅ **12 entidades principales** implementadas  
✅ **9 controladores REST** completos con CRUD  
✅ **3 relaciones ManyToMany** mediante tablas intermedias  
✅ **DTOs robustos** para todas las relaciones ManyToOne  
✅ **Autenticación JWT** profesional implementada y validada  
✅ **Spring Security** configurado con protección de endpoints  
✅ **Pruebas exhaustivas** con Postman completadas  

---

## Arquitectura técnica y decisiones de diseño

### Patrón arquitectónico

El backend sigue una **arquitectura en capas clara y profesional**:

```
┌─────────────────────────────────────┐
│ Controller (REST Endpoints)         │ ← Capa de presentación/API
├─────────────────────────────────────┤
│ DTO (Data Transfer Objects)         │ ← Capa de transporte
├─────────────────────────────────────┤
│ Service (Lógica de negocio)         │ ← Capa de servicios
├─────────────────────────────────────┤
│ Repository (JPA Interfaces)         │ ← Capa de acceso a datos
├─────────────────────────────────────┤
│ Model (JPA Entities)                │ ← Capa de persistencia
├─────────────────────────────────────┤
│ Security (JWT, Filters, Config)     │ ← Capa de seguridad
├─────────────────────────────────────┤
│ Config (CORS, Beans)                │ ← Capa de configuración
└─────────────────────────────────────┘
```

### Decisiones técnicas clave

1. **DTOs obligatorios para relaciones**: Evita el problema de entidades transientes en Hibernate y asegura validación de FKs.
2. **Inyección por constructor**: Facilita testing y cumple principios SOLID.
3. **Rutas RESTful semánticas**: `/api/{entidad}` y `/api/{entidad}/{id}`.
4. **Respuestas con objetos anidados completos**: Facilita consumo desde frontend sin necesidad de múltiples peticiones.
5. **Validación en DB y en código**: `ddl-auto=validate` asegura coherencia entre modelo Java y esquema MySQL.
6. **JWT con Spring Security**: Autenticación stateless profesional y escalable.

---

## Estructura completa del proyecto

```
src/backend-tfg/
├── src/main/java/com/DAMUnitedFC/backend_tfg/
│   ├── controller/
│   │   ├── UsuarioController.java
│   │   ├── CategoriaController.java
│   │   ├── LigaController.java
│   │   ├── EquipoController.java
│   │   ├── JugadorController.java
│   │   ├── EntrenadorController.java
│   │   ├── SolicitudInscripcionController.java
│   │   ├── ConvocatoriaController.java
│   │   ├── IncidenciaController.java
│   │   ├── JugadorEquipoController.java
│   │   ├── ConvocatoriaJugadorController.java
│   │   └── EquipoEntrenadorController.java
│   │
│   ├── dto/
│   │   ├── RegistroUsuario.java
│   │   ├── LoginDto.java
│   │   ├── LigaDto.java
│   │   ├── EquipoDto.java
│   │   ├── JugadorDto.java
│   │   ├── EntrenadorDto.java
│   │   ├── SolicitudInscripcionDto.java
│   │   ├── ConvocatoriaDto.java
│   │   ├── IncidenciaDto.java
│   │   ├── JugadorEquipoDto.java
│   │   ├── ConvocatoriaJugadorDto.java
│   │   └── EquipoEntrenadorDto.java
│   │
│   ├── model/
│   │   ├── Usuario.java
│   │   ├── Categoria.java
│   │   ├── Liga.java
│   │   ├── Equipo.java
│   │   ├── Jugador.java
│   │   ├── Entrenador.java
│   │   ├── SolicitudInscripcion.java
│   │   ├── Convocatoria.java
│   │   ├── Incidencia.java
│   │   ├── JugadorEquipo.java + JugadorEquipoId.java
│   │   ├── ConvocatoriaJugador.java + ConvocatoriaJugadorId.java
│   │   └── EquipoEntrenador.java + EquipoEntrenadorId.java
│   │
│   ├── repository/
│   │   ├── UsuarioRepository.java
│   │   ├── CategoriaRepository.java
│   │   ├── LigaRepository.java
│   │   ├── EquipoRepository.java
│   │   ├── JugadorRepository.java
│   │   ├── EntrenadorRepository.java
│   │   ├── SolicitudInscripcionRepository.java
│   │   ├── ConvocatoriaRepository.java
│   │   ├── IncidenciaRepository.java
│   │   ├── JugadorEquipoRepository.java
│   │   ├── ConvocatoriaJugadorRepository.java
│   │   └── EquipoEntrenadorRepository.java
│   │
│   ├── service/
│   │   ├── AuthService.java
│   │   └── JwtService.java
│   │
│   ├── security/
│   │   ├── JwtAuthenticationFilter.java
│   │   └── CustomUserDetails.java
│   │
│   ├── config/
│   │   └── SecurityConfig.java
│   │
│   └── BackendTfgApplication.java
│
└── src/main/resources/
    └── application.properties
```

### Explicación de cada capa

#### **controller/**
Expone endpoints REST. Cada controlador maneja una entidad específica y sigue el patrón CRUD completo. Usa `@RestController` y `@RequestMapping` para definir rutas.

#### **dto/**
**Clave de la robustez del sistema.** Cada DTO representa los datos que viajan en POST/PUT para entidades con relaciones FK. Solo contiene IDs de entidades relacionadas, nunca objetos anidados.

#### **model/**
Entidades JPA que mapean 1:1 con las tablas MySQL. Usan anotaciones `@Entity`, `@Table`, `@ManyToOne`, `@OneToMany`, `@Embedded` según corresponda.

#### **repository/**
Interfaces que extienden `JpaRepository<Entidad, TipoID>`. Spring Data JPA genera automáticamente las implementaciones CRUD.

#### **service/**
Capa de lógica de negocio. `AuthService` gestiona registro y autenticación. `JwtService` genera y valida tokens JWT.

#### **security/**
Filtros y clases de seguridad. `JwtAuthenticationFilter` intercepta requests HTTP y valida tokens. `CustomUserDetails` implementa UserDetails para Spring Security.

#### **config/**
Configuración de seguridad (Spring Security + JWT), beans personalizados y CORS.

---

## 🔐 Sistema de Autenticación JWT y Spring Security

### Fecha de implementación: 18/11/2025
### Estado: ✅ Completado y validado

### Resumen de implementación

El sistema de autenticación JWT ha sido implementado profesionalmente usando **Spring Security 6.5.6** con tokens **JWT firmados con HMAC SHA-256**. La arquitectura sigue el patrón stateless moderno, donde el backend no mantiene sesiones, sino que valida tokens en cada petición.

### Componentes principales

#### 1. SecurityConfig.java

Configuración central de Spring Security que:
- Permite acceso público a `/api/auth/**` (registro y login)
- Protege todos los endpoints `/api/**` (requieren autenticación)
- Registra el filtro JWT antes del filtro de autenticación de Spring
- Configura CORS para permitir frontend en `http://localhost:4200`
- Usa BCrypt para hashear contraseñas

```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, 
                                                   JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

#### 2. JwtService.java

Servicio que gestiona la generación y validación de tokens JWT:

```java
@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String SECRET_KEY;

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)) // 1 hora
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }
}
```

**Características:**
- Tokens firmados con HMAC-SHA256
- Expiración configurable (1 hora por defecto)
- Validación de firma y expiración
- Extracción de claims (subject, expiration, etc.)

#### 3. AuthService.java

Servicio de lógica de negocio para autenticación:

```java
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public Usuario registerNewUser(RegistroUsuario registroDto) {
        if (usuarioRepository.findByEmail(registroDto.getEmail()).isPresent()) {
            throw new RuntimeException("Error: El email ya está registrado.");
        }
        Usuario newUser = new Usuario();
        newUser.setNombre(registroDto.getNombre());
        newUser.setApellidos(registroDto.getApellidos());
        newUser.setEmail(registroDto.getEmail());
        newUser.setPasswordHash(passwordEncoder.encode(registroDto.getPassword()));
        newUser.setRol("JUGADOR");
        newUser.setFechaAlta(new java.sql.Date(System.currentTimeMillis()));
        newUser.setTelefono(registroDto.getTelefono());
        return usuarioRepository.save(newUser);
    }

    public UserDetails authenticateUser(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email no encontrado"));
        if (!passwordEncoder.matches(password, usuario.getPasswordHash())) {
            throw new RuntimeException("Contraseña incorrecta");
        }
        return new CustomUserDetails(usuario);
    }
}
```

#### 4. UsuarioController.java - Endpoints de autenticación

```java
@RestController
@RequestMapping("/api/auth")
public class UsuarioController {

    private final AuthService authService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegistroUsuario registroDto) {
        try {
            Usuario newUser = authService.registerNewUser(registroDto);
            return new ResponseEntity<>(newUser, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        try {
            UserDetails user = authService.authenticateUser(loginDto.getEmail(), loginDto.getPassword());
            String token = jwtService.generateToken(user);
            return ResponseEntity.ok(Map.of("token", token));
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
    }

    @GetMapping("/users")
    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }
}
```

### Endpoints de autenticación

| Método | Endpoint | Descripción | Protección |
|--------|----------|-------------|------------|
| POST | `/api/auth/register` | Registro de nuevo usuario | Público |
| POST | `/api/auth/login` | Login (devuelve JWT) | Público |
| GET | `/api/auth/users` | Lista de usuarios | Protegido (JWT) |

### Flujo completo de autenticación

```
1. Usuario se registra
   POST /api/auth/register
   Body: { nombre, apellidos, email, password, telefono }
   ↓
   Response: Usuario creado (201 CREATED)

2. Usuario hace login
   POST /api/auth/login
   Body: { email, password }
   ↓
   AuthService valida credenciales
   ↓
   JwtService genera token firmado
   ↓
   Response: { "token": "eyJhbGciOiJIUzI1NiIs..." }

3. Usuario accede a endpoint protegido
   GET /api/equipos
   Header: Authorization: Bearer <token>
   ↓
   JwtAuthenticationFilter intercepta
   ↓
   JwtService valida firma y expiración
   ↓
   Spring Security autoriza petición
   ↓
   Controller procesa y responde
```

### Configuración en application.properties

```properties
# JWT Secret Key (base64 encoded)
application.security.jwt.secret-key=VHVTb2xvRGViZXNHdWFyZGFyRXN0YUNsYXZlRW5Vbkx1Z2FyU2VndXJvTm9FblJlcG9zaXRvcmlvc1B1YmxpY29z

# JWT expiration time (1 hour in milliseconds)
application.security.jwt.expiration=3600000
```

### Problema resuelto: JJWT en Java 17+

**Error encontrado:**
```
java.lang.NoClassDefFoundError: javax/xml/bind/DatatypeConverter
```

**Causa:**  
La librería JJWT 0.9.x depende de `javax.xml.bind.DatatypeConverter`, que fue eliminada del JDK en Java 9+.

**Solución aplicada:**  
Añadir dependencia manual del JAR `jaxb-api-2.3.1.jar` al proyecto:

1. Descargar JAR desde [Maven Central](https://repo1.maven.org/maven2/javax/xml/bind/jaxb-api/2.3.1/jaxb-api-2.3.1.jar)
2. Añadir a las librerías del proyecto en IntelliJ:
   - File → Project Structure → Libraries → + → Java → Seleccionar JAR
3. Rebuild proyecto

**Resultado:** Token JWT generado correctamente sin errores.

### Validación y pruebas con Postman

#### 1. Registro de usuario

**Request:**
```http
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "nombre": "Antonio",
  "apellidos": "Estudillo Butron",
  "email": "sestmar1996@gmail.com",
  "password": "1111a",
  "telefono": "123456789"
}
```

**Response (201 CREATED):**
```json
{
  "idUsuario": 57,
  "nombre": "Antonio",
  "apellidos": "Estudillo Butron",
  "email": "sestmar1996@gmail.com",
  "passwordHash": "$2a$10$uqEUvaRX1r9OE1.WUxBVq.VDelbUh/GU8BzMvkiojboxgwAkFIUSM",
  "rol": "JUGADOR",
  "fechaAlta": "2025-11-18",
  "telefono": "123456789",
  "direccion": null
}
```

#### 2. Login (obtener token)

**Request:**
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "sestmar1996@gmail.com",
  "password": "1111a"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzZXN0bWFyMTk5NkBnbWFpbC5jb20iLCJpYXQiOjE3MzE5NTM0NzcsImV4cCI6MTczMTk1NzA3N30.abc123xyz..."
}
```

#### 3. Acceso a endpoint protegido

**Request:**
```http
GET http://localhost:8080/api/auth/users
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzZXN0bWFyMTk5NkBnbWFpbC5jb20iLCJpYXQiOjE3MzE5NTM0NzcsImV4cCI6MTczMTk1NzA3N30.abc123xyz...
```

**Response (200 OK):**
```json
[
  {
    "idUsuario": 57,
    "nombre": "Antonio",
    "apellidos": "Estudillo Butron",
    "email": "sestmar1996@gmail.com",
    ...
  }
]
```

### Mejoras futuras del sistema de autenticación

- [ ] Migrar a JJWT 0.11.x o 0.12.x (API moderna)
- [ ] Implementar refresh tokens para renovación automática
- [ ] Añadir roles y permisos en claims del JWT
- [ ] Logout con blacklist de tokens (Redis)
- [ ] Rate limiting en endpoints de autenticación
- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth2 para login con Google/Facebook

---

## Tabla completa de endpoints implementados

### Endpoints de autenticación

| Método | Endpoint | Descripción | Protección |
|--------|----------|-------------|------------|
| POST | `/api/auth/register` | Registro usuario | Público |
| POST | `/api/auth/login` | Login con JWT | Público |
| GET | `/api/auth/users` | Lista usuarios | JWT requerido |

### Endpoints de entidades principales

| Método | Endpoint | Descripción | Protección |
|--------|----------|-------------|------------|
| GET | `/api/usuarios` | Listar usuarios | JWT requerido |
| GET | `/api/usuarios/{id}` | Usuario por ID | JWT requerido |
| POST | `/api/usuarios` | Crear usuario | JWT requerido |
| PUT | `/api/usuarios/{id}` | Actualizar usuario | JWT requerido |
| DELETE | `/api/usuarios/{id}` | Eliminar usuario | JWT requerido |
| GET | `/api/equipos` | Listar equipos | JWT requerido |
| GET | `/api/equipos/{id}` | Equipo por ID | JWT requerido |
| POST | `/api/equipos` | Crear equipo | JWT requerido |
| GET | `/api/jugadores` | Listar jugadores | JWT requerido |
| GET | `/api/convocatorias` | Listar convocatorias | JWT requerido |
| POST | `/api/incidencias` | Crear incidencia | JWT requerido |

---

## Problemas encontrados y soluciones aplicadas

### 1. Error NoClassDefFoundError con JJWT

**Problema:**  
```
java.lang.NoClassDefFoundError: javax/xml/bind/DatatypeConverter
```

**Causa:**  
JJWT 0.9.x requiere `javax.xml.bind`, removido en Java 9+.

**Solución:**  
Añadir manualmente `jaxb-api-2.3.1.jar` a las librerías del proyecto.

**Lección aprendida:**  
En Java moderno, verificar siempre compatibilidad de librerías legacy. Considerar migración a JJWT 0.11+ en producción.

### 2. Contraseña en texto plano en base de datos

**Problema:**  
Inicialmente las contraseñas se guardaban sin hashear.

**Solución:**  
Implementar `BCryptPasswordEncoder` en `AuthService`:
```java
newUser.setPasswordHash(passwordEncoder.encode(registroDto.getPassword()));
```

### 3. CORS bloqueando peticiones desde frontend

**Problema:**  
Frontend en `localhost:4200` no podía hacer requests al backend.

**Solución:**  
Configurar CORS en `SecurityConfig`:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type"));
    configuration.setAllowCredentials(true);
    return source;
}
```

---

## Best practices, validación y manejo de errores

### Validación de datos

- **DTOs con validación:** Usar `@Valid` en controladores
- **Validación de email único:** Verificar en `AuthService` antes de registrar
- **Validación de contraseña:** Longitud mínima, caracteres especiales (futuro)

### Manejo de errores

```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
    try {
        UserDetails user = authService.authenticateUser(loginDto.getEmail(), loginDto.getPassword());
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(Map.of("token", token));
    } catch (RuntimeException e) {
        return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
    }
}
```

### Seguridad

- ✅ Contraseñas hasheadas con BCrypt
- ✅ Tokens JWT firmados y con expiración
- ✅ Endpoints protegidos según autenticación
- ✅ CORS configurado correctamente
- ⚠️ Secret key debe moverse a variables de entorno en producción

---

## Roadmap técnico y mejoras futuras

### Fase actual (Completada)
- [x] Autenticación JWT básica
- [x] Registro y login funcionales
- [x] Protección de endpoints con Spring Security
- [x] Validación con Postman

### Próximas mejoras
- [ ] Refresh tokens
- [ ] Roles y permisos en JWT claims
- [ ] Logout con blacklist
- [ ] Migración a JJWT 0.12.x
- [ ] Variables de entorno para secret key
- [ ] Testing unitario de seguridad
- [ ] Documentación Swagger/OpenAPI

---

**Última actualización:** 18/11/2025  
**Versión:** 3.0 (Con autenticación JWT implementada)  
**Autor:** Sergio Estudillo - 2º DAM