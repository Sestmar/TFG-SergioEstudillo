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
// ✅ NUEVO IMPORT
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
    { title: 'Convocatorias', icon: 'calendar', route: '/convocations', color: 'primary', description: 'Gestionar asistencia' },
    { title: 'Mi Equipo', icon: 'shield', route: '/teams', color: 'secondary', description: 'Ver plantilla' },
    { title: 'Mi Perfil', icon: 'person', route: '/profile', color: 'tertiary', description: 'Datos personales' },
    { title: 'Estadísticas', icon: 'bar-chart', route: '/player/stats', color: 'success', description: 'Rendimiento' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private playerService: PlayerService,
    private teamService: TeamService, // ✅ INYECCIÓN DEL SERVICIO DE EQUIPOS
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
        this.notificationService.showError('Error al cargar datos del usuario');
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
          
          // --- LÓGICA DE RESOLUCIÓN DE EQUIPO ---
          const playerAny = this.currentPlayer as any;
          
          if (playerAny.equipo) {
            // Caso A: El backend envió el objeto completo
            this.currentTeam = playerAny.equipo;
          } else if (playerAny.equipoActual) {
            // Caso B: Variante de nombre
            this.currentTeam = playerAny.equipoActual;
          } else if (playerAny.equipoPrincipal) {
            // ✅ Caso C: Solo tenemos el ID (23). Buscamos el nombre.
            this.teamService.getTeamById(playerAny.equipoPrincipal).subscribe({
              next: (team) => {
                this.currentTeam = team;
                console.log('Nombre de equipo resuelto:', team.nombre);
              },
              error: (err) => console.error('No se pudo resolver el nombre del equipo', err)
            });
          }
          // --------------------------------------

          if (this.currentPlayer) {
            const playerId = (this.currentPlayer as any).idJugador || this.currentPlayer.id;
            this.loadPlayerStats(playerId);
            this.loadPlayerConvocations(playerId);
          }
        }
      }
    });
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
        
        const playerConvocations = allConvocations.filter((c: any) => 
            c.jugadoresConvocados?.some((jc: any) => jc.jugadorId === playerId || jc.jugador?.id === playerId)
        );
        
        this.processConvocations(playerConvocations);
      },
      error: (error) => console.error('Error loading convocations:', error)
    });
  }

  processConvocations(convocations: Convocation[]) {
    const now = new Date();
    
    this.upcomingConvocations = convocations.filter(conv => {
      const convDate = new Date(conv.fechaHoraInicio);
      return convDate >= now;
    }).sort((a, b) => new Date(a.fechaHoraInicio).getTime() - new Date(b.fechaHoraInicio).getTime()).slice(0, 5);

    this.recentConvocations = convocations
        .sort((a, b) => new Date(b.fechaHoraInicio).getTime() - new Date(a.fechaHoraInicio).getTime())
        .slice(0, 10);

    this.stats.totalConvocations = convocations.length;
    this.stats.upcomingConvocations = this.upcomingConvocations.length;
    
    this.stats.pendingConfirmations = convocations.filter(conv => {
      const playerId = this.currentPlayer ? (this.currentPlayer as any).idJugador || this.currentPlayer.id : 0;
      const convokedPlayer = conv.jugadoresConvocados?.find((jc: any) => 
        (jc.jugadorId === playerId) || (jc.jugador && jc.jugador.id === playerId)
      );
      return convokedPlayer && (convokedPlayer as any).estadoAsistencia === 'PENDIENTE';
    }).length;

    const confirmedConvocations = convocations.filter(conv => {
      const playerId = this.currentPlayer ? (this.currentPlayer as any).idJugador || this.currentPlayer.id : 0;
      const convokedPlayer = conv.jugadoresConvocados?.find((jc: any) => 
        (jc.jugadorId === playerId) || (jc.jugador && jc.jugador.id === playerId)
      );
      return convokedPlayer && (convokedPlayer as any).estadoAsistencia === 'CONFIRMADO';
    }).length;
    
    const pastConvocations = convocations.filter(c => new Date(c.fechaHoraFin) < now).length;
    
    this.stats.attendanceRate = pastConvocations > 0 
      ? Math.round((confirmedConvocations / pastConvocations) * 100)
      : 0;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  // --- Métodos Auxiliares de Vista ---

  getPlayerAge(): number {
    const player: any = this.currentPlayer;
    if (!player?.fechaNacimiento) return 0;
    
    const birth = new Date(player.fechaNacimiento);
    const ageDifMs = Date.now() - birth.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  getPlayerPosition(): string {
    const player: any = this.currentPlayer;
    return player?.posicion || 'Sin Posición';
  }

  isPlayerAvailable(): boolean {
    const player: any = this.currentPlayer;
    // Comprobamos 'estado' (ACTIVO) o 'disponible' (true)
    return player?.estado === 'ACTIVO' || player?.disponible === true;
  }
  
  getDuration(start: string | Date, end: string | Date): string {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  
  getConvocationTypeColor(type: string): string {
      const map: any = { 'PARTIDO': 'success', 'ENTRENAMIENTO': 'primary', 'EVENTO': 'warning' };
      return map[type] || 'medium';
  }
  
  formatConvocationDate(date: string | Date): string {
      return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' });
  }
  
  getPlayerAttendanceStatus(convocation: Convocation): string {
    if (!this.currentPlayer) return 'DESCONOCIDO';
    const playerId = (this.currentPlayer as any).idJugador || this.currentPlayer.id;
    
    const jc = convocation.jugadoresConvocados?.find((j: any) => 
      j.jugadorId === playerId || (j.jugador && j.jugador.id === playerId)
    );
    return jc ? (jc as any).estadoAsistencia : 'NO_CONVOCADO';
  }

  getAttendanceStatusColor(status: string): string {
    const map: any = { 'CONFIRMADO': 'success', 'RECHAZADO': 'danger', 'PENDIENTE': 'warning' };
    return map[status] || 'medium';
  }

  getAttendanceStatusText(status: string): string {
    const map: any = { 'CONFIRMADO': 'Asistiré', 'RECHAZADO': 'No voy', 'PENDIENTE': 'Pendiente' };
    return map[status] || status;
  }

  confirmAttendance(id: number) { console.log('Confirmar', id); }
  rejectAttendance(id: number) { console.log('Rechazar', id); }
}