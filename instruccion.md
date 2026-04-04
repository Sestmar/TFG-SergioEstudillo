lee instruccion.md para dejar sellado el apartado de chat

  Read 1 file (ctrl+o to expand)

● Bien, el cuello de botella es claro. El take(1) mata la suscripción y si el
  usuario se logea después del arranque, la conexión global nunca se dispara. Déjame
   verificar estado actual y hacer los cambios.

  Read 2 files (ctrl+o to expand)

● Perfecto, ahora los dos cambios:

  1. AppComponent — Eliminar take(1):

● Update(frontend\src\app\app.component.ts)
  ⎿  Added 1 line, removed 1 line
      1  import { Component, OnInit, DestroyRef, inject } from '@angular/core
         ';
      2  import { Platform } from '@ionic/angular';
      3 -import { filter, switchMap, take } from 'rxjs/operators';
      3 +import { filter, switchMap } from 'rxjs/operators';
      4  import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
      5  import { of } from 'rxjs';
      6

● Update(frontend\src\app\app.component.ts)
  ⎿  Removed 1 line
      51        .pipe(
      52          takeUntilDestroyed(this.destroyRef),
      53          filter(user => !!user),
      54 -        take(1),
      54          switchMap(user => {
      55            const userId = user!.idUsuario;
      56            capturedUserId = userId;

● 2. ChatService — Log de trazabilidad en conectarGlobal:

● Update(frontend\src\app\core\services\chat\chat.service.ts)
  ⎿  Added 1 line
      75     * No llamar si el usuario es ADMIN u otros roles sin equipo (equ
          ipoId null).
      76     */
      77    conectarGlobal(equipoId: number, currentUserId?: number): void {
      78 +    console.log(`[ChatService] Intentando conectar global -> Equipo
         + ID: ${equipoId}, Usuario ID: ${currentUserId}`);
      79      const token = localStorage.getItem('auth_token');
      80      if (!token) return;
      81

● Ahora verifico los bindings en los HTMLs (punto 4):

  Searched for 3 patterns (ctrl+o to expand)

● Bindings correctos en ambos dashboards. Verifico que los constructores están bien:

  Searched for 1 pattern (ctrl+o to expand)

● Todo cuadra. Resumen de lo que se hizo:

  1. AppComponent — take(1) eliminado (el fix crítico). Con take(1), la suscripción
  se completaba tras la primera emisión. Si al arrancar la app currentUser$ era null
   (lo cual es lo normal — el usuario aún no se logueó), el filter lo bloqueaba,
  pero cuando el usuario se logueaba, switchMap se disparaba bien. El problema real
  era que tras un logout y re-login, o si el BehaviorSubject emitía null primero y
  luego el usuario, el take(1) ya había cortado el flujo. Sin take(1), el stream
  queda vivo y es reactivo a cada login. conectarGlobal ya tiene el guard if
  (this.clientGlobal?.active) return; que previene conexiones duplicadas, así que es
   seguro.

  2. ChatService — Log de trazabilidad en conectarGlobal. Ahora al abrir la consola
  vas a ver exactamente: [ChatService] Intentando conectar global -> Equipo ID: 5,
  Usuario ID: 12. Esto te deja confirmar en las pruebas cruzadas que Jugador y
  Entrenador están escuchando el mismo equipoId. Si ves IDs distintos, ahí está el
  bug.

  3 y 4. Verificados — El log de noLeidosEquipo$ emitiendo: X de la sesión anterior
  ya está en manejarMensajeGlobal, y los bindings de ambos dashboards usan
  ((noLeidos$ | async) ?? 0) > 0 con la variable noLeidos$ correctamente asignada
  desde chatService.noLeidosEquipo$ en los constructores.