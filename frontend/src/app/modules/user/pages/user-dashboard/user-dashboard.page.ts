import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonRefresher, IonInfiniteScroll } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';

// Imports de Servicios (Rutas Absolutas)
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { MatchService} from 'src/app/core/services/match/match.service';
import { NewsService } from 'src/app/core/services/news/new.service';

// Imports de Modelos (Desde index o individuales si index falla)
import { User, Team, Match, News } from 'src/app/shared/models/models';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.page.html',
  styleUrls: ['./user-dashboard.page.scss']
})
export class UserDashboardPage implements OnInit, OnDestroy {
  @ViewChild(IonRefresher) refresher!: IonRefresher;
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  favoriteTeam: Team | null = null;
  nextMatches: Match[] = [];
  recentNews: News[] = [];
  teamStandings: any[] = []; // Usamos any por flexibilidad
  
  isLoading = true;
  newsPage = 1;
  newsHasMore = true;
  
  stats = {
    totalMatches: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0
  };

  constructor(
    private authService: AuthService,
    private teamService: TeamService,
    private matchService: MatchService,
    private newsService: NewsService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.initializeDashboard();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserData() {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
      if (user && user.equipoFavoritoId) {
        this.loadFavoriteTeam(user.equipoFavoritoId);
      }
    });
  }

  private initializeDashboard() {
    this.loadNextMatches();
    this.loadRecentNews();
    this.loadTeamStandings();
  }

  private loadFavoriteTeam(teamId: number) {
    this.teamService.getTeamById(teamId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (team) => {
        this.favoriteTeam = team;
        this.loadTeamStats(teamId);
      },
      error: (err) => console.error('Error loading fav team', err)
    });
  }

  private loadTeamStats(teamId: number) {
    // Intentamos getMatchesByTeam, si no existe usa getMatches con filtro
    // Asumimos que getMatchesByTeam existe en tu MatchService actual
    this.matchService.getMatchesByTeam(teamId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (matches) => this.calculateTeamStats(matches),
      error: (err) => console.error('Error loading stats', err)
    });
  }

  private calculateTeamStats(matches: Match[]) {
    if (!matches) return;
    const currentSeason = new Date().getFullYear();
    const seasonMatches = matches.filter(match => 
      new Date(match.fechaHora).getFullYear() === currentSeason
    );

    this.stats.totalMatches = seasonMatches.length;
    this.stats.wins = seasonMatches.filter(m => m.resultado === 'V').length;
    this.stats.draws = seasonMatches.filter(m => m.resultado === 'E').length;
    this.stats.losses = seasonMatches.filter(m => m.resultado === 'D').length;
    
    this.stats.goalsFor = seasonMatches.reduce((sum, match) => 
      sum + (match.equipoLocalId === this.favoriteTeam?.id ? (match.golesLocal || 0) : (match.golesVisitante || 0)), 0);
    
    this.stats.goalsAgainst = seasonMatches.reduce((sum, match) => 
      sum + (match.equipoLocalId === this.favoriteTeam?.id ? (match.golesVisitante || 0) : (match.golesLocal || 0)), 0);
  }

  private loadNextMatches() {
    const now = new Date();
    const nextMonth = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    // Casting a 'any' para pasar parámetros si la firma es estricta
    this.matchService.getMatches({ 
      fechaInicio: now.toISOString(),
      fechaFin: nextMonth.toISOString(),
      limit: 10
    } as any).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        // Soporte robusto para cualquier formato de respuesta
        const matches = Array.isArray(response) ? response : (response.matches || response.data || []);
        this.nextMatches = matches;
      },
      error: (err) => console.error('Error loading matches', err)
    });
  }

  private loadRecentNews() {
    this.newsService.getNews({ page: this.newsPage, limit: 10 }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        const news = Array.isArray(response) ? response : (response.news || response.data || []);
        
        if (this.newsPage === 1) {
          this.recentNews = news;
        } else {
          this.recentNews = [...this.recentNews, ...news];
        }
        this.newsHasMore = news.length === 10;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading news', err);
        this.isLoading = false;
      }
    });
  }

  private loadTeamStandings() {
    // Si tu servicio no tiene este método, simplemente no hará nada
    if (this.teamService.getTeamStandings) {
      this.teamService.getTeamStandings().pipe(takeUntil(this.destroy$)).subscribe({
        next: (standings: any[]) => {
          this.teamStandings = Array.isArray(standings) ? standings.slice(0, 10) : [];
        },
        error: (err) => console.error('Error loading standings', err)
      });
    }
  }

  doRefresh(event: any) {
    this.newsPage = 1;
    this.initializeDashboard();
    setTimeout(() => this.refresher?.complete(), 1000);
  }

  loadMoreNews(event: any) {
    this.newsPage++;
    this.loadRecentNews();
    setTimeout(() => this.infiniteScroll?.complete(), 1000);
  }

  getTeamLogo(teamId: number): string {
    // Ruta genérica o servicio de imágenes
    return `assets/images/teams/${teamId}-logo.png`;
  }

  getMatchStatus(match: Match): string {
    const now = new Date();
    const matchDate = new Date(match.fechaHora);
    if (matchDate > now) {
      const daysDiff = Math.ceil((matchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 1 ? 'Mañana' : `En ${daysDiff} días`;
    }
    return 'Finalizado';
  }

  getFormColor(result: string): string {
    const colors: any = { 'V': 'success', 'E': 'warning', 'D': 'danger' };
    return colors[result] || 'medium';
  }

  trackByMatchId(index: number, match: Match): number { return match.id; }
  trackByNewsId(index: number, news: News): number { return news.id; }
}
