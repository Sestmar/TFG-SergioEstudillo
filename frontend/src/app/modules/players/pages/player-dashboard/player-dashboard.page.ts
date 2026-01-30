import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http'; 
import { AlertController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
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
    { id: 'calendar', title: 'Calendario', icon: 'calendar', color: 'primary' },
    { id: 'team', title: 'Mi Equipo', icon: 'shield-checkmark', color: 'secondary' },
    { id: 'profile', title: 'Mi Perfil', icon: 'person', color: 'tertiary' },
    { id: 'stats', title: 'Estadísticas', icon: 'stats-chart', color: 'success' }
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

  // 🔥 MÉTODO LOGOUT AÑADIDO
  async logout() {
      const alert = await this.alertCtrl.create({
          header: 'Desconectar',
          message: '¿Quieres cerrar sesión?',
          buttons: [
              { text: 'No', role: 'cancel' },
              { 
                  text: 'Sí, salir', 
                  role: 'destructive',
                  handler: () => {
                      this.authService.logout();
                  }
              }
          ]
      });
      await alert.present();
  }

  private loadPlayerData() {
    this.loading = true;
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (user) => {
        const u = user as any;
        if (u && (u.id || u.idUsuario)) {
          const userId = u.id || u.idUsuario; 
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
    // ✅ Usamos la URL de Render definida en environment.ts
    const url = `${environment.apiUrl}/jugadores/usuario/${userId}/equipo`;

    this.http.get(url).pipe(
      catchError(() => of(null))
    ).subscribe((equipo: any) => {
      if (equipo) {
          this.currentTeam = equipo;
          this.currentPlayer = { 
            usuario: { id: userId } as any 
          } as Player; 
          
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
              
              if (realPlayerId) {
                  if (!this.currentPlayer!.id) {
                      this.currentPlayer!.id = realPlayerId;
                  }
                  this.loadPlayerStats(realPlayerId); 
              }
          } else {
              this.loading = false;
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
        next: (stats: PlayerStats) => {
            this.playerStats = stats;
        },
        error: (err) => console.error('Error cargando stats', err)
      });
  }

  navigateTo(actionOrRoute: any) {
    if (typeof actionOrRoute === 'string') {
        if (actionOrRoute === '/profile') {
             this.goToProfile();
        } else if (actionOrRoute === '/convocations') {
             this.router.navigate(['/calendar']);
        } else {
             this.router.navigate([actionOrRoute]);
        }
        return;
    }

    const actionId = actionOrRoute.id;

    switch (actionId) {
        case 'calendar':      
        case 'convocations':  
            this.router.navigate(['/calendar']);
            break;
        case 'team':
            this.router.navigate(['/coach/my-team']); 
            break;
        case 'profile':
            this.goToProfile();
            break;
        case 'stats':
            this.scrollToStats();
            break;
    }
  }

  private goToProfile() {
    if (this.currentPlayer && this.currentPlayer.usuario) {
        this.router.navigate(['/profile']);
    } else {
        console.warn("⚠️ Aún no se ha cargado el jugador.");
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
    const matchId = match.idPartido || match.id;
    this.router.navigate(['/match-detail', matchId]);
  }

  async showTrainingAlert(match: any) {
      const alert = await this.alertCtrl.create({
        header: 'Entrenamiento',
        subHeader: match.lugar,
        message: match.observaciones || 'Sin observaciones.',
        buttons: ['OK'],
        cssClass: 'custom-alert'
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
  
  getConvocationTypeColor(type: string): string {
      const map: any = { 'PARTIDO': 'success', 'ENTRENAMIENTO': 'primary' };
      return map[type] || 'medium';
  }

  getPlayerAttendanceStatus(conv: any): string { return 'PENDIENTE'; }
  getAttendanceStatusColor(status: string): string { return 'primary'; }
  getAttendanceStatusText(status: string): string { return 'Convocado'; }
}