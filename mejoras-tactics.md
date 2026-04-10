  Para que un entrenador sienta que tiene el mando total y la
  experiencia sea TOP, te tiro 4 ideas de "Pizarra 2.0" que son
  realizables con lo que ya tenés:

  ---

  1. 🖊️ Capa de Anotaciones (Dibujo Táctico)
  Esto es lo que separa a una app de gestión de una pizarra de
  verdad. Poder dibujar flechas de desmarque, líneas de pase o zonas
  de presión.
   - Idea: Añadir un botón "Modo Dibujo" que habilite un Canvas
     invisible sobre el campo.
   - Técnica: Usar una librería liviana de dibujo o simplemente un
     SVG que capture trazos de ratón/dedo.
   - Impacto: El entrenador puede explicarle al jugador: "Mirá,
     quiero que el lateral doble por acá cuando el extremo cierre".

     Viabilidad: ALTA. Es 100% frontend, cero cambios en backend.

  La técnica es un <canvas> con position: absolute encima del campo,
  transparente por defecto. Un botón "Modo Dibujo" lo activa (deshabilita
  el drag-drop temporalmente) y capturás eventos
  pointerdown/pointermove/pointerup para trazar líneas o flechas. El único
   "truco" es el z-index: cuando está en modo dibujo el canvas está
  arriba, cuando está en modo alineación está debajo.

  No necesitás ninguna librería externa — con Canvas API nativo alcanza
  para flechas y trazos libres. Tampoco necesitás persistirlo en backend
  para el TFG (podés limpiar el canvas al salir).

  2. 🛡️ Análisis del Rival (Shadow Players)
  En una pizarra real, el entrenador también mueve al rival.
   - Idea: Un toggle para "Mostrar Rival". Aparecen 11 círculos
     rojos (genéricos o con nombres del rival si los cargaste) que
     el entrenador puede mover para ensayar cómo romper el bloque
     bajo o cómo defender las contras.
   - Técnica: Duplicar la lógica de drag & drop pero para una lista
     de "Pins de Oposición".
   - Impacto: Permite planificar el partido de forma reactiva al
     rival, no solo centrada en lo propio.

     Viabilidad: ALTA. También casi puro frontend.

  Agregás un array rivalSlots: { id: string, x: number, y: number, label:
  string }[] de 11 jugadores genéricos con posiciones absolutas en el
  campo. Un toggle "Mostrar Rival" los renderiza. Los hacés draggables con
   CDK también, pero en su propio cdkDropListGroup para que no interactúen
   con tu alineación. No necesitan llegar al backend — son efímeros, solo
  para planificación táctica visual.

  El backend no toca nada. Si quisieras persistirlos, sería añadir un
  campo en el JSON del lineup, pero no es necesario para el TFG.


  3. 🔄 Estados Transicionales (Fase Ofensiva vs Defensiva)
  El fútbol moderno es transición. Una formación 4-3-3 en defensa
  suele ser un 3-4-3 en ataque.
   - Idea: Botones "Fase Ataque" / "Fase Defensa". El entrenador
     puede guardar dos posiciones distintas para el mismo jugador.
     Al pulsar el botón, los círculos de los jugadores se deslizan
     (animación CSS transition) a su nueva posición.
   - Técnica: Guardar dos sets de coordenadas (x, y) por jugador en
     el JSON de la formación.
   - Impacto: Esto es Ingeniería Táctica pura. Demostrás un nivel de
     conocimiento futbolístico y técnico altísimo para el TFG.

  ---

  ¿Por cuál empezamos?
  Mi recomendación para el TFG es la Nº 4 (Estados Transicionales).
  Es visualmente impactante (ver los jugadores moverse solos de
  ataque a defensa es una locura) y técnicamente demuestra que
  manejás estados complejos en Angular.

  O, si querés algo más "clásico", la Nº 1 (Anotaciones) es la que
  más utilidad real le daría a un entrenador de verdad.

  ¿Qué te parece? Si querés, investigo cómo tenés hecha la pizarra
  ahora (busco el componente) y vemos qué tan difícil es meterle
  alguna de estas. ¡Decime!


  La clave que hay que entender

  La tabla alineacion en BD tiene dos responsabilidades mezcladas: es la
  formación táctica Y la fuente de datos del acta (goles, tarjetas,
  minutos, sustituciones). Eso es lo que hay que respetar.

  ---
  Viabilidad de cada punto

  Punto 1 — Anotaciones (canvas)

  Viable, 100% frontend, cero riesgo. Un <canvas> absoluto encima del
  campo. No toca nada del backend, no toca el acta, no toca la alineación
  guardada. Es completamente independiente.

  Punto 2 — Shadow Players (rival)

  Viable, 100% frontend, cero riesgo. 11 círculos rojos draggables en su
  propio layer. Ni siquiera necesita backend — son efímeros, solo para
  planificación visual. No interactúan con alineacion en ningún momento.

  Punto 4 — Fases táctica (ataque/defensa)

  Viable, pero requiere una tabla nueva en backend. Y acá está el punto
  importante:

  NO se puede meter en Alineacion, porque esa tabla la lee el acta. Si le
  añadís campos de "posición en ataque" y "posición en defensa",
  contaminas el modelo que tiene responsabilidad funcional.

  La solución limpia es una tabla separada tactica_fase:

  tactica_fase
  ├── id
  ├── id_partido (FK → partido)
  ├── id_jugador (FK → jugador)
  ├── slot_ataque   → "FWD-2", "MID-1", etc.
  └── slot_defensa  → "DEF-3", "MID-2", etc.

  El endpoint sería independiente (/api/tactica-fase/{matchId}), el
  frontend lo consume solo desde la página de /tactics, y el acta no sabe
  que existe. Cero acoplamiento.

  ---
  Recomendación para el TFG

  Los tres juntos son realizables. El orden de impacto visual de mayor a
  menor:

  1. Punto 4 — ver los jugadores animarse de una formación a otra con CSS
  transition es lo más impresionante para una demo
  2. Punto 1 — dibujar flechas sobre tu propia alineación es lo más útil
  en la práctica real
  3. Punto 2 — los shadow players complementan al punto 4 (poner al rival
  y ver cómo tu equipo transiciona contra ellos)

  Por qué no vas a romper nada

  El sistema actual tiene un flujo muy claro:

  /tactics/:matchId
      → guarda en POST /api/alineaciones
          → el admin lee eso en el acta
              → cierra acta con goles, tarjetas, etc.

  Todo lo que propone Gemini vive en una rama completamente separada de
  ese flujo. Nunca toca /api/alineaciones. El acta no sabe que existe.

  ---
  Qué es seguro y qué no

  100% seguro — cero riesgo:
  - Crear TacticsProPage como página nueva con su propia ruta
  tactics-pro/:id
  - Añadir el botón en el dashboard del entrenador
  - Features 1 (canvas) y 2 (shadow players) — son puramente visuales, no
  llaman a ningún endpoint

  Requiere cuidado — nueva tabla en BD:
  - Feature 4 (fases ataque/defensa) necesita su propio endpoint POST
  /api/tactica-fase y su propia tabla. Mientras no uses el mismo endpoint
  que el acta, no hay riesgo.

  ---
  La única decisión que tenés que tomar antes de arrancar

  ¿La TacticsProPage carga la alineación oficial como punto de partida
  (solo lectura), o empieza desde cero con el campo vacío?

  Tiene sentido cargarla como base — el entrenador ya tiene su 4-3-3
  guardado y quiere explicar qué hace cada jugador en fase defensiva. Pero
   eso implica hacer un GET /api/alineaciones/:matchId (solo lectura, sin
  escribir nada). Eso es completamente seguro.

  Decidí eso y arrancamos. Yo me encargo de que en ningún momento la
  página Pro llame al saveLineup.