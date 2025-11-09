### TFG Club de Fútbol — Sergio Estudillo

## Índice
Introducción

Modelo Entidad-Relación y Base de Datos

Justificación del modelo

Objetivos y alcance

Entidades principales y relaciones

Claves y restricciones

Ventajas del diseño

Diagrama ER

Verificación y pruebas BBDD

Tecnologías, Herramientas e Integración

Estructura del Repositorio y Organización del Código

Backend - Spring Boot

Arquitectura, Convenciones y Estándares

Implementación Profesional: Código y Lógica

Seguridad y Acceso API REST

Validación y Pruebas

Documentación y Buenas Prácticas

Roadmap: Siguientes pasos y evolución prevista

Autor --> Sergio Estudillo

## Introducción
Este proyecto constituye una solución profesional y escalable para la gestión integral de clubes de fútbol base, orientada a modernizar procesos administrativos, deportivos y de comunicación. La plataforma abarca la gestión de usuarios, equipos, jugadores, entrenadores, inscripciones, incidencias, convocatorias y más, facilitando la digitalización total de un club.

## Modelo Entidad-Relación y Base de Datos
Justificación del modelo
Refleja la complejidad real del día a día en clubes de fútbol (roles, movimientos, inscripciones, sanciones).

Ágil ante futuros cambios, manteniendo integridad y flexibilidad.

Cubre procesos clave: inscribir jugadores, convocarlos, gestionar incidencias y roles, con trazabilidad total.

## Objetivos y alcance
Estandarizar los datos imprescindibles para gestión deportiva y administrativa.

Garantizar la integridad referencial y coherencia de la información.

Habilitar la ampliación con nuevas entidades (estadísticas, facturación, comunicación con familias, etc.).

## Entidades principales y relaciones
Usuario: Abstracción única de persona (jugador, entrenador, admin…).

Jugador: Futbolista, atributos deportivos, vinculado a usuario y equipos.

Entrenador: Técnico responsable, con licencia/especialidad, vinculado a usuario.

Equipo: Agrega jugadores y entrenadores, asociados a una categoría de edad y a una liga.

Categoría: Rango de edades (Prebenjamín, Alevín, Infantil…).

Liga: Nueva entidad, representa competición/división en la que puede participar un equipo (relacionada con categoría y equipos).

SolicitudInscripción y Convocatoria: Flujos de alta y organización de partidos/entrenos.

Incidencia: Sanciones, lesiones, bloqueos y observaciones sobre cualquier persona.

## Relaciones clave
Un usuario puede tener varios roles.

Un jugador puede estar en varios equipos (principal/historial/convocatoria).

Un equipo pertenece a una categoría y a una liga.

Liga y Equipo referencian a Categoría mediante FK.

Relaciones ManyToOne gestionadas por DTO en POST/PUT (véase apartado backend).

Relaciones muchos-a-muchos (por tablas de unión):

jugador_equipo

equipo_entrenador

convocatoria_jugador

## Claves y restricciones
Uso sistemático de claves primarias y foráneas, restricciones NOT NULL.

ON DELETE/UPDATE ajustadas a lógica de negocio (protección de histórico, cascadas…).

Validación exhaustiva de duplicados y referencias.

## Ventajas del diseño
Escalabilidad: Soporta nuevas funcionalidades y entidades fácilmente.

Robustez: Evita inconsistencias y errores, respeta la lógica de negocio.

Flexibilidad: Preparado para evolucionar con nuevas reglas de negocio/módulos.

## Diagrama ER
Coloca aquí tu diagrama final (usa dbdiagram.io para claridad):

## Verificación y pruebas BBDD
Scripts de inserción, actualización y borrado validados en MySQL Workbench.

Pruebas JOIN complejas para validar las consultas backend/frontend.

Validación de restricciones por FK (equipos solo pueden pertenecer a categorías y ligas existentes).

Generación/borrado masivo de datos de ejemplo: usuarios, jugadores, equipos, entrenadores.

## Tecnologías, Herramientas e Integración
Backend: Spring Boot (Java 21/22 LTS)

ORM: Spring Data JPA + Hibernate

Frontend: Angular/Ionic (integración futura)

Base de datos: MySQL 8.x

Testing & docs: Postman, Swagger (previsto), JUnit

Modelado ER: dbdiagram.io, MySQL Workbench

DevOps/GitHub: Git, GitHub Desktop, CI/CD opcional, .gitignore personalizado

IDE: IntelliJ IDEA, Visual Studio Code

## Estructura del Repositorio y Organización del Código
/
├── docs/
│   ├── diagrama-er.png
│   └── Documentacion-TFG-Sergio-Estudillo.pdf
├── src/
│   └── backend-tfg/
│       ├── src/main/java/com/DAMUnitedFC/backend_tfg/
│       │   ├── controller/
│       │   ├── dto/                  # NUEVO: DTOs robustos (LigaDto, EquipoDto, etc)
│       │   ├── model/
│       │   ├── repository/
│       │   └── config/
│       └── resources/application.properties
├── backend.md                        # Documentación técnica del backend
├── README.md
├── .gitignore
└── planificacion.txt
controller/: Rutas y lógica REST completa.

dto/: DTOs (Data Transfer Objects) usados en endpoints POST y PUT para controlar relaciones ManyToOne y validación de FKs. Ejemplos: EquipoDto.java, LigaDto.java.

model/: Entidades JPA que reflejan la estructura real de la base de datos.

repository/: Interfaces JpaRepository para acceso a datos.

config/: Configuración personalizada (seguridad, CORS, beans).

Backend - Spring Boot
Arquitectura, Convenciones y Estándares
Arquitectura en capas (controller, dto, repository, model, config).

## Uso sistemático de entidades, controladores REST y DTOs.

Rutas RESTful robustas: /api/usuarios, /api/equipos/{id}, /api/ligas, etc.

Todas las relaciones ManyToOne ahora aseguradas usando DTOs (nunca objetos anidados sin id en POST/PUT).

Inyección de dependencias por constructor.

## Implementación Profesional: Código y Lógica
Insertar o actualizar equipos, ligas, etc. siempre vía DTO:

{ "idCategoria": 5, "idLiga": 2, ... } en el body.

El controlador busca la entidad por id y la asigna antes de save().

@PostMapping
public Equipo crearEquipo(@RequestBody EquipoDto equipoDto) {
    Liga liga = ligaRepository.findById(equipoDto.getIdLiga()).orElseThrow(...);
    Categoria categoria = categoriaRepository.findById(equipoDto.getIdCategoria()).orElseThrow(...);
    Equipo equipo = new Equipo();
    equipo.setNombre(...);
    equipo.setLiga(liga);
    equipo.setCategoria(categoria);
    ...
    return equipoRepository.save(equipo);
}
Ejemplo de petición POST:

json
{
    "nombre": "Cadete B",
    "fechaCreacion": "2025-11-10",
    "observaciones": "Equipo cadete segundo nivel",
    "idCategoria": 5,
    "idLiga": 2
}
En las respuestas, los objetos de liga y categoría se muestran anidados.

Seguridad y Acceso API REST
Acceso abierto temporalmente en desarrollo (SecurityConfig).

Listo para activar autenticación JWT y roles específicos.

## Validación y Pruebas
Pruebas exhaustivas con Postman: GET, POST, PUT, DELETE sobre ligas y equipos.

Monitorización SQL (spring.jpa.show-sql=true).

Validación JPA (ddl-auto=validate).

Integridad verificada en todas las relaciones.

Documentación y Buenas Prácticas
README autoactualizable y limpio.

backend.md en desarrollo para detalles de endpoints y lógica técnica.

Manejo robusto de errores en endpoints y validación previa de ids.

Roadmap: Siguientes pasos y evolución prevista
Modelado avanzado y endpoints para entidades clave restantes (jugadores, partidos, incidencias, etc).

Endpoints avanzados: filtrado, gestión de roles, análisis.

Integración frontend Angular/Ionic.

Seguridad completa con autenticación/roles.

Pruebas unitarias/integración (JUnit/TestNG).

Documentación OpenAPI automática.

CI/CD y scripts de despliegue.

Autor y contacto
Sergio Estudillo
Repositorio GitHub: sestmar/TFG-SergioEstudillo

Documentación viva y profesional. Para versión académica completa, consulta el PDF en docs/Documentacion-TFG-Sergio-Estudillo.pdf.