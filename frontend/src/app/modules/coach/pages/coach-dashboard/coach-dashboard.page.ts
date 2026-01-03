import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { ModalController, ToastController } from '@ionic/angular';

import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MatchService } from 'src/app/core/services/match/match.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { CoachService } from 'src/app/core/services/coach/coach.service'; 
import { User } from 'src/app/shared/models/models';

interface CoachStats {
  matches: number;
  trainings: number;
  squadSize: number;
  injured: number;
}

// Tipos de vista para el dashboard
type ViewType = 'dashboard' | 'matches';

@Component({
  selector: 'app-coach-dashboard',
  templateUrl: './coach-dashboard.page.html',
  styleUrls: ['./coach-dashboard.page.scss'],
})
export class CoachDashboardPage implements OnInit {
  currentUser$: Observable<User | null>;
  loading: boolean = true;
  
  // Control de Vista (Dashboard vs Lista de Partidos)
  currentView: ViewType = 'dashboard';

  // Datos del Equipo y Rol
  teamName: string = '';
  categoryName: string = '';
  escudoUrl: string = ''; 
  managedTeamId: number | null = null;
  currentRole: string = ''; 
  topScorer: any = null;
  coachId: number | null = null; 
  
  stats: CoachStats = { matches: 0, trainings: 0, squadSize: 0, injured: 0 };
  
  upcomingEvents: any[] = []; 
  
  // Contador de partidos futuros para el badge
  futureMatchesCount: number = 0;

  constructor(
    private authService: AuthService,
    private matchService: MatchService,
    private playerService: PlayerService,
    private coachService: CoachService,
    private router: Router,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.loadCoachData();
    // Siempre volvemos al dashboard principal al entrar
    this.currentView = 'dashboard';
  }

  // Cambiar entre vistas
  setView(view: ViewType) {
    this.currentView = view;
  }

  private loadCoachData() {
    this.loading = true;
    
    this.authService.currentUser$
      .pipe(
        filter(user => !!user),
        switchMap(user => {
            const u = user as any;
            const userId = u.id || u.idUsuario || u.sub;
            return this.coachService.getDashboardData(userId);
        })
      )
      .subscribe({
        next: (response: any) => {
          const equipo = response.equipo;
          this.currentRole = response.rol; 
          this.coachId = response.entrenadorId;

          if (equipo) {
            this.teamName = equipo.nombre;
            this.categoryName = equipo.categoria ? equipo.categoria.nombre : 'General';
            this.escudoUrl = equipo.escudoUrl;
            this.managedTeamId = equipo.idEquipo || equipo.id;
            
            if (this.managedTeamId) {
              this.loadTeamStats(this.managedTeamId);
              this.loadMatches(this.managedTeamId);
            }
          } else {
             this.managedTeamId = null;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error("Error cargando dashboard:", err);
          this.loading = false;
        }
      });
  }

  private loadMatches(teamId: number) {
    this.matchService.getMatchesByTeam(teamId).subscribe({
      next: (matches) => {
        // Ordenar por fecha ASC
        this.upcomingEvents = matches.sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
        
        this.stats.matches = matches.filter(m => m.tipo === 'PARTIDO').length;
        this.stats.trainings = matches.filter(m => m.tipo === 'ENTRENAMIENTO').length;

        // Calcular cuántos partidos hay en el futuro para poner un numerito en el botón
        const now = new Date();
        this.futureMatchesCount = this.upcomingEvents.filter(m => m.tipo === 'PARTIDO' && new Date(m.fechaHora) > now).length;
      }
    });
  }

  private loadTeamStats(teamId: number) {
    this.playerService.getAllPlayers().subscribe((res: any) => {
        const all = Array.isArray(res) ? res : (res.data || []);
        
        // Filtrar mis jugadores
        const myPlayers = all.filter((p: any) => {
           const tId = p.equipoPrincipal?.id || p.equipoPrincipal?.idEquipo || p.equipoPrincipal;
           return tId == teamId;
        });

        this.stats.squadSize = myPlayers.length;

        // 1. CALCULAR LESIONADOS
        // Asumiendo que usas un campo 'estado' o 'lesionado'
        // Si no tienes el campo exacto, simúlalo o ajusta la condición
        this.stats.injured = myPlayers.filter((p: any) => 
            p.estado === 'LESIONADO' || p.estado === 'BAJA'
        ).length;

        // 2. CALCULAR PICHICHI (TOP SCORER)
        if (myPlayers.length > 0) {
            // Ordenar por goles de mayor a menor
            const sortedScorers = [...myPlayers].sort((a, b) => (b.golesTemporada || 0) - (a.golesTemporada || 0));
            // Si el mejor tiene más de 0 goles, lo guardamos
            if (sortedScorers[0] && (sortedScorers[0].golesTemporada || 0) > 0) {
                this.topScorer = sortedScorers[0];
            }
        }
    });
  }

  // --- NAVEGACIÓN ---

  goToProfile() {
    if (this.coachId) {
      this.router.navigate(['/coach/profile', this.coachId]);
    }
  }
  
  navigateToAction(path: string) {
    this.router.navigate([path]);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    return hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  }

  goToStats() {
      this.router.navigate(['/coach/stats']);
  }
}