import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';

// Imports de Modelos
import { User, Player, Team, Convocation, PlayerStats } from 'src/app/shared/models/models';

// Imports de Servicios
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { ConvocationService } from 'src/app/core/services/convocation/convocation.service';
import { NotificationService } from 'src/app/core/services/notification/notification.service';
import { TeamService } from 'src/app/core/services/team/team.service';

interface DashboardStats {
  totalConvocations: number;
  upcomingConvocations: number;
  pendingConfirmations: number;
  attendanceRate: number;
}

interface QuickAction {
  title: string;
  icon: string;
  route: string;
  color: string;
  description: string;
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

  recentConvocations: Convocation[] = [];
  upcomingConvocations: Convocation[] = [];
  playerStats: PlayerStats | null = null;
  
  quickActions: QuickAction[] = [
    { title: 'Convocatorias', icon: 'calendar', route: '/convocations', color: 'primary', description: 'Ver agenda' },
    { title: 'Mi Equipo', icon: 'shield', route: '/teams', color: 'secondary', description: 'Ver plantilla' },
    { title: 'Mi Perfil', icon: 'person', route: '/profile', color: 'tertiary', description: 'Datos personales' },
    { title: 'Estadísticas', icon: 'bar-chart', route: '/player/stats', color: 'success', description: 'Rendimiento' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private playerService: PlayerService,
    private teamService: TeamService, 
    private convocationService: ConvocationService,
    private notificationService: NotificationService,
    private router: Router
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
        if (user) {
          const userId = (user as any).id || (user as any).idUsuario; 
          this.loadPlayerProfile(userId); 
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.loading = false;
      }
    });
  }

  private loadPlayerProfile(userId: number) {
    this.playerService.getAllPlayers({ usuarioId: userId }).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Error cargando perfil:', err);
        return of([]); 
      }),
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response: any) => {
        const players = Array.isArray(response) ? response : (response.players || response.data || []);
        
        if (players && players.length > 0) {
          this.currentPlayer = players[0];
          
          // --- LÓGICA DE EQUIPO ---
          const playerAny = this.currentPlayer as any;
          
          if (playerAny.equipo) {
            this.currentTeam = playerAny.equipo;
          } else if (playerAny.equipoActual) {
            this.currentTeam = playerAny.equipoActual;
          } 
          else if (playerAny.equipoPrincipal) {
            this.teamService.getTeamById(playerAny.equipoPrincipal).subscribe({
              next: (team) => {
                this.currentTeam = team;
                this.loadDataAfterTeamLoaded();
              },
              error: (err) => {
                console.error('No se pudo cargar info del equipo', err);
                this.loadDataAfterTeamLoaded();
              }
            });
            return;
          }

          this.loadDataAfterTeamLoaded();
        }
      }
    });
  }

  private loadDataAfterTeamLoaded() {
    if (this.currentPlayer) {
      const playerId = (this.currentPlayer as any).idJugador || this.currentPlayer.id;
      this.loadPlayerStats(playerId);
      this.loadPlayerConvocations(playerId);
    }
  }

  private loadPlayerStats(playerId: number) {
    const service: any = this.playerService;
    const method = service.getStats || service.getPlayerStats;
    
    if (method) {
        method.call(service, playerId).pipe(takeUntil(this.destroy$)).subscribe({
          next: (stats: PlayerStats) => this.playerStats = stats,
          error: (err: any) => console.log('Stats no disponibles aún')
        });
    }
  }

  private loadPlayerConvocations(playerId: number) { 
    this.convocationService.getConvocations().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        let allConvocations = Array.isArray(response) ? response : (response.convocations || response.data || []);
        
        const playerConvocations = allConvocations.filter((c: any) => {
            const isExplicitlyInvited = c.jugadoresConvocados?.some((jc: any) => 
              jc.jugadorId === playerId || (jc.jugador && jc.jugador.id === playerId)
            );

            const isTeamMatch = this.currentTeam && (
              (c.equipo && c.equipo.idEquipo === this.currentTeam.id) || 
              (c.idEquipo === this.currentTeam.id) ||
              (c.equipo === this.currentTeam.id)
            );

            return isExplicitlyInvited || isTeamMatch;
        });
        
        this.processConvocations(playerConvocations);
      },
      error: (error) => console.error('Error loading convocations:', error)
    });
  }

  processConvocations(convocations: Convocation[]) {
    const now = new Date();
    
    // Función helper para normalizar fechas (acepta fechaHoraInicio o fechaEvento)
    const getDate = (c: any) => new Date(c.fechaHoraInicio || c.fechaEvento);

    this.upcomingConvocations = convocations.filter(conv => {
      const convDate = getDate(conv);
      return convDate >= now;
    }).sort((a, b) => {
      return getDate(a).getTime() - getDate(b).getTime();
    }).slice(0, 5);

    this.recentConvocations = convocations
        .sort((a, b) => {
           return getDate(b).getTime() - getDate(a).getTime();
        })
        .slice(0, 10);

    this.stats.totalConvocations = convocations.length;
    this.stats.upcomingConvocations = this.upcomingConvocations.length;
    
    this.stats.pendingConfirmations = convocations.filter(conv => {
      const status = this.getPlayerAttendanceStatus(conv);
      // Solo cuenta como "pendiente" de acción si realmente queremos que confirme
      // En este nuevo modelo "Convocado", quizás solo queremos contar los "No Vistos"
      // Pero por ahora lo dejamos en 0 para no estresar al jugador
      return false; 
    }).length;

    const confirmedConvocations = convocations.filter(conv => {
       return this.getPlayerAttendanceStatus(conv) === 'CONFIRMADO';
    }).length;
    
    const pastConvocations = convocations.length - this.upcomingConvocations.length;
    
    this.stats.attendanceRate = pastConvocations > 0 
      ? Math.round((confirmedConvocations / pastConvocations) * 100)
      : 0;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  // --- Helpers ---

  getPlayerAge(): number {
    const player: any = this.currentPlayer;
    if (!player?.fechaNacimiento) return 0;
    const birth = new Date(player.fechaNacimiento);
    return Math.abs(new Date(Date.now() - birth.getTime()).getUTCFullYear() - 1970);
  }

  getPlayerPosition(): string {
    const player: any = this.currentPlayer;
    return player?.posicion || 'Sin Posición';
  }

  isPlayerAvailable(): boolean {
    const player: any = this.currentPlayer;
    return player?.estado === 'ACTIVO' || player?.disponible === true;
  }
  
  getDuration(conv: any): string {
    return "2h"; 
  }
  
  getConvocationTypeColor(type: string): string {
      const map: any = { 'PARTIDO': 'success', 'ENTRENAMIENTO': 'primary', 'EVENTO': 'warning' };
      return map[type] || 'medium';
  }
  
  formatConvocationDate(dateInput: string | Date): string {
      if (!dateInput) return 'Fecha pendiente';
      return new Date(dateInput).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' });
  }
  
  getPlayerAttendanceStatus(convocation: Convocation): string {
    if (!this.currentPlayer) return 'DESCONOCIDO';
    const playerId = (this.currentPlayer as any).idJugador || this.currentPlayer.id;
    
    const jc = convocation.jugadoresConvocados?.find((j: any) => 
      j.jugadorId === playerId || (j.jugador && j.jugador.id === playerId)
    );
    
    return jc ? (jc as any).estadoAsistencia : 'PENDIENTE';
  }

  // --- LÓGICA DE ESTADOS CAMBIADA ---

  getAttendanceStatusColor(status: string): string {
    // Si es Pendiente o No_Convocado (implícito), es azul (Primary) porque es una convocatoria estándar
    if (status === 'PENDIENTE' || status === 'NO_CONVOCADO') return 'primary';
    
    const map: any = { 'CONFIRMADO': 'success', 'RECHAZADO': 'danger' };
    return map[status] || 'primary';
  }

  getAttendanceStatusText(status: string): string {
    // Texto más profesional
    if (status === 'PENDIENTE' || status === 'NO_CONVOCADO') return 'Convocado';
    
    const map: any = { 'CONFIRMADO': 'Asistiré', 'RECHAZADO': 'Baja' };
    return map[status] || 'Convocado';
  }

  // Métodos placeholder (ya no se usan en el HTML pero se dejan por si acaso)
  confirmAttendance(id: number) { console.log('Confirmar', id); }
  rejectAttendance(id: number) { console.log('Rechazar', id); }
}