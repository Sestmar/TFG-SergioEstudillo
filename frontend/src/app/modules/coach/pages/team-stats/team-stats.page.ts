import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MatchService } from 'src/app/core/services/match/match.service';
import { CoachService } from 'src/app/core/services/coach/coach.service';
import { filter, switchMap } from 'rxjs/operators';
import { Partido, PlayerSeasonStat } from 'src/app/shared/models/models';

@Component({
  selector: 'app-team-stats',
  templateUrl: './team-stats.page.html',
  styleUrls: ['./team-stats.page.scss'],
})
export class TeamStatsPage implements OnInit {

  private destroyRef = inject(DestroyRef);
  loading = true;
  teamName = '';
  
  seasonStats = {
    played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0
  };

  // Listas para la Vista
  topScorerMVP: PlayerSeasonStat | null = null;
  restScorers: PlayerSeasonStat[] = [];
  topMinutes: PlayerSeasonStat[] = [];
  topAttendance: PlayerSeasonStat[] = [];
  
  maxMinutes: number = 1;

  constructor(
    private navCtrl: NavController,
    private authSvc: AuthService,
    private coachSvc: CoachService,
    private matchSvc: MatchService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  goBack() {
    this.navCtrl.back();
  }

  async loadData() {
    this.loading = true;
    
    this.authSvc.currentUser$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(u => !!u),
        switchMap(u => {
            const id = u!.idUsuario;
            return this.coachSvc.getDashboardData(id);
        })
      )
      .subscribe({
        next: (res) => {
          if (res.equipo) {
            this.teamName = res.equipo.nombre;
            const teamId = res.equipo.idEquipo || res.equipo.id;
            const coachId = res.entrenadorId; // Asegúrate de que el endpoint dashboard devuelve esto

            // 1. Cargar Partidos (para resumen de temporada)
            this.matchSvc.getMatchesByTeam(teamId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(matches => {
                this.calculateSeasonStats(matches || []);
            });

            // 2. Cargar Estadísticas COMPLETAS (Goles, Minutos, Asistencia)
            if (coachId) {
                this.loadFullStats(coachId);
            } else {
                console.warn("No se encontró ID de entrenador en dashboard");
                this.loading = false;
            }

          } else {
            this.loading = false;
          }
        },
        error: () => this.loading = false
      });
  }

  loadFullStats(coachId: number) {
      this.coachSvc.getTeamStats(coachId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (res) => {
              const players: PlayerSeasonStat[] = res.jugadores || [];

              const scorers = [...players]
                  .sort((a, b) => (b.goles || 0) - (a.goles || 0))
                  .filter(p => (p.goles || 0) > 0);

              if (scorers.length > 0) {
                  this.topScorerMVP = scorers[0];
                  this.restScorers = scorers.slice(1, 6);
              }

              this.topMinutes = [...players]
                  .sort((a, b) => (b.minutos || 0) - (a.minutos || 0))
                  .slice(0, 10);

              this.topAttendance = [...players]
                  .sort((a, b) => (b.asistenciaPct || 0) - (a.asistenciaPct || 0));

              this.loading = false;
          },
          error: (err) => {
              console.error(err);
              this.loading = false;
          }
      });
  }

  calculateSeasonStats(matches: Partido[]) {
      const finished = matches.filter(m => m.estado === 'FINALIZADO' && m.tipo === 'PARTIDO');
      this.seasonStats.played = finished.length;
      
      finished.forEach(m => {
          const gf = m.golesFavor || 0;
          const gc = m.golesContra || 0;
          this.seasonStats.goalsFor += gf;
          this.seasonStats.goalsAgainst += gc;

          if (gf > gc) this.seasonStats.wins++;
          else if (gf === gc) this.seasonStats.draws++;
          else this.seasonStats.losses++;
      });
  }

  // Helpers visuales
  getBarWidth(mins: number): string {
      return ((mins / this.maxMinutes) * 100) + '%';
  }

  getAvatarUrl(p: PlayerSeasonStat): string {
      if (p.fotoUrl) return p.fotoUrl;
      const name = p.nombre || 'Player';
      return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=128`;
  }
  
  // Helper para color de asistencia
  getAttendanceColor(pct: number): string {
      if (!pct) return '#ef4444'; 
      if (pct >= 85) return '#10b981'; // Verde
      if (pct >= 60) return '#3b82f6'; // Azul
      if (pct >= 40) return '#f59e0b'; // Naranja
      return '#ef4444'; // Rojo
  }
}