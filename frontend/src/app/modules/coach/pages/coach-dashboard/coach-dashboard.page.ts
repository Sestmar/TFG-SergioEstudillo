import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators'; // 🔥 USAMOS SWITCHMAP
import { ModalController } from '@ionic/angular';

import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MatchService } from 'src/app/core/services/match/match.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { CoachService } from 'src/app/core/services/coach/coach.service'; 
import { User } from 'src/app/shared/models/models';

interface CoachStats {
  matches: number;
  trainings: number;
  squadSize: number;
}

@Component({
  selector: 'app-coach-dashboard',
  templateUrl: './coach-dashboard.page.html',
  styleUrls: ['./coach-dashboard.page.scss'],
})
export class CoachDashboardPage implements OnInit {
  currentUser$: Observable<User | null>;
  loading: boolean = true;
  
  // Datos del Equipo y Rol
  teamName: string = '';
  categoryName: string = '';
  managedTeamId: number | null = null;
  currentRole: string = ''; 
  coachId: number | null = null; 
  
  stats: CoachStats = { matches: 0, trainings: 0, squadSize: 0 };
  
  upcomingEvents: any[] = []; 

  constructor(
    private authService: AuthService,
    private matchService: MatchService,
    private playerService: PlayerService,
    private coachService: CoachService,
    private router: Router,
    private modalCtrl: ModalController
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.loadCoachData();
  }

  private loadCoachData() {
    this.loading = true;
    
    // 🔥 PATRÓN SEMÁFORO: Esperamos al usuario + ID antes de llamar
    this.authService.currentUser$
      .pipe(
        filter(user => !!user), // 1. Espera si es null
        switchMap(user => {
            // 2. Extrae ID seguro
            const u = user as any;
            const userId = u.id || u.idUsuario || u.sub;
            
            console.log('Dashboard - Usuario detectado:', userId);

            // 3. Llama a la API (Devuelve observable)
            return this.coachService.getDashboardData(userId);
        })
      )
      .subscribe({
        next: (response: any) => {
          // 4. Procesa datos
          console.log('Datos Dashboard recibidos:', response);
          const equipo = response.equipo;
          this.currentRole = response.rol; 
          this.coachId = response.entrenadorId;

          if (equipo) {
            this.teamName = equipo.nombre;
            this.categoryName = equipo.categoria ? equipo.categoria.nombre : 'General';
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
          this.managedTeamId = null;
          this.currentRole = '';
        }
      });
  }

  private loadMatches(teamId: number) {
    this.matchService.getMatchesByTeam(teamId).subscribe({
      next: (matches) => {
        this.upcomingEvents = matches;
        this.stats.matches = matches.filter(m => m.tipo === 'PARTIDO').length;
        this.stats.trainings = matches.filter(m => m.tipo === 'ENTRENAMIENTO').length;
        // Ordenar por fecha
        this.upcomingEvents.sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
      }
    });
  }

  private loadTeamStats(teamId: number) {
    this.playerService.getAllPlayers().subscribe((res: any) => {
        const all = Array.isArray(res) ? res : (res.data || []);
        const myPlayers = all.filter((p: any) => {
           const tId = p.equipoPrincipal?.id || p.equipoPrincipal?.idEquipo || p.equipoPrincipal;
           return tId == teamId;
        });
        this.stats.squadSize = myPlayers.length;
    });
  }

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
}