import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http'; 
import { AlertController } from '@ionic/angular'; 

import { User, Player, Team, PlayerStats } from 'src/app/shared/models/models';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { NotificationService } from 'src/app/core/services/notification/notification.service';
import { MatchService } from 'src/app/core/services/match/match.service'; 

interface DashboardStats {
  totalConvocations: number;
  upcomingConvocations: number;
  pendingConfirmations: number;
  attendanceRate: number;
}

@Component({
  selector: 'app-player-dashboard',
  templateUrl: './player-dashboard.page.html',
  styleUrls: ['./player-dashboard.page.scss'],
})
export class PlayerDashboardPage implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  currentPlayer: Player | null = null;
  currentTeam: Team | null = null;
  loading: boolean = true;
  
  stats: DashboardStats = {
    totalConvocations: 0,
    upcomingConvocations: 0,
    pendingConfirmations: 0,
    attendanceRate: 0
  };

  upcomingConvocations: any[] = []; 
  playerStats: PlayerStats | null = null;
  
  quickActions = [
    { title: 'Convocatorias', icon: 'calendar', route: '/convocations', color: 'primary' },
    { title: 'Mi Equipo', icon: 'shield', route: '/coach/my-team', color: 'secondary' },
    { title: 'Mi Perfil', icon: 'person', route: '/profile', color: 'tertiary' },
    { title: 'Estadísticas', icon: 'bar-chart', route: null, action: 'scrollStats', color: 'success' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private playerService: PlayerService,
    private teamService: TeamService, 
    private matchService: MatchService, 
    private notificationService: NotificationService,
    private router: Router,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) {
    this.currentUser$ = this.authService.currentUser$; 
  }

  ngOnInit() {
    this.loadPlayerData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPlayerData() {
    this.loading = true;
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (user) => {
        if (user && ((user as any).id || (user as any).idUsuario)) {
          const userId = (user as any).id || (user as any).idUsuario; 
          this.loadPlayerProfile(userId); 
        } else {
          console.log("Esperando datos de usuario...");
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.loading = false;
      }
    });
  }

  private loadPlayerProfile(userId: number) {
    this.http.get(`http://localhost:8080/api/jugadores/usuario/${userId}/equipo`).pipe(
        catchError(() => of(null))
    ).subscribe((equipo: any) => {
        if (equipo) {
            this.currentTeam = equipo;
            this.currentPlayer = { usuario: { id: userId } as any } as Player; 
            
            this.getFullPlayerData(userId);

            const teamId = equipo.id || equipo.idEquipo;
            this.loadTeamMatches(teamId);
        } else {
            this.loading = false;
        }
    });
  }

  private getFullPlayerData(userId: number) {
      this.playerService.getAllPlayers().subscribe((res: any) => {
          const players = Array.isArray(res) ? res : (res.data || []);
          const found = players.find((p: any) => {
             const uId = p.usuario?.id || p.usuario?.idUsuario;
             return uId === userId;
          });
          
          if (found) {
              this.currentPlayer = found;
              const realPlayerId = (found as any).id || (found as any).idJugador;
              console.log("✅ Jugador encontrado. ID Deportivo REAL:", realPlayerId);
              
              if (realPlayerId) {
                  if (!this.currentPlayer!.id) this.currentPlayer!.id = realPlayerId;
                  this.loadPlayerStats(realPlayerId); 
              } else {
                  console.error("❌ Error: El objeto jugador no tiene campo 'id' ni 'idJugador'");
              }
          }
      });
  }

  private loadTeamMatches(teamId: number) {
      this.matchService.getMatchesByTeam(teamId).pipe(takeUntil(this.destroy$)).subscribe({
          next: (matches) => {
              const now = new Date();
              this.upcomingConvocations = matches
                  .filter((m: any) => new Date(m.fechaHora) >= now) 
                  .sort((a: any, b: any) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
                  .slice(0, 5); 

              this.stats.upcomingConvocations = this.upcomingConvocations.length;
              this.stats.totalConvocations = matches.length; 
              this.loading = false;
          },
          error: (err) => {
              console.error("Error cargando partidos", err);
              this.loading = false;
          }
      });
  }

  private loadPlayerStats(playerId: number) {
    this.playerService.getPlayerStats(playerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: PlayerStats) => this.playerStats = stats,
        error: (err) => console.error('Error cargando stats', err)
      });
  }

  navigateTo(action: any) {
    if (action.route) {
      this.router.navigate([action.route]);
    } else if (action.action === 'scrollStats') {
      this.scrollToStats();
    }
  }

  scrollToStats() {
    setTimeout(() => {
        const element = document.getElementById('stats-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
  }

  showMatchDetails(match: any) {
    if (match.tipo === 'ENTRENAMIENTO') {
       this.showTrainingAlert(match);
       return;
    }
    this.router.navigate(['/match-detail', match.idPartido || match.id]);
  }

  async showTrainingAlert(match: any) {
      const alert = await this.alertCtrl.create({
        header: 'Entrenamiento',
        subHeader: match.lugar,
        message: match.observaciones || 'Sin observaciones.',
        buttons: ['OK']
      });
      await alert.present();
  }

  getPlayerPosition(): string {
    const player: any = this.currentPlayer;
    return player?.posicion || 'Sin Posición';
  }

  isPlayerAvailable(): boolean {
    const player: any = this.currentPlayer;
    return player?.estado === 'ACTIVO';
  }
  
  getConvocationTitle(conv: any): string {
      if (conv.tipo === 'PARTIDO') return 'VS ' + (conv.rival || 'Rival');
      return conv.rival || 'Entrenamiento'; 
  }
  
  getConvocationTypeColor(type: string): string {
      const map: any = { 'PARTIDO': 'success', 'ENTRENAMIENTO': 'primary' };
      return map[type] || 'medium';
  }

  getPlayerAttendanceStatus(conv: any): string { return 'PENDIENTE'; }
  getAttendanceStatusColor(status: string): string { return 'primary'; }
  getAttendanceStatusText(status: string): string { return 'Convocado'; }
  confirmAttendance(id: any) {}
  rejectAttendance(id: any) {}
}