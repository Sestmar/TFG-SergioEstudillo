/**
 * FLUJO CRÍTICO E2E — DAM United FC
 * ═══════════════════════════════════════════════════════════════════
 *
 * Cubre el camino más importante de la app de principio a fin:
 *
 *  [1] Login
 *        ↓ credenciales válidas → token JWT guardado
 *  [2] Dashboard del Entrenador
 *        ↓ carga datos del equipo, nombre visible
 *  [3] Vista de Partidos (inline en el dashboard)
 *        ↓ click en "Próx. Partidos" → aparece la lista de encuentros
 *  [4] Acta del Partido (Match Detail)
 *        ↓ click en el botón "Ver Acta" → /match-detail/1
 *        ↓ marcador y nombre del rival visibles
 *  [5] Laboratorio Táctico Pro
 *        ↓ click en "Laboratorio" → /tactics-pro/1
 *        ↓ campo de fútbol y selector de fase visibles
 *
 * Estrategia de selectores (de más a menos preferido):
 *   1. data-test="..."    → inmune a cambios de clase y texto
 *   2. Texto semántico    → cy.contains('...') para etiquetas estables
 *   3. CSS class único    → solo si pertenece a este componente específico
 *
 * Todas las llamadas HTTP se interceptan con cy.intercept() — no se
 * necesita backend real. La app funciona con datos mockeados.
 * ═══════════════════════════════════════════════════════════════════
 */

