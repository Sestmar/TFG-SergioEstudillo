import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Jugador, PlayerHistory, PlayerHistoryPartido } from 'src/app/shared/models/models';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { PlayerService } from 'src/app/core/services/player/player.service';

type ChartOptions = {
  series: any; chart: any; xaxis?: any; yaxis?: any;
  dataLabels?: any; colors?: string[]; fill?: any;
  stroke?: any; markers?: any; plotOptions?: any; tooltip?: any;
};

@Component({
  selector: 'app-player-performance',
  templateUrl: './player-performance.page.html',
  styleUrls: ['./player-performance.page.scss'],
})
export class PlayerPerformancePage implements OnInit {

  loading = true;
  currentPlayer: Jugador | null = null;
  history: PlayerHistory | null = null;
  partidosFinalizados: PlayerHistoryPartido[] = [];

  radarOptions: ChartOptions = {
    series: [{ name: 'Temporada', data: [0, 0, 0, 0, 0] }],
    chart: {
      type: 'radar', height: 260,
      background: 'transparent', foreColor: '#94a3b8',
      toolbar: { show: false }, fontFamily: 'inherit',
      animations: { enabled: false }
    },
    colors: ['#8b5cf6'],
    xaxis: { categories: ['Partidos', 'Goles', 'Asistencias', 'Min/10', 'Eficiencia'] },
    yaxis: { show: false },
    plotOptions: {
      radar: {
        polygons: {
          strokeColors: 'rgba(255,255,255,0.07)',
          connectorColors: 'rgba(255,255,255,0.07)',
          fill: { colors: ['rgba(139,92,246,0.05)', 'rgba(139,92,246,0.02)'] }
        }
      }
    },
    fill: { opacity: 0.25 },
    stroke: { width: 2 },
    markers: { size: 4 },
    dataLabels: { enabled: false },
    tooltip: { theme: 'dark' }
  };

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
        if (history) {
          this.partidosFinalizados = [...(history.partidos || [])]
            .filter(p => p.estado === 'FINALIZADO')
            .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
          this.buildRadar(history);
        }
        this.loading = false;
      });
  }

  private buildRadar(h: PlayerHistory) {
    const partidos    = h.partidosTotales || 0;
    const goles       = h.goles           || 0;
    const asistencias = h.asistencias     || 0;
    const min10       = Math.round((h.minutosJugados || 0) / 10);
    const eficiencia  = partidos > 0
      ? Math.min(Math.round(((goles + asistencias) / partidos) * 20), 100)
      : 0;

    this.radarOptions = {
      ...this.radarOptions,
      series: [{ name: 'Temporada', data: [partidos, goles, asistencias, min10, eficiencia] }]
    };
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

  getResultClass(p: PlayerHistoryPartido): string {
    if (p.golesFavor > p.golesContra) return 'win';
    if (p.golesFavor === p.golesContra) return 'draw';
    return 'loss';
  }

  getMinutesDisplay(p: PlayerHistoryPartido): string {
    if (p.minutoEntrada == null && p.minutoSalida == null) return '90\'';
    const entrada = p.minutoEntrada ?? 0;
    const salida  = p.minutoSalida  ?? 90;
    return `${salida - entrada}\'`;
  }
}
