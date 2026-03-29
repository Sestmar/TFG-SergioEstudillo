import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MatchService } from 'src/app/core/services/match/match.service';
import { CoachService } from 'src/app/core/services/coach/coach.service';
import { filter, switchMap } from 'rxjs/operators';

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
  topScorerMVP: any = null; 
  restScorers: any[] = []; 
  topMinutes: any[] = [];
  topAttendance: any[] = []; // Nueva lista para asistencia
  
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
        switchMap((u: any) => {
            // Obtenemos el ID del usuario (Entrenador)
            const id = u.id || u.idUsuario || u.sub;
            return this.coachSvc.getDashboardData(id);
        })
      )
      .subscribe({
        next: (res: any) => {
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
          next: (res: any) => {
              const players = res.jugadores || [];

              // A) Goleadores (Igual)
              const scorers = [...players]
                  .sort((a:any, b:any) => b.goles - a.goles)
                  .filter((p:any) => p.goles > 0);
              
              if (scorers.length > 0) {
                  this.topScorerMVP = scorers[0]; 
                  this.restScorers = scorers.slice(1, 6);
              }

              // B) Minutos (Ordenamos por TOTAL, pero mostraremos promedio)
              this.topMinutes = [...players]
                  .sort((a:any, b:any) => b.minutos - a.minutos)
                  .slice(0, 10); // Top 10

              // C) Asistencia
              this.topAttendance = [...players]
                  .sort((a:any, b:any) => b.asistenciaPct - a.asistenciaPct);

              this.loading = false;
          },
          error: (err) => {
              console.error(err);
              this.loading = false;
          }
      });
  }

  calculateSeasonStats(matches: any[]) {
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

  getAvatarUrl(p: any): string {
      // El objeto 'p' ahora viene directo del endpoint nuevo
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