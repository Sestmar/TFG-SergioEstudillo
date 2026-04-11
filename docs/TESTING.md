# Plan de Calidad y Testing — DAM United FC

> **Proyecto:** DAM United FC — Sistema de Gestión de Club de Fútbol  
> **Stack:** Spring Boot 3.5 · Angular 18 · Ionic 7 · PostgreSQL  
> **Documento:** Arquitectura de Testing y Control de Calidad  
> **Versión:** 1.0 · Abril 2026

---

## Índice

1. [Introducción y Estrategia](#1-introducción-y-estrategia)
2. [Backend Testing — JUnit 5 + Mockito](#2-backend-testing--junit-5--mockito)
3. [Frontend Testing — Jasmine + Karma](#3-frontend-testing--jasmine--karma)
4. [Pruebas E2E — Cypress](#4-pruebas-e2e--cypress)
5. [Integración Continua — GitHub Actions](#5-integración-continua--github-actions)
6. [Manual de Ejecución](#6-manual-de-ejecución)

---

## 1. Introducción y Estrategia

### La Pirámide de Testing

DAM United FC adopta la **Pirámide de Testing** como modelo arquitectónico de calidad. Este modelo establece una jerarquía de pruebas inversamente proporcional a su coste de ejecución y mantenimiento:

```
            ╱▔▔▔▔▔▔▔▔▔╲
           ╱   E2E       ╲          ← Cypress (20 tests)
          ╱   Cypress      ╲           Lentos · Alta confianza
         ╱▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔╲
        ╱  Integración/UI    ╲      ← Jasmine/Karma (44 tests)
       ╱   Angular Services   ╲        Medios · Aislados por HTTP
      ╱▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔╲
     ╱    Unitarios Backend     ╲   ← JUnit 5 + Mockito (29 tests)
    ╱   JUnit 5 · Mockito Puro  ╲      Rápidos · Sin estado externo
   ╱▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔╲
```

**Principio rector:** Cada capa de la pirámide complementa a las demás. Los tests unitarios validan la lógica de negocio de forma rápida y aislada; los tests de integración/UI verifican los contratos entre capas; las pruebas E2E certifican que los flujos críticos del usuario funcionan de extremo a extremo.

### Métricas Globales

| Capa | Framework | Tests | Cobertura objetivo | Velocidad |
|------|-----------|-------|--------------------|-----------|
| Unitarios Backend | JUnit 5 + Mockito | **29** | Core de negocio ≥ 70 % | ~11 s |
| Unitarios Frontend | Jasmine + Karma | **44** | Capa de servicios | ~2 s |
| E2E | Cypress 15 | **20** | Flujos críticos de usuario | ~2–5 min |
| **Total** | | **93** | | |

---

## 2. Backend Testing — JUnit 5 + Mockito

### 2.1 Stack y Filosofía

El backend (Spring Boot 3.5 · Java 21) implementa una estrategia de **tests unitarios puros**, es decir, completamente desacoplados del contenedor de Spring y de cualquier base de datos. Esto garantiza:

- **Velocidad de ejecución:** La suite completa corre en ~11 segundos en cualquier entorno.
- **Aislamiento total:** Cada test verifica exactamente una unidad de lógica, sin dependencias de infraestructura.
- **Compatibilidad con CI:** El pipeline de GitHub Actions no dispone de PostgreSQL; los tests con Mockito funcionan sin ninguna conexión externa.

| Librería | Versión | Rol |
|----------|---------|-----|
| JUnit 5 (`junit-jupiter`) | 5.x (via Spring Boot BOM) | Runner de tests y assertions base |
| Mockito (`mockito-core`) | 5.x | Mocking de repositorios y servicios colaboradores |
| AssertJ (`assertj-core`) | 3.x | Assertions fluidas y expresivas |

### 2.2 Patrón de Implementación

Todo test sigue el patrón **Arrange → Act → Assert** con construcción manual del servicio bajo prueba para evitar el contexto de Spring:

```java
@ExtendWith(MockitoExtension.class)          // ① Mockito puro, sin Spring
class AdminServiceTest {

    // ② Mocks de todos los colaboradores
    @Mock private UsuarioRepository usuarioRepo;
    @Mock private PartidoRepository partidoRepo;
    @Mock private PasswordEncoder passwordEncoder;
    // ...

    private AdminService adminService;         // ③ SUT construido manualmente

    @BeforeEach
    void setUp() {
        // ④ Constructor injection: evita @Value y cualquier contexto
        adminService = new AdminService(
            usuarioRepo, jugadorRepo, ..., "http://localhost:8080"
        );
    }

    @Test
    void deberiaLanzarExcepcionSiEmailYaExiste() {
        // Arrange
        when(usuarioRepo.findByEmail("dup@test.com"))
            .thenReturn(Optional.of(existingUser));

        // Act & Assert
        assertThatThrownBy(() -> adminService.crearUsuario(payload))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Email");
    }
}
```

> **Decisión de diseño:** Se excluye `BackendTfgApplicationTests` del pipeline de CI mediante el flag `-Dtest='!BackendTfgApplicationTests'`. Este test levanta el contexto de Spring completo y requiere una instancia de PostgreSQL disponible, lo que no es viable en un runner de GitHub Actions estándar. Los tests de Mockito cubren la misma lógica de negocio sin esta restricción.

### 2.3 Cobertura por Servicio

#### `PublicService` — 5 tests

Valida el cálculo de estadísticas públicas de jugadores (lectura agregada).

| Test | Tipo | Verifica |
|------|------|----------|
| `deberiaCalcularEstadisticasCorrectamente` | Happy path | Suma correcta de goles y asistencias |
| `deberiaRetornarCeroEstadisticasCuandoCamposNulos` | Edge case | Tolerancia a `null` sin `NullPointerException` |
| `deberiaRetornarCeroEstadisticasSinParticipaciones` | Edge case | Jugador sin partidos → estadísticas en cero |
| `deberiaRetornarListaVaciaSinJugadores` | Edge case | Equipo vacío → lista `[]`, nunca `null` |
| `deberiaLanzarExcepcionCuandoJugadorNoExiste` | Error path | `ResourceNotFoundException` con mensaje descriptivo |

#### `AdminService` — 13 tests

Valida la lógica de gestión administrativa: usuarios, equipos, partidos y cierre de actas.

| Test | Tipo | Verifica |
|------|------|----------|
| `deberiaCrrarUsuarioJugadorConPasswordPorDefecto` | Happy path | Password `"123456"` cuando el campo viene `null` |
| `deberiaCrrarEntrenadorYRegistrarloEnTablaEntrenador` | Happy path | Creación en cascada: `Usuario` + `Entrenador` |
| `deberiaLanzarExcepcionSiEmailYaExiste` | Error path | Duplicidad de email bloqueada antes de encodear |
| `deberiaEliminarPrefixoROLE_AlNormalizarRol` | Regla de negocio | `"ROLE_ENTRENADOR"` → `"ENTRENADOR"` |
| `deberiaActualizarCamposDelUsuario` | Happy path | Campos del payload aplicados correctamente |
| `deberiaLanzarExcepcionAlActualizarInexistente` | Error path | `RuntimeException` con mensaje claro |
| `deberiaEliminarJugadorYSusAlineacionesOrdenado` | Orden crítico | `deleteByJugador` → `delete(jugador)` → `deleteById(usuario)` |
| `deberiaLanzarExcepcionAlEliminarInexistente` | Error path | Guard antes de intentar el delete |
| `deberiaCerrarActaYActualizarEstadoPartido` | Happy path | Estado `"FINALIZADO"`, goles registrados |
| `deberiaCerrarActaActualizandoEstadisticasJugador` | Happy path | Goles/asistencias/minutos aplicados a la `Alineacion` |
| `deberiaIgnorarJugadorInexistenteEnEstadisticas` | Edge case | `continue` silencioso, no explota |
| `deberiaFiltrarAdminsDeListaDeUsuariosActivos` | Regla de negocio | ADMINs excluidos del listado |
| `deberiaRetornarListaVaciaSiTodosAdmin` | Edge case | Lista `[]`, nunca `null` |

#### `AlineacionService` — 11 tests

Valida la gestión táctica: guardar alineaciones, cerrar actas y mapeo a DTOs.

| Test | Tipo | Verifica |
|------|------|----------|
| `deberiaRetornarDtosConDatosDelJugador` | Happy path | Mapeo completo `Alineacion → AlineacionResponseDto` |
| `deberiaRetornarListaVaciaSinAlineacion` | Edge case | Partido sin alineación → `[]`, no `null` |
| `deberiaGuardarJugadorComoTitular` | Regla de negocio | Slot no-BENCH → `esTitular = true` |
| `deberiaGuardarJugadorComoSuplente` | Regla de negocio | Slot `BENCH_*` → `esTitular = false` |
| `deberiaOmitirFichasConIdJugadorNulo` | Edge case | `idJugador = null` → se ignora silenciosamente |
| `deberiaEliminarAlineacionPreviaAntesDeSalvar` | Orden crítico | `delete → flush → save` verificado con `InOrder` |
| `deberiaEliminarExistentesYNoGuardarSiFichasNull` | Edge case | `null` fichas → borra pero no guarda |
| `deberiaCerrarActaYMarcarFinalizado` | Happy path | Partido → `"FINALIZADO"`, marcador correcto |
| `deberiaCerrarActaActualizandoEstadisticasExistentes` | Happy path | Stats aplicadas a `Alineacion` existente |
| `deberiaCerrarActaCreandoNuevaSiNoExistia` | Edge case | Jugador sin ficha → crea con `slotId = "BENCH_{id}"` |
| `deberiaManejarValoresNulosEnEstadisticas` | Edge case | `safeInt(null)` → `0`, sin `NullPointerException` |

### 2.4 Ejecución

```bash
cd src/backend-tfg/backend-tfg

# Todos los tests unitarios (patrón del CI)
./mvnw test \
  --no-transfer-progress \
  -Dtest='!BackendTfgApplicationTests' \
  -Dsurefire.failIfNoSpecifiedTests=false

# Output esperado
# Tests run: 29, Failures: 0, Errors: 0, Skipped: 0
# BUILD SUCCESS — Total time: ~11 s
```

---

## 3. Frontend Testing — Jasmine + Karma

### 3.1 Stack y Filosofía

El frontend (Angular 18 · Ionic 7 · TypeScript 5.5) implementa tests unitarios de la **capa de servicios**, que concentra toda la lógica de comunicación con el backend, gestión de estado y transformación de datos.

| Herramienta | Versión | Rol |
|-------------|---------|-----|
| Jasmine | ^5.1 | Framework de assertions y spies |
| Karma | ^6.4 | Runner de tests sobre Chrome Headless |
| `HttpClientTestingModule` | Angular 18 | Interceptación y verificación de peticiones HTTP |
| `jasmine.createSpyObj` | — | Mocking de servicios con dependencias complejas |

**Ventaja clave de `HttpClientTestingModule`:** Permite verificar no solo _qué_ URL se llama, sino _con qué método HTTP_, _qué body_ se envía y _qué headers_ se incluyen, sin levantar ningún servidor real. El `HttpTestingController.verify()` garantiza al final de cada test que no quedaron peticiones sin gestionar.

### 3.2 Patrón de Implementación

Para servicios que usan `HttpClient` directamente:

```typescript
describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],    // ① Reemplaza HttpClient real
      providers: [AdminService]
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());       // ② Sin peticiones pendientes

  it('debería hacer POST con el payload correcto', () => {
    service.createUser({ nombre: 'Ana', email: 'ana@test.com' }).subscribe();

    const req = httpMock.expectOne(`${BASE}/crear-usuario`);
    expect(req.request.method).toBe('POST');  // ③ Verifica método HTTP
    expect(req.request.body).toEqual(payload); // ④ Verifica body exacto
    req.flush(mockResponse);                   // ⑤ Simula respuesta del backend
  });
});
```

Para servicios con dependencias complejas (`AuthService`):

```typescript
beforeEach(() => {
  // SpyObj: tipo seguro, todos los métodos son spies configurables
  apiSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put']);
  storageSpy = jasmine.createSpyObj('StorageService', ['getToken', 'setToken', ...]);

  storageSpy.getToken.and.returnValue(null); // initializeAuth() → no intenta decodificar JWT

  TestBed.configureTestingModule({
    providers: [
      AuthService,
      { provide: ApiService,     useValue: apiSpy     },
      { provide: StorageService, useValue: storageSpy },
      { provide: Router,         useValue: routerSpy  }
    ]
  });
});
```

### 3.3 Cobertura por Servicio

#### `AuthService` — 13 tests

| Test | Verifica |
|------|----------|
| `isTokenExpired` × 3 | Token expirado, válido y malformado |
| `logout` × 3 | Limpieza de storage, `isAuthenticated$ → false`, `currentUser$ → null` |
| `hasRole` × 4 | Coincidencia por `roles[]`, por `rol` string, caso negativo, sin usuario |
| `getCurrentUser` × 3 | Normalización `"ROLE_JUGADOR" → "JUGADOR"`, `"admin" → "ADMIN"`, construcción de array `roles` |

#### `AdminService (frontend)` — 9 tests

| Endpoint | Método | Verifica |
|----------|--------|----------|
| `/admin/candidatos` | GET | Lista de candidatos |
| `/admin/crear-usuario` | POST | Payload y response correctos |
| `/admin/usuarios/{id}` | PUT | Payload de actualización |
| `/admin/usuario/{id}` | DELETE | URL con ID correcto |
| `/admin/equipos` | GET | Lista de equipos |
| `/admin/crear-partido` | POST | Datos del partido |
| `/admin/evento/{id}` | DELETE | Eliminación de evento |
| `/admin/asignar-equipo` | POST | Body `{ idUsuario, idEquipo }` |
| Error HTTP 500 | — | Propagación correcta del error |

#### `MatchService` — 11 tests

| Endpoint | Método | Verifica |
|----------|--------|----------|
| `/partidos/equipo/{teamId}` | GET | Lista de partidos con datos |
| `/partidos/{id}` | GET | Partido por ID, estado correcto |
| `/partidos` | GET | Sin filtros |
| `/partidos/equipo/{id}` | GET | Con filtro `teamId` |
| `/alineaciones/partido/{id}` | GET | Alineación completa, lista vacía |
| `/alineaciones/guardar/{id}` | POST | Header `Content-Type: application/json` |
| `/alineaciones/guardar/{id}` | POST | Body `estadisticas` del acta |
| `/admin/cerrar-acta` | POST | Acta completa con marcador |
| Error HTTP 404 | — | Propagación del error |

#### `ApiService` — 11 tests

| Test | Verifica |
|------|----------|
| `get` | URL correcta, construcción de query params |
| `get` con params `undefined` | Filtrado de params vacíos |
| `post` × 2 | Body correcto, body vacío sin errores |
| `put` | Body de actualización |
| `delete` | URL correcta |
| Error 401 en GET | `HttpErrorResponse` propagado con `status` |
| Error 400 en POST | `HttpErrorResponse` propagado con `status` |

### 3.4 Ejecución

```bash
cd frontend

# Modo interactivo (con watcher)
npm test

# Modo headless — idéntico al CI de GitHub
npm test -- --watch=false --browsers=ChromeHeadless --no-progress

# Output esperado
# Chrome Headless: Executed 44 of 44 SUCCESS
# TOTAL: 44 SUCCESS
```

---

## 4. Pruebas E2E — Cypress

### 4.1 Stack y Filosofía

Las pruebas E2E con **Cypress 15** verifican el sistema desde la perspectiva del usuario final, renderizando la aplicación Angular real en un navegador Chrome y simulando interacciones humanas. Este nivel de la pirámide detecta regresiones que los tests unitarios no pueden: routing, guards de autenticación, renderizado de componentes Ionic y flujo de navegación.

| Herramienta | Versión | Rol |
|-------------|---------|-----|
| Cypress | ^15.13 | Runner E2E + assertions sobre el DOM |
| Chrome Headless | 147+ | Navegador de ejecución |
| `cy.intercept()` | — | Mock de todas las llamadas HTTP a la API |

**Estrategia de mocking:** Los tests E2E utilizan `cy.intercept()` para interceptar cada llamada REST y devolver fixtures predefinidos. Esto elimina la dependencia del backend en la suite de tests, garantizando ejecuciones deterministas y rápidas. La app Angular funciona con datos controlados mientras Cypress valida el flujo completo de UI.

### 4.2 Selectores Robustos con `data-test`

La fragilidad más común en tests E2E es la dependencia de selectores CSS volátiles (clases de utilidad, estructura DOM). DAM United FC adopta el estándar de la industria: atributos `data-test` añadidos directamente a los elementos interactivos clave.

```html
<!-- login.page.html -->
<input type="email" data-test="input-email" ...>
<input type="password" data-test="input-password" ...>
<button type="submit" data-test="btn-submit" ...>

<!-- coach-dashboard.page.html -->
<div class="action-card" data-test="card-proximos-partidos" ...>
<div class="event-card"  data-test="event-card" ...>
<ion-button data-test="btn-ver-acta" ...>
<ion-button data-test="btn-laboratorio" ...>

<!-- match-detail.page.html -->
<div class="scoreboard-card" data-test="scoreboard" ...>

<!-- tactics-pro.page.html -->
<div class="pitch-board"     data-test="pitch-board" ...>
<div class="phase-indicator" data-test="phase-indicator" ...>
```

**Ventaja:** Un cambio en el diseño visual (renombrar una clase CSS, reestructurar el HTML) no rompe los tests. El selector `[data-test="btn-ver-acta"]` es inmune a cualquier refactor de estilos.

### 4.3 Arquitectura de Comandos Personalizados

```typescript
// cypress/support/commands.ts

cy.interceptApiFlow()   // Monta todos los cy.intercept() necesarios
cy.loginAsCoach()       // Login completo + redirección verificada al dashboard
```

```typescript
// Uso en los specs — semántico y DRY
beforeEach(() => {
  cy.loginAsCoach();         // Una línea, flujo completo encapsulado
  cy.wait('@dashboard');
});
```

### 4.4 Flujo Crítico — 20 Tests en 6 Suites

El spec `flujo-critico.cy.ts` cubre el camino de mayor valor de negocio:

```
  Login ──→ Dashboard ──→ Lista de Partidos ──→ Acta del Partido ──→ Laboratorio Táctico
    ↓            ↓               ↓                     ↓                      ↓
  [4 tests]  [3 tests]       [3 tests]             [5 tests]             [4 tests]
                                                                    + Smoke test [1]
```

#### Suite 1 — Página de Login (4 tests)

| Test | Verifica |
|------|----------|
| Formulario visible | Inputs y botón de submit presentes en el DOM |
| Botón deshabilitado (vacío) | Guard de validación de Angular Reactive Forms |
| Botón deshabilitado (email inválido) | Validación `email` de Angular activa |
| Redirección tras login | URL cambia a `/coach-dashboard` tras POST exitoso |

#### Suite 2 — Dashboard del Entrenador (3 tests)

| Test | Verifica |
|------|----------|
| Nombre del equipo | `"FC Prueba"` visible tras carga del dashboard |
| Panel de Gestión | Sección de accesos rápidos presente |
| Card Agenda Completa | Primer acceso rápido renderizado |

#### Suite 3 — Vista de Partidos (3 tests)

| Test | Verifica |
|------|----------|
| Cambio de vista | Click en card → sección `"Encuentros"` visible |
| Partido en lista | `"FC Rival"` renderizado en la lista de eventos |
| Tres botones de acción | Pizarra, Acta y Laboratorio visibles por partido |

#### Suite 4 — Acta del Partido (5 tests)

| Test | Verifica |
|------|----------|
| URL correcta | Navega a `/match-detail/1` |
| Scoreboard visible | Card con marcador presente en el DOM |
| Nombre del rival | `"FC Rival"` en la pantalla de detalle |
| Título de página | `ion-title` contiene `"Acta del Partido"` |
| Estado del partido | `"PENDIENTE"` visible en la interfaz |

#### Suite 5 — Laboratorio Táctico Pro (4 tests)

| Test | Verifica |
|------|----------|
| URL correcta | Navega a `/tactics-pro/1` |
| Campo de fútbol | `[data-test="pitch-board"]` renderizado |
| Indicador de fase | `[data-test="phase-indicator"]` visible |
| Fase por defecto | Contiene texto `"ATAQUE"` al cargar |

#### Suite 6 — Smoke Test Completo (1 test)

Un único `it()` que recorre todo el flujo de extremo a extremo sin interrupciones, verificando que ninguna transición intermedia bloquea al usuario.

### 4.5 Manejo de WebSocket en Tests

El chat utiliza STOMP sobre SockJS (WebSocket). Cypress no intercepta WebSockets nativamente. La solución adoptada es un handler en `e2e.ts` que silencia los errores de conexión sin afectar el resto de la suite:

```typescript
// cypress/support/e2e.ts
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('WebSocket') || err.message.includes('STOMP')) {
    return false; // No falla el test — la app degrada graciosamente
  }
  return true;    // Cualquier otro error sí es un fallo real
});
```

---

## 5. Integración Continua — GitHub Actions

### 5.1 Arquitectura de Pipelines

El repositorio cuenta con dos pipelines independientes que se activan automáticamente en cada `push` y `pull_request` a las ramas `main`, `preprod` y `develop`:

```
Push al repositorio
       │
       ├──→ [backend-ci.yml]  ─── Tests JUnit + Mockito ─── BUILD OK/FAIL
       │
       └──→ [frontend-ci.yml] ─── Lint → Tests Karma ─── Build Producción ─── BUILD OK/FAIL
```

### 5.2 Backend CI (`backend-ci.yml`)

```yaml
- name: Ejecutar tests unitarios
  run: |
    ./mvnw test \
      --no-transfer-progress \
      -Dtest='!BackendTfgApplicationTests' \       # Excluye test de contexto Spring
      -Dsurefire.failIfNoSpecifiedTests=false
```

**Comportamiento:**
- Se ejecuta únicamente cuando cambian archivos en `src/backend-tfg/**`
- Utiliza JDK 21 (Temurin) con caché de Maven
- Publica los reportes Surefire como artefactos descargables
- Un fallo en cualquier test bloquea el merge del PR

### 5.3 Frontend CI (`frontend-ci.yml`)

```yaml
- name: Lint (ESLint + Angular ESLint)
  run: npm run lint

- name: Tests unitarios (Karma + ChromeHeadless)
  run: npm test -- --watch=false --browsers=ChromeHeadless --no-progress

- name: Build de producción
  run: npm run build -- --configuration production
```

**Comportamiento:**
- Se ejecuta únicamente cuando cambian archivos en `frontend/**`
- El paso de **tests unitarios** es bloqueante: si falla, el build de producción no se ejecuta
- El orden garantiza que nunca se despliega código que no pasa el control de calidad
- Cypress **no está incluido** en este pipeline (requiere app en ejecución; se ejecuta manualmente para demos)

### 5.4 Garantías del Sistema de CI

| Garantía | Mecanismo |
|----------|-----------|
| Ningún commit roto llega a `main` | Ambos pipelines deben pasar en PR |
| El CI no requiere base de datos | Mockito puro + exclusión de `BackendTfgApplicationTests` |
| El CI no requiere servidor de display | `--browsers=ChromeHeadless` en Karma |
| Los specs no contaminan el build de producción | `tsconfig.app.json` excluye `*.spec.ts` |

---

## 6. Manual de Ejecución

### 6.1 Comandos por Capa

| Capa | Comando | Directorio | Tiempo esperado |
|------|---------|------------|-----------------|
| **Backend — todos los tests** | `./mvnw test -Dtest='!BackendTfgApplicationTests'` | `src/backend-tfg/backend-tfg/` | ~11 s |
| **Backend — un test específico** | `./mvnw test -Dtest=AdminServiceTest` | `src/backend-tfg/backend-tfg/` | ~5 s |
| **Frontend — modo watcher** | `npm test` | `frontend/` | continuo |
| **Frontend — modo headless** | `npm test -- --watch=false --browsers=ChromeHeadless` | `frontend/` | ~2 s |
| **E2E — GUI interactiva** | `npm run e2e` | `frontend/` | manual |
| **E2E — modo headless** | `npm run e2e:headless` | `frontend/` | ~2–5 min |

### 6.2 Instrucciones para la Demo en Vivo (Tribunal)

Para una demostración completa del sistema de testing ante el tribunal, seguir este orden:

#### Paso 1 — Demostrar Tests Unitarios del Backend

```bash
cd src/backend-tfg/backend-tfg

./mvnw test \
  --no-transfer-progress \
  -Dtest='!BackendTfgApplicationTests' \
  -Dsurefire.failIfNoSpecifiedTests=false
```

Resultado esperado en consola:
```
Tests run: 29, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS — Total time: 11.368 s
```

#### Paso 2 — Demostrar Tests Unitarios del Frontend

```bash
cd frontend

npm test -- --watch=false --browsers=ChromeHeadless --no-progress
```

Resultado esperado en consola:
```
Chrome Headless: Executed 44 of 44 SUCCESS
TOTAL: 44 SUCCESS
```

#### Paso 3 — Demostrar el Flujo E2E con Cypress (GUI)

```bash
# Terminal 1: levantar la aplicación Angular
cd frontend
npm start
# Esperar: "Application bundle generation complete."

# Terminal 2: abrir Cypress en modo interactivo
cd frontend
npm run e2e
```

En la ventana de Cypress:
1. Seleccionar **E2E Testing**
2. Elegir navegador **Chrome**
3. Hacer click en `flujo-critico.cy.ts`
4. Observar la ejecución visual del flujo completo

### 6.3 Verificación del Estado de CI en GitHub

Los badges de estado de cada pipeline son visibles en el repositorio. Para consultar el historial de ejecuciones:

```bash
# Ver estado del último run (requiere GitHub CLI)
gh run list --workflow=backend-ci.yml  --limit 5
gh run list --workflow=frontend-ci.yml --limit 5
```

---

## Apéndice — Estructura de Archivos de Testing

```
TFG-SergioEstudillo/
│
├── src/backend-tfg/backend-tfg/
│   └── src/test/java/com/DAMUnitedFC/backend_tfg/service/
│       ├── PublicServiceTest.java      ←  5 tests
│       ├── AdminServiceTest.java       ← 13 tests
│       └── AlineacionServiceTest.java  ← 11 tests
│
├── frontend/
│   ├── karma.conf.js                   ← Config del runner Karma
│   ├── tsconfig.spec.json              ← TS config para tests unitarios
│   │
│   ├── src/
│   │   ├── test.ts                     ← Entry point de Karma
│   │   └── app/core/services/
│   │       ├── auth/auth.service.spec.ts       ← 13 tests
│   │       ├── admin/admin.service.spec.ts     ←  9 tests
│   │       ├── match/match.service.spec.ts     ← 11 tests
│   │       └── api/api.service.spec.ts         ← 11 tests
│   │
│   ├── cypress/
│   │   ├── tsconfig.json               ← TS config para Cypress
│   │   ├── e2e/
│   │   │   └── flujo-critico.cy.ts     ← 20 tests E2E
│   │   └── support/
│   │       ├── e2e.ts                  ← Setup global
│   │       └── commands.ts             ← Comandos personalizados
│   │
│   └── cypress.config.ts               ← Config Cypress (baseUrl, viewport)
│
└── .github/workflows/
    ├── backend-ci.yml                  ← Pipeline JUnit (29 tests)
    └── frontend-ci.yml                 ← Pipeline Karma + build (44 tests)
```

---

*Documento generado como parte del Trabajo de Fin de Grado — DAM United FC · Ciclo Superior de Desarrollo de Aplicaciones Multiplataforma · 2026*
