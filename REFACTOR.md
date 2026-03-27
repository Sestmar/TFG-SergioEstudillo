# Registro de Refactoring — DAM United FC

## Estado general

| Problema | Severidad | Estado |
|---|---|---|
| Controllers hablan directo con Repositories | CRÍTICO | 🔄 En progreso |
| Lógica de negocio en controllers | CRÍTICO | 🔄 En progreso |
| `@Transactional` en controllers | CRÍTICO | ⏳ Pendiente |
| `@Autowired` field injection | IMPORTANTE | ⏳ Pendiente |
| `@CrossOrigin` duplicado en controllers | IMPORTANTE | ⏳ Pendiente |
| `UserController` y `UsuarioController` duplicados | REVISAR | ⏳ Pendiente |

---

## Cambios aplicados

### [2026-03-27] Setup entorno local
**Problema**: Desarrollo local conectaba a BD de producción (NeonDB).
**Solución**: Spring Profiles — perfil `local` con `application-local.properties` (gitignoreado).
**Archivos**:
- `src/backend-tfg/backend-tfg/src/main/resources/application.properties` — sin credenciales hardcodeadas
- `src/backend-tfg/backend-tfg/src/main/resources/application-local.properties` — credenciales locales (gitignoreado)
- `src/backend-tfg/backend-tfg/.gitignore` — ignora el perfil local
- `frontend/src/environments/environment.ts` — apunta a `localhost:8080` en desarrollo

---

### [2026-03-27] JugadorService — primer service de dominio
**Problema**: `JugadorController` tenía 127 líneas con lógica de negocio, mapeo DTO→entidad, cálculo de estadísticas y acceso directo a 4 repositories.
**Solución**: Extraída toda la lógica a `JugadorService`. Controller bajó a 58 líneas, delega todo al service.
**Patrón establecido**: Controller → Service → Repository. Este patrón se replicará al resto de dominios.
**Archivos**:
- `service/JugadorService.java` — creado
- `controller/JugadorController.java` — refactorizado (eliminado `@CrossOrigin`, eliminados imports de repositories)

---

## Próximos cambios

- [x] `JugadorService` — ✅ completado
- [ ] `EquipoService`
- [ ] `PartidoService`
- [ ] `EntrenadorService`
- [ ] `AlineacionService`
- [ ] `AdminService`
- [ ] `PublicService`
- [ ] `ConvocatoriaService`, `IncidenciaService`, `LigaService`, `CategoriaService`
- [ ] `UsuarioService`
- [ ] Mover `@Transactional` a services
- [ ] Eliminar `@CrossOrigin` restantes
