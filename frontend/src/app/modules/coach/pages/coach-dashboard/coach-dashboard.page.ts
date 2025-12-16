import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';

// CORRECCIÓN 1: Usar UserService directamente si UserStateService no existe
import { UserService } from 'src/app/core/services/user/user.service';

import { 
  User, 
  UserRole,
  Team, 
  Player,
  Convocation,
  Incident,
  InscriptionRequest 
} from 'src/app/shared/models/models'; // CORRECCIÓN 2: Ruta segura a models

import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { ConvocationService } from 'src/app/core/services/convocation/convocation.service';
import { IncidentService } from 'src/app/core/services/incident/incident.service';
import { RequestService } from 'src/app/core/services/request/request.service'; // O inscription/inscription.service
import { NotificationService } from 'src/app/core/services/notification/notification.service';

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
    { title: 'Mis Equipos', icon: 'shield', route: '/teams', color: 'primary', description: 'Gestionar equipos asignados', count: 0 },
    { title: 'Mis Jugadores', icon: 'people', route: '/players', color: 'secondary', description: 'Ver y gestionar jugadores', count: 0 },
    { title: 'Convocatorias', icon: 'calendar', route: '/convocations', color: 'tertiary', description: 'Crear y gestionar convocatorias', count: 0 },
    { title: 'Incidencias', icon: 'medical', route: '/incidents', color: 'warning', description: 'Reportar y gestionar incidencias', count: 0 },
    { title: 'Solicitudes', icon: 'document-text', route: '/requests', color: 'success', description: 'Revisar solicitudes de inscripción', count: 0 },
    { title: 'Estadísticas', icon: 'stats-chart', route: '/coach/stats', color: 'danger', description: 'Analizar rendimiento del equipo', count: 0 }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userService: UserService, // CORRECCIÓN 3: Inyectar UserService
    private teamService: TeamService,
    private playerService: PlayerService,
    private convocationService: ConvocationService,
    private incidentService: IncidentService,
    private requestService: RequestService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    // Si UserService no tiene getCurrentUserObservable, usa authService o un BehaviorSubject propio
    // Asumimos que authService tiene el user actual
    this.currentUser$ = this.authService.currentUser$; 
  }

  ngOnInit() {
    this.loadCoachData();
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCoachData() {
    // Si userService.getUserProfile() no existe, ajusta al método real
    this.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
        this.currentUser = user;
        if (user) {
            this.loadManagedTeams(user.idUsuario);
        }
    });
  }

  private loadManagedTeams(userId: number) {
    // CORRECCIÓN 4: Usar getTeams en vez de getAllTeams
    this.teamService.getTeams({ entrenadorId: userId }).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
          console.error('Error loading teams', err);
          return of({ teams: [], total: 0 });
      })
    ).subscribe((response: any) => {
        // CORRECCIÓN 5: Manejar respuesta paginada o array directo
        const teams = Array.isArray(response) ? response : (response.teams || []);
        this.managedTeams = teams;
        this.stats.teamCount = teams.length;
        this.updateQuickActionCounts();
        
        if (this.managedTeams.length > 0) {
          this.loadTeamData();
        }
    });
  }

  private loadTeamData() {
    const teamIds = this.managedTeams.map(team => team.id);
    this.loadTeamPlayers(teamIds);
    this.loadTeamConvocations(teamIds);
  }

  private loadTeamPlayers(teamIds: number[]) {
    teamIds.forEach(teamId => {
      // CORRECCIÓN 6: Usar getPlayers en vez de getAllPlayers si es necesario
      this.playerService.getAllPlayers({ equipoId: teamId }).pipe(
        takeUntil(this.destroy$)
      ).subscribe((response: any) => {
          const players = Array.isArray(response) ? response : (response.players || []);
          this.managedPlayers = [...this.managedPlayers, ...players];
          // Eliminar duplicados si es necesario
          this.stats.totalPlayers = this.managedPlayers.length;
          this.updateQuickActionCounts();
      });
    });
  }

  private loadTeamConvocations(teamIds: number[]) {
    const now = new Date();
    const nextMonth = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    teamIds.forEach(teamId => {
      // CORRECCIÓN 7: Usar getConvocations en vez de getTeamConvocations
      // Y pasar parámetros correctamente
      this.convocationService.getConvocations().pipe( 
        // Si tu servicio requiere teamId, ajusta: getConvocations(teamId)
        takeUntil(this.destroy$),
        map((res: any) => {
            // Filtrar manualmente si el backend devuelve todo
            const allConvocations = Array.isArray(res) ? res : (res.convocations || []);
            return allConvocations.filter((c: any) => c.equipoId === teamId);
        })
      ).subscribe((convocations: any[]) => {
          this.recentConvocations = [...this.recentConvocations, ...convocations];
          this.stats.activeConvocations = this.recentConvocations.length;
          this.updateQuickActionCounts();
      });
    });
  }

  private loadDashboardData() {
    if (this.currentUser && this.hasRole('ADMIN')) {
      this.loadPendingRequests();
    }
    this.loadOpenIncidents();
  }

  private loadPendingRequests() {
    // Ajusta getRequests según tu servicio
    this.requestService.getAllRequests({ estado: 'PENDIENTE' }).pipe(
      takeUntil(this.destroy$)
    ).subscribe((response: any) => {
        const requests = Array.isArray(response) ? response : (response.requests || []);
        this.pendingRequests = requests;
        this.stats.pendingRequests = requests.length;
        this.updateQuickActionCounts();
    });
  }

  private loadOpenIncidents() {
    // Ajusta getIncidents según tu servicio
    this.incidentService.getAllIncidents({ estado: 'ABIERTA' }).pipe(
      takeUntil(this.destroy$)
    ).subscribe((response: any) => {
        const incidents = Array.isArray(response) ? response : (response.incidents || []);
        this.openIncidents = incidents;
        this.stats.openIncidents = incidents.length;
        this.updateQuickActionCounts();
    });
  }

  private updateQuickActionCounts() {
    this.quickActions = this.quickActions.map(action => {
      switch (action.route) {
        case '/teams': return { ...action, count: this.stats.teamCount };
        case '/players': return { ...action, count: this.stats.totalPlayers };
        case '/convocations': return { ...action, count: this.stats.activeConvocations };
        case '/incidents': return { ...action, count: this.stats.openIncidents };
        case '/requests': return { ...action, count: this.stats.pendingRequests };
        default: return action;
      }
    });
  }

  hasRole(role: string): boolean {
    return (this.currentUser as any)?.role === role || (this.currentUser as any)?.roles?.includes(role) || false;
  }

  navigateTo(route: string) { this.router.navigate([route]); }
  createConvocation() { this.router.navigate(['/convocations/create']); }
  reportIncident() { this.router.navigate(['/incidents/create']); }
  manageRequests() { this.router.navigate(['/requests']); }

  getConvocationTypeColor(type: string): string {
    const colors: any = { 'PARTIDO_OFICIAL': 'danger', 'PARTIDO_AMISTOSO': 'warning', 'ENTRENAMIENTO': 'primary', 'CONCENTRACION': 'secondary' };
    return colors[type] || 'medium';
  }

  formatConvocationDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  getDuration(startDate: string | Date, endDate: string | Date): string {
    const diffMs = new Date(endDate).getTime() - new Date(startDate).getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMinutes = Math.floor((diffMs % 3600000) / 60000);
    return diffHours > 0 ? `${diffHours}h ${diffMinutes}min` : `${diffMinutes}min`;
  }

  getConvocationStatus(convocation: Convocation): string {
    const now = new Date();
    const start = new Date(convocation.fechaHoraInicio);
    const end = new Date(convocation.fechaHoraFin);
    if (now < start) return 'Próximo';
    if (now >= start && now <= end) return 'En curso';
    return 'Finalizado';
  }

  getConvocationStatusColor(status: string): string {
    return { 'Próximo': 'primary', 'En curso': 'success', 'Finalizado': 'medium' }[status] || 'medium';
  }

  getRequestStatusInfo(status: string): { text: string; color: string } {
    const map: any = { 
      'PENDIENTE': { text: 'Pendiente', color: 'warning' }, 
      'APROBADA': { text: 'Aprobada', color: 'success' }, 
      'RECHAZADA': { text: 'Rechazada', color: 'danger' } 
    };
    return map[status] || { text: status, color: 'medium' };
  }

  getIncidentSeverityInfo(severity: string): { text: string; color: string } {
    const map: any = { 'LEVE': 'success', 'MODERADO': 'warning', 'GRAVE': 'danger', 'CRITICO': 'danger' };
    return { text: severity, color: map[severity] || 'medium' };
  }

  getTimeAgo(date: string | Date): string {
    const diffMs = new Date().getTime() - new Date(date).getTime();
    const days = Math.floor(diffMs / 86400000);
    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    return 'Reciente';
  }
}
