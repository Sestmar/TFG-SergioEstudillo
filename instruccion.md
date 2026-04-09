Listo, hermano. 5 tests, 5 verdes, 0 riesgos.

  Resumen de lo que se hizo punto por punto:

  Paso 1 — Verificación — spring-boot-starter-test ya
  estaba en el pom.xml. Sin tocar nada.

  Paso 2 — Análisis del PublicService — el servicio tenía
  lógica de cálculo de goles/asistencias pero le faltaba
  un método que lanzara ResourceNotFoundException. Lo
  añadimos.

  Paso 3 — PublicService.getPublicPlayerById() — método
  nuevo que busca un jugador por ID, lanza
  ResourceNotFoundException si no existe, y mapea al DTO.
  Reutiliza la misma lógica de mapeo que getPublicRoster.

  Paso 4 — PublicServiceTest.java — 5 tests con patrón
  AAA:

  ┌──────────────────────────────┬────────────────────┐
  │             Test             │     Escenario      │
  ├──────────────────────────────┼────────────────────┤
  │ deberiaCalcularEstadisticas. │ 3 partidos →       │
  │ ..                           │ goles=3,           │
  │                              │ asistencias=3      │
  ├──────────────────────────────┼────────────────────┤
  │ deberiaRetornarCero...Campos │ null en            │
  │ Nulos                        │ goles/asistencias  │
  │                              │ → 0, sin NPE       │
  ├──────────────────────────────┼────────────────────┤
  │ deberiaRetornarCero...SinPar │ Lista de           │
  │ ticipaciones                 │ alineaciones vacía │
  │                              │  → 0               │
  ├──────────────────────────────┼────────────────────┤
  │                              │ Equipo sin         │
  │ deberiaRetornarListaVacia... │ jugadores → lista  │
  │                              │ vacía, no null     │
  ├──────────────────────────────┼────────────────────┤
  │                              │ ID inexistente →   │
  │ deberiaLanzarExcepcion...    │ ResourceNotFoundEx │
  │                              │ ception            │
  └──────────────────────────────┴────────────────────┘

  El comando para ejecutarlos: ./mvnw test
  -Dtest=PublicServiceTest