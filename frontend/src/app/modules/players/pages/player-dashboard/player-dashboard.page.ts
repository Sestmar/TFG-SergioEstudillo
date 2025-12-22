import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http'; // ✅ Necesario para buscar equipo del jugador
import { AlertController } from '@ionic/angular'; // <--- IMPORTAR ESTO

// Imports de Modelos
import { User, Player, Team, PlayerStats } from 'src/app/shared/models/models';

// Imports de Servicios
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { NotificationService } from 'src/app/core/services/notification/notification.service';
import { MatchService } from 'src/app/core/services/match/match.service'; // ✅ NUEVO SERVICIO

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
export class PlayerDashboardPage implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  currentPlayer: Player | null = null;
  currentTeam: Team | null = null;
  loading: boolean = true;
  
  stats: DashboardStats = {
    totalConvocations: 0,
    upcomingConvocations: 0,
    pendingConfirmations: 0,
    attendanceRate: 0
  };

  // ✅ Usamos any[] porque ahora son Partidos (no Convocations antiguas)
  upcomingConvocations: any[] = []; 
  
  playerStats: PlayerStats | null = null;
  
  quickActions = [
    { title: 'Convocatorias', icon: 'calendar', route: '/convocations', color: 'primary', description: 'Ver agenda' },
    { title: 'Mi Equipo', icon: 'shield', route: '/coach/my-team', color: 'secondary', description: 'Ver plantilla' },
    { title: 'Mi Perfil', icon: 'person', route: '/profile', color: 'tertiary', description: 'Datos personales' },
    { title: 'Estadísticas', icon: 'bar-chart', route: '/player/stats', color: 'success', description: 'Rendimiento' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private playerService: PlayerService,
    private teamService: TeamService, 
    private matchService: MatchService, // ✅ Inyectamos MatchService
    private notificationService: NotificationService,
    private router: Router,
    private http: HttpClient,
    private alertCtrl: AlertController
  ) {
    this.currentUser$ = this.authService.currentUser$; 
  }

  ngOnInit() {
    this.loadPlayerData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPlayerData() {
    this.loading = true;
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (user) => {
        // ✅ FIX: Comprobamos que user existe Y tiene ID antes de seguir
        if (user && ((user as any).id || (user as any).idUsuario)) {
          const userId = (user as any).id || (user as any).idUsuario; 
          this.loadPlayerProfile(userId); 
        } else {
          // Si no hay usuario cargado aún, no hacemos nada (evitamos el error 400)
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
    // 1. Buscamos al jugador usando el endpoint nuevo (más seguro)
    this.http.get(`http://localhost:8080/api/jugadores/usuario/${userId}/equipo`).pipe(
        catchError(() => of(null)) // Si falla, devolvemos null
    ).subscribe((equipo: any) => {
        
        if (equipo) {
            // ✅ Encontramos equipo directamente
            this.currentTeam = equipo;
            console.log("✅ Equipo detectado para jugador:", equipo.nombre);
            
            // Construimos un objeto "Player" básico con los datos que tenemos
            // (Si necesitas más datos del jugador, haríamos otra llamada, pero para el dashboard esto vale)
            this.currentPlayer = { 
                usuario: { id: userId } as any 
            } as Player; // Mock parcial necesario
            
            // Cargamos datos del jugador real para rellenar foto/nombre si hace falta
            this.getFullPlayerData(userId);

            this.loadDataAfterTeamLoaded();

        } else {
            console.warn("❌ Jugador sin equipo asignado");
            this.loading = false;
        }
    });
  }

  private getFullPlayerData(userId: number) {
      this.playerService.getAllPlayers().subscribe((res: any) => {
          const players = Array.isArray(res) ? res : (res.data || []);
          const found = players.find((p: any) => (p.usuario?.id || p.usuario?.idUsuario) === userId);
          if (found) {
              this.currentPlayer = found;
          }
      });
  }

  private loadDataAfterTeamLoaded() {
    if (this.currentTeam) {
      const teamId = this.currentTeam.id || (this.currentTeam as any).idEquipo;
      
      // ✅ CARGAR PARTIDOS NUEVOS (MatchService)
      this.loadTeamMatches(teamId);
      
      // Cargar stats si tenemos ID de jugador
      if (this.currentPlayer && (this.currentPlayer.id || (this.currentPlayer as any).idJugador)) {
          const pid = this.currentPlayer.id || (this.currentPlayer as any).idJugador;
          this.loadPlayerStats(pid!);
      }
    }
  }

  // ✅ NUEVA LÓGICA: Cargar desde la tabla 'partido'
  private loadTeamMatches(teamId: number) {
      this.matchService.getMatchesByTeam(teamId).pipe(takeUntil(this.destroy$)).subscribe({
          next: (matches) => {
              // Filtramos y ordenamos
              const now = new Date();
              this.upcomingConvocations = matches
                  .filter((m: any) => new Date(m.fechaHora) >= now) // Solo futuros
                  .sort((a: any, b: any) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
                  .slice(0, 5); // Max 5

              // Actualizamos contadores
              this.stats.upcomingConvocations = this.upcomingConvocations.length;
              this.stats.totalConvocations = matches.length; // Total histórico aprox
              
              this.loading = false;
          },
          error: (err) => {
              console.error("Error cargando partidos", err);
              this.loading = false;
          }
      });
  }

  private loadPlayerStats(playerId: number) {
    if (this.playerService.getPlayerStats) {
        this.playerService.getPlayerStats(playerId).pipe(takeUntil(this.destroy$)).subscribe({
          next: (stats: PlayerStats) => this.playerStats = stats,
          error: (err: any) => console.log('Stats no disponibles aún')
        });
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  async showMatchDetails(match: any) {
    // Formatear fecha y hora
    const fechaObj = new Date(match.fechaHora);
    const fecha = fechaObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const hora = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    // Capitalizar primera letra de la fecha (lunes -> Lunes)
    const fechaCap = fecha.charAt(0).toUpperCase() + fecha.slice(1);

    const alert = await this.alertCtrl.create({
      header: match.tipo === 'PARTIDO' ? `VS ${match.rival}` : 'Entrenamiento',
      subHeader: `${fechaCap} - ${hora}`,
      // Usamos \n para saltos de línea y emojis para destacar secciones
      message: `
📍 LUGAR:
${match.lugar || 'Por confirmar'}

📝 OBSERVACIONES:
${match.observaciones || 'Sin observaciones adicionales.'}
      `,
      buttons: ['Entendido'],
      cssClass: 'custom-alert' // Opcional: para darle estilo si tienes CSS global
    });

    await alert.present();
  }

  // --- Helpers Visuales ---

  getPlayerPosition(): string {
    const player: any = this.currentPlayer;
    return player?.posicion || 'Sin Posición';
  }

  isPlayerAvailable(): boolean {
    const player: any = this.currentPlayer;
    return player?.estado === 'ACTIVO';
  }
  
  // ✅ ADAPTADOR: El HTML pide 'titulo', pero el objeto nuevo tiene 'rival'.
  // Usamos getters o funciones en el HTML para evitar errores.
  
  getConvocationTitle(conv: any): string {
      if (conv.tipo === 'PARTIDO') return 'VS ' + (conv.rival || 'Rival');
      return conv.rival || 'Entrenamiento'; // En entrenos, 'rival' puede usarse como título/descripción
  }
  
  getConvocationTypeColor(type: string): string {
      const map: any = { 'PARTIDO': 'success', 'ENTRENAMIENTO': 'primary' };
      return map[type] || 'medium';
  }

  // Devuelve el estado de asistencia (Fake por ahora)
  getPlayerAttendanceStatus(conv: any): string {
    return 'PENDIENTE'; 
  }

  // Devuelve el color del badge
  getAttendanceStatusColor(status: string): string {
    return 'primary'; // Azul por defecto
  }

  // Devuelve el texto legible
  getAttendanceStatusText(status: string): string {
    return 'Convocado';
  }

  // Manejadores de botones (vacíos por ahora para que no den error)
  confirmAttendance(id: any) { console.log('Confirmar asistencia pendiente de implementar'); }
  rejectAttendance(id: any) { console.log('Rechazar asistencia pendiente de implementar'); }
}