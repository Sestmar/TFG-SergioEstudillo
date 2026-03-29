# Registro de Refactoring — DAM United FC

## Estado general

| Problema | Severidad | Estado |
|---|---|---|
| Controllers hablan directo con Repositories | CRÍTICO | ✅ Completado |
| Lógica de negocio en controllers | CRÍTICO | ✅ Completado |
| `@Transactional` en controllers | CRÍTICO | ✅ Movido a Services |
| `@Autowired` field injection | IMPORTANTE | ✅ Completado (todos los Services migrados a constructor injection) |
| `@CrossOrigin` duplicado en controllers | IMPORTANTE | ✅ Centralizado en CorsConfig |
| `UserController` y `UsuarioController` duplicados | REVISAR | ✅ Responsabilidades documentadas y separadas |

**Estado final: REFACTOR COMPLETO ✅**

---

## Cambios aplicados

### [2026-03-27] Implementación de la Capa de Servicio (Service Layer)
**Problema**: El backend tenía controladores con demasiada lógica de negocio y acceso directo a base de datos.
**Solución**: Se han implementado 19 servicios de dominio para centralizar la lógica de negocio y la persistencia, siguiendo el patrón **Controller → Service → Repository**.
**Beneficios**:
- **Desacoplamiento**: Los controladores ahora solo manejan la comunicación HTTP y delegan la lógica a los servicios.
- **Transaccionalidad**: Se ha movido el control de transacciones (`@Transactional`) a la capa de servicios para asegurar la integridad de los datos en operaciones complejas.
- **Reutilización**: La lógica de negocio ahora puede ser consumida por distintos controladores o servicios sin duplicar código.

### [2026-03-28] Cierre del refactor — limpieza final
**Problema**: Quedaban flecos tras la refactorización masiva.
**Cambios aplicados**:
- `AuthService` migrado a inyección por constructor (fields `final`, constructor explícito)
- `EmailService` migrado a inyección por constructor
- `UsuarioController` eliminado acceso directo a `UsuarioRepository` — delega a `UsuarioService`
- `UsuarioService` ampliado con `findByEmail()` y `resetPassword()`
- `FileController` eliminada anotación `@CrossOrigin` redundante
- `UserController` y `UsuarioController` documentados con responsabilidades claras

---

## Servicios de Dominio Implementados

- ✅ `AdminService`
- ✅ `EntrenadorService`
- ✅ `AlineacionService`
- ✅ `PublicService`
- ✅ `UsuarioService`
- ✅ `PartidoService`
- ✅ `EquipoService`
- ✅ `JugadorService`
- ✅ `AuthService`
- ✅ `ConvocatoriaService`
- ✅ `IncidenciaService`
- ✅ `LigaService`
- ✅ `CategoriaService`
- ✅ `SolicitudInscripcionService`
- ✅ `EmailService`
- ✅ `JwtService`

---

## Arquitectura final — Controller → Service → Repository

Todos los controllers siguen el patrón:
- **Inyección por constructor** (fields `final`)
- **Sin imports de Repository** — toda la persistencia pasa por Services
- **Sin lógica de negocio** — los controllers solo manejan HTTP (rutas, status codes, request/response)

### Responsabilidades de controllers con nombres similares

| Controller | Ruta base | Responsabilidad |
|---|---|---|
| `UsuarioController` | `/api/auth` | Autenticación e identidad (register, login, forgot-password, me) |
| `UserController` | `/api/usuarios` | CRUD de perfiles (listar, obtener por ID, actualizar datos) |

> Nota: `GET /api/auth/users` en `UsuarioController` lista todos los usuarios. Semánticamente encajaría en `/api/usuarios`, pero la ruta se mantiene por retrocompatibilidad con el frontend.

---

## Próximos pasos

Refactor completado. No quedan pendientes técnicos.