describe('Flujo Crítico — DAM United FC', () => {

  // ─── PASO 1: Login ────────────────────────────────────────────────────────

  describe('1. Página de Login', () => {

    beforeEach(() => {
      cy.interceptApiFlow();
      cy.visit('/auth/login');
    });

    it('debería mostrar el formulario de acceso al estadio', () => {
      cy.get('[data-test="input-email"]').should('be.visible');
      cy.get('[data-test="input-password"]').should('be.visible');
      cy.get('[data-test="btn-submit"]').should('contain.text', 'INICIAR SESIÓN');
    });

    it('debería deshabilitar el botón si el formulario está vacío', () => {
      cy.get('[data-test="btn-submit"]').should('be.disabled');
    });

    it('debería deshabilitar el botón si el email es inválido', () => {
      cy.get('[data-test="input-email"]').type('esto-no-es-un-email');
      cy.get('[data-test="input-password"]').type('password123');
      cy.get('[data-test="btn-submit"]').should('be.disabled');
    });

    it('debería redirigir al coach-dashboard tras login exitoso', () => {
      cy.get('[data-test="input-email"]').type('coach@dam.com');
      cy.get('[data-test="input-password"]').type('password123');
      cy.get('[data-test="btn-submit"]').click();

      cy.wait('@login');
      cy.url().should('include', '/coach-dashboard');
    });

  });

  // ─── PASO 2: Dashboard del Entrenador ────────────────────────────────────

  describe('2. Dashboard del Entrenador', () => {

    beforeEach(() => {
      cy.loginAsCoach();
    });

    it('debería mostrar el nombre del equipo gestionado', () => {
      cy.wait('@dashboard');
      cy.contains('FC Prueba').should('be.visible');
    });

    it('debería mostrar la sección "Panel de Gestión"', () => {
      cy.contains('Panel de Gestión').should('be.visible');
    });

    it('debería mostrar el card de Agenda Completa', () => {
      cy.contains('Agenda Completa').should('be.visible');
    });

  });

  // ─── PASO 3: Vista de Partidos (inline) ──────────────────────────────────

  describe('3. Vista de Partidos — Próximos Encuentros', () => {

    beforeEach(() => {
      cy.loginAsCoach();
      cy.wait('@dashboard');
    });

    it('debería cambiar a la vista de partidos al hacer click en el card', () => {
      cy.get('[data-test="card-proximos-partidos"]').click();
      // La vista inline cambia — aparece la cabecera de la sección
      cy.contains('Encuentros').should('be.visible');
    });

    it('debería mostrar el partido FC Rival en la lista', () => {
      cy.get('[data-test="card-proximos-partidos"]').click();
      cy.wait('@partidos');
      cy.contains('FC Rival').should('be.visible');
    });

    it('debería mostrar los tres botones de acción por partido (pizarra, acta, laboratorio)', () => {
      cy.get('[data-test="card-proximos-partidos"]').click();
      cy.wait('@partidos');

      // Espera que aparezca la tarjeta del primer partido
      cy.get('[data-test="event-card"]').first().within(() => {
        cy.get('[data-test="btn-pizarra"]').should('be.visible');
        cy.get('[data-test="btn-ver-acta"]').should('be.visible');
        cy.get('[data-test="btn-laboratorio"]').should('be.visible');
      });
    });

  });

  // ─── PASO 4: Detalle del Partido (Acta) ──────────────────────────────────

  describe('4. Acta del Partido — Match Detail', () => {

    beforeEach(() => {
      cy.loginAsCoach();
      cy.wait('@dashboard');
      cy.get('[data-test="card-proximos-partidos"]').click();
      cy.wait('@partidos');
      cy.get('[data-test="btn-ver-acta"]').first().click();
    });

    it('debería navegar a /match-detail/1', () => {
      cy.url().should('include', '/match-detail/1');
    });

    it('debería mostrar el marcador del partido', () => {
      cy.wait('@matchDetail');
      cy.get('[data-test="scoreboard"]').should('be.visible');
    });

    it('debería mostrar el nombre del rival', () => {
      cy.wait('@matchDetail');
      cy.contains('FC Rival').should('be.visible');
    });

    it('debería mostrar el título "Acta del Partido"', () => {
      cy.get('ion-title').should('contain.text', 'Acta del Partido');
    });

    it('debería mostrar el estado del partido (PENDIENTE)', () => {
      cy.wait('@matchDetail');
      cy.contains('PENDIENTE').should('be.visible');
    });

  });

  // ─── PASO 5: Laboratorio Táctico Pro ─────────────────────────────────────

  describe('5. Laboratorio Táctico Pro — Tactics Pro', () => {

    beforeEach(() => {
      cy.loginAsCoach();
      cy.wait('@dashboard');
      cy.get('[data-test="card-proximos-partidos"]').click();
      cy.wait('@partidos');
      cy.get('[data-test="btn-laboratorio"]').first().click();
    });

    it('debería navegar a /tactics-pro/1', () => {
      cy.url().should('include', '/tactics-pro/1');
    });

    it('debería renderizar el campo de fútbol (pitch board)', () => {
      cy.get('[data-test="pitch-board"]').should('be.visible');
    });

    it('debería mostrar el indicador de fase táctica', () => {
      cy.get('[data-test="phase-indicator"]').should('be.visible');
    });

    it('debería mostrar la fase de ATAQUE por defecto', () => {
      cy.get('[data-test="phase-indicator"]').should('contain.text', 'ATAQUE');
    });

  });

  // ─── FLUJO COMPLETO (smoke test) ─────────────────────────────────────────

  describe('6. Flujo completo de extremo a extremo (smoke test)', () => {

    it('debería completar Login → Dashboard → Partido → Acta → Táctico sin errores', () => {
      // 1. Login
      cy.interceptApiFlow();
      cy.visit('/auth/login');
      cy.get('[data-test="input-email"]').type('coach@dam.com');
      cy.get('[data-test="input-password"]').type('password123');
      cy.get('[data-test="btn-submit"]').click();
      cy.wait('@login');
      cy.url().should('include', '/coach-dashboard');

      // 2. Dashboard cargado
      cy.wait('@dashboard');
      cy.contains('FC Prueba').should('be.visible');

      // 3. Abrir lista de partidos
      cy.get('[data-test="card-proximos-partidos"]').click();
      cy.wait('@partidos');
      cy.contains('FC Rival').should('be.visible');

      // 4. Ver acta del partido
      cy.get('[data-test="btn-ver-acta"]').first().click();
      cy.url().should('include', '/match-detail');
      cy.wait('@matchDetail');
      cy.get('[data-test="scoreboard"]').should('be.visible');

      // 5. Navegar al laboratorio táctico
      cy.go('back');
      cy.url().should('include', '/coach-dashboard');
      cy.get('[data-test="card-proximos-partidos"]').click();
      cy.get('[data-test="btn-laboratorio"]').first().click();
      cy.url().should('include', '/tactics-pro');
      cy.get('[data-test="pitch-board"]').should('be.visible');
    });

  });

});
