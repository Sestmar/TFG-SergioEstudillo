import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';

import { 
  User, 
  UserRole, 
  Team, 
  Convocation, 
  InscriptionRequest 
} from '@shared/models';
import { 
  AuthService, 
  UserStateService, 
  TeamStateService,
  ConvocationService,
  RequestService,
  NotificationService 
} from '@core/services';

interface DashboardStats {
  totalTeams: number;
  upcomingConvocations: number;
  pendingRequests: number;
  totalPlayers: number;
}

interface QuickAction {
  title: string;
  icon: string;
  route: string;
  color: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  userRole$: Observable<UserRole | null>;
  
  stats: DashboardStats = {
    totalTeams: 0,
    upcomingConvocations: 0,
    pendingRequests: 0,
    totalPlayers: 0
  };

  recentConvocations: Convocation[] = [];
  recentRequests: InscriptionRequest[] = [];
  
  quickActions: QuickAction[] = [
    {
      title: 'Mis Equipos',
      icon: 'shield',
      route: '/teams',
      color: 'primary',
      roles: ['JUGADOR', 'ENTRENADOR', 'ADMIN']
    },
    {
      title: 'Convocatorias',
      icon: 'calendar',
      route: '/convocations',
      color: 'secondary',
      roles: ['JUGADOR', 'ENTRENADOR', 'ADMIN']
    },
    {
      title: 'Solicitudes',
      icon: 'document-text',
      route: '/requests',
      color: 'tertiary',
      roles: ['ADMIN']
    },
    {
      title: 'Incidencias',
      icon: 'warning',
      route: '/incidents',
      color: 'warning',
      roles: ['ENTRENADOR', 'ADMIN']
    },
    {
      title: 'Jugadores',
      icon: 'people',
      route: '/players',
      color: 'success',
      roles: ['ENTRENADOR', 'ADMIN']
    },
    {
      title: 'Panel Admin',
      icon: 'settings',
      route: '/admin',
      color: 'danger',
      roles: ['ADMIN']
    }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userStateService: UserStateService,
    private teamStateService: TeamStateService,
    private convocationService: ConvocationService,
    private requestService: RequestService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.currentUser$ = this.userStateService.getCurrentUserObservable();
    this.userRole$ = this.currentUser$.pipe(
      map(user => {
        if (!user?.roles?.length) return null;
        return user.roles[0] as UserRole;
      })
    );
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga los datos del dashboard
   */
  private loadDashboardData() {
    this.loadUserData();
    this.loadStats();
    this.loadRecentData();
  }

  /**
   * Carga los datos del usuario
   */
  private loadUserData() {
    this.userStateService.loadCurrentUser().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      error: (error) => {
        console.error('Error loading user data:', error);
        this.notificationService.showError('Error al cargar datos del usuario');
      }
    });
  }

  /**
   * Carga las estadísticas del dashboard
   */
  private loadStats() {
    // Cargar equipos
    this.teamStateService.loadAllTeams().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.stats.totalTeams = response.total;
      },
      error: (error) => {
        console.error('Error loading teams:', error);
      }
    });

    // Cargar convocatorias próximas
    this.convocationService.getUpcomingConvocations(7).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (convocations) => {
        this.stats.upcomingConvocations = convocations.length;
        this.recentConvocations = convocations.slice(0, 3);
      },
      error: (error) => {
        console.error('Error loading convocations:', error);
      }
    });

    // Cargar solicitudes pendientes (solo admin)
    this.userStateService.hasRole('ADMIN').pipe(
      takeUntil(this.destroy$)
    ).subscribe(hasAdminRole => {
      if (hasAdminRole) {
        this.requestService.getPendingRequests().pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (requests) => {
            this.stats.pendingRequests = requests.length;
            this.recentRequests = requests.slice(0, 3);
          },
          error: (error) => {
            console.error('Error loading requests:', error);
          }
        });
      }
    });
  }

  /**
   * Carga datos recientes según el rol del usuario
   */
  private loadRecentData() {
    // Cargar datos específicos según el rol
    this.userRole$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(role => {
      if (role === 'JUGADOR') {
        this.loadPlayerData();
      } else if (role === 'ENTRENADOR') {
        this.loadCoachData();
      } else if (role === 'ADMIN') {
        this.loadAdminData();
      }
    });
  }

  /**
   * Carga datos específicos para jugadores
   */
  private loadPlayerData() {
    // Cargar convocatorias del jugador
    const userId = this.userStateService.getCurrentUserId();
    if (userId) {
      this.convocationService.getPlayerConvocations(userId, { 
        estado: 'PROGRAMADA' 
      }).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (convocations) => {
          this.recentConvocations = convocations.slice(0, 3);
        },
        error: (error) => {
          console.error('Error loading player convocations:', error);
        }
      });
    }
  }

  /**
   * Carga datos específicos para entrenadores
   */
  private loadCoachData() {
    // Lógica específica para entrenadores
    this.stats.totalPlayers = 25; // Esto vendría del servicio
  }

  /**
   * Carga datos específicos para administradores
   */
  private loadAdminData() {
    // Lógica específica para administradores
    this.stats.totalPlayers = 200; // Esto vendría del servicio
  }

  /**
   * Obtiene las acciones rápidas filtradas por rol
   */
  getFilteredQuickActions(role: UserRole | null): QuickAction[] {
    if (!role) return [];
    return this.quickActions.filter(action => 
      action.roles.includes(role)
    );
  }

  /**
   * Navega a una ruta específica
   */
  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  /**
   * Formatea la fecha de una convocatoria
   */
  formatConvocationDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }

  /**
   * Obtiene el estado de una solicitud con color
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
}