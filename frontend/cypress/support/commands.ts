// Comandos personalizados de Cypress para DAM United FC.
// Agregan semántica de dominio a los tests E2E.

// JWT falso con exp en el año 2286 — no expirará en ninguna demo
// Payload: { "sub": "coach@dam.com", "exp": 9999999999, "iat": 1700000000 }
const FAKE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiJjb2FjaEBkYW0uY29tIiwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjE3MDAwMDAwMDB9' +
  '.cypress-fake-signature';

// ─── Fixtures reutilizables ───────────────────────────────────────────────────

const ME_RESPONSE = {
  idUsuario: 1,
  nombre: 'Juan',
  apellidos: 'Técnico',
  email: 'coach@dam.com',
  rol: 'ENTRENADOR',
  roles: ['ENTRENADOR'],
  fotoUrl: null
};

const DASHBOARD_RESPONSE = {
  equipo: {
    idEquipo: 10,
    nombre: 'FC Prueba',
    categoria: 'División 1',
    fotoUrl: null
  },
  rol: 'Entrenador Principal',
  entrenadorId: 5
};

const PARTIDOS_RESPONSE = [
  {
    idPartido: 1,
    rival: 'FC Rival',
    lugar: 'Campo Norte',
    fechaHora: '2027-06-01T18:00:00',
    tipo: 'PARTIDO',
    estado: 'PENDIENTE',
    golesFavor: 0,
    golesContra: 0,
    escudoRivalUrl: 'assets/img/mi-club-logo.png'
  }
];

const MATCH_DETAIL_RESPONSE = {
  idPartido: 1,
  rival: 'FC Rival',
  lugar: 'Campo Norte',
  fechaHora: '2027-06-01T18:00:00',
  tipo: 'PARTIDO',
  estado: 'PENDIENTE',
  golesFavor: 0,
  golesContra: 0,
  escudoRivalUrl: 'assets/img/mi-club-logo.png'
};

// ─── Comando: interceptar todas las APIs del flujo completo ──────────────────

Cypress.Commands.add('interceptApiFlow', () => {
  // Auth
  cy.intercept('POST', '**/auth/login', { token: FAKE_JWT }).as('login');
  cy.intercept('GET', '**/auth/me', ME_RESPONSE).as('me');

  // Coach dashboard
  cy.intercept('GET', '**/entrenadores/usuario/1/equipo', DASHBOARD_RESPONSE).as('dashboard');

  // Matches y jugadores del equipo
  cy.intercept('GET', '**/partidos/equipo/10', PARTIDOS_RESPONSE).as('partidos');
  cy.intercept('GET', '**/jugadores**', []).as('jugadores');

  // Match detail y alineación
  cy.intercept('GET', '**/partidos/1', MATCH_DETAIL_RESPONSE).as('matchDetail');
  cy.intercept('GET', '**/alineaciones/partido/1', []).as('alineacion');

  // Stats entrenador (puede ser llamada secundaria)
  cy.intercept('GET', '**/entrenadores/**', {}).as('coachData');

  // Chat (no bloqueamos pero evitamos errores 404)
  cy.intercept('GET', '**/mensajes/**', []).as('mensajes');
});

// ─── Comando: login completo como entrenador ─────────────────────────────────

Cypress.Commands.add('loginAsCoach', () => {
  cy.interceptApiFlow();

  cy.visit('/auth/login');

  cy.get('[data-test="input-email"]').type('coach@dam.com');
  cy.get('[data-test="input-password"]').type('password123');
  cy.get('[data-test="btn-submit"]').click();

  cy.wait('@login');
  // Esperamos redirección al dashboard
  cy.url().should('include', '/coach-dashboard');
});

// ─── Declaración TypeScript de los comandos personalizados ──────────────────

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Monta todos los intercepts necesarios para el flujo crítico */
      interceptApiFlow(): Chainable<void>;
      /** Realiza login como entrenador usando credenciales mockeadas */
      loginAsCoach(): Chainable<void>;
    }
  }
}

export {};
