import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { MatchService } from 'src/app/core/services/match/match.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
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
  matches: any[] = []; 
  
  loading = true;
  selectedSegment = 'squad'; 
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminSvc: AdminService,
    private matchSvc: MatchService,
    private authSvc: AuthService,
    private location: Location
  ) { }

  ngOnInit() {
    // 1. Detectar Rol
    this.authSvc.currentUser$.subscribe(user => {
        const u = user as any;
        if (u && u.rol) {
            this.isAdmin = String(u.rol).toUpperCase().includes('ADMIN');
            console.log("👮‍♂️ TeamDetail - Es Admin:", this.isAdmin);
        }
    });

    // 2. Cargar Datos
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.teamId = +id;
        this.loadTeamDetails();
        this.loadTeamMatches();
      }
    });
  }

  loadTeamDetails() {
    this.loading = true;
    if (!this.teamId) return;

    this.adminSvc.getTeamDetails(this.teamId).subscribe({
      next: (res) => {
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

  loadTeamMatches() {
      if (!this.teamId) return;
      this.matchSvc.getMatchesByTeam(this.teamId).subscribe({
          next: (res) => {
              this.matches = res || [];
              // Ordenar: Próximos primero
              this.matches.sort((a,b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime());
          }
      });
  }

  // 🔥 ACCIÓN 1: IR A CERRAR ACTA (Solo Admin -> Lápiz)
  goToEditMatch(match: any) {
      const matchId = match.idPartido || match.id;
      console.log("✏️ Admin yendo a editar acta:", matchId);
      // Esto navega a la página de poner goles
      this.router.navigate(['/edit-match', matchId]);
  }

  // 🔥 ACCIÓN 2: IR A VER DETALLES (Para todos -> Ojo)
  goToViewMatch(match: any) {
      const matchId = match.idPartido || match.id;
      console.log("👁️ Viendo detalles (solo lectura):", matchId);
      this.router.navigate(['/match-detail', matchId]);
  }

  goBack() {
    this.location.back();
  }

  goToCalendar() {
      this.router.navigate(['/calendar'], { queryParams: { teamId: this.teamId } });
  }
}