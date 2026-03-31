Claude, he revisado los logs del backend al intentar enviar un mensaje desde Angular y salta esta excepción exacta:

`org.springframework.messaging.converter.MessageConversionException: Could not read JSON: Cannot construct instance of org.springframework.security.core.userdetails.UserDetails (no Creators, like default constructor, exist)`

El problema radica en la firma del método en el `ChatController` (el que tiene `@MessageMapping("/chat.enviar")`). Estás intentando inyectar o deserializar `UserDetails`, lo cual falla en WebSockets porque Jackson intenta mapear el payload JSON a esta interfaz.

Por favor, refactoriza el `ChatController` (y el `ChatService` si es necesario) aplicando esto:
1. Cambia el parámetro del usuario en el método `@MessageMapping` para usar `java.security.Principal principal` (o `Authentication`) en lugar de `UserDetails`.
2. Obtén el email (o username) del usuario que envía el mensaje llamando a `principal.getName()`.
3. Usa ese email para buscar al `Usuario` en la base de datos y establecerlo como el 'remitente' del mensaje.
4. Asegúrate de que `EnviarMensajeDto` contenga solo tipos de datos simples (String contenido, Integer idEquipo, etc.) y no entidades de Spring Security.

Dame el código corregido de esos archivos para solucionar la excepción.