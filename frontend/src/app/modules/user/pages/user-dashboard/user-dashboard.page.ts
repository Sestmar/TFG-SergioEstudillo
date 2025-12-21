import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonRefresher, IonInfiniteScroll } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http'; // ✅ Necesario para buscar equipo del jugador

// Imports de Servicios
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { MatchService } from 'src/app/core/services/match/match.service'; // ✅ Usamos el nuevo servicio
import { NewsService } from 'src/app/core/services/news/new.service';

// Imports de Modelos
import { User, News } from 'src/app/shared/models/models';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.page.html',
  styleUrls: ['./user-dashboard.page.scss']
})
export class UserDashboardPage implements OnInit, OnDestroy {
  @ViewChild(IonRefresher) refresher!: IonRefresher;

  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  myTeamId: number | null = null; // ID del equipo del jugador
  teamName: string = '';

  nextMatches: any[] = []; // Usamos any[] para adaptarnos a la nueva entidad Partido
  recentNews: News[] = [];
  
  isLoading = true;
  
  // Estadísticas simples
  stats = {
    matches: 0,
    wins: 0, // Por implementar con nueva lógica
    goals: 0
  };

  constructor(
    private authService: AuthService,
    private teamService: TeamService,
    private matchService: MatchService,
    private newsService: NewsService,
    private http: HttpClient // ✅ Inyectamos HTTP para buscar el equipo
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // 1. Cargamos usuario y buscamos su equipo
  private loadUserData() {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.findPlayerTeam(user);
      }
    });
  }

  // 2. Buscamos el equipo del jugador (Igual que hicimos con el entrenador)
  private findPlayerTeam(user: any) {
    const userId = user.id || user.idUsuario;
    
    // Endpoint para saber en qué equipo juega
    // Nota: Asumo que tienes un endpoint similar o usas el del entrenador si es compartido,
    // o buscamos al jugador directamente.
    // Si no tienes endpoint de jugador, intentamos leerlo del usuario directamente.
    
    // INTENTO 1: Si el usuario ya tiene el ID del equipo guardado
    if (user.equipoId || user.idEquipo) {
        this.myTeamId = user.equipoId || user.idEquipo;
        this.loadDashboardData();
        return;
    }

    // INTENTO 2: Buscar en backend (Ajusta la URL si tienes un endpoint específico de jugadores)
    // Usaremos el de entrenadores temporalmente o asume que tienes /api/jugadores/usuario/{id}/equipo
    this.http.get(`http://localhost:8080/api/entrenadores/usuario/${userId}/equipo`).subscribe({
        next: (equipo: any) => {
            this.myTeamId = equipo.idEquipo || equipo.id;
            this.teamName = equipo.nombre;
            this.loadDashboardData();
        },
        error: () => {
             // Si falla, intentamos cargar noticias generales
             this.loadRecentNews(); 
             this.isLoading = false;
        }
    });
  }

  private loadDashboardData() {
    if (this.myTeamId) {
        this.loadNextMatches(this.myTeamId);
    }
    this.loadRecentNews();
  }

  // 3. Cargamos los partidos NUEVOS (Tabla Partido)
  private loadNextMatches(teamId: number) {
    this.matchService.getMatchesByTeam(teamId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (matches: any[]) => {
        // Filtramos solo los futuros o recientes
        const now = new Date();
        
        this.nextMatches = matches
            .filter(m => m.tipo === 'PARTIDO') // Solo partidos, no entrenos (opcional)
            .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()); // Ordenar por fecha
            
        // Estadísticas básicas basadas en la cantidad
        this.stats.matches = this.nextMatches.length;
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando partidos', err);
        this.isLoading = false;
      }
    });
  }

  private loadRecentNews() {
    this.newsService.getNews({ page: 1, limit: 5 }).subscribe({
      next: (res: any) => {
        this.recentNews = Array.isArray(res) ? res : (res.data || []);
      }
    });
  }

  doRefresh(event: any) {
    this.ngOnInit();
    setTimeout(() => event.target.complete(), 1000);
  }

  // --- Helpers para la Vista ---

  getMatchDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }

  getMatchTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }
}