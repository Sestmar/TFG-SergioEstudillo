import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MatchService } from 'src/app/core/services/match/match.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { CoachService } from 'src/app/core/services/coach/coach.service';
import { filter, switchMap, catchError } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs'; // Importante para peticiones paralelas

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

  topScorers: AggregatedPlayerStats[] = [];
  topMinutes: AggregatedPlayerStats[] = [];

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
            
            // 1. Cargar Partidos (para el resumen global)
            this.matchSvc.getMatchesByTeam(teamId).subscribe(matches => {
                this.calculateSeasonStats(matches || []);
            });

            // 2. Cargar Jugadores y sus Stats individuales
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

  // 🔥 NUEVA LÓGICA: Pedir stats al backend para cada jugador
  loadPlayersWithStats(teamId: number) {
      this.playerSvc.getAllPlayers().subscribe((res: any) => {
          const allPlayersRaw = Array.isArray(res) ? res : (res.data || []);
          
          // Filtrar mis jugadores
          const myPlayers = allPlayersRaw.filter((p: any) => {
              const tId = this.getTeamIdSafe(p);
              return tId == teamId;
          });

          console.log(`👥 Solicitando estadísticas para ${myPlayers.length} jugadores...`);

          // Crear un array de Observables: una petición por cada jugador
          const statsRequests = myPlayers.map((player: any) => {
              const pId = player.id || player.idJugador;
              // Usamos catchError para que si falla uno no rompa todo
              return this.playerSvc.getPlayerStats(pId).pipe(
                  catchError(err => of({ golesTotales: 0, minutosJugados: 0 })), // Fallback si falla
                  // Devolvemos objeto combinado
                  switchMap(stats => of({
                      player: player,
                      goals: stats.golesTotales || 0,
                      minutes: stats.minutosJugados || 0
                  }))
              );
          });

          // Ejecutar todas las peticiones en paralelo
          if (statsRequests.length > 0) {
              forkJoin(statsRequests).subscribe((results: AggregatedPlayerStats[]) => {
                  
                  // Ordenar Top Goleadores
                  this.topScorers = [...results]
                      .sort((a, b) => b.goals - a.goals)
                      .slice(0, 10)
                      .filter(s => s.goals > 0);

                  // Ordenar Top Minutos
                  this.topMinutes = [...results]
                      .sort((a, b) => b.minutes - a.minutes)
                      .slice(0, 10)
                      .filter(s => s.minutes > 0);

                  console.log("🏆 Goleadores cargados:", this.topScorers);
                  this.loading = false;
              });
          } else {
              this.loading = false;
          }
      });
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
      return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff`;
  }
}