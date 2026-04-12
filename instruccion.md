La idea ahora es potenciar el player-dashboard ya que en comparacion al
 modulo de coach es un poco pobre. Mira en nuevas-mejoras.md el plan de
accion y antes de ponerte a ello, dime si es valido o sugieres hacer
alguna otra cosa. El centro analitico inteligente está integrado en
player-dashboard, pero más allá de eso, no puede ver el match-insights ni
 nada. Al igual que coach-dashboard tiene pizarra tactica, match-insights
 y demás, el jugador debe tener sus cositas tambien.

  Read 1 file (ctrl+o to expand)

● Déjame ver el player-dashboard actual antes de opinar.

  Searched for 1 pattern, read 1 file (ctrl+o to expand)

● Déjame ver el .ts para entender qué datos maneja, y qué rutas existen
  para el jugador:

  Searched for 1 pattern, read 1 file (ctrl+o to expand)

● Bien, tengo todo el contexto. Dejame verificar rápido qué rutas existen
  y si match-insights está protegida por rol:

  Searched for 2 patterns (ctrl+o to expand)

● Ahora sí tengo todo el contexto. Te doy mi análisis.

  ---
  El plan es sólido, pero le falta la pieza más importante

  Lo que propone nuevas-mejoras.md está bien — el Cromo FIFA, los KPI
  arriba, limpiar el scroll, el panel compacto abajo. Todo eso es
  correcto. Pero hay un dato crítico que el plan no explotó:

  match-insights ya está habilitada para JUGADOR en el routing:

  path: 'match-insights/:id',
  data: { roles: ['ADMIN', 'ENTRENADOR', 'JUGADOR'] }

  El jugador ya tiene acceso a esa página. El problema es que no hay
  ningún botón que lo lleve ahí. En la lista de eventos del coach, cada
  partido tiene tres botones (pizarra, acta, laboratorio). El jugador solo
   tiene un botón de "info" que muestra un alert o va a match-detail.

  Lo que le falta al plan: en la lista de eventos del jugador, cuando el
  evento es un PARTIDO, agregar el botón de match-insights — igual que el
  coach, pero sin pizarra táctica (eso es solo para entrenadores).

  ---
  Lo que yo haría, en orden:

  TAREA 1 — Cromo de Jugador ✅ del plan — ok tal cual
  TAREA 2 — KPIs arriba + subir gráficos ✅ del plan — ok
  TAREA 3 — Panel compacto abajo ✅ del plan — ok
  TAREA EXTRA — Botón match-insights en eventos de partido — esto es lo
  que hace que el jugador "tenga sus cositas", como vos dijiste

  ---
  Una sola advertencia técnica

  Los dos charts (apx-chart) del player-dashboard tienen el mismo
  potencial problema de timing que teníamos en match-insights ayer. Si el
  player-dashboard es la primera página que carga ApexCharts en la sesión
  del jugador, el radar puede aparecer en blanco.

  Propongo que el radar personal también lo migremos a SVG nativo (igual
  que hicimos ayer con match-insights), y el gráfico de evolución lo
  dejamos con ApexCharts porque es area chart y vale la pena. ¿Ese
  trade-off te parece bien o preferís dejar ambos en ApexCharts y asumir
  el riesgo?

  ---
  Resumen: ¿arrancamos con el plan tal cual + el botón de match-insights
  en la lista de eventos del jugador + migración del radar personal a SVG?

✻ Worked for 1m 5s

> no es que quiera hacer un panel abajo mas compacto, lo que quiero es
que al igual que el entrenador tiene el dashboard analitico y ademas el
centro analitico inteligente, en el jugador hacer algo similar pero mas
especifico para que el jugador pueda ver todas sus estadisticas ahí, por
partido, y etc. Respecto a la pregunta de SVG o apexChart prefiero hacer
el trade-off

● Bien, entiendo. Antes de proponer nada déjame revisar qué datos tiene
  disponibles el backend para el jugador, para saber qué podemos mostrar
  realmente:

  Searched for 2 patterns, read 1 file (ctrl+o to expand)

● Hay un endpoint que lo cambia todo. getPlayerHistory() → GET
  /jugadores/{id}/history ya devuelve:

  - Por partido: rival, fecha, goles, asistencias, minutoEntrada,
  minutoSalida, capitán, amarillas, rojas
  - Convocatorias históricas
  - Incidencias (lesiones)
  - Totales: partidos, minutos, goles, asistencias, tarjetas

  Eso es exactamente lo que necesitás. Ahora, la propuesta concreta:

  ---
  Lo que propongo (análogo al coach)

  Coach tiene:
  - coach-dashboard → hub principal
  - season-intelligence → Centro Analítico del equipo
  - match-insights → análisis por partido

  Jugador tendría:
  - player-dashboard → hub principal (refactorizado como dice el plan)
  - NUEVA página: player-performance → "Mi Centro de Rendimiento Personal"
  - match-insights (ya accesible) → análisis por partido con enlace desde
  sus eventos

  ---
  Qué muestra player-performance:

  Con los datos que ya existen en el backend:

  1. Hero card — dorsal, posición, estado, foto
  2. KPI row — Partidos / Goles / Asistencias / Minutos (los totales)
  3. Radar personal — el que ya existe en el dashboard pero elevado a
  protagonista
  4. Historial por partido — tabla/cards con cada partido: rival, fecha,
  goles, asistencias, minutos jugados, tarjetas. Con botón a
  match-insights de ese partido
  5. Disciplina — amarillas/rojas acumuladas con contexto visual

  ---
  ¿Qué pasa con el player-dashboard actual?

  El plan de nuevas-mejoras.md sigue siendo válido como refactor del hub,
  pero en lugar del "Centro de Rendimiento" embebido ahí, simplemente se
  agrega un acceso a player-performance en las acciones (igual que
  season-intelligence se accede desde el widget del coach).

  ---
  ¿Te parece ese enfoque, o preferís que sea una sección embebida dentro
  del player-dashboard en lugar de una página aparte?