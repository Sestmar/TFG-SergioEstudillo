export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  appName: 'Club de Fútbol Pro',
  version: '1.0.0',
  defaultLocale: 'es-ES',
  enableDebug: true,
  jwtConfig: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpirationOffset: 300 // 5 minutos antes de expirar
  }
};