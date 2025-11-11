import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonRefresher, IonInfiniteScroll } from '@ionic/angular';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { TeamService } from 'src/app/core/services/team.service';
import { MatchService } from 'src/app/core/services/match.service';
import { NewsService } from 'src/app/core/services/news.service';
import { User } from 'src/app/shared/models/user.model';
import { Team } from 'src/app/shared/models/team.model';
import { Match } from 'src/app/shared/models/match.model';
import { News } from 'src/app/shared/models/news.model';

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
  teamStandings: any[] = [];
  
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
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
      if (user?.equipoFavoritoId) {
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
    this.teamService.getTeamById(teamId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (team) => {
        this.favoriteTeam = team;
        this.loadTeamStats(teamId);
      },
      error: (error) => {
        console.error('Error loading favorite team:', error);
      }
    });
  }

  private loadTeamStats(teamId: number) {
    this.matchService.getMatchesByTeam(teamId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (matches) => {
        this.calculateTeamStats(matches);
      },
      error: (error) => {
        console.error('Error loading team matches:', error);
      }
    });
  }

  private calculateTeamStats(matches: Match[]) {
    const currentSeason = new Date().getFullYear();
    const seasonMatches = matches.filter(match => 
      new Date(match.fechaHora).getFullYear() === currentSeason
    );

    this.stats.totalMatches = seasonMatches.length;
    this.stats.wins = seasonMatches.filter(m => m.resultado === 'V').length;
    this.stats.draws = seasonMatches.filter(m => m.resultado === 'E').length;
    this.stats.losses = seasonMatches.filter(m => m.resultado === 'D').length;
    
    this.stats.goalsFor = seasonMatches.reduce((sum, match) => 
      sum + (match.equipoLocalId === this.favoriteTeam?.id ? match.golesLocal : match.golesVisitante), 0);
    
    this.stats.goalsAgainst = seasonMatches.reduce((sum, match) => 
      sum + (match.equipoLocalId === this.favoriteTeam?.id ? match.golesVisitante : match.golesLocal), 0);
  }

  private loadNextMatches() {
    const now = new Date();
    const nextMonth = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    this.matchService.getMatches({ 
      fechaInicio: now.toISOString(),
      fechaFin: nextMonth.toISOString(),
      limit: 10
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.nextMatches = response.matches;
      },
      error: (error) => {
        console.error('Error loading next matches:', error);
      }
    });
  }

  private loadRecentNews() {
    this.newsService.getNews({ 
      page: this.newsPage, 
      limit: 10 
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (this.newsPage === 1) {
          this.recentNews = response.news;
        } else {
          this.recentNews = [...this.recentNews, ...response.news];
        }
        this.newsHasMore = response.news.length === 10;
      },
      error: (error) => {
        console.error('Error loading news:', error);
      }
    });
  }

  private loadTeamStandings() {
    this.teamService.getTeamStandings().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (standings) => {
        this.teamStandings = standings.slice(0, 10); // Top 10 teams
      },
      error: (error) => {
        console.error('Error loading team standings:', error);
      }
    });
  }

  doRefresh(event: any) {
    this.newsPage = 1;
    this.initializeDashboard();
    
    setTimeout(() => {
      this.refresher?.complete();
    }, 1000);
  }

  loadMoreNews(event: any) {
    this.newsPage++;
    this.loadRecentNews();
    
    setTimeout(() => {
      this.infiniteScroll?.complete();
    }, 1000);
  }

  getTeamLogo(teamId: number): string {
    return `assets/images/teams/${teamId}-logo.png`;
  }

  getMatchStatus(match: Match): string {
    const now = new Date();
    const matchDate = new Date(match.fechaHora);
    
    if (matchDate > now) {
      const daysDiff = Math.ceil((matchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff === 1 ? 'Mañana' : `En ${daysDiff} días`;
    }
    
    return 'Finalizado';
  }

  getFormColor(result: string): string {
    switch (result) {
      case 'V': return 'success';
      case 'E': return 'warning';
      case 'D': return 'danger';
      default: return 'medium';
    }
  }

  trackByMatchId(index: number, match: Match): number {
    return match.id;
  }

  trackByNewsId(index: number, news: News): number {
    return news.id;
  }
}