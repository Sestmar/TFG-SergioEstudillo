import { Component, OnInit, DestroyRef, inject } from '@angular/core';

type ChartOptions = {
  series: any; chart: any; xaxis?: any; yaxis?: any;
  dataLabels?: any; colors?: string[]; fill?: any;
  legend?: any; grid?: any; stroke?: any; tooltip?: any;
  markers?: any; plotOptions?: any;
};
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertController, ToastController } from '@ionic/angular'; // Añadido ToastController
import { User, Jugador, EquipoResumen, Partido, PlayerStats } from 'src/app/shared/models/models';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { NotificationService } from 'src/app/core/services/notification/notification.service';
import { MatchService } from 'src/app/core/services/match/match.service';
import { ChatService } from 'src/app/core/services/chat/chat.service';

interface DashboardStats {
  totalConvocations: number;
  upcomingConvocations: number;
  pendingConfirmations: number;
  attendanceRate: number;
}

@Component({
  selector: 'app-player-dashboard',
  templateUrl: './player-dashboard.page.html',
  styleUrls: ['./player-dashboard.page.scss'],
})
export class PlayerDashboardPage implements OnInit {
  currentUser$: Observable<User | null>;
  noLeidos$: Observable<number>;
  currentPlayer: Jugador | null = null;
  currentTeam: EquipoResumen | null = null;
  loading: boolean = true;
  
  stats: DashboardStats = {
    totalConvocations: 0,
    upcomingConvocations: 0,
    pendingConfirmations: 0,
    attendanceRate: 0
  };

  upcomingConvocations: Partido[] = [];
  playerStats: PlayerStats | null = null;

  // ── CHART: Evolución del equipo (Area) ─────────────────────
  evolutionChartOptions: ChartOptions = {
    series: [{ name: 'Goles a Favor', data: [] }],
    chart: {
      type: 'area', height: 140,
      background: 'transparent', foreColor: '#94a3b8',
      toolbar: { show: false }, fontFamily: 'inherit'
    },
    colors: ['#6c63ff'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 } },
    stroke: { curve: 'smooth', width: 2 },
    dataLabels: { enabled: false },
    xaxis: {
      categories: [],
      labels: { style: { colors: '#475569', fontSize: '9px' } },
      axisBorder: { show: false }, axisTicks: { show: false }
    },
    yaxis: { show: false },
    grid: { borderColor: 'rgba(255,255,255,0.05)', padding: { left: 4, right: 4 } },
    tooltip: { theme: 'dark' }
  };

  // ── CHART: Stats personales (Radar) ────────────────────────
  statsRadarOptions: ChartOptions = {
    series: [{ name: 'Temporada', data: [0, 0, 0, 0, 0] }],
    chart: {
      type: 'radar', height: 240,
      background: 'transparent', foreColor: '#94a3b8',
      toolbar: { show: false }, fontFamily: 'inherit'
    },
    colors: ['#6c63ff'],
    xaxis: { categories: ['Partidos', 'Goles', 'Asistencias', 'Min/10', 'Eficiencia'] },
    yaxis: { show: false },
    plotOptions: {
      radar: {
        polygons: {
          strokeColors: 'rgba(255,255,255,0.08)',
          connectorColors: 'rgba(255,255,255,0.08)',
          fill: { colors: ['rgba(108,99,255,0.05)', 'rgba(108,99,255,0.02)'] }
        }
      }
    },
    fill: { opacity: 0.25 },
    stroke: { width: 2 },
    markers: { size: 4 },
    tooltip: { theme: 'dark' }
  };
  
  // Las acciones se renderizan en el HTML, pero el ID es clave para el switch
  quickActions = [
    { id: 'calendar', title: 'Calendario', icon: 'calendar', color: 'primary' },
    { id: 'team', title: 'Mi Equipo', icon: 'shield-checkmark', color: 'secondary' },
    { id: 'profile', title: 'Mi Perfil', icon: 'person', color: 'tertiary' },
    { id: 'stats', title: 'Estadísticas', icon: 'stats-chart', color: 'success' }
  ];

  private destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private playerService: PlayerService,
    private teamService: TeamService,
    private matchService: MatchService,
    private notificationService: NotificationService,
    private chatService: ChatService,
    private router: Router,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController // Inyectamos Toast
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.noLeidos$ = this.chatService.noLeidosEquipo$;
  }

  ngOnInit() {
    this.loadPlayerData();
  }

  // 🔥 MÉTODO LOGOUT
  async logout() {
      const alert = await this.alertCtrl.create({
          header: 'Desconectar',
          message: '¿Quieres cerrar sesión?',
          buttons: [
              { text: 'No', role: 'cancel' },
              { 
                  text: 'Sí, salir', 
                  role: 'destructive',
                  handler: () => {
                      this.authService.logout();
                  }
              }
          ]
      });
      await alert.present();
  }

  private loadPlayerData() {
    this.loading = true;
    this.authService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (user) => {
        const userId = user?.idUsuario;
        if (userId) {
          this.loadPlayerProfile(userId);
        } else {
          console.log("Esperando datos de usuario...");
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.loading = false;
      }
    });
  }

  private loadPlayerProfile(userId: number) {
    this.playerService.getPlayerTeamByUserId(userId).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => of(null))
    ).subscribe((equipo) => {
      if (equipo) {
          this.currentTeam = equipo;
          this.currentPlayer = {
            usuario: { idUsuario: userId, nombre: '', apellidos: '' }
          } as Jugador;

          this.getFullPlayerData(userId);

          const teamId = equipo.id || equipo.idEquipo;
          this.loadTeamMatches(teamId);
      } else {
          this.loading = false;
      }
    });
  }

  private getFullPlayerData(userId: number) {
      this.playerService.getAllPlayers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((players: Jugador[]) => {
          const found = players.find((p: Jugador) => {
             const uId = p.usuario?.id || p.usuario?.idUsuario;
             return uId === userId;
          });

          if (found) {
              this.currentPlayer = found;
              const realPlayerId = found.idJugador || found.id;

              if (realPlayerId) {
                  if (!this.currentPlayer!.idJugador) {
                      this.currentPlayer!.idJugador = realPlayerId;
                  }
                  this.loadPlayerStats(realPlayerId);
              }
          } else {
              this.loading = false;
          }
      });
  }

  private loadTeamMatches(teamId: number) {
      this.matchService.getMatchesByTeam(teamId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (matches) => {
              const now = new Date();
              this.upcomingConvocations = matches
                  .filter(m => new Date(m.fechaHora) >= now)
                  .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
                  .slice(0, 5); 

              this.stats.upcomingConvocations = this.upcomingConvocations.length;
              this.stats.totalConvocations = matches.length;

              const pastFinished = matches
                .filter(m => m.estado === 'FINALIZADO' && m.tipo === 'PARTIDO')
                .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
                .slice(-8);
              this.buildEvolutionChart(pastFinished);

              this.loading = false;
          },
          error: (err) => {
              console.error("Error cargando partidos", err);
              this.loading = false;
          }
      });
  }

  private loadPlayerStats(playerId: number) {
    this.playerService.getPlayerStats(playerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats: PlayerStats) => {
            this.playerStats = stats;
            this.buildPlayerRadar();
        },
        error: (err) => console.error('Error cargando stats', err)
      });
  }

  // 🔥 MÉTODO NAVIGATE MEJORADO PARA JUGADORES
  async navigateTo(actionOrRoute: any) {
    if (typeof actionOrRoute === 'string') {
        if (actionOrRoute === '/profile') {
             this.goToProfile();
        } else if (actionOrRoute === '/convocations') {
             this.router.navigate(['/calendar']);
        } else if (actionOrRoute === '/coach/my-team') {
             // Si el HTML llama a la ruta antigua, interceptamos aquí
             this.goToMyTeamDetail();
        } else {
             if (actionOrRoute === '/chat') {
               this.chatService.resetearNoLeidos();
             }
             this.router.navigate([actionOrRoute]);
        }
        return;
    }

    const actionId = actionOrRoute.id;

    switch (actionId) {
        case 'calendar':      
        case 'convocations':  
            this.router.navigate(['/calendar']);
            break;
        case 'team':
            // ✅ CORRECCIÓN: Vamos al detalle del equipo, no al panel de coach
            this.goToMyTeamDetail();
            break;
        case 'profile':
            this.goToProfile();
            break;
        case 'stats':
            this.scrollToStats();
            break;
    }
  }

  // ✅ Nueva función para ir al detalle del equipo del jugador
  private async goToMyTeamDetail() {
    if (this.currentTeam) {
        const teamId = this.currentTeam.id || this.currentTeam.idEquipo;
        this.router.navigate(['/team-detail', teamId]);
    } else {
        const toast = await this.toastCtrl.create({
            message: 'No tienes equipo asignado todavía.',
            duration: 2000,
            color: 'warning'
        });
        toast.present();
    }
  }

  private goToProfile() {
    if (this.currentPlayer && this.currentPlayer.usuario) {
        this.router.navigate(['/profile']);
    } else {
        console.warn("⚠️ Aún no se ha cargado el jugador.");
    }
  }

  scrollToStats() {
    setTimeout(() => {
        const element = document.getElementById('stats-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
  }

  showMatchDetails(match: Partido) {
    if (match.tipo === 'ENTRENAMIENTO') {
       this.showTrainingAlert(match);
       return;
    }
    const matchId = match.idPartido || match.id;
    this.router.navigate(['/match-detail', matchId]);
  }

  async showTrainingAlert(match: Partido) {
      const alert = await this.alertCtrl.create({
        header: 'Entrenamiento',
        subHeader: match.lugar,
        message: match.observaciones || 'Sin observaciones.',
        buttons: ['OK'],
        cssClass: 'custom-alert'
      });
      await alert.present();
  }

  getPlayerPosition(): string {
    return this.currentPlayer?.posicion || 'Sin Posición';
  }

  isPlayerAvailable(): boolean {
    return this.currentPlayer?.estado === 'ACTIVO';
  }

  getConvocationTypeColor(type: string): string {
      const map: Record<string, string> = { 'PARTIDO': 'success', 'ENTRENAMIENTO': 'primary' };
      return map[type] || 'medium';
  }

  buildEvolutionChart(matches: Partido[]) {
    this.evolutionChartOptions = {
      ...this.evolutionChartOptions,
      series: [{ name: 'Goles a Favor', data: matches.map(m => m.golesFavor || 0) }],
      xaxis: {
        ...this.evolutionChartOptions.xaxis,
        categories: matches.map((m, i) => {
          const r = m.rival;
          if (!r) return `PJ${i + 1}`;
          return r.length > 7 ? r.substring(0, 6) + '.' : r;
        })
      }
    };
  }

  buildPlayerRadar() {
    if (!this.playerStats) return;
    const partidos    = this.playerStats.partidosTotales  || 0;
    const goles       = this.playerStats.golesTotales      || 0;
    const asistencias = this.playerStats.asistenciasTotales || 0;
    const minutos10   = Math.round((this.playerStats.minutosJugados || 0) / 10);
    const eficiencia  = partidos > 0
      ? Math.round(((goles + asistencias) / partidos) * 10)
      : 0;

    this.statsRadarOptions = {
      ...this.statsRadarOptions,
      series: [{ name: 'Temporada', data: [partidos, goles, asistencias, minutos10, eficiencia] }]
    };
  }

  getPlayerAttendanceStatus(conv: Partido): string { return 'PENDIENTE'; }
  getAttendanceStatusColor(status: string): string { return 'primary'; }
  getAttendanceStatusText(status: string): string { return 'Convocado'; }
}