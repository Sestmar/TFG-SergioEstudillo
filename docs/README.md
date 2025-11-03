"# Documentacion del TFG" 

# TFG Club de Fútbol — Sergio Estudillo

## 1. Introducción al modelo ER

Este proyecto implementa un gestor de club de fútbol base con un modelo entidad-relación que refleja los procesos y necesidades reales de gestión deportiva y administrativa. La estructura está optimizada para organizar usuarios, jugadores, equipos, entrenadores, categorías y operaciones críticas del club.

## 1.1 Justificación del modelo

El objetivo es reflejar fielmente la operativa real de un club de fútbol base, permitiendo:
- Gestión y validación de inscripciones de jugadores.
- Organización de equipos por categoría de edad.
- Convocatorias y eventos (partidos, entrenos, reuniones).
- Registro de incidencias administrativas y deportivas.
- Asignación flexible de entrenadores y jugadores, permitiendo pertenencia principal y convocatorias cruzadas.

## 1.2 Descripción de entidades principales

- **Usuario:** Persona con acceso a la app. Tipos: jugador, entrenador, ayudante, administrador.
- **Jugador:** Miembro futbolista con estado de inscripción, vinculado principalmente a equipos.
- **Entrenador:** Responsable de dirigir equipos. Puede tener roles principal y ayudante.
- **Equipo:** Conjunto de jugadores bajo una categoría y entrenador/es asignados.
- **Categoria:** Agrupa equipos por edad (Alevín, Infantil, etc).
- **SolicitudInscripción:** Proceso de inscripción con estados: pendiente, validado, rechazado.
- **Incidencia:** Lesiones, sanciones, quejas u otras notificaciones administrativas/deportivas.
- **Convocatoria:** Eventos deportivos y lista de jugadores convocados.

**Tablas de relación:**
- **jugador_equipo:** Asocia jugadores a equipos (principal o extraordinario).
- **equipo_entrenador:** Registra el rol de cada entrenador en equipos.
- **convocatoria_jugador:** Registra cada convocatoria individual a eventos.

## 1.3 Relación entre entidades

- Un usuario puede ser jugador, entrenador, ayudante o administrador.
- Un jugador puede pertenecer y ser convocado por varios equipos/categorías.
- Un equipo puede tener más de un entrenador (principal/ayudante).
- Las incidencias pueden asociarse a jugadores o usuarios generales.
- El flujo de inscripción es realista: pre-inscripción, pruebas, aceptación/rechazo.

## 1.4 Claves y restricciones

- Todas las claves primarias y foráneas están definidas para asegurar la integridad referencial.
- Relaciones muchos-a-muchos (jugadores/equipos, entrenadores/equipos, convocatorias/jugadores) modeladas mediante tablas intermedias con clave compuesta.

## 1.5 Ventajas del diseño

- **Flexibilidad y escalabilidad:** El club puede ampliar la estructura según sus necesidades, incluyendo nuevos procesos como pagos, asistencias y estadísticas.
- **Integridad:** Minimiza duplicidades y asegura relaciones consistentes entre datos.
- **Ampliable:** Fácilmente extensible a nuevas funcionalidades como adjuntos, estadísticas, etc.

## 1.6 Diagrama visual e implementación

El diagrama ER ha sido generado usando dbdiagram.io para facilitar la visualización de las relaciones y servir como referencia tanto en desarrollo como en presentación/defensa del TFG.

---

## 2. Verificación y pruebas base de datos

Antes del desarrollo backend, se han realizado verificaciones manuales (en MySQL Workbench) sobre el modelo físico.

### 2.1 Objetivos de las pruebas

- Verificar la creación de todas las tablas y claves foráneas.
- Comprobar la integridad relacional y funcionamiento de restricciones.
- Validar la inserción, borrado, y consulta con datos representativos.
- Examinar consultas JOIN para extraer información de jugadores, equipos y eventos.
- Confirmar comportamiento de restricciones (ON DELETE CASCADE/RESTRICT, claves foráneas válidas).

### 2.2 Proceso realizado

- **Inicialización:** Script completo de creación de base de datos ejecutado en MySQL Workbench.
- **Inserciones:** Datos de prueba para usuarios (de distintos roles), categorías, equipos, jugadores, entrenadores, inscripciones, incidencias y convocatorias.
- **Pruebas de dependencias:** Orden correcto en inserciones y validación de restricciones entre entidades.
- **Consultas JOIN:** Validación de relaciones cruzadas y obtención de información asociada.

### 2.3 Resultados

- Todas las tablas fueron creadas correctamente y las restricciones funcionaron como esperado.
- Los datos de prueba se insertaron, consultaron y eliminaron correctamente.
- Se identificaron y corrigieron pequeñas dependencias en el orden de inserción.
- El modelo físico de BD es estable y listo para integrar con backend Spring Boot.

---

## 3. Tecnologías utilizadas

- **Backend:** Spring Boot (Java)
- **Frontend:** Angular/Ionic
- **Base de datos:** MySQL
- **Herramientas:** dbdiagram.io, MySQL Workbench, GitHub, Visual Studio Code

---

## 4. Próximos pasos

- Implementación de entidades y servicios en Spring Boot.
- Exposición de endpoints API REST (CRUD).
- Validación e integración con frontend.
- Tests de integración y documentación continua en este README.md.

---

*Documentación generada y actualizada directamente en GitHub para mayor comodidad y rastreo de cambios.*