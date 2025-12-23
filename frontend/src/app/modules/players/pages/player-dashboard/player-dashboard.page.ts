import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http'; 
import { AlertController } from '@ionic/angular'; 

// Imports de Modelos
import { User, Player, Team, PlayerStats } from 'src/app/shared/models/models';

// Imports de Servicios
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
            
            // Creamos el mock temporal
            this.currentPlayer = { 
                usuario: { id: userId } as any 
            } as Player; 
            
            // 1. Cargamos los datos reales del jugador
            this.getFullPlayerData(userId);

            // Solo cargamos los partidos del equipo aquí
            const teamId = equipo.id || equipo.idEquipo;
            this.loadTeamMatches(teamId);

        } else {
            this.loading = false;
        }
    });
  }

  // ✅ CORRECCIÓN CRÍTICA AQUÍ
  private getFullPlayerData(userId: number) {
      this.playerService.getAllPlayers().subscribe((res: any) => {
          const players = Array.isArray(res) ? res : (res.data || []);
          
          // Buscamos el jugador que coincida con el usuario
          const found = players.find((p: any) => {
             const uId = p.usuario?.id || p.usuario?.idUsuario;
             return uId === userId;
          });
          
          if (found) {
              this.currentPlayer = found;
              
              // 🔥 FIX: Capturamos el ID asegurando ambas nomenclaturas (id o idJugador)
              const realPlayerId = (found as any).id || (found as any).idJugador;

              console.log("✅ Jugador encontrado. ID Deportivo REAL:", realPlayerId);
              
              if (realPlayerId) {
                  // Asignamos el ID al objeto local si faltaba
                  if (!this.currentPlayer!.id) {
                      this.currentPlayer!.id = realPlayerId;
                  }
                  // Llamamos a las estadísticas con el ID seguro
                  this.loadPlayerStats(realPlayerId); 
              } else {
                  console.error("❌ Error: El objeto jugador no tiene campo 'id' ni 'idJugador'");
              }
          }
      });
  }

  private loadDataAfterTeamLoaded() {
     // Método deprecado por la nueva lógica, se mantiene vacío o se borra
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
          console.log("📊 ESTADÍSTICAS RECIBIDAS:", stats); 
          this.playerStats = stats;
        },
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
        } else {
            console.warn("Elemento stats-section no encontrado");
        }
    }, 100);
  }

  async showMatchDetails(match: any) {
    const fechaObj = new Date(match.fechaHora);
    const fecha = fechaObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const hora = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const fechaCap = fecha.charAt(0).toUpperCase() + fecha.slice(1);

    const alert = await this.alertCtrl.create({
      header: match.tipo === 'PARTIDO' ? `VS ${match.rival}` : 'Entrenamiento',
      subHeader: `${fechaCap} - ${hora}`,
      message: `
📍 LUGAR:
${match.lugar || 'Por confirmar'}

📝 OBSERVACIONES:
${match.observaciones || 'Sin observaciones adicionales.'}
      `,
      buttons: ['Entendido'],
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
  
  getConvocationTitle(conv: any): string {
      if (conv.tipo === 'PARTIDO') return 'VS ' + (conv.rival || 'Rival');
      return conv.rival || 'Entrenamiento'; 
  }
  
  getConvocationTypeColor(type: string): string {
      const map: any = { 'PARTIDO': 'success', 'ENTRENAMIENTO': 'primary' };
      return map[type] || 'medium';
  }

  getPlayerAttendanceStatus(conv: any): string {
    return 'PENDIENTE'; 
  }

  getAttendanceStatusColor(status: string): string {
    return 'primary'; 
  }

  getAttendanceStatusText(status: string): string {
    return 'Convocado';
  }

  confirmAttendance(id: any) { console.log('Confirmar asistencia pendiente de implementar'); }
  rejectAttendance(id: any) { console.log('Rechazar asistencia pendiente de implementar'); }
}