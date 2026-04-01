Listo. Resumen completo:

  global.scss — clase .night-alert añadida (fondo dark, glassmorphism, borde neón,
  botones estilizados)

  8 alertas actualizadas con cssClass: 'night-alert':

  ┌──────────────────────────┬─────────────────────────────────────────────┐
  │         Archivo          │                   Alerta                    │
  ├──────────────────────────┼─────────────────────────────────────────────┤
  │ player-dashboard.page.ts │ 🔒 Cerrar Sesión + ⚽ Entrenamiento         │
  ├──────────────────────────┼─────────────────────────────────────────────┤
  │ coach-dashboard.page.ts  │ 🔒 Cerrar Sesión                            │
  ├──────────────────────────┼─────────────────────────────────────────────┤
  │ admin-dashboard.page.ts  │ 🔒 Cerrar Sesión + ⚠️ Confirmar Eliminación │
  ├──────────────────────────┼─────────────────────────────────────────────┤
  │ calendar.page.ts         │ 🗑️ ¿Borrar Evento?                          │
  ├──────────────────────────┼─────────────────────────────────────────────┤
  │ my-team.page.ts          │ 🏥 ¿Alta Médica?                            │
  ├──────────────────────────┼─────────────────────────────────────────────┤
  │ edit-match.page.ts       │ 📋 Cerrar Acta Oficial                      │
  └──────────────────────────┴─────────────────────────────────────────────┘

  notification.service.ts — showAlert, showConfirm y showPrompt ahora incluyen
  cssClass: 'night-alert' automáticamente.