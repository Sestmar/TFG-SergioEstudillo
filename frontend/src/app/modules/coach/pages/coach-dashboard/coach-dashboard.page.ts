import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { 
  User, 
  UserRole,
  Team, 
  Player,
  Convocation,
  Incident,
  InscriptionRequest 
} from '@shared/models';
import { 
  AuthService, 
  UserStateService,
  TeamService,
  PlayerService,
  ConvocationService,
  IncidentService,
  RequestService,
  NotificationService 
} from '@core/services';

interface DashboardStats {
  totalPlayers: number;
  activeConvocations: number;
  pendingRequests: number;
  openIncidents: number;
  teamCount: number;
}

interface QuickAction {
  title: string;
  icon: string;
  route: string;
  color: string;
  description: string;
  count?: number;
}

@Component({
  selector: 'app-coach-dashboard',
  templateUrl: './coach-dashboard.page.html',
  styleUrls: ['./coach-dashboard.page.scss'],
})
export class CoachDashboardPage implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  currentUser: User | null = null;
  
  managedTeams: Team[] = [];
  managedPlayers: Player[] = [];
  recentConvocations: Convocation[] = [];
  pendingRequests: InscriptionRequest[] = [];
  openIncidents: Incident[] = [];
  
  stats: DashboardStats = {
    totalPlayers: 0,
    activeConvocations: 0,
    pendingRequests: 0,
    openIncidents: 0,
    teamCount: 0
  };

  quickActions: QuickAction[] = [
    {
      title: 'Mis Equipos',
      icon: 'shield',
      route: '/teams',
      color: 'primary',
      description: 'Gestionar equipos asignados',
      count: 0
    },
    {
      title: 'Mis Jugadores',
      icon: 'people',
      route: '/players',
      color: 'secondary',
      description: 'Ver y gestionar jugadores',
      count: 0
    },
    {
      title: 'Convocatorias',
      icon: 'calendar',
      route: '/convocations',
      color: 'tertiary',
      description: 'Crear y gestionar convocatorias',
      count: 0
    },
    {
      title: 'Incidencias',
      icon: 'medical',
      route: '/incidents',
      color: 'warning',
      description: 'Reportar y gestionar incidencias',
      count: 0
    },
    {
      title: 'Solicitudes',
      icon: 'document-text',
      route: '/requests',
      color: 'success',
      description: 'Revisar solicitudes de inscripción',
      count: 0
    },
    {
      title: 'Estadísticas',
      icon: 'stats-chart',
      route: '/coach/stats',
      color: 'danger',
      description: 'Analizar rendimiento del equipo',
      count: 0
    }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userStateService: UserStateService,
    private teamService: TeamService,
    private playerService: PlayerService,
    private convocationService: ConvocationService,
    private incidentService: IncidentService,
    private requestService: RequestService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.currentUser$ = this.userStateService.getCurrentUserObservable();
  }

  ngOnInit() {
    this.loadCoachData();
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos del entrenador
   */
  private loadCoachData() {
    this.userStateService.loadCurrentUser().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (user) => {
        this.currentUser = user;
        if (user) {
          this.loadManagedTeams(user.id);
        }
      },
      error: (error) => {
        console.error('Error loading coach data:', error);
        this.notificationService.showError('Error al cargar datos del entrenador');
      }
    });
  }

  /**
   * Carga los equipos gestionados por el entrenador
   */
  private loadManagedTeams(userId: number) {
    this.teamService.getAllTeams({ entrenadorId: userId }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.managedTeams = response.teams;
        this.stats.teamCount = response.total;
        this.updateQuickActionCounts();
        
        if (this.managedTeams.length > 0) {
          this.loadTeamData();
        }
      },
      error: (error) => {
        console.error('Error loading managed teams:', error);
      }
    });
  }

  /**
   * Carga los datos de los equipos gestionados
   */
  private loadTeamData() {
    const teamIds = this.managedTeams.map(team => team.id);
    
    // Cargar jugadores de los equipos
    this.loadTeamPlayers(teamIds);
    
    // Cargar convocatorias de los equipos
    this.loadTeamConvocations(teamIds);
  }

  /**
   * Carga los jugadores de los equipos gestionados
   */
  private loadTeamPlayers(teamIds: number[]) {
    const playerObservables = teamIds.map(teamId => 
      this.playerService.getAllPlayers({ equipoId: teamId })
    );
    
    // Combinar todos los observables
    // Nota: En producción, usaría forkJoin o similar
    teamIds.forEach(teamId => {
      this.playerService.getAllPlayers({ equipoId: teamId }).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (response) => {
          this.managedPlayers = [...this.managedPlayers, ...response.players];
          this.stats.totalPlayers = this.managedPlayers.length;
          this.updateQuickActionCounts();
        },
        error: (error) => {
          console.error('Error loading team players:', error);
        }
      });
    });
  }

  /**
   * Carga las convocatorias de los equipos gestionados
   */
  private loadTeamConvocations(teamIds: number[]) {
    const now = new Date();
    const nextMonth = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    teamIds.forEach(teamId => {
      this.convocationService.getTeamConvocations(teamId, {
        fechaInicio: now,
        fechaFin: nextMonth
      }).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (convocations) => {
          this.recentConvocations = [...this.recentConvocations, ...convocations];
          this.stats.activeConvocations = this.recentConvocations.length;
          this.updateQuickActionCounts();
        },
        error: (error) => {
          console.error('Error loading team convocations:', error);
        }
      });
    });
  }

  /**
   * Carga los datos del dashboard
   */
  private loadDashboardData() {
    // Cargar solicitudes pendientes (si es admin o tiene permisos)
    if (this.currentUser && this.hasRole('ADMIN')) {
      this.loadPendingRequests();
    }
    
    // Cargar incidencias abiertas
    this.loadOpenIncidents();
  }

  /**
   * Carga las solicitudes pendientes
   */
  private loadPendingRequests() {
    this.requestService.getPendingRequests().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (requests) => {
        this.pendingRequests = requests;
        this.stats.pendingRequests = requests.length;
        this.updateQuickActionCounts();
      },
      error: (error) => {
        console.error('Error loading pending requests:', error);
      }
    });
  }

  /**
   * Carga las incidencias abiertas
   */
  private loadOpenIncidents() {
    this.incidentService.getOpenIncidents().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (incidents) => {
        this.openIncidents = incidents;
        this.stats.openIncidents = incidents.length;
        this.updateQuickActionCounts();
      },
      error: (error) => {
        console.error('Error loading open incidents:', error);
      }
    });
  }

  /**
   * Actualiza los contadores de las acciones rápidas
   */
  private updateQuickActionCounts() {
    this.quickActions = this.quickActions.map(action => {
      switch (action.route) {
        case '/teams':
          return { ...action, count: this.stats.teamCount };
        case '/players':
          return { ...action, count: this.stats.totalPlayers };
        case '/convocations':
          return { ...action, count: this.stats.activeConvocations };
        case '/incidents':
          return { ...action, count: this.stats.openIncidents };
        case '/requests':
          return { ...action, count: this.stats.pendingRequests };
        default:
          return action;
      }
    });
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    return this.currentUser?.roles?.includes(role) || false;
  }

  /**
   * Navega a una ruta específica
   */
  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  /**
   * Crea una nueva convocatoria
   */
  createConvocation() {
    this.router.navigate(['/convocations/create']);
  }

  /**
   * Reporta una incidencia
   */
  reportIncident() {
    this.router.navigate(['/incidents/create']);
  }

  /**
   * Gestiona las solicitudes pendientes
   */
  manageRequests() {
    this.router.navigate(['/requests']);
  }

  /**
   * Obtiene el color del tipo de convocatoria
   */
  getConvocationTypeColor(type: string): string {
    switch (type) {
      case 'PARTIDO_OFICIAL':
        return 'danger';
      case 'PARTIDO_AMISTOSO':
        return 'warning';
      case 'ENTRENAMIENTO':
        return 'primary';
      case 'CONCENTRACION':
        return 'secondary';
      default:
        return 'medium';
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
   * Obtiene la duración de una convocatoria
   */
  getDuration(startDate: Date, endDate: Date): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}min`;
    } else {
      return `${diffMinutes}min`;
    }
  }

  /**
   * Obtiene el estado de una convocatoria
   */
  getConvocationStatus(convocation: Convocation): string {
    const now = new Date();
    const startDate = new Date(convocation.fechaHoraInicio);
    const endDate = new Date(convocation.fechaHoraFin);
    
    if (now < startDate) {
      return 'Próximo';
    } else if (now >= startDate && now <= endDate) {
      return 'En curso';
    } else {
      return 'Finalizado';
    }
  }

  /**
   * Obtiene el color del estado de una convocatoria
   */
  getConvocationStatusColor(status: string): string {
    switch (status) {
      case 'Próximo':
        return 'primary';
      case 'En curso':
        return 'success';
      case 'Finalizado':
        return 'medium';
      default:
        return 'medium';
    }
  }

  /**
   * Obtiene el estado de una solicitud
   */
  getRequestStatusInfo(status: string): { text: string; color: string } {
    const statusMap: { [key: string]: { text: string; color: string } } = {
      'PENDIENTE': { text: 'Pendiente', color: 'warning' },
      'EN_REVISION': { text: 'En Revisión', color: 'primary' },
      'APROBADA': { text: 'Aprobada', color: 'success' },
      'RECHAZADA': { text: 'Rechazada', color: 'danger' },
      'CANCELADA': { text: 'Cancelada', color: 'medium' }
    };
    
    return statusMap[status] || { text: status, color: 'medium' };
  }

  /**
   * Obtiene la gravedad de una incidencia
   */
  getIncidentSeverityInfo(severity: string): { text: string; color: string } {
    switch (severity) {
      case 'LEVE':
        return { text: 'Leve', color: 'success' };
      case 'MODERADO':
        return { text: 'Moderado', color: 'warning' };
      case 'GRAVE':
        return { text: 'Grave', color: 'danger' };
      case 'CRITICO':
        return { text: 'Crítico', color: 'danger' };
      default:
        return { text: severity, color: 'medium' };
    }
  }

  /**
   * Calcula el tiempo transcurrido desde una fecha
   */
  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 0) {
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
      return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return 'Reciente';
    }
  }
}