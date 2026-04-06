FASE 1 COMPLETA. Acá va el resumen de todo lo que se hizo en la 1.3:

  Angular Update

  - Angular 17.3.12 → 18.2.14 (cierra CVEs de XSS en SVG, i18n,
  atributos)
  - TypeScript 5.2 → 5.5.4
  - Angular CDK 17.3.10 → 18.2.14
  - Ionic 7 se mantuvo (compatible con Angular 18, peerDependencies:
  @angular/core >=14.0.0)
  - Migraciones automáticas aplicadas (HTTP interceptor y
  app.module.ts actualizados)

  Guardias de Ruta

  ┌────────────────────────────────────────┬──────────────────────┐
  │                  Ruta                  │        Guards        │
  ├────────────────────────────────────────┼──────────────────────┤
  │ landing, auth                          │ Público              │
  ├────────────────────────────────────────┼──────────────────────┤
  │ user-dashboard, player-dashboard,      │ AuthGuard            │
  │ profile, match-detail, club, calendar  │                      │
  ├────────────────────────────────────────┼──────────────────────┤
  │ coach-dashboard, coach/*,              │ AuthGuard +          │
  │ convocations/*, tactics/*,             │ RoleGuard → ADMIN,   │
  │ edit-match/*, training-attendance      │ ENTRENADOR           │
  ├────────────────────────────────────────┼──────────────────────┤
  │ admin, team-detail                     │ AuthGuard +          │
  │                                        │ RoleGuard → ADMIN    │
  ├────────────────────────────────────────┼──────────────────────┤
  │                                        │ AuthGuard +          │
  │ chat                                   │ NoAdminGuard (ya     │
  │                                        │ existía)             │
  └────────────────────────────────────────┴──────────────────────┘

  Bloqueo de UI

  - Player-dashboard: cambié los links a /coach/my-team por /club (el
  jugador no tiene por qué acceder a la gestión del entrenador)
  - Coach-dashboard: limpio, no tiene links a admin
  - User module: limpio, sin links a coach ni admin

  La Fase 1 (INCENDIOS) está terminada. ¿Seguimos con la Fase 2?