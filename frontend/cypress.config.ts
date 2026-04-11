import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // URL base de la app Angular en dev
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',

    // Viewport similar a tablet/móvil (Ionic es mobile-first)
    viewportWidth: 430,
    viewportHeight: 932,

    // Sin video para mantenerlo ligero; screenshot solo en fallos
    video: false,
    screenshotOnRunFailure: true,

    // Timeouts razonables para una SPA con lazy-loading
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    pageLoadTimeout: 30000,

    setupNodeEvents(_on, _config) {
      // Espacio para plugins de Node (cobertura, tareas, etc.)
    },
  },
});
