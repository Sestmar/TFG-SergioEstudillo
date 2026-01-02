import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.page.html',
  styleUrls: ['./team-detail.page.scss'],
})
export class TeamDetailPage implements OnInit {

  teamId: number | null = null;
  teamData: any = null;
  players: any[] = [];
  staff: any[] = [];
  loading = true;
  
  selectedSegment = 'squad'; // 'squad' o 'staff'

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminSvc: AdminService,
    private location: Location
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.teamId = +id;
        this.loadTeamDetails();
      }
    });
  }

  loadTeamDetails() {
    this.loading = true;
    if (!this.teamId) return;

    this.adminSvc.getTeamDetails(this.teamId).subscribe({
      next: (res) => {
        // El backend devuelve: { equipo: {...}, jugadores: [...], staff: [...] }
        this.teamData = res.equipo;
        this.players = res.jugadores || [];
        this.staff = res.staff || [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  goBack() {
    this.location.back();
  }

  // Ir al calendario filtrado por este equipo
  goToCalendar() {
      this.router.navigate(['/calendar'], { queryParams: { teamId: this.teamId } });
  }
}