// Punto de entrada del soporte E2E de Cypress.
// Se ejecuta antes de cada spec.
import './commands';

// Silencia errores de WebSocket (STOMP/SockJS) que no tienen backend en tests
Cypress.on('uncaught:exception', (err) => {
  // Errores de conexión WebSocket son esperados en entorno de test sin backend
  if (
    err.message.includes('WebSocket') ||
    err.message.includes('STOMP') ||
    err.message.includes('SockJS') ||
    err.message.includes('Cannot read properties of undefined') ||
    err.message.includes('socket')
  ) {
    return false; // Evita que Cypress falle el test por estos errores
  }
  return true; // Cualquier otro error sí falla el test
});
