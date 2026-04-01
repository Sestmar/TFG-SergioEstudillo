3 agentes corriendo en paralelo:

  - Agente 1 — Role badges (player-dashboard + my-team)
  - Agente 2 — Profile sections (form-section headers)
  - Agente 3 — Night modal global class

  Una corrección que apliqué al plan de Gemini: los modales del proyecto son
  declarativos (<ion-modal> en HTML), no imperativos — así que aplico
  cssClass="night-modal" directamente en el template en vez de buscar
  modalController.create().

  Avisame cuando terminen y te doy el resumen completo de cambios.

✻ Churned for 3m 24s · 3 local agents still running

● Agent "Implementar secciones form-section en perfil" completed

● Perfil listo. Esperando los otros dos agentes...

● Agent "Implementar clase global night-modal" completed

● Night modal listo — 5 modales actualizados (2 en my-team, 3 en admin-dashboard).
  Esperando el agente de role badges...

● Agent "Implementar role badges colores" completed

● Las 3 tareas completadas. Resumen de todo lo hecho:

  ---
  Punto 3 — Pulido Estético UX — DONE ✓

  1. Role badges (player-dashboard + my-team)
  - player-dashboard: [ngClass] basado en isPlayerAvailable() — verde neón / rojo
  con iconos checkmark-circle / close-circle
  - my-team: los 5 status-dot (porteros, defensas, mediocentros, delanteros, sin
  posición) ahora son dinámicos con $any(p).estado → activo / lesionado / baja con
  glow neon

  2. Profile form sections
  - Inputs de "DATOS PERSONALES" reorganizados en dos form-section con cabeceras:
  "Información de Cuenta" (teléfono) y "Preferencias de Usuario" (dirección + foto
  URL)
  - .input-group margin reducido de 20px a 8px — vista más compacta
  - "FICHA DEPORTIVA" y badge "SOLO MÍSTER" intactos

  3. Night modal
  - Clase global .night-modal en global.scss — fondo #0a0e1a, border-radius 16px,
  borde violeta sutil
  - Aplicada a 5 modales: 2 en my-team (editar ficha + lesión), 3 en admin-dashboard
   (usuario + equipo + partido)
  - El picker interno de ion-datetime se dejó sin tocar — correcto

  ---
  Todo listo para commitear. El instruccion.md y futuras-mejoras.md los podés
  actualizar para marcar el punto 3 como completado cuando quieras.