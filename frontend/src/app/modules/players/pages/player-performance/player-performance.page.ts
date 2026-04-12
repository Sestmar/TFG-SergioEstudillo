import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Jugador, PlayerHistory, PlayerHistoryPartido } from 'src/app/shared/models/models';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { PlayerService } from 'src/app/core/services/player/player.service';

@Component({
  selector: 'app-player-performance',
  templateUrl: './player-performance.page.html',
  styleUrls: ['./player-performance.page.scss'],
})
export class PlayerPerformancePage implements OnInit {

  loading = true;
  currentPlayer: Jugador | null = null;
  history: PlayerHistory | null = null;

  private destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private playerService: PlayerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        if (user?.idUsuario) {
          this.loadData(user.idUsuario);
        }
      });
  }

  private loadData(userId: number) {
    this.playerService.getAllPlayers()
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of([])))
      .subscribe((players: Jugador[]) => {
        const found = players.find(p => {
          const uId = p.usuario?.id || p.usuario?.idUsuario;
          return uId === userId;
        });
        if (found) {
          this.currentPlayer = found;
          const playerId = found.idJugador || found.id;
          if (playerId) {
            this.loadHistory(playerId);
          } else {
            this.loading = false;
          }
        } else {
          this.loading = false;
        }
      });
  }

  private loadHistory(playerId: number) {
    this.playerService.getPlayerHistory(playerId)
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => of(null)))
      .subscribe(history => {
        this.history = history;
        this.loading = false;
      });
  }

  goBack() {
    this.router.navigate(['/player-dashboard']);
  }

  goToMatchInsights(partido: PlayerHistoryPartido) {
    this.router.navigate(['/match-insights', partido.idPartido]);
  }

  isActive(): boolean {
    return this.history?.estado === 'ACTIVO';
  }

  getMinutesDisplay(p: PlayerHistoryPartido): string {
    if (p.minutoEntrada == null && p.minutoSalida == null) return '90\'';
    const entrada = p.minutoEntrada ?? 0;
    const salida  = p.minutoSalida  ?? 90;
    return `${salida - entrada}\'`;
  }
}
