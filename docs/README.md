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
6. [Roadmap: Siguientes pasos y evolución prevista](#roadmap-siguientes-pasos-y-evolución-prevista)
7. [Autor y contacto](#autor-y-contacto)

---

## Introducción

Este proyecto constituye una solución profesional y escalable para la gestión integral de clubes de fútbol base, orientada a modernizar procesos administrativos, deportivos y de comunicación. La plataforma abarca la gestión de usuarios, equipos, jugadores, entrenadores, inscripciones, incidencias, convocatorias y más, facilitando la digitalización total de un club.

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
- **Equipo**: Agrega jugadores y entrenadores, asociados a una categoría de edad.
- **Categoría**: Rango de edades (Prebenjamín, Alevín, Infantil…).
- **SolicitudInscripción y Convocatoria**: Flujos de alta y organización de partidos/entrenos.
- **Incidencia**: Sanciones, lesiones, bloqueos y observaciones sobre cualquier persona.

#### Relaciones clave
- Un usuario puede tener varios roles (jugador y entrenador simultáneamente).
- Un jugador puede estar en varios equipos (principal/historial/por convocatoria).
- Equipos tienen uno o varios entrenadores.
- Convocatorias recogen a los jugadores llamados para la sesión.

**Relaciones muchos-a-muchos (por tablas de unión):**
- jugador_equipo
- equipo_entrenador
- convocatoria_jugador

### Claves y restricciones

- Uso sistemático de claves primarias, foráneas y restricciones NOT NULL.
- ON DELETE/UPDATE ajustadas a la lógica del club (proteger histórico vs limpiar datos huérfanos).
- Validación exhaustiva de duplicados y referencias para máxima integridad.

### Ventajas del diseño

- **Escalabilidad:** Soporta nuevas funcionalidades y entidades fácilmente.
- **Robustez:** Evita inconsistencias y errores, respeta la lógica de negocio real.
- **Flexibilidad:** Diseñado para evolucionar con nuevas reglas de negocio o módulos.

### Diagrama ER

Coloca aquí tu diagrama final (usa [dbdiagram.io](https://dbdiagram.io/) para claridad):

### Verificación y pruebas BBDD

- Scripts de inserción, actualización y borrado validados en MySQL Workbench.
- Pruebas JOIN complejas para validar las consultas backend/frontend.
- Validación de cascadas y restricciones por FK.
- Generación/borrado masivo de datos de ejemplo: usuarios, jugadores, equipos, entrenadores.

---

## Tecnologías, Herramientas e Integración

- **Backend:** Spring Boot (Java 21/22 LTS)
- **ORM:** Spring Data JPA + Hibernate
- **Frontend:** Angular/Ionic (integración futura)
- **Base de datos:** MySQL 8.x
- **Testing & docs:** Postman, Swagger (previsto), JUnit
- **Modelado ER:** dbdiagram.io, MySQL Workbench
- **DevOps/GitHub:** Git, GitHub Desktop, CI/CD opcional, .gitignore personalizado
- **IDE:** IntelliJ IDEA, Visual Studio Code

---

## Estructura del Repositorio y Organización del Código

/
├── docs/
│ ├── diagrama-er.png
│ └── Documentacion-TFG-Sergio-Estudillo.pdf
├── src/
│ └── backend-tfg/
│ ├── src/main/java/com/DAMUnitedFC/backend_tfg/
│ │ ├── controller/
│ │ ├── model/
│ │ ├── repository/
│ │ └── config/
│ └── resources/application.properties
├── README.md
├── .gitignore
└── planificacion.txt

text
- **controller/**: Rutas y lógica expuesta a cliente (REST).
- **model/**: Entidades JPA que reflejan la estructura de tabla.
- **repository/**: Interfaces JpaRepository para acceso a datos.
- **config/**: Configuración personalizada (seguridad, CORS, beans).

---

## Backend - Spring Boot

### Arquitectura, Convenciones y Estándares

- Arquitectura en capas (controller, repository, model, config).
- Anotaciones @Entity, @RestController, @Repository.
- Rutas RESTful: `/api/usuarios`, `/api/equipos/{id}`, etc.
- Inyección de dependencias por constructor.

### Implementación Profesional: Código y Lógica

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

text
private final UsuarioRepository usuarioRepository;

public UsuarioController(UsuarioRepository usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
}

@GetMapping
public List<Usuario> getUsuarios() {
    return usuarioRepository.findAll();
}

@PostMapping
public Usuario crearUsuario(@RequestBody Usuario usuario) {
    return usuarioRepository.save(usuario);
}
}

text
undefined
@Entity
@Data
public class Usuario {
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Integer idUsuario;
@Column(nullable = false, length = 50)
private String nombre;
@Column(nullable = false, length = 70)
private String apellidos;
@Column(unique = true, nullable = false, length = 120)
private String email;
@Column(nullable = false)
private String passwordHash;
@Column(nullable = false, length = 20)
private String rol;
@Column(nullable = false)
private java.sql.Date fechaAlta;
private String telefono;
private String direccion;
}

text
undefined
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {}

text

### Seguridad y Acceso API REST

- Acceso abierto durante el desarrollo (`SecurityConfig` desactiva temporalmente la seguridad).
- Listo para extender con autenticación personalizada.

@Configuration
public class SecurityConfig {
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
http
.csrf(csrf -> csrf.disable())
.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
return http.build();
}
}

text

### Validación y Pruebas

- Pruebas exhaustivas con Postman: endpoints GET/POST.
- Monitorización SQL: `spring.jpa.show-sql=true`.
- Validación de correspondencia entidad-tabla: `ddl-auto=validate`.

### Documentación y Buenas Prácticas

- README profesional y comentarios claros por clase/método.
- Manejo de errores y DTOs recomendado para futuras capas.
- Swagger/OpenAPI en roadmap para documentación automática.
- Control de versiones activo y documentado.

---

## Roadmap: Siguientes pasos y evolución prevista

- Modelado avanzado y endpoints para entidades clave.
- Endpoints avanzados: filtrado, gestión de roles, análisis.
- Integración frontend Angular/Ionic.
- Seguridad completa: autenticación y rol por usuario.
- Pruebas unitarias/integración (JUnit/TestNG).
- Documentación OpenAPI automática.
- CI/CD y scripts de despliegue.

---

## Autor y contacto

**Sergio Estudillo**  
Repositorio GitHub: [sestmar/TFG-SergioEstudillo](https://github.com/sestmar/TFG-SergioEstudillo)

---

*Documentación viva y profesional. Para versión académica completa, consulta el PDF en docs/Documentacion-TFG-Sergio-Estudillo.pdf.*