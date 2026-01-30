export const environment = {
  production: true,
  apiUrl: 'https://backend-tfg-sergio.onrender.com/api', 
  appName: 'Club de Fútbol Pro',
  version: '1.0.0',
  defaultLocale: 'es-ES',
  enableDebug: false,
  jwtConfig: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpirationOffset: 300
  }
};