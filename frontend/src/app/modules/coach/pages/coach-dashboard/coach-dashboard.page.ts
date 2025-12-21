import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModalController } from '@ionic/angular'; // ✅ Necesario para abrir el modal

import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MatchService } from 'src/app/core/services/match/match.service'; // ✅ Nuevo servicio
import { PlayerService } from 'src/app/core/services/player/player.service';
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
  
  // Datos del Equipo
  teamName: string = '';
  categoryName: string = '';
  managedTeamId: number | null = null;
  
  stats: CoachStats = { matches: 0, trainings: 0, squadSize: 0 };
  
  // ✅ Usamos 'any[]' porque viene de la entidad Partido de Java
  upcomingEvents: any[] = []; 

  constructor(
    private authService: AuthService,
    private matchService: MatchService, // ✅ Inyectado
    private playerService: PlayerService,
    private http: HttpClient,
    private router: Router,
    private modalCtrl: ModalController // ✅ Inyectado
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    // Carga inicial
  }

  // ✅ Se ejecuta cada vez que entras a la pantalla (útil al volver de la pizarra)
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

  private loadManagedTeam(userId: number) {
    this.http.get(`http://localhost:8080/api/entrenadores/usuario/${userId}/equipo`)
      .subscribe({
        next: (equipo: any) => {
          this.teamName = equipo.nombre;
          this.categoryName = equipo.categoria ? equipo.categoria.nombre : 'General';
          this.managedTeamId = equipo.idEquipo || equipo.id;
          
          if (this.managedTeamId) {
            this.loadTeamStats(this.managedTeamId);
            this.loadMatches(this.managedTeamId); // ✅ Cargamos partidos reales
          }
          this.loading = false;
        },
        error: (err) => {
          console.error("Error cargando equipo", err);
          this.loading = false;
        }
      });
  }

  // ✅ Cargar Partidos desde MatchService
  private loadMatches(teamId: number) {
    this.matchService.getMatchesByTeam(teamId).subscribe({
      next: (matches) => {
        // Guardamos todos
        this.upcomingEvents = matches;
        
        // Actualizamos estadísticas
        this.stats.matches = matches.filter(m => m.tipo === 'PARTIDO').length;
        this.stats.trainings = matches.filter(m => m.tipo === 'ENTRENAMIENTO').length;

        // Ordenar por fecha y coger los próximos 3
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

  // ✅ ABRIR MODAL PARA NUEVA CONVOCATORIA
  async openNewConvocation() {
    const modal = await this.modalCtrl.create({
      component: CreateConvocationPage,
      // No hace falta pasar ID porque el modal lo detecta solo, pero podrías pasarlo
    });

    await modal.present();

    // Esperamos a que se cierre
    const { data } = await modal.onWillDismiss();
    
    // Si se creó algo, recargamos la lista
    if (data && data.created) {
      if (this.managedTeamId) this.loadMatches(this.managedTeamId);
    }
  }

  // Navegación genérica (para otras tarjetas)
  navigateToAction(route: string) {
    this.router.navigate([route]);
  }
  
  getGreeting(): string {
    const hour = new Date().getHours();
    return hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  }

  getEventTypeColor(type: string): string {
    return type === 'PARTIDO' ? 'success' : 'primary';
  }
}