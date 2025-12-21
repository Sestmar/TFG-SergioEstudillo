import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ConvocationService } from 'src/app/core/services/convocation/convocation.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { User, Convocation } from 'src/app/shared/models/models';

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
  loading: boolean = true;
  
  // Datos del Equipo
  teamName: string = '';
  categoryName: string = '';
  managedTeamId: number | null = null;
  
  stats: CoachStats = { matches: 0, trainings: 0, wins: 0, squadSize: 0 };
  upcomingEvents: Convocation[] = [];
  
  quickActions = [
    { title: 'Nueva Convocatoria', icon: 'add-circle', route: '/convocations/create', color: 'primary', description: 'Crear partido o entreno' },
    { title: 'Gestionar Plantilla', icon: 'people', route: '/coach/my-team', color: 'secondary', description: 'Ver jugadores' },
    { title: 'Planificación', icon: 'calendar', route: '/calendar', color: 'tertiary', description: 'Calendario mensual' },
    { title: 'Incidencias', icon: 'medkit', route: '/incidents', color: 'warning', description: 'Bajas y lesiones' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private convocationService: ConvocationService,
    private playerService: PlayerService,
    private http: HttpClient,
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
          if (userId) {
              this.loadManagedTeam(userId);
          }
        }
      },
      error: (err) => {
        console.error('Error user:', err);
        this.loading = false;
      }
    });
  }

  private loadManagedTeam(userId: number) {
    this.http.get(`http://localhost:8080/api/entrenadores/usuario/${userId}/equipo`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
            // El loading lo quitamos dentro del next/error
        })
      )
      .subscribe({
        next: (equipo: any) => {
          console.log("🏆 Dashboard - Equipo detectado:", equipo);
          
          this.teamName = equipo.nombre;
          this.categoryName = equipo.categoria ? equipo.categoria.nombre : 'General';
          this.managedTeamId = equipo.idEquipo || equipo.id;
          
          this.loading = false;

          if (this.managedTeamId) {
            this.loadTeamStats(this.managedTeamId);
            this.loadUpcomingEvents(this.managedTeamId);
          }
        },
        error: (err) => {
          console.error("❌ Error cargando equipo:", err);
          this.managedTeamId = null;
          this.loading = false;
        }
      });
  }

  private loadUpcomingEvents(teamId: number) {
    this.convocationService.getConvocations().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        const allEvents = Array.isArray(response) ? response : (response.data || []);
        
        // 🔥 FILTRADO CRÍTICO 🔥
        const myEvents = allEvents.filter((e: any) => {
            // Buscamos el ID del equipo en todas las variantes posibles del backend
            const eTeamId = e.equipo ? (e.equipo.id || e.equipo.idEquipo) : e.idEquipo;
            
            // Usamos '==' para comparar número con string si fuera necesario
            return eTeamId == teamId;
        });

        this.stats.matches = myEvents.filter((e: any) => e.tipo === 'PARTIDO').length;
        this.stats.trainings = myEvents.filter((e: any) => e.tipo === 'ENTRENAMIENTO').length;
        
        this.upcomingEvents = myEvents
          .filter((e: any) => new Date(e.fechaHoraInicio || e.fechaEvento) >= new Date())
          .sort((a: any, b: any) => new Date(a.fechaHoraInicio).getTime() - new Date(b.fechaHoraInicio).getTime())
          .slice(0, 3); 
      }
    });
  }

  private loadTeamStats(teamId: number) {
    this.playerService.getAllPlayers().subscribe((res: any) => {
        const all = Array.isArray(res) ? res : (res.data || []);
        const myPlayers = all.filter((p: any) => {
           const tId = this.getTeamIdFromPlayer(p);
           return tId == teamId;
        });
        this.stats.squadSize = myPlayers.length;
    });
  }

  private getTeamIdFromPlayer(p: any): number | null {
    let val: any = null;
    if (p.equipoPrincipal && typeof p.equipoPrincipal === 'object') {
        val = p.equipoPrincipal.id || p.equipoPrincipal.idEquipo;
    }
    else if (typeof p.equipoPrincipal === 'number') val = p.equipoPrincipal;
    else if (p.equipo && p.equipo.id) val = p.equipo.id;
    else if (typeof p.idEquipo === 'number') val = p.idEquipo;
    return val ? Number(val) : null;
  }

  navigateToAction(action: any) {
    this.router.navigate([action.route]);
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