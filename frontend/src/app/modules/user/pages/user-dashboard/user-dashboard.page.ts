import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { IonRefresher, IonInfiniteScroll } from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Imports de Servicios
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { MatchService } from 'src/app/core/services/match/match.service';
import { NewsService } from 'src/app/core/services/news/new.service';

// Imports de Modelos
import { User, News, Partido } from 'src/app/shared/models/models';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.page.html',
  styleUrls: ['./user-dashboard.page.scss']
})
export class UserDashboardPage implements OnInit {
  @ViewChild(IonRefresher) refresher!: IonRefresher;
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  private destroyRef = inject(DestroyRef);

  currentUser: User | null = null;
  myTeamId: number | null = null; 
  teamName: string = '';
  
  nextMatches: Partido[] = [];
  recentNews: News[] = [];
  
  isLoading = true;
  newsPage = 1;
  
  stats = {
    matches: 0,
    trainings: 0
  };

  constructor(
    private authService: AuthService,
    private teamService: TeamService,
    private matchService: MatchService,
    private newsService: NewsService
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  // 1. Cargar usuario y buscar su equipo
  private loadUserData() {
    this.authService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.findPlayerTeam(user);
      }
    });
  }

  // 2. Lógica para encontrar el equipo del JUGADOR
  private findPlayerTeam(user: User) {
    const userId = user.idUsuario;

    // A. Si el usuario ya tiene el ID guardado en local (Login optimizado)
    if (user.equipoFavoritoId) {
        this.myTeamId = user.equipoFavoritoId;
        this.loadDashboardData();
        return;
    }

    // B. Buscar equipo del jugador via TeamService
    this.teamService.getTeamByUserId(userId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (equipo) => {
            this.myTeamId = equipo.idEquipo || equipo.id || null;
            this.teamName = equipo.nombre;

            // Una vez tenemos el ID correcto, cargamos los partidos
            this.loadDashboardData();
        },
        error: (err) => {
            console.warn("No se encontró equipo para este jugador (o no es jugador)", err);
            // Cargamos solo noticias si no tiene equipo
            this.loadRecentNews();
            this.isLoading = false;
        }
    });
  }

  private loadDashboardData() {
    if (this.myTeamId) {
        this.loadNextMatches(this.myTeamId);
    } else {
        this.isLoading = false;
    }
    this.loadRecentNews();
  }

  // 3. Cargar partidos usando el servicio MatchService (filtra por ID de equipo)
  private loadNextMatches(teamId: number) {
    this.matchService.getMatchesByTeam(teamId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (matches: Partido[]) => {
        
        // Filtramos y ordenamos por fecha
        this.nextMatches = matches
            .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());

        // Actualizamos estadísticas
        this.stats.matches = this.nextMatches.filter(m => m.tipo === 'PARTIDO').length;
        this.stats.trainings = this.nextMatches.filter(m => m.tipo === 'ENTRENAMIENTO').length;
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando partidos', err);
        this.isLoading = false;
      }
    });
  }

  private loadRecentNews() {
    this.newsService.getNews({ page: String(this.newsPage), limit: '10' }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        const news = Array.isArray(response) ? response : (response.news || response.data || []);
        if (this.newsPage === 1) {
          this.recentNews = news;
        } else {
          this.recentNews = [...this.recentNews, ...news];
        }
        // Solo quitamos el loading si no estábamos esperando partidos
        if (!this.myTeamId) this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  doRefresh(event: any) {
    this.ngOnInit();
    setTimeout(() => event.target.complete(), 1000);
  }

  loadMoreNews(event: any) {
    this.newsPage++;
    this.loadRecentNews();
    setTimeout(() => this.infiniteScroll?.complete(), 1000);
  }

  // Helpers visuales
  getTeamLogo(teamId: number): string {
    return `assets/images/teams/${teamId}-logo.png`;
  }

  getMatchStatus(dateStr: string): string {
    const now = new Date();
    const matchDate = new Date(dateStr);
    if (matchDate < now) return 'Finalizado';
    
    const diffTime = Math.abs(matchDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 1 ? 'Mañana' : `En ${diffDays} días`;
  }

  trackByMatchId(index: number, match: Partido): number { return match.idPartido || index; }
  trackByNewsId(index: number, news: News): number { return news.id; }
}