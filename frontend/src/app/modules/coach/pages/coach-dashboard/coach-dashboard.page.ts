import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular';

import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MatchService } from 'src/app/core/services/match/match.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
// 🔥 IMPORTANTE: Asegúrate de importar el nuevo servicio
import { CoachService } from 'src/app/core/services/coach/coach.service'; 
import { User } from 'src/app/shared/models/models';
import { CreateConvocationPage } from '../convocations/create-convocation.page';

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
  currentRole: string = ''; // 🔥 Nuevo: Rol específico (Ej: Segundo Entrenador)
  coachId: number | null = null; // 🔥 Nuevo: ID para ir al perfil
  
  stats: CoachStats = { matches: 0, trainings: 0, squadSize: 0 };
  
  upcomingEvents: any[] = []; 

  constructor(
    private authService: AuthService,
    private matchService: MatchService,
    private playerService: PlayerService,
    private coachService: CoachService, // 🔥 Inyectado
    private router: Router,
    private modalCtrl: ModalController
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    // Carga inicial
  }

  ionViewWillEnter() {
    this.loadCoachData();
  }

  private loadCoachData() {
    this.loading = true;
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          const userId = (user as any).id || (user as any).idUsuario; 
          if (userId) {
              this.loadManagedTeam(userId);
          }
        }
      },
      error: () => this.loading = false
    });
  }

  // 🔥 LÓGICA ACTUALIZADA: Recibe { equipo, rol, entrenadorId }
  private loadManagedTeam(userId: number) {
    this.coachService.getDashboardData(userId).subscribe({
        next: (response: any) => {
          // Desempaquetamos la respuesta compuesta del backend
          const equipo = response.equipo;
          this.currentRole = response.rol; // "Entrenador Principal", "Segundo Entrenador", etc.
          this.coachId = response.entrenadorId;

          this.teamName = equipo.nombre;
          this.categoryName = equipo.categoria ? equipo.categoria.nombre : 'General';
          this.managedTeamId = equipo.idEquipo || equipo.id;
          
          if (this.managedTeamId) {
            this.loadTeamStats(this.managedTeamId);
            this.loadMatches(this.managedTeamId);
          }
          this.loading = false;
        },
        error: (err) => {
          console.error("Error cargando equipo", err);
          this.loading = false;
          // Reseteamos datos si falla
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

  async openNewConvocation() {
    if (!this.managedTeamId) {
      // Seguridad extra: si no ha cargado el equipo, no dejamos abrir
      return; 
    }

    const modal = await this.modalCtrl.create({
      component: CreateConvocationPage,
      // AQUÍ ESTÁ LA CLAVE 👇
      componentProps: {
        teamId: this.managedTeamId 
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    // Si se creó algo, recargamos la lista
    if (data && data.created) {
      this.loadMatches(this.managedTeamId);
    }
  }

  // 🔥 NUEVO: Ir a la página de perfil
  goToProfile() {
    if (this.coachId) {
      // Asumiendo que crearás la ruta /coach/profile/:id
      this.router.navigate(['/coach/profile', this.coachId]);
    }
  }
  
  getGreeting(): string {
    const hour = new Date().getHours();
    return hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  }

  getEventTypeColor(type: string): string {
    return type === 'PARTIDO' ? 'success' : 'primary';
  }
}