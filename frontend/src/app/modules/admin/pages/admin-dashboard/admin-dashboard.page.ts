import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/core/services/user.service';
import { TeamService } from 'src/app/core/services/team.service';
import { MatchService } from 'src/app/core/services/match.service';
import { StatisticsService } from 'src/app/core/services/statistics.service';
import { User } from 'src/app/shared/models/user.model';
import { Team } from 'src/app/shared/models/team.model';
import { Match } from 'src/app/shared/models/match.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss']
})
export class AdminDashboardPage implements OnInit, OnDestroy {
  @ViewChild('userModal') userModal!: IonModal;
  @ViewChild('teamModal') teamModal!: IonModal;

  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  
  // Dashboard statistics
  stats = {
    totalUsers: 0,
    activeUsers: 0,
    totalTeams: 0,
    activeTeams: 0,
    totalMatches: 0,
    upcomingMatches: 0,
    pendingRequests: 0,
    systemHealth: 'healthy'
  };
  
  // Recent activity
  recentActivity: any[] = [];
  
  // Quick management lists
  recentUsers: User[] = [];
  recentTeams: Team[] = [];
  recentMatches: Match[] = [];
  
  // System information
  systemInfo = {
    version: '1.0.0',
    lastBackup: new Date(),
    serverStatus: 'online',
    databaseStatus: 'connected',
    storageUsed: '45%',
    memoryUsage: '62%'
  };
  
  // Charts data
  userGrowthData: any[] = [];
  teamPerformanceData: any[] = [];
  matchActivityData: any[] = [];
  
  isLoading = true;
  selectedUser: User | null = null;
  selectedTeam: Team | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private teamService: TeamService,
    private matchService: MatchService,
    private statisticsService: StatisticsService
  ) {}

  ngOnInit() {
    this.loadAdminData();
    this.initializeDashboard();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAdminData() {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
    });
  }

  private initializeDashboard() {
    this.loadSystemStats();
    this.loadRecentActivity();
    this.loadQuickManagementData();
    this.loadChartsData();
    
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }

  private loadSystemStats() {
    // Load comprehensive system statistics
    this.statisticsService.getSystemStats().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (stats) => {
        this.stats = { ...this.stats, ...stats };
      },
      error: (error) => {
        console.error('Error loading system stats:', error);
      }
    });
  }

  private loadRecentActivity() {
    this.statisticsService.getRecentActivity({ limit: 10 }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (activity) => {
        this.recentActivity = activity;
      },
      error: (error) => {
        console.error('Error loading recent activity:', error);
      }
    });
  }

  private loadQuickManagementData() {
    // Load recent users
    this.userService.getAllUsers({ limit: 5, sort: 'createdAt' }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.recentUsers = response.users;
      }
    });

    // Load recent teams
    this.teamService.getAllTeams({ limit: 5, sort: 'createdAt' }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.recentTeams = response.teams;
      }
    });

    // Load recent matches
    this.matchService.getMatches({ limit: 5, sort: 'fechaHora' }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.recentMatches = response.matches;
      }
    });
  }

  private loadChartsData() {
    // Load user growth chart data
    this.statisticsService.getUserGrowth({ period: '6months' }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.userGrowthData = data;
      }
    });

    // Load team performance data
    this.statisticsService.getTeamPerformance({ season: 'current' }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.teamPerformanceData = data;
      }
    });

    // Load match activity data
    this.statisticsService.getMatchActivity({ period: '3months' }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.matchActivityData = data;
      }
    });
  }

  // Modal management
  openUserModal(user: User) {
    this.selectedUser = user;
    this.userModal.present();
  }

  openTeamModal(team: Team) {
    this.selectedTeam = team;
    this.teamModal.present();
  }

  closeModal(modalType: 'user' | 'team') {
    if (modalType === 'user') {
      this.userModal.dismiss();
      this.selectedUser = null;
    } else {
      this.teamModal.dismiss();
      this.selectedTeam = null;
    }
  }

  // Quick actions
  createNewUser() {
    // Navigate to user creation page or open creation modal
    console.log('Create new user');
  }

  createNewTeam() {
    // Navigate to team creation page or open creation modal
    console.log('Create new team');
  }

  scheduleMatch() {
    // Navigate to match scheduling page
    console.log('Schedule new match');
  }

  generateReport() {
    // Generate system report
    console.log('Generate system report');
  }

  backupSystem() {
    // Trigger system backup
    console.log('Backup system');
  }

  // Utility methods
  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return 'danger';
      case 'coach': return 'warning';
      case 'player': return 'success';
      case 'user': return 'medium';
      default: return 'light';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'medium';
      case 'pending': return 'warning';
      case 'suspended': return 'danger';
      default: return 'light';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'user_created': return 'person-add-outline';
      case 'team_created': return 'shield-outline';
      case 'match_scheduled': return 'calendar-outline';
      case 'user_login': return 'log-in-outline';
      case 'system_backup': return 'archive-outline';
      default: return 'information-circle-outline';
    }
  }

  formatActivityTime(timestamp: Date): string {
    const now = new Date();
    const timeDiff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(timeDiff / (1000 * 60));
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  trackByTeamId(index: number, team: Team): number {
    return team.id;
  }

  trackByMatchId(index: number, match: Match): number {
    return match.id;
  }
}