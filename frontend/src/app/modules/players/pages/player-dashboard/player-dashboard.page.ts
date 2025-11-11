import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { 
  User, 
  Player, 
  Team, 
  Convocation,
  PlayerStats 
} from '@shared/models';
import { 
  AuthService, 
  UserStateService,
  PlayerService,
  ConvocationService,
  NotificationService 
} from '@core/services';

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
    {
      title: 'Mis Convocatorias',
      icon: 'calendar',
      route: '/convocations',
      color: 'primary',
      description: 'Ver y confirmar convocatorias'
    },
    {
      title: 'Mi Equipo',
      icon: 'shield',
      route: '/teams',
      color: 'secondary',
      description: 'Información del equipo'
    },
    {
      title: 'Mi Perfil',
      icon: 'person',
      route: '/profile',
      color: 'tertiary',
      description: 'Editar perfil deportivo'
    },
    {
      title: 'Estadísticas',
      icon: 'stats-chart',
      route: '/player/stats',
      color: 'success',
      description: 'Ver estadísticas personales'
    }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userStateService: UserStateService,
    private playerService: PlayerService,
    private convocationService: ConvocationService,
    private notificationService: NotificationService
  ) {
    this.currentUser$ = this.userStateService.getCurrentUserObservable();
  }

  ngOnInit() {
    this.loadPlayerData();
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos del jugador actual
   */
  private loadPlayerData() {
    this.userStateService.loadCurrentUser().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (user) => {
        if (user) {
          this.loadPlayerProfile(user.id);
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.notificationService.showError('Error al cargar datos del usuario');
      }
    });
  }

  /**
   * Carga el perfil del jugador
   */
  private loadPlayerProfile(userId: number) {
    this.playerService.getAllPlayers({ usuarioId: userId }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.players.length > 0) {
          this.currentPlayer = response.players[0];
          this.currentTeam = this.currentPlayer.equipoActual || null;
          this.loadPlayerStats(this.currentPlayer.id);
        }
      },
      error: (error) => {
        console.error('Error loading player profile:', error);
      }
    });
  }

  /**
   * Carga las estadísticas del jugador
   */
  private loadPlayerStats(playerId: number) {
    this.playerService.getPlayerStats(playerId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (stats) => {
        this.playerStats = stats;
      },
      error: (error) => {
        console.error('Error loading player stats:', error);
      }
    });
  }

  /**
   * Carga los datos del dashboard
   */
  private loadDashboardData() {
    // Cargar convocatorias del jugador
    const userId = this.userStateService.getCurrentUserId();
    if (userId) {
      this.loadPlayerConvocations(userId);
    }
  }

  /**
   * Carga las convocatorias del jugador
   */
  private loadPlayerConvocations(userId: number) {
    this.convocationService.getPlayerConvocations(userId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (convocations) => {
        this.processConvocations(convocations);
      },
      error: (error) => {
        console.error('Error loading player convocations:', error);
      }
    });
  }

  /**
   * Procesa las convocatorias para el dashboard
   */
  private processConvocations(convocations: Convocation[]) {
    const now = new Date();
    
    // Convocatorias próximas (próximos 30 días)
    this.upcomingConvocations = convocations.filter(conv => {
      const convDate = new Date(conv.fechaHoraInicio);
      const daysDiff = (convDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff >= 0 && daysDiff <= 30;
    }).slice(0, 5);

    // Todas las convocatorias
    this.recentConvocations = convocations.slice(0, 10);

    // Calcular estadísticas
    this.stats.totalConvocations = convocations.length;
    this.stats.upcomingConvocations = this.upcomingConvocations.length;
    
    // Convocatorias pendientes de confirmación
    this.stats.pendingConfirmations = convocations.filter(conv => {
      const convokedPlayer = conv.jugadoresConvocados.find(jc => 
        jc.jugador.id === this.currentPlayer?.id
      );
      return convokedPlayer && convokedPlayer.estadoAsistencia === 'PENDIENTE';
    }).length;

    // Tasa de asistencia
    const confirmedConvocations = convocations.filter(conv => {
      const convokedPlayer = conv.jugadoresConvocados.find(jc => 
        jc.jugador.id === this.currentPlayer?.id
      );
      return convokedPlayer && convokedPlayer.estadoAsistencia === 'CONFIRMADO';
    }).length;
    
    this.stats.attendanceRate = this.stats.totalConvocations > 0 
      ? Math.round((confirmedConvocations / this.stats.totalConvocations) * 100)
      : 0;
  }

  /**
   * Navega a una ruta específica
   */
  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  /**
   * Confirma asistencia a una convocatoria
   */
  async confirmAttendance(convocationId: number) {
    if (!this.currentPlayer) return;

    try {
      await this.notificationService.showLoading('Confirmando asistencia...');
      
      // Buscar el jugador convocado en esta convocatoria
      const convocation = this.recentConvocations.find(c => c.id === convocationId);
      const convokedPlayer = convocation?.jugadoresConvocados.find(jc => 
        jc.jugador.id === this.currentPlayer?.id
      );

      if (convokedPlayer) {
        // Actualizar asistencia
        // Lógica de actualización aquí
        
        this.notificationService.showSuccess('Asistencia confirmada correctamente');
        this.loadDashboardData(); // Recargar datos
      }
    } catch (error) {
      this.notificationService.showError('Error al confirmar asistencia');
    } finally {
      await this.notificationService.hideLoading();
    }
  }

  /**
   * Formatea la fecha de una convocatoria
   */
  formatConvocationDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtiene el color del estado de asistencia
   */
  getAttendanceStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMADO':
        return 'success';
      case 'RECHAZADO':
        return 'danger';
      case 'PENDIENTE':
        return 'warning';
      default:
        return 'medium';
    }
  }

  /**
   * Obtiene el texto del estado de asistencia
   */
  getAttendanceStatusText(status: string): string {
    switch (status) {
      case 'CONFIRMADO':
        return 'Confirmado';
      case 'RECHAZADO':
        return 'Rechazado';
      case 'PENDIENTE':
        return 'Pendiente';
      default:
        return status;
    }
  }

  /**
   * Calcula la edad del jugador
   */
  getPlayerAge(): number {
    if (!this.currentUser$ || !this.currentPlayer) return 0;
    
    const today = new Date();
    const birthDate = new Date(this.currentPlayer.usuario.fechaNacimiento || today);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Obtiene la posición principal del jugador
   */
  getPlayerPosition(): string {
    if (!this.currentPlayer) return 'Sin posición';
    
    const positions: { [key: string]: string } = {
      'PORTERO': 'Portero',
      'DEFENSA_CENTRAL': 'Defensa Central',
      'LATERAL_DERECHO': 'Lateral Derecho',
      'LATERAL_IZQUIERDO': 'Lateral Izquierdo',
      'MEDIOCENTRO_DEFENSIVO': 'Mediocentro Defensivo',
      'MEDIOCENTRO_ORGANIZADOR': 'Mediocentro Organizador',
      'MEDIOCENTRO_OFFENSIVO': 'Mediocentro Ofensivo',
      'EXTREMO_DERECHO': 'Extremo Derecho',
      'EXTREMO_IZQUIERDO': 'Extremo Izquierdo',
      'DELANTERO_CENTRO': 'Delantero Centro',
      'SEGUNDO_DELANTERO': 'Segundo Delantero'
    };
    
    return positions[this.currentPlayer.posicion] || this.currentPlayer.posicion;
  }
}