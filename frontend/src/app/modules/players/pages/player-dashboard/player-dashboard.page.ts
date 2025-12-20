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
    { title: 'Mi Equipo', icon: 'shield', route: '/coach/my-team', color: 'secondary', description: 'Ver plantilla' }, // Ajustado si quieres ver la lista
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
    // Solicitamos TODOS los jugadores y filtramos en el cliente para asegurar
    // que encontramos al correcto, ignorando si el backend no filtra bien.
    this.playerService.getAllPlayers().pipe(
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
          // ✅ CORRECCIÓN CLAVE: Buscamos específicamente el jugador cuyo usuario ID coincide
          const foundPlayer = players.find((p: any) => {
             const pUserId = p.usuario?.id || p.usuario?.idUsuario || p.idUsuario;
             return pUserId === userId;
          });

          if (foundPlayer) {
            this.currentPlayer = foundPlayer;
            
            // --- LÓGICA DE EQUIPO ---
            const playerAny = this.currentPlayer as any;
            
            // 1. Intentamos obtener el equipo del objeto jugador
            if (playerAny.equipo) {
              this.currentTeam = playerAny.equipo;
            } else if (playerAny.equipoActual) {
              this.currentTeam = playerAny.equipoActual;
            } 
            // 2. Si solo tenemos el ID, lo buscamos
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
              return; // Salimos para esperar a que cargue el equipo
            }

            this.loadDataAfterTeamLoaded();
          } else {
            console.error("No se encontró ficha de jugador para este usuario: " + userId);
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
    // Aseguramos que el método existe en el servicio antes de llamarlo
    if (this.playerService.getPlayerStats) {
        this.playerService.getPlayerStats(playerId).pipe(takeUntil(this.destroy$)).subscribe({
          next: (stats: PlayerStats) => this.playerStats = stats,
          error: (err: any) => console.log('Stats no disponibles aún (mockeadas o error 404 controlado)')
        });
    }
  }

  private loadPlayerConvocations(playerId: number) { 
    this.convocationService.getConvocations().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        let allConvocations = Array.isArray(response) ? response : (response.convocations || response.data || []);
        
        // Filtrado inteligente: Team-First + Invitaciones explícitas
        const playerConvocations = allConvocations.filter((c: any) => {
            // A. ¿Está explícitamente en la lista?
            const isExplicitlyInvited = c.jugadoresConvocados?.some((jc: any) => 
              jc.jugadorId === playerId || (jc.jugador && jc.jugador.id === playerId)
            );

            // B. ¿Es un evento de su equipo?
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
    
    // Helper para fechas
    const getDate = (c: any) => new Date(c.fechaHoraInicio || c.fechaEvento);

    // Próximas
    this.upcomingConvocations = convocations.filter(conv => {
      const convDate = getDate(conv);
      return convDate >= now;
    }).sort((a, b) => {
      return getDate(a).getTime() - getDate(b).getTime();
    }).slice(0, 5);

    // Recientes/Pasadas
    this.recentConvocations = convocations
        .filter(conv => getDate(conv) < now)
        .sort((a, b) => {
           return getDate(b).getTime() - getDate(a).getTime();
        })
        .slice(0, 10);

    // Cálculo de DashboardStats
    this.stats.totalConvocations = convocations.length;
    this.stats.upcomingConvocations = this.upcomingConvocations.length;
    this.stats.pendingConfirmations = 0; // Simplificado: ya no pedimos confirmación manual obligatoria
    
    const pastConvocations = convocations.length - this.upcomingConvocations.length;
    // Mock de asistencia al 100% por ahora
    this.stats.attendanceRate = pastConvocations > 0 ? 100 : 0;
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
    // Soporte para ambos nombres de campo
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