Backend TFG - Sergio Estudillo
Documentación Técnica Backend (backend.md)
Índice
## Introducción

## Estructura del proyecto backend

### Explicación de carpetas: organización y propósito

## Modelo de datos y relaciones

### Equipo - Liga

### Equipo - Categoría

### Liga - Categoría

### Usuario, Jugador, Entrenador y futuras entidades

### Gestión avanzada de relaciones: DTOs

## Controladores, endpoints y ciclo CRUD

### Tabla-resumen de endpoints REST implementados

### Ejemplos de cada relación (JSON)

## Pruebas e integración con Postman: ejemplos y trucos

## Validación, best practices, seguridad y errores comunes

## Roadmap backend y tareas siguientes

Introducción
Esta documentación recoge toda la arquitectura, estructura técnica, patrón DTO, validación de relaciones y el ciclo completo de desarrollo backend para el TFG Club de Fútbol. El objetivo es que cualquier desarrollador pueda continuar, mejorar y mantener el backend siguiendo prácticas empresariales, robustas y fáciles de testear/manualizar.

Estructura del proyecto backend
text
src/
├── backend-tfg/
│   ├── src/main/java/com/DAMUnitedFC/backend_tfg/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── model/
│   │   ├── repository/
│   │   └── config/
│   └── resources/
│       └── application.properties
Explicación de carpetas: organización y propósito
controller/
Agrupa todos los endpoints REST. Cada entidad funcional tiene su propio controlador RESTful siguiendo la convención /api/[nombre]. Encapsula la lógica de entrada/salida hacia el exterior.

dto/
Nueva carpeta, clave de robustez. Aquí cada DTO define los datos que viajan por red en POST/PUT. Las relaciones ManyToOne siempre se gestionan por ID, nunca anidando objetos.
Ejemplo para equipos:

java
public class EquipoDto {
    private String nombre;
    private String fechaCreacion;
    private String observaciones;
    private Integer idCategoria;
    private Integer idLiga;
}
model/
Define la estructura física de cada tabla en la base de datos. Cada entidad mapea exactamente a la tabla en SQL, usando @Entity, @Id, @ManyToOne, etc.

repository/
Interfaces extendiendo JpaRepository, permitiendo acceso, CRUD y paginaciones.

config/
Configuraciones técnicas (seguridad, beans, CORS...).

Modelo de datos y relaciones
Equipo - Liga
Un equipo pertenece a una liga.

Relación en DB: id_liga en equipo.

Implementación:

DTO: Solo se permite "idLiga": 3

Controlador: Busca la liga por id antes del save.

Equipo - Categoría
Un equipo pertenece a una categoría (por edad).

DTO: "idCategoria": 5

En la base de datos, FK id_categoria en equipo.

Liga - Categoría
Cada liga está ligada a una categoría (N equipos pueden competir en la misma categoría/edad).

DTO Liga: "idCategoria": 5, y el backend valida que exista antes del save.

Usuario, Jugador, Entrenador y futuras entidades
Por arquitectura, todas las relaciones importantes (usuario-jugador, equipo-entrenador, etc) seguirán el mismo patrón de DTO-referencia por id y validación business logic.

Gestión avanzada de relaciones: DTOs
¿Por qué usamos DTO?
Evita errores de entidades transientes en Hibernate, obliga a validar que la FK existe antes de cualquier alta/modificación, asegura la integridad y desacopla el modelo de los datos de transporte.

Patrón de uso:

POST/PUT siempre reciben el id de la entidad referenciada (ejemplo: equipo recibe idLiga e idCategoria).

El controlador busca la entidad y la asigna como objeto JPA gestionado.

Ejemplo de implementación en controller:

java
@PostMapping
public Equipo crearEquipo(@RequestBody EquipoDto equipoDto) {
    Liga liga = ligaRepository.findById(equipoDto.getIdLiga())
        .orElseThrow(() -> new RuntimeException("Liga no encontrada"));
    Categoria categoria = categoriaRepository.findById(equipoDto.getIdCategoria())
        .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
    Equipo equipo = new Equipo();
    equipo.setNombre(equipoDto.getNombre());
    equipo.setFechaCreacion(Date.valueOf(equipoDto.getFechaCreacion()));
    equipo.setObservaciones(equipoDto.getObservaciones());
    equipo.setLiga(liga);
    equipo.setCategoria(categoria);
    return equipoRepository.save(equipo);
}
Controladores, endpoints y ciclo CRUD
Estructura típica
java
@RestController
@RequestMapping("/api/equipos")
public class EquipoController {
    // GetAll, GetById, Post (DTO), Put (DTO), Delete...
}
Endpoints robustos
Para Liga:

GET /api/ligas: lista todas las ligas.

GET /api/ligas/{id}: detalles de una liga.

POST /api/ligas: alta vía LigaDto (referencia idCategoria).

PUT /api/ligas/{id}: edita una liga vía LigaDto.

DELETE /api/ligas/{id}: borra la liga.

Para Equipo:

GET /api/equipos

GET /api/equipos/{id}

POST /api/equipos: alta vía EquipoDto (referencia idCategoria, idLiga).

PUT /api/equipos/{id}: edit con EquipoDto.

DELETE /api/equipos/{id}

Para Categoría:

GET /api/categorias

GET /api/categorias/{id}

POST /api/categorias

PUT /api/categorias/{id}

DELETE /api/categorias/{id}

Tabla-resumen de endpoints REST implementados
Entidad	Endpoint	Método HTTP	Body / Parámetros	Respuesta
Liga	/api/ligas	GET	-	array de ligas
Liga	/api/ligas/{id}	GET	-	liga (con categoria anidada)
Liga	/api/ligas	POST	LigaDto (nombre, temporada, ..., idCategoria)	liga creada
Liga	/api/ligas/{id}	PUT	LigaDto	liga actualizada
Liga	/api/ligas/{id}	DELETE	-	204 / OK
Equipo	/api/equipos	GET	-	array de equipos
Equipo	/api/equipos/{id}	GET	-	equipo (con liga, categoria)
Equipo	/api/equipos	POST	EquipoDto (nombre, ..., idCategoria, idLiga)	equipo creado
Equipo	/api/equipos/{id}	PUT	EquipoDto	equipo actualizado
Equipo	/api/equipos/{id}	DELETE	-	204 / OK
Categoría	/api/categorias	GET	-	array de categorías
Categoría	/api/categorias/{id}	GET	-	categoría unica
Categoría	/api/categorias	POST	{nombre, edadMin, edadMax}	categoria creada
Categoría	/api/categorias/{id}	PUT	{nombre, edadMin, edadMax}	categoria actualizada
Categoría	/api/categorias/{id}	DELETE	-	204 / OK
Ejemplos de cada relación (JSON)
Crear liga asociada a una categoría existente

json
{
    "nombre": "Liga Cadete A",
    "temporada": "2025/2026",
    "nivel": "Preferente",
    "observaciones": "",
    "idCategoria": 5
}
Respuesta:

json
{
    "idliga": 2,
    "nombre": "Liga Cadete A",
    "temporada": "2025/2026",
    "nivel": "Preferente",
    "observaciones": "",
    "categoria": {
        "idCategoria": 5,
        "nombre": "Cadete",
        "edadMin": 14,
        "edadMax": 15
    }
}
Crear equipo ligado a una liga y una categoría

json
{
    "nombre": "Cadete B",
    "fechaCreacion": "2025-11-10",
    "observaciones": "Equipo cadete segundo nivel",
    "idCategoria": 5,
    "idLiga": 2
}
Respuesta:

json
{
    "idEquipo": 24,
    "nombre": "Cadete B",
    "fechaCreacion": "2025-11-10",
    "observaciones": "Equipo cadete segundo nivel",
    "categoria": {
        "idCategoria": 5,
        "nombre": "Cadete",
        "edadMin": 14,
        "edadMax": 15
    },
    "liga": {
        "idliga": 2,
        "nombre": "Liga Cadete A",
        "temporada": "2025/2026",
        "nivel": "Preferente",
        "observaciones": "",
        "categoria": {
            "idCategoria": 5,
            "nombre": "Cadete",
            "edadMin": 14,
            "edadMax": 15
        }
    }
}
Crear categoría nueva

json
{
    "nombre": "Benjamín",
    "edadMin": 8,
    "edadMax": 9
}
Pruebas e integración con Postman: ejemplos y trucos
Todos los endpoints han sido validados con colecciones de pruebas Postman.

En cada POST o PUT con relaciones, se debe indicar el id de la entidad referenciada (nunca objeto anidado sin id).

Validar error-handling: si el id referenciado no existe se devuelve error 400/404 con mensaje comprensible.

Recomendado: guardar respuestas y documentos de ejemplos para pruebas E2E futuro Frontend.

Validación, best practices, seguridad y errores comunes
Validación obligatoria
Controller debe hacer siempre .findById().orElseThrow() antes de cualquier save/update.

DTO obligatorio en operaciones con relaciones.

Solo se aceptan ids válidos (no nulos, no inventados).

Seguridad
Durante desarrollo, seguridad abierta total (permitAll); preparado para seguridad JWT al ampliar frontend.

Errores comunes evitados
Entidad transiente (objeto anidado en vez de id FK): resuelto con DTO.

Error 500 al POST/PUT: casi siempre por IDs erróneos, mal paso a DTO o no encontrar entidades en repositorio.

Respuestas claras y consistentes (anidado siempre con objetos completos, nunca solo ids en la respuesta).

Roadmap backend y tareas siguientes
Modularización de lógica de negocio en servicios.

Nuevos endpoints para jugador, incidencia, partido, estadísticas.

Búsqueda combinada y consultas avanzadas (por liga, por categoría…).

Implementación de seguridad real (autenticación y roles).

Integración Swagger/OpenAPI y testing automático.

Integración con Frontend y despliegue en producción.