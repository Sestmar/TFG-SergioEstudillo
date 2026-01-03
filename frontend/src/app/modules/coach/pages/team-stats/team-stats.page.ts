import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MatchService } from 'src/app/core/services/match/match.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { CoachService } from 'src/app/core/services/coach/coach.service';
import { filter, switchMap, catchError } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

interface AggregatedPlayerStats {
    player: any;
    goals: number;
    minutes: number;
}

@Component({
  selector: 'app-team-stats',
  templateUrl: './team-stats.page.html',
  styleUrls: ['./team-stats.page.scss'],
})
export class TeamStatsPage implements OnInit {

  loading = true;
  teamName = '';
  
  seasonStats = {
    played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0
  };

  // Listas para la Vista
  topScorerMVP: AggregatedPlayerStats | null = null; // El nº1
  restScorers: AggregatedPlayerStats[] = [];         // Del 2º al 10º
  topMinutes: AggregatedPlayerStats[] = [];
  maxMinutes: number = 1;

  constructor(
    private navCtrl: NavController,
    private authSvc: AuthService,
    private coachSvc: CoachService,
    private matchSvc: MatchService,
    private playerSvc: PlayerService
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
        filter(u => !!u),
        switchMap((u: any) => {
            const id = u.id || u.idUsuario || u.sub;
            return this.coachSvc.getDashboardData(id);
        })
      )
      .subscribe({
        next: (res: any) => {
          if (res.equipo) {
            this.teamName = res.equipo.nombre;
            const teamId = res.equipo.idEquipo || res.equipo.id;
            
            // 1. Partidos
            this.matchSvc.getMatchesByTeam(teamId).subscribe(matches => {
                this.calculateSeasonStats(matches || []);
            });

            // 2. Jugadores y Stats
            this.loadPlayersWithStats(teamId);

          } else {
            this.loading = false;
          }
        },
        error: () => this.loading = false
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

  loadPlayersWithStats(teamId: number) {
      this.playerSvc.getAllPlayers().subscribe((res: any) => {
          const allPlayersRaw = Array.isArray(res) ? res : (res.data || []);
          
          const myPlayers = allPlayersRaw.filter((p: any) => {
              const tId = this.getTeamIdSafe(p);
              return tId == teamId;
          });

          const statsRequests = myPlayers.map((player: any) => {
              const pId = player.id || player.idJugador;
              return this.playerSvc.getPlayerStats(pId).pipe(
                  catchError(() => of({ golesTotales: 0, minutosJugados: 0 })),
                  switchMap(stats => of({
                      player: player,
                      goals: stats.golesTotales || 0,
                      minutes: stats.minutosJugados || 0
                  }))
              );
          });

          if (statsRequests.length > 0) {
              forkJoin(statsRequests).subscribe((results: AggregatedPlayerStats[]) => {
                  
                  // Procesar Goleadores (MVP + Lista)
                  const allScorers = [...results]
                      .sort((a, b) => b.goals - a.goals)
                      .filter(s => s.goals > 0);
                  
                  if (allScorers.length > 0) {
                      this.topScorerMVP = allScorers[0];
                      this.restScorers = allScorers.slice(1);
                  }

                  // Procesar Minutos
                  this.topMinutes = [...results]
                      .sort((a, b) => b.minutes - a.minutes)
                      .slice(0, 10)
                      .filter(s => s.minutes > 0);
                  
                  if (this.topMinutes.length > 0) {
                      this.maxMinutes = this.topMinutes[0].minutes;
                  }

                  this.loading = false;
              });
          } else {
              this.loading = false;
          }
      });
  }

  // Helper para anchos de barra de minutos
  getBarWidth(mins: number): string {
      const percent = (mins / this.maxMinutes) * 100;
      return `${percent}%`;
  }

  private getTeamIdSafe(p: any): number | null {
      if (p.equipoPrincipal) {
          if (typeof p.equipoPrincipal === 'object') return p.equipoPrincipal.id || p.equipoPrincipal.idEquipo;
          return Number(p.equipoPrincipal);
      }
      return null;
  }

  getAvatarUrl(playerStat: any): string {
      const p = playerStat.player;
      if (p && p.usuario && (p.usuario.fotoUrl || p.usuario.fotoPerfil)) {
          return p.usuario.fotoUrl || p.usuario.fotoPerfil;
      }
      const name = p.usuario?.nombre || p.nombre || 'Player';
      return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff&size=128`;
  }
}