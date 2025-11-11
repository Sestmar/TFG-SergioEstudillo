import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Team, TeamService } from '@core/services';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {
  featuredTeams$: Observable<Team[]>;
  isLoading = true;

  constructor(
    private teamService: TeamService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFeaturedTeams();
  }

  /**
   * Carga los equipos destacados
   */
  private loadFeaturedTeams() {
    this.featuredTeams$ = this.teamService.getFeaturedTeams();
    this.featuredTeams$.subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading featured teams:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Navega a la página de registro
   */
  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Navega a la página de login
   */
  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Navega al detalle de un equipo
   */
  viewTeamDetails(teamId: number) {
    this.router.navigate(['/teams', teamId]);
  }

  /**
   * Navega a la lista de equipos
   */
  viewAllTeams() {
    this.router.navigate(['/teams']);
  }
}