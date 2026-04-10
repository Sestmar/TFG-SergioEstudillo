gemini en instruccion.md te ha dejado la tarea a realizar. Comprueba si
 es lo que falta realmente y no está hecho ya, para ponerte a ello

  Searched for 2 patterns, read 1 file (ctrl+o to expand)

● Bien, déjame verificar el estado actual del archivo antes de asumir que
  no está hecho.

  Searched for 1 pattern, read 1 file (ctrl+o to expand)

● Confirmado — la tarea de Gemini es válida y no está hecha. El archivo
  sigue con @Autowired en campos (líneas 25 y 28).

  Lo que voy a cambiar exactamente:

  - Eliminar import org.springframework.beans.factory.annotation.Autowired
  - Agregar import lombok.RequiredArgsConstructor
  - Añadir @RequiredArgsConstructor a la clase
  - @Autowired private JwtService jwtService → private final JwtService
  jwtService
  - @Autowired private UserDetailsService userDetailsService → private
  final UserDetailsService userDetailsService

  ¿Arranco?

> dale si

● Update(src\backend-tfg\backend-tfg\src\main\java\com\DAMUnitedFC\backend
        _tfg\config\WebSocketConfig.java)
  ⎿  Added 1 line, removed 1 line
      1  package com.DAMUnitedFC.backend_tfg.config;
      2
      3  import com.DAMUnitedFC.backend_tfg.service.JwtService;
      4 -import org.springframework.beans.factory.annotation.Autowi
        -red;
      4 +import lombok.RequiredArgsConstructor;
      5  import org.springframework.context.annotation.Configuratio
         n;
      6  import org.springframework.messaging.Message;
      7  import org.springframework.messaging.MessageChannel;

● Update(src\backend-tfg\backend-tfg\src\main\java\com\DAMUnitedFC\backend
        _tfg\config\WebSocketConfig.java)
  ⎿  Added 3 lines, removed 5 lines
      20
      21  @Configuration
      22  @EnableWebSocketMessageBroker
      23 +@RequiredArgsConstructor
      24  public class WebSocketConfig implements WebSocketMessageB
          rokerConfigurer {
      25
      25 -    @Autowired
      26 -    private JwtService jwtService;
      26 +    private final JwtService jwtService;
      27 +    private final UserDetailsService userDetailsService;
      28
      28 -    @Autowired
      29 -    private UserDetailsService userDetailsService;
      30 -
      29      @Override
      30      public void registerStompEndpoints(StompEndpointRegis
          try registry) {
      31          registry.addEndpoint("/ws")

● Listo. Probalo con ./mvnw spring-boot:run y confirmame que arranca. Si
  anda bien, el siguiente y último ítem pendiente son los console.warn del
   frontend.

> arrancó bien. Gemini actualizó la tarea en instruccion.md con la parte
que queda. Comprueba y lleva a cabo la tarea

  Searched for 1 pattern, read 1 file (ctrl+o to expand)

● Antes de tocar nada, verifico el contexto de cada console.warn para no
  romper flujos. Los leo todos en paralelo.

  Searched for 8 patterns, read 8 files (ctrl+o to expand)

● Tengo todo el contexto. Todos son logs puros — ninguno altera el flujo
  de control. Arranco con todos en paralelo.

● Update(frontend\src\app\app.component.ts)
  ⎿  Added 1 line, removed 2 lines
      88              this.chatService.conectarGlobal(equipoId, cap
          turedUserId ?? undefined);
      89            }
      90          },
      91 -        error: (err) => {
      92 -          console.warn('[AppComponent] No se pudo obtener
         - el equipo para chat global:', err);
      91 +        error: () => {
      92          }
      93        });
      94    }

● Update(frontend\src\app\core\interceptors\auth.interceptor.ts)
  ⎿  Removed 2 lines
      33        catchError((error: HttpErrorResponse) => {
      34          if (error.status === 401) {
      35            // Si el token es inválido o expiró:
      36 -          console.warn('Sesión expirada o no autorizada.
         -Redirigiendo al login...');
      37 -
      36            // Limpiamos el token manualmente
      37            localStorage.removeItem('auth_token');
      38

● Update(frontend\src\app\core\services\auth\auth.service.ts)
  ⎿  Added 1 line, removed 2 lines
      48        this.setAuth(token);
      49        this.getCurrentUser().subscribe({
      50          error: () => {
      51 -           console.warn('Sesión inválida al inicio, cerra
         -ndo sesión.');
      52 -           this.logout();
      51 +           this.logout();
      52          }
      53        });
      54      } else {

● Update(frontend\src\app\core\services\auth\auth.service.ts)
  ⎿  Added 1 line, removed 1 line
      201          if (this.tokenRefreshTimer) clearTimeout(this.to
           kenRefreshTimer);
      202          this.tokenRefreshTimer = setTimeout(() => {
      203            this.refreshToken().subscribe({
      204 -            error: () => console.warn('Auto-refresh toke
          -n failed')
      204 +            error: () => {}
      205            });
      206          }, delay);
      207        }

● Update(frontend\src\app\core\services\chat\chat.service.ts)
  ⎿  Removed 1 line
      175
      176    enviarMensaje(dto: EnviarMensajeDto): void {
      177      if (!this.client?.active) {
      178 -      console.warn('STOMP no conectado');
      178        return;
      179      }
      180      this.client.publish({

● Update(frontend\src\app\core\services\chat\chat.service.ts)
  ⎿  Added 1 line, removed 2 lines
      256            extra: { route: '/chat' }
      257          }]
      258        });
      259 -    } catch (err) {
      260 -      console.warn('[ChatService] No se pudo disparar no
          -tificación local:', err);
      259 +    } catch {
      260      }
      261    }
      262

● Update(frontend\src\app\core\services\chat\chat.service.ts)
  ⎿  Added 1 line, removed 2 lines
      264    private registrarListenerNotificaciones(): void {
      265      LocalNotifications.addListener('localNotificationAct
           ionPerformed', () => {
      266        this.router.navigate(['/chat']);
      267 -    }).catch(err => {
      267 +    }).catch(() => {
      268        // En web/browser LocalNotifications no está dispo
           nible — silenciar el error
      269 -      console.warn('[ChatService] LocalNotifications no
          -disponible en esta plataforma:', err);
      269      });
      270    }
      271

● Update(frontend\src\app\modules\user\pages\user-dashboard\user-dashboard
        .page.ts)
  ⎿  Added 1 line, removed 2 lines
      78              // Una vez tenemos el ID correcto, cargamos l
          os partidos
      79              this.loadDashboardData();
      80          },
      81 -        error: (err) => {
      82 -            console.warn("No se encontró equipo para este
         - jugador (o no es jugador)", err);
      81 +        error: () => {
      82              // Cargamos solo noticias si no tiene equipo
      83              this.loadRecentNews();
      84              this.isLoading = false;

● Update(frontend\src\app\modules\chat\pages\chat\chat.page.ts)
  ⎿  Removed 1 line
      77            // por lo que hay que extraer idEquipo desde re
          spuesta.equipo.idEquipo.
      78            this.equipoId = respuesta?.idEquipo ?? respuest
          a?.equipo?.idEquipo;
      79            if (!this.equipoId) {
      80 -            console.warn('[Chat] El endpoint devolvió res
         -puesta sin idEquipo — no se conectará al chat');
      80              return;
      81            }
      82            this.iniciarChat();

● Update(frontend\src\app\modules\chat\pages\chat\chat.page.ts)
  ⎿  Added 1 line, removed 2 lines
      81            }
      82            this.iniciarChat();
      83          },
      84 -        error: (err) => {
      85 -          console.warn('[Chat] Sin equipo asignado (error
         -', err?.status, ') — no se conectará al chat de equipo');
      84 +        error: () => {
      85            // No llamar iniciarChat() si no hay equipoId:
          no tiene sentido conectar sin equipo
      86          }
      87        });

● Update(frontend\src\app\modules\coach\pages\team-stats\team-stats.page.t
        s)
  ⎿  Removed 1 line
      199              if (coachId) {
      200                this.loadFullStats(coachId);
      201              } else {
      202 -              console.warn('No se encontró ID de entrena
          -dor en dashboard');
      202                this.loading = false;
      203              }
      204            } else {

● Update(frontend\src\app\modules\players\pages\player-dashboard\player-da
        shboard.page.ts)
  ⎿  Removed 2 lines
      301    private goToProfile() {
      302      if (this.currentPlayer && this.currentPlayer.usuario
           ) {
      303          this.router.navigate(['/profile']);
      304 -    } else {
      305 -        console.warn("⚠️ Aún no se ha cargado el jugador.
          -");
      304      }
      305    }
      306

● 12 console.warn eliminados en 8 archivos, flujo de control intacto en
  todos. Resumen de lo que hice en cada caso:

  ┌──────────────────────────┬─────────────────────────────────────────┐
  │         Archivo          │                 Cambio                  │
  ├──────────────────────────┼─────────────────────────────────────────┤
  │ app.component.ts         │ Eliminado warn del error:, parámetro    │
  │                          │ err también quitado                     │
  ├──────────────────────────┼─────────────────────────────────────────┤
  │ auth.interceptor.ts      │ Eliminado warn, el resto del bloque 401 │
  │                          │  intacto                                │
  ├──────────────────────────┼─────────────────────────────────────────┤
  │ auth.service.ts          │ Eliminado warn del error:, logout() se  │
  │                          │ mantiene                                │
  ├──────────────────────────┼─────────────────────────────────────────┤
  │ auth.service.ts          │ error: () => console.warn(...) → error: │
  │                          │  () => {}                               │
  ├──────────────────────────┼─────────────────────────────────────────┤
  │ chat.service.ts          │ Eliminado warn del guard if             │
  │                          │ (!this.client?.active), return intacto  │
  ├──────────────────────────┼─────────────────────────────────────────┤
  │ chat.service.ts          │ catch (err) con solo warn → catch {}    │
  │                          │ vacío                                   │
  ├──────────────────────────┼─────────────────────────────────────────┤
  │ chat.service.ts          │ .catch(err => { warn }) → .catch(() =>  │
  │                          │ {}) con comentario explicativo          │
  ├──────────────────────────┼─────────────────────────────────────────┤
  │ user-dashboard.page.ts   │ Eliminado warn del error:, lógica de    │
  │                          │ fallback intacta                        │
  ├──────────────────────────┼─────────────────────────────────────────┤
  │ chat.page.ts             │ Eliminado warn del guard if             │
  │                          │ (!this.equipoId), return intacto        │
  ├──────────────────────────┼─────────────────────────────────────────┤
  │ chat.page.ts             │ Eliminado warn del error:, comentario   │
  │                          │ intacto                                 │
  ├──────────────────────────┼─────────────────────────────────────────┤
  │ team-stats.page.ts       │ Eliminado warn del else, this.loading = │
  │                          │  false intacto                          │
  ├──────────────────────────┼─────────────────────────────────────────┤
  │ player-dashboard.page.ts │ Eliminado warn del else vacío — bloque  │
  │                          │ colapsado                               │
  └──────────────────────────┴─────────────────────────────────────────┘

  La deuda técnica del deuda-tecnica.md está completamente resuelta (salvo
   los métodos largos que dejamos fuera de alcance). ¿Hacemos commit de
  todo esto?