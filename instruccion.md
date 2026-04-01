¡Buenísima idea, loco! Es un detalle de UX que marca la diferencia. Como ya
  tenemos la base de los WebSockets y el ChatService, implementar esa
  "exclamación" (o badge) es totalmente viable.

  Para que esto funcione "de diez", hay que pensar en la Persistencia y el Estado
  Global. Te tiro el análisis de cómo se podría encarar:

  1. El "Escuchador Global" (Ya tenés la base)
  Para que el icono del chat se entere de que hay un mensaje nuevo, el ChatService
  (que es un Singleton) tiene que estar conectado al WebSocket siempre, no solo
  cuando entrás a la pantalla de chat.
   * Cómo funciona: Cuando llega un mensaje por el /topic/equipo/{id}, el servicio
     lo recibe.
   * La lógica: El servicio chequea: "¿Estoy parado en la ruta /chat?".
       * Si SÍ, no hace nada (el usuario ya lo está viendo).
       * Si NO, dispara una señal de "Tenés algo sin leer".

  2. Gestión del Estado (BehaviorSubject)
  En Angular, la mejor forma de comunicar esto a componentes que están "lejos"
  (como el menú lateral o el icono del chat) es un BehaviorSubject.
   * Podrías tener una variable reactiva tieneMensajesNuevos$ (un booleano).
   * Cualquier componente que tenga el icono del chat se "suscribe" a ese
     booleano. Si es true, mostrás la exclamación; si es false, la ocultás.

  3. El desafío de la Persistencia (Dos niveles)
  Acá es donde se separa un TFG normal de uno profesional:

   * Nivel A (Memoria - Volátil): Si el usuario refresca la página (F5), la
     exclamación desaparece porque el estado de Angular se reinicia. Es fácil de
     hacer pero "barato".
   * Nivel B (Base de Datos - Pro):
       * Backend: Necesitás guardar en la base de datos cuándo fue la última vez
         que el usuario leyó el chat (un last_read_at).
       * Lógica: Al cargar la app, el backend compara la fecha del último mensaje
         del equipo con tu last_read_at. Si hay mensajes posteriores, el backend
         le dice al front: "Che, mandale la exclamación que tiene cosas
         pendientes".

  4. La Visual (UI)
  En Ionic/Angular, esto es muy sencillo de representar:
   * Un ion-badge pequeñito con un color llamativo (como un naranja o el lila que
     venís usando) encima del icono.
   * O simplemente un punto brillante (estilo "punto de notificación") que
     aparezca mediante un *ngIf.

  5. ¿Cuándo se quita la exclamación?
  Esto es clave para que no sea molesto:
   * En el momento en que el usuario entra a la ruta /chat, el componente debe
     llamar a una función marcarComoLeido().
   * Esa función pone el BehaviorSubject en false y (si elegís el Nivel B) le
     avisa al backend para que actualice la fecha de lectura.

  Conclusión:
  Como ya tenés el Global Listener y el ChatService (según tu archivo de mejoras),
  el "caño" por donde viaja la información ya está construido. Solo te falta poner
  el "tanque" (el estado global) y la "canilla" (el icono con la exclamación) para
  que el usuario lo vea.

  ¿Se entiende la lógica detrás del flujo, hermano? Es básicamente mover un
  booleano por toda la app de forma reactiva.