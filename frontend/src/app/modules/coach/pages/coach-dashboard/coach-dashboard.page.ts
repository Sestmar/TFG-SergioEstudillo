import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalController, ToastController, AlertController } from '@ionic/angular'; // 🔥 AlertController añadido

import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MatchService } from 'src/app/core/services/match/match.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { CoachService } from 'src/app/core/services/coach/coach.service';
import { ChatService } from '@core/services/chat/chat.service';
import { User, Partido, Jugador, PlayerSeasonStat } from 'src/app/shared/models/models';

interface CoachStats {
  matches: number;
  trainings: number;
  squadSize: number;
  injured: number;
}

type ViewType = 'dashboard' | 'matches';

@Component({
  selector: 'app-coach-dashboard',
  templateUrl: './coach-dashboard.page.html',
  styleUrls: ['./coach-dashboard.page.scss'],
})
export class CoachDashboardPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  currentUser$: Observable<User | null>;
  noLeidos$: Observable<number>;
  loading: boolean = true;
  
  currentView: ViewType = 'dashboard';

  teamName: string = '';
  categoryName: string = '';
  escudoUrl: string = ''; 
  managedTeamId: number | null = null;
  currentRole: string = ''; 
  topScorer: PlayerSeasonStat | null = null;
  coachId: number | null = null;

  stats: CoachStats = { matches: 0, trainings: 0, squadSize: 0, injured: 0 };

  upcomingEvents: Partido[] = [];
  futureMatchesCount: number = 0;

  constructor(
    private authService: AuthService,
    private matchService: MatchService,
    private playerService: PlayerService,
    private coachService: CoachService,
    private chatService: ChatService,
    private router: Router,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.noLeidos$ = this.chatService.noLeidosEquipo$;
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.loadCoachData();
    this.currentView = 'dashboard';
  }

  // 🔥 MÉTODO LOGOUT AÑADIDO
  async logout() {
      const alert = await this.alertCtrl.create({
          header: '🔒 Cerrar Sesión',
          message: '¿Estás seguro de que quieres salir, Míster?',
          cssClass: 'night-alert',
          buttons: [
              { text: 'Cancelar', role: 'cancel' },
              { 
                  text: 'Salir', 
                  role: 'destructive',
                  handler: () => {
                      this.authService.logout();
                  }
              }
          ]
      });
      await alert.present();
  }

  setView(view: ViewType) {
    this.currentView = view;
  }

  private loadCoachData() {
    this.loading = true;
    
    this.authService.currentUser$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(user => !!user),
        switchMap(user => {
            const userId = user!.idUsuario;
            return this.coachService.getDashboardData(userId);
        })
      )
      .subscribe({
        next: (response) => {
          const equipo = response.equipo;
          this.currentRole = response.rol; 
          this.coachId = response.entrenadorId;

          if (equipo) {
            this.teamName = equipo.nombre;
            this.categoryName = equipo.categoria || 'General';
            this.escudoUrl = equipo.fotoUrl || '';
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
    this.matchService.getMatchesByTeam(teamId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (matches) => {
        this.upcomingEvents = matches.sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
        
        this.stats.matches = matches.filter(m => m.tipo === 'PARTIDO').length;
        this.stats.trainings = matches.filter(m => m.tipo === 'ENTRENAMIENTO').length;

        const now = new Date();
        this.futureMatchesCount = this.upcomingEvents.filter(m => m.tipo === 'PARTIDO' && new Date(m.fechaHora) > now).length;
      }
    });
  }

  private loadTeamStats(teamId: number) {
    this.playerService.getAllPlayers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((all: Jugador[]) => {
        const myPlayers = all.filter((p: Jugador) => {
           const ep = p.equipoPrincipal;
           const tId = typeof ep === 'object' ? (ep?.id || ep?.idEquipo) : ep;
           return tId == teamId;
        });

        this.stats.squadSize = myPlayers.length;
        this.stats.injured = myPlayers.filter(p => p.estado === 'LESIONADO' || p.estado === 'BAJA').length;
    });
  }

  goToProfile() {
    if (this.coachId) {
      this.router.navigate(['/coach/profile', this.coachId]);
    }
  }
  
  navigateToAction(path: string) {
    if (path === '/chat') {
      this.chatService.resetearNoLeidos();
    }
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