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

**Estado actual:** Backend completamente implementado y validado con pruebas exhaustivas en Postman.

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
- **Frontend:** Angular/Ionic (roadmap)
- **Base de datos:** MySQL 8.x
- **Testing & docs:** Postman, Swagger (previsto), JUnit
- **Modelado ER:** dbdiagram.io, MySQL Workbench
- **DevOps/GitHub:** Git, GitHub Desktop, CI/CD opcional, .gitignore personalizado
- **IDE:** IntelliJ IDEA, Visual Studio Code

---

## Estructura del Repositorio y Organización del Código

