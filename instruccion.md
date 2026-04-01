## 3. Pulido Estético y UX (Pantallas Secundarias) 🎨

Mantener la consistencia del diseño "Night Stadium" en toda la app.

### Análisis del Terreno (Para Claude 🤖)
- **Ruta Listado Jugadores**: `frontend/src/app/modules/players/pages/player-dashboard/player-dashboard.page.html` (usa clase `role-badge`).
- **Ruta Perfil**: `frontend/src/app/modules/user/pages/profile/profile.page.html` (usa clases `dark-card` y `input-group`).
- **Ruta Modales**: Localizados en `frontend/src/app/shared/models/convocation-modal/`.
- **Estilos Globales**: `frontend/src/theme/variables.scss`.

### Plan de Acción Exacto
1.  **Listado de Jugadores (`my-team`)**:
    - Localizar la clase `.role-badge` en `player-dashboard.page.scss`.
    - Implementar lógica de colores en el HTML: `ACTIVO` (verde neón), `LESIONADO` (ámbar), `BAJA` (rojo peligro).
    - Añadir tooltips o iconos descriptivos junto al badge.
2.  **Formulario de Perfil**:
    - En `profile.page.html`, envolver los `input-group` en dos nuevos contenedores `<div class="form-section">` con títulos de cabecera: "Información de Cuenta" y "Preferencias de Usuario".
    - Ajustar el SCSS para reducir el padding vertical de los inputs y permitir una vista más compacta.
3.  **Consistencia de Modales**:
    - Crear una clase global `.night-modal` en `global.scss` que fuerce `background: #0a0e1a`, `border-radius: 16px` y `border: 1px solid rgba(108, 99, 255, 0.3)`.
    - Aplicar esta clase usando `cssClass: 'night-modal'` en todas las llamadas a `modalController.create()` encontradas en el análisis previo.