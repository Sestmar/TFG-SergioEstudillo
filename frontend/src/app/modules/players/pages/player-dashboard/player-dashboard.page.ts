import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Imports de Modelos (Ruta absoluta segura)
import { User, Player, Team, Convocation, PlayerStats } from 'src/app/shared/models/models';

// Imports de Servicios (Rutas absolutas individuales)
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { ConvocationService } from 'src/app/core/services/convocation/convocation.service';
import { NotificationService } from 'src/app/core/services/notification/notification.service';

interface DashboardStats {
  totalConvocations: number;
  upcomingConvocations: number;
  pendingConfirmations: number;
  attendanceRate: number;
}

interface QuickAction {
  title: string;
  icon: string;
  route: string;
  color: string;
  description: string;
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
  
  stats: DashboardStats = {
    totalConvocations: 0,
    upcomingConvocations: 0,
    pendingConfirmations: 0,
    attendanceRate: 0
  };

  recentConvocations: Convocation[] = [];
  upcomingConvocations: Convocation[] = [];
  playerStats: PlayerStats | null = null;
  
  quickActions: QuickAction[] = [
    { title: 'Mis Convocatorias', icon: 'calendar', route: '/convocations', color: 'primary', description: 'Ver y confirmar convocatorias' },
    { title: 'Mi Equipo', icon: 'shield', route: '/teams', color: 'secondary', description: 'Información del equipo' },
    { title: 'Mi Perfil', icon: 'person', route: '/profile', color: 'tertiary', description: 'Editar perfil deportivo' },
    { title: 'Estadísticas', icon: 'stats-chart', route: '/player/stats', color: 'success', description: 'Ver estadísticas personales' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private playerService: PlayerService,
    private convocationService: ConvocationService,
    private notificationService: NotificationService,
    private router: Router
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
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (user) => {
        if (user) {
          // Usamos id o idUsuario según tu modelo
          this.loadPlayerProfile(user.idUsuario); 
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.notificationService.showError('Error al cargar datos del usuario');
      }
    });
  }

  private loadPlayerProfile(userId: number) {
    // Usamos getPlayers con filtro
    this.playerService.getAllPlayers({ usuarioId: userId }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        // Soporte robusto para respuesta
        const players = Array.isArray(response) ? response : (response.players || response.data || []);
        
        if (players && players.length > 0) {
          this.currentPlayer = players[0];
          this.currentTeam = this.currentPlayer?.equipoActual || null;
          if (this.currentPlayer) {
            this.loadPlayerStats(this.currentPlayer.id);
            this.loadPlayerConvocations(this.currentPlayer.id); // Cargamos convocatorias aquí
          }
        }
      },
      error: (error) => console.error('Error loading player profile:', error)
    });
  }

  private loadPlayerStats(playerId: number) {
    // Si getStats no existe, usa getPlayerStats. Casteamos a any para evitar bloqueos
    const service: any = this.playerService;
    const method = service.getStats || service.getPlayerStats;
    
    if (method) {
        method.call(service, playerId).pipe(takeUntil(this.destroy$)).subscribe({
        next: (stats: PlayerStats) => this.playerStats = stats,
        error: (error: any) => console.error('Error loading stats:', error)
        });
    }
  }

  private loadPlayerConvocations(playerId: number) { // Cambiado para recibir playerId en vez de userId
    // Usamos getConvocations y filtramos si es necesario
    this.convocationService.getConvocations().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response: any) => {
        let allConvocations = Array.isArray(response) ? response : (response.convocations || response.data || []);
        
        // Filtramos las convocatorias donde está este jugador
        // Esto depende de cómo sea tu API, si ya filtra por usuarioId genial, si no, filtramos aquí
        const playerConvocations = allConvocations.filter((c: any) => 
            c.jugadoresConvocados?.some((jc: any) => jc.jugadorId === playerId || jc.jugador?.id === playerId)
        );
        
        this.processConvocations(playerConvocations);
      },
      error: (error) => console.error('Error loading convocations:', error)
    });
  }

  processConvocations(convocations: Convocation[]) {
    const now = new Date();
    
    this.upcomingConvocations = convocations.filter(conv => {
      const convDate = new Date(conv.fechaHoraInicio);
      return convDate >= now;
    }).sort((a, b) => new Date(a.fechaHoraInicio).getTime() - new Date(b.fechaHoraInicio).getTime()).slice(0, 5);

    this.recentConvocations = convocations
        .sort((a, b) => new Date(b.fechaHoraInicio).getTime() - new Date(a.fechaHoraInicio).getTime())
        .slice(0, 10);

    this.stats.totalConvocations = convocations.length;
    this.stats.upcomingConvocations = this.upcomingConvocations.length;
    
    // Convocatorias pendientes de confirmar
    this.stats.pendingConfirmations = convocations.filter(conv => {
      const convokedPlayer = conv.jugadoresConvocados?.find(jc => jc.jugador.id === this.currentPlayer?.id);
      // Casting a any para evitar el error de 'estadoAsistencia'
      return convokedPlayer && (convokedPlayer as any).estadoAsistencia === 'PENDIENTE';
    }).length;

    // Asistencia
    const confirmedConvocations = convocations.filter(conv => {
      const convokedPlayer = conv.jugadoresConvocados?.find(jc => jc.jugador.id === this.currentPlayer?.id);
      return convokedPlayer && (convokedPlayer as any).estadoAsistencia === 'CONFIRMADO';
    }).length;
    
    // Calculamos tasa sobre convocatorias pasadas solamente para que sea real
    const pastConvocations = convocations.filter(c => new Date(c.fechaHoraFin) < now).length;
    
    this.stats.attendanceRate = pastConvocations > 0 
      ? Math.round((confirmedConvocations / pastConvocations) * 100)
      : 0;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  // Métodos auxiliares de vista
  getDuration(start: string | Date, end: string | Date): string {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / 3600000);
    return `${hours}h`;
  }
  
  getConvocationTypeColor(type: string): string {
      const map: any = { 'PARTIDO': 'success', 'ENTRENAMIENTO': 'primary' };
      return map[type] || 'medium';
  }
  
  formatConvocationDate(date: string | Date): string {
      return new Date(date).toLocaleDateString();
  }
  
  getConvocationStatus(conv: Convocation): string {
      return 'Activo'; // Simplificado
  }
  
  getConvocationStatusColor(status: string): string {
      return 'primary';
  }
}