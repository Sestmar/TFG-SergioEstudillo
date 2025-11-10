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
9. [Tabla completa de endpoints implementados](#tabla-completa-de-endpoints-implementados)
10. [Ejemplos JSON por entidad: Requests y Responses](#ejemplos-json-por-entidad)
11. [Pruebas con Postman: Metodología y resultados](#pruebas-con-postman-metodología-y-resultados)
12. [Problemas encontrados y soluciones aplicadas](#problemas-encontrados-y-soluciones-aplicadas)
13. [Best practices, validación y manejo de errores](#best-practices-validación-y-manejo-de-errores)
14. [Roadmap técnico y mejoras futuras](#roadmap-técnico-y-mejoras-futuras)

---

## Resumen ejecutivo del backend

El backend del TFG Club de Fútbol ha sido desarrollado íntegramente sobre **Spring Boot 3.5.7** con Java 21/22, utilizando **Spring Data JPA** y **Hibernate** como ORM para gestionar la persistencia contra **MySQL 8.x**.

### Estado actual
✅ **100% funcional y validado**  
✅ **12 entidades principales** implementadas  
✅ **9 controladores REST** completos con CRUD  
✅ **3 relaciones ManyToMany** mediante tablas intermedias  
✅ **DTOs robustos** para todas las relaciones ManyToOne  
✅ **Pruebas exhaustivas** con Postman completadas  

---

## Arquitectura técnica y decisiones de diseño

### Patrón arquitectónico

El backend sigue una **arquitectura en capas clara y profesional**:

┌─────────────────────────────────────┐
│ Controller (REST Endpoints) │ ← Capa de presentación/API
├─────────────────────────────────────┤
│ DTO (Data Transfer Objects) │ ← Capa de transporte
├─────────────────────────────────────┤
│ Repository (JPA Interfaces) │ ← Capa de acceso a datos
├─────────────────────────────────────┤
│ Model (JPA Entities) │ ← Capa de persistencia
├─────────────────────────────────────┤
│ Config (Security, CORS, Beans) │ ← Capa de configuración
└─────────────────────────────────────┘


### Decisiones técnicas clave

1. **DTOs obligatorios para relaciones**: Evita el problema de entidades transientes en Hibernate y asegura validación de FKs.
2. **Inyección por constructor**: Facilita testing y cumple principios SOLID.
3. **Rutas RESTful semánticas**: `/api/{entidad}` y `/api/{entidad}/{id}`.
4. **Respuestas con objetos anidados completos**: Facilita consumo desde frontend sin necesidad de múltiples peticiones.
5. **Validación en DB y en código**: `ddl-auto=validate` asegura coherencia entre modelo Java y esquema MySQL.

---

## Estructura completa del proyecto

src/backend-tfg/
├── src/main/java/com/DAMUnitedFC/backend_tfg/
│ ├── controller/
│ │ ├── UsuarioController.java
│ │ ├── CategoriaController.java
│ │ ├── LigaController.java
│ │ ├── EquipoController.java
│ │ ├── JugadorController.java
│ │ ├── EntrenadorController.java
│ │ ├── SolicitudInscripcionController.java
│ │ ├── ConvocatoriaController.java
│ │ ├── IncidenciaController.java
│ │ ├── JugadorEquipoController.java
│ │ ├── ConvocatoriaJugadorController.java
│ │ └── EquipoEntrenadorController.java
│ │
│ ├── dto/
│ │ ├── LigaDto.java
│ │ ├── EquipoDto.java
│ │ ├── JugadorDto.java
│ │ ├── EntrenadorDto.java
│ │ ├── SolicitudInscripcionDto.java
│ │ ├── ConvocatoriaDto.java
│ │ ├── IncidenciaDto.java
│ │ ├── JugadorEquipoDto.java
│ │ ├── ConvocatoriaJugadorDto.java
│ │ └── EquipoEntrenadorDto.java
│ │
│ ├── model/
│ │ ├── Usuario.java
│ │ ├── Categoria.java
│ │ ├── Liga.java
│ │ ├── Equipo.java
│ │ ├── Jugador.java
│ │ ├── Entrenador.java
│ │ ├── SolicitudInscripcion.java
│ │ ├── Convocatoria.java
│ │ ├── Incidencia.java
│ │ ├── JugadorEquipo.java + JugadorEquipoId.java
│ │ ├── ConvocatoriaJugador.java + ConvocatoriaJugadorId.java
│ │ └── EquipoEntrenador.java + EquipoEntrenadorId.java
│ │
│ ├── repository/
│ │ ├── UsuarioRepository.java
│ │ ├── CategoriaRepository.java
│ │ ├── LigaRepository.java
│ │ ├── EquipoRepository.java
│ │ ├── JugadorRepository.java
│ │ ├── EntrenadorRepository.java
│ │ ├── SolicitudInscripcionRepository.java
│ │ ├── ConvocatoriaRepository.java
│ │ ├── IncidenciaRepository.java
│ │ ├── JugadorEquipoRepository.java
│ │ ├── ConvocatoriaJugadorRepository.java
│ │ └── EquipoEntrenadorRepository.java
│ │
│ ├── config/
│ │ └── SecurityConfig.java
│ │
│ └── BackendTfgApplication.java
│
└── src/main/resources/
└── application.properties


### Explicación de cada capa

#### **controller/**
Expone endpoints REST. Cada controlador maneja una entidad específica y sigue el patrón CRUD completo. Usa `@RestController` y `@RequestMapping` para definir rutas.

#### **dto/**
**Clave de la robustez del sistema.** Cada DTO representa los datos que viajan en POST/PUT para entidades con relaciones FK. Solo contiene IDs de entidades relacionadas, nunca objetos anidados.

#### **model/**
Entidades JPA que mapean 1:1 con las tablas MySQL. Usan anotaciones `@Entity`, `@Table`, `@ManyToOne`, `@OneToMany`, `@Embedded` según corresponda.

#### **repository/**
Interfaces que extienden `JpaRepository<Entidad, TipoID>`. Spring Data JPA genera automáticamente las implementaciones CRUD.

#### **config/**
Configuración de seguridad (temporalmente deshabilitada para desarrollo), beans personalizados y CORS si fuera necesario.

---

## Modelo de datos: Entidades y relaciones

### Entidades principales implementadas

#### 1. Usuario
@Entity
public class Usuario {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
private Integer idUsuario;
private String nombre;
private String apellidos;
@Column(unique = true, nullable = false)
private String email;
private String passwordHash;
private String rol;
private Date fechaAlta;
private String telefono;
private String direccion;
}


#### 2. Categoria
@Entity
public class Categoria {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "id_categoria")
private Integer idCategoria;
private String nombre;
private Integer edadMin;
private Integer edadMax;
}


#### 3. Liga
@Entity
public class Liga {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
private Integer idliga;
private String nombre;
private String temporada;
private String nivel;
private String observaciones;

@ManyToOne
@JoinColumn(name = "id_categoria", nullable = false)
private Categoria categoria;
}


#### 4. Equipo
@Entity
public class Equipo {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "id_equipo")
private Integer idEquipo;
private String nombre;
private Date fechaCreacion;
private String observaciones;

@ManyToOne
@JoinColumn(name = "id_categoria", nullable = false)
private Categoria categoria;

@ManyToOne
@JoinColumn(name = "id_liga", nullable = false)
private Liga liga;
}


#### 5. Jugador
@Entity
public class Jugador {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "id_jugador")
private Integer idJugador;

@ManyToOne
@JoinColumn(name = "id_usuario", nullable = false)
private Usuario usuario;

private Date fechaNacimiento;
private String posicion;
private Integer dorsal;
private String estado;
private String telefonoContacto;
private String direccion;
private Date fechaAlta;
private Date fechaBaja;
private String observaciones;
private Integer equipoPrincipal;
}


#### 6. Entrenador
@Entity
@Table(name = "entrenador")
public class Entrenador {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "id_entrenador")
private Integer idEntrenador;

@ManyToOne
@JoinColumn(name = "id_usuario", nullable = false)
private Usuario usuario;

private String especialidad;
private String licencia;
private String telefonoContacto;
private Date fechaAlta;
}


#### 7. SolicitudInscripcion
@Entity
public class SolicitudInscripcion {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "id_solicitud")
private Integer idSolicitud;

@ManyToOne
@JoinColumn(name = "id_usuario", nullable = false)
private Usuario usuario;

@ManyToOne
@JoinColumn(name = "id_jugador")
private Jugador jugador; // null hasta aprobar

private Date fechaSolicitud;
private String estado; // pendiente/aceptada/rechazada
private String motivoRechazo;
}


#### 8. Convocatoria
@Entity
public class Convocatoria {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "id_convocatoria")
private Integer idConvocatoria;

@ManyToOne
@JoinColumn(name = "id_equipo", nullable = false)
private Equipo equipo;

private Timestamp fechaEvento;
private String tipo;
private String observaciones;
}


#### 9. Incidencia
@Entity
public class Incidencia {
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "id_incidencia")
private Integer idIncidencia;

@ManyToOne
@JoinColumn(name = "id_jugador")
private Jugador jugador;

@ManyToOne
@JoinColumn(name = "id_usuario")
private Usuario usuario;

private Date fechaReporte;
private String tipo;
private String estado;
private String descripcion;
}


### Relaciones ManyToMany (tablas intermedias)

#### JugadorEquipo
@Entity
@Table(name = "jugador_equipo")
public class JugadorEquipo {
@EmbeddedId
private JugadorEquipoId id; // Clave compuesta

@ManyToOne
@MapsId("idJugador")
@JoinColumn(name = "id_jugador")
private Jugador jugador;

@ManyToOne
@MapsId("idEquipo")
@JoinColumn(name = "id_equipo")
private Equipo equipo;

private String observacion;
}


#### ConvocatoriaJugador
@Entity
@Table(name = "convocatoria_jugador")
public class ConvocatoriaJugador {
@EmbeddedId
private ConvocatoriaJugadorId id;

@ManyToOne
@MapsId("idConvocatoria")
@JoinColumn(name = "id_convocatoria")
private Convocatoria convocatoria;

@ManyToOne
@MapsId("idJugador")
@JoinColumn(name = "id_jugador")
private Jugador jugador;
}


#### EquipoEntrenador
@Entity
@Table(name = "equipo_entrenador")
public class EquipoEntrenador {
@EmbeddedId
private EquipoEntrenadorId id;

@ManyToOne
@MapsId("idEquipo")
@JoinColumn(name = "id_equipo")
private Equipo equipo;

@ManyToOne
@MapsI

