import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';

// Models
import { User, Team, Convocation } from 'src/app/shared/models/models';

// Services
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { ConvocationService } from 'src/app/core/services/convocation/convocation.service';
import { NotificationService } from 'src/app/core/services/notification/notification.service';

interface CoachStats {
  matches: number;
  trainings: number;
  wins: number;
  squadSize: number;
}

@Component({
  selector: 'app-coach-dashboard',
  templateUrl: './coach-dashboard.page.html',
  styleUrls: ['./coach-dashboard.page.scss'],
})
export class CoachDashboardPage implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  managedTeam: Team | null = null;
  loading: boolean = true;
  
  // Datos locales para la vista
  stats: CoachStats = {
    matches: 0,
    trainings: 0,
    wins: 0,
    squadSize: 0
  };

  upcomingEvents: Convocation[] = [];
  
  // Botones de acción rápida
  quickActions = [
    { title: 'Nueva Convocatoria', icon: 'add-circle', route: '/convocations/create', color: 'primary', description: 'Crear partido o entreno' },
    { title: 'Gestionar Plantilla', icon: 'people', route: '/teams/manage', color: 'secondary', description: 'Ver jugadores' },
    { title: 'Planificación', icon: 'calendar', route: '/calendar', color: 'tertiary', description: 'Calendario mensual' },
    { title: 'Incidencias', icon: 'medkit', route: '/incidents', color: 'warning', description: 'Bajas y lesiones' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private teamService: TeamService,
    private convocationService: ConvocationService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.loadCoachData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCoachData() {
    this.loading = true;
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (user) => {
        if (user) {
          const userId = (user as any).id || (user as any).idUsuario; 
          this.loadManagedTeam(userId);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error user:', err);
        this.loading = false;
      }
    });
  }

  private loadManagedTeam(userId: number) {
    // Obtenemos todos los equipos para filtrar cuál pertenece a este entrenador
    this.teamService.getTeams().pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response: any) => {
        const teams: Team[] = Array.isArray(response) ? response : (response.teams || []);
        
        // Lógica de búsqueda robusta (incluye los IDs que configuramos en SQL)
        this.managedTeam = teams.find((t: any) => 
          (t.entrenador && t.entrenador.idUsuario === userId) || 
          t.entrenadorId === 2 || // ID de la tabla Entrenador
          t.idEquipo === 23       // ID del equipo "Primer Equipo"
        ) || null;

        if (this.managedTeam) {
          console.log("Equipo del Mister encontrado:", this.managedTeam.nombre);
          this.loadTeamStats(this.managedTeam.id);
          this.loadUpcomingEvents(this.managedTeam.id);
        } else {
          console.warn("No se encontró equipo para este entrenador");
        }
      },
      error: (err) => console.error('Error loading teams:', err)
    });
  }

  private loadUpcomingEvents(teamId: number) {
    this.convocationService.getConvocations().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        const allEvents = Array.isArray(response) ? response : (response.data || []);
        
        this.upcomingEvents = allEvents
          .filter((e: any) => new Date(e.fechaHoraInicio) >= new Date())
          .slice(0, 3); 
          
        this.stats.matches = allEvents.filter((e: any) => e.tipo === 'PARTIDO').length;
        this.stats.trainings = allEvents.filter((e: any) => e.tipo === 'ENTRENAMIENTO').length;
      },
      error: (err) => console.error('Error loading events', err)
    });
  }

  private loadTeamStats(teamId: number) {
    this.stats.squadSize = this.managedTeam?.jugadores?.length || 0;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
  
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  }

  getEventTypeColor(type: string): string {
    return type === 'PARTIDO' ? 'success' : 'primary';
  }
}