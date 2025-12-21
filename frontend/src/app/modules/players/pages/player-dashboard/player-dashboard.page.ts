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
    { title: 'Mi Equipo', icon: 'shield', route: '/coach/my-team', color: 'secondary', description: 'Ver plantilla' },
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
    this.playerService.getAllPlayers().pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('Error cargando perfil:', err);
        return of([]); 
      }),
      finalize(() => {
        // Solo quitamos el loading si NO tenemos que cargar equipo extra
        if (!this.currentPlayer || this.currentTeam) {
             this.loading = false;
        }
      })
    ).subscribe({
      next: (response: any) => {
        const players = Array.isArray(response) ? response : (response.players || response.data || []);
        
        if (players && players.length > 0) {
          const foundPlayer = players.find((p: any) => {
             const pUserId = p.usuario?.id || p.usuario?.idUsuario || p.idUsuario;
             return pUserId === userId;
          });

          if (foundPlayer) {
            this.currentPlayer = foundPlayer;
            const raw = foundPlayer as any;

            // --- DETECCIÓN INTELIGENTE DEL EQUIPO ---
            // 1. Buscamos el campo del equipo (puede ser objeto o ID)
            const teamProp = raw.equipoPrincipal || raw.equipo || raw.equipoActual;

            if (teamProp && typeof teamProp === 'object') {
                // ✅ CASO 1: El backend devuelve el objeto completo (Nuevo Backend)
                this.currentTeam = teamProp;
                this.loading = false;
                this.loadDataAfterTeamLoaded();
            } 
            else if (teamProp && typeof teamProp === 'number') {
                // ✅ CASO 2: El backend devuelve solo el ID (Legacy)
                this.teamService.getTeamById(teamProp).subscribe({
                    next: (team) => {
                        this.currentTeam = team;
                        this.loading = false;
                        this.loadDataAfterTeamLoaded();
                    },
                    error: () => {
                        this.loading = false;
                        this.loadDataAfterTeamLoaded();
                    }
                });
            } else {
                // Sin equipo asignado
                this.currentTeam = null;
                this.loading = false;
                this.loadDataAfterTeamLoaded();
            }

          } else {
            console.error("No se encontró ficha de jugador para este usuario: " + userId);
            this.loading = false;
          }
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
    if (this.playerService.getPlayerStats) {
        this.playerService.getPlayerStats(playerId).pipe(takeUntil(this.destroy$)).subscribe({
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
        
        // 🔥 FILTRADO ROBUSTO DE EVENTOS 🔥
        const playerConvocations = allConvocations.filter((c: any) => {
            
            // 1. Invitación explícita (si estás en la lista de convocados)
            const isExplicitlyInvited = c.jugadoresConvocados?.some((jc: any) => 
              jc.jugadorId === playerId || (jc.jugador && jc.jugador.id === playerId)
            );

            // 2. Evento de Equipo (Si el evento es para tu equipo, lo ves)
            let isTeamMatch = false;
            if (this.currentTeam) {
                // Extraemos ID del equipo de la convocatoria
                let convTeamId = null;
                if (c.equipo && typeof c.equipo === 'object') convTeamId = c.equipo.id || c.equipo.idEquipo;
                else if (typeof c.equipo === 'number') convTeamId = c.equipo;
                else if (c.idEquipo) convTeamId = c.idEquipo;

                // Extraemos ID de MI equipo
                const myTeamId = this.currentTeam.id || (this.currentTeam as any).idEquipo;

                // Comparamos con '==' para permitir string vs number
                if (convTeamId && myTeamId && convTeamId == myTeamId) {
                    isTeamMatch = true;
                }
            }

            return isExplicitlyInvited || isTeamMatch;
        });
        
        this.processConvocations(playerConvocations);
      },
      error: (error) => console.error('Error loading convocations:', error)
    });
  }

  processConvocations(convocations: Convocation[]) {
    const now = new Date();
    const getDate = (c: any) => new Date(c.fechaHoraInicio || c.fechaEvento);

    // Próximas
    this.upcomingConvocations = convocations.filter(conv => {
      const convDate = getDate(conv);
      return convDate >= now;
    }).sort((a, b) => {
      return getDate(a).getTime() - getDate(b).getTime();
    }).slice(0, 5);

    // Recientes
    this.recentConvocations = convocations
        .filter(conv => getDate(conv) < now)
        .sort((a, b) => {
           return getDate(b).getTime() - getDate(a).getTime();
        })
        .slice(0, 10);

    // Stats Dashboard
    this.stats.totalConvocations = convocations.length;
    this.stats.upcomingConvocations = this.upcomingConvocations.length;
    this.stats.pendingConfirmations = 0; 
    
    const pastConvocations = convocations.length - this.upcomingConvocations.length;
    this.stats.attendanceRate = pastConvocations > 0 ? 100 : 0;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  // --- Helpers Visuales ---

  getPlayerAge(): number {
    const player: any = this.currentPlayer;
    if (!player?.fechaNacimiento) return 0;
    const birth = new Date(player.fechaNacimiento);
    return Math.abs(new Date(Date.now() - birth.getTime()).getUTCFullYear() - 1970);
  }

  getPlayerPosition(): string {
    const player: any = this.currentPlayer;
    return player?.posicion || player?.posicionPrimaria || 'Sin Posición';
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

  getAttendanceStatusColor(status: string): string {
    if (status === 'PENDIENTE' || status === 'NO_CONVOCADO') return 'primary';
    const map: any = { 'CONFIRMADO': 'success', 'RECHAZADO': 'danger' };
    return map[status] || 'primary';
  }

  getAttendanceStatusText(status: string): string {
    if (status === 'PENDIENTE' || status === 'NO_CONVOCADO') return 'Convocado';
    const map: any = { 'CONFIRMADO': 'Asistiré', 'RECHAZADO': 'Baja' };
    return map[status] || 'Convocado';
  }

  confirmAttendance(id: number) { console.log('Confirmar', id); }
  rejectAttendance(id: number) { console.log('Rechazar', id); }
}