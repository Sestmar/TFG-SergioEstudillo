import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { Platform } from '@ionic/angular';
import { filter, switchMap, take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

import { AuthService } from './core/services/auth/auth.service';
import { ChatService } from './core/services/chat/chat.service';
import { PlayerService } from './core/services/player/player.service';
import { CoachService } from './core/services/coach/coach.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {

  private destroyRef = inject(DestroyRef);

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private chatService: ChatService,
    private playerService: PlayerService,
    private coachService: CoachService
  ) {
    this.initializeApp();
  }

  ngOnInit(): void {
    console.log('Aplicación inicializada');
    this.iniciarConexionGlobalChat();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      console.log('Aplicación Ionic inicializada correctamente');
    });
  }

  /**
   * Conecta el WebSocket de chat en segundo plano en cuanto el usuario
   * está autenticado y tiene un equipo asociado.
   * - JUGADOR: obtiene el equipo via PlayerService
   * - ENTRENADOR: obtiene el equipo via CoachService
   * - ADMIN y otros roles sin equipo: no se conecta (no tiene equipoId)
   */
  private iniciarConexionGlobalChat(): void {
    this.authService.currentUser$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(user => !!user),
        take(1),
        switchMap(user => {
          const userId = user!.idUsuario;
          const rol = (user!.rol ?? '').toUpperCase();

          if (rol.includes('JUGADOR')) {
            return this.playerService.getPlayerTeamByUserId(userId);
          }

          if (rol.includes('ENTRENADOR') || rol.includes('CUERPO_TECNICO') || rol.includes('COACH')) {
            return this.coachService.getDashboardData(userId);
          }

          // ADMIN u otros roles sin equipo — no conectar
          return of(null);
        })
      )
      .subscribe({
        next: (respuesta) => {
          if (!respuesta) return;

          // Jugador devuelve el objeto equipo directamente (EquipoResumen)
          // Entrenador devuelve CoachDashboardResponse con { equipo: { idEquipo, ... } }
          const equipoId: number | null =
            respuesta.idEquipo       ??   // EquipoResumen directo
            respuesta.id             ??   // EquipoResumen con campo 'id'
            respuesta.equipo?.idEquipo ?? // CoachDashboardResponse
            respuesta.equipo?.id     ??   // CoachDashboardResponse alternativo
            null;

          if (equipoId) {
            this.chatService.conectarGlobal(equipoId);
          }
        },
        error: (err) => {
          console.warn('[AppComponent] No se pudo obtener el equipo para chat global:', err);
        }
      });
  }
}
