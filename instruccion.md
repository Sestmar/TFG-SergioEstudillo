Listo. Los 3 archivos tocados:

  - application.properties — 2 propiedades nuevas con fallback a las URLs
  de producción actuales
  - AdminService.java — campo backendUrl inyectado por constructor, URL
  reemplazada en línea 277
  - UsuarioController.java — campo frontendUrl inyectado por constructor,
  URL reemplazada en línea 90

  Probalo con ./mvnw spring-boot:run y confirmame que arranca sin errores.
   Si no tenés las variables de entorno APP_BACKEND_URL/APP_FRONTEND_URL
  seteadas localmente, usa directamente los fallbacks del .properties, así
   que no debería romperse nada.