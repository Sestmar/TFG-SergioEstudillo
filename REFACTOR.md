# Registro de Refactoring — DAM United FC

## Estado general

| Problema | Severidad | Estado |
|---|---|---|
| Controllers hablan directo con Repositories | CRÍTICO | ✅ Completado |
| Lógica de negocio en controllers | CRÍTICO | ✅ Completado |
| `@Transactional` en controllers | CRÍTICO | ✅ Movido a Services |
| `@Autowired` field injection | IMPORTANTE | 🔄 En progreso (Migrado en Services Core) |
| `@CrossOrigin` duplicado en controllers | IMPORTANTE | ✅ Centralizado en CorsConfig |
| `UserController` y `UsuarioController` duplicados | REVISAR | ⏳ Pendiente de unificación |

---

## Cambios aplicados

### [2026-03-27] Implementación de la Capa de Servicio (Service Layer)
**Problema**: El backend tenía controladores con demasiada lógica de negocio y acceso directo a base de datos.
**Solución**: Se han implementado 19 servicios de dominio para centralizar la lógica de negocio y la persistencia, siguiendo el patrón **Controller → Service → Repository**.
**Beneficios**:
- **Desacoplamiento**: Los controladores ahora solo manejan la comunicación HTTP y delegan la lógica a los servicios.
- **Transaccionalidad**: Se ha movido el control de transacciones (`@Transactional`) a la capa de servicios para asegurar la integridad de los datos en operaciones complejas.
- **Reutilización**: La lógica de negocio ahora puede ser consumida por distintos controladores o servicios sin duplicar código.

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

## Próximos pasos

- [ ] Unificar `UsuarioController` y `UserController` para evitar redundancias.
- [ ] Completar la migración de `@Autowired` a Inyección por Constructor en todos los servicios restantes.
- [ ] Revisión final de controladores para asegurar que no quede lógica de negocio residual.
