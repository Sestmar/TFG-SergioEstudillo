import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';

// ✅ Esta ruta es infalible para Docker y funciona en tu local
import { PublicService } from 'src/app/core/services/public/public.service';
import { PublicTeam, PublicPlayer } from 'src/app/shared/models/models';

@Component({
  selector: 'app-club',
  templateUrl: './club.page.html',
  styleUrls: ['./club.page.scss'],
})
export class ClubPage implements OnInit {

  teams: PublicTeam[] = [];
  selectedTeam: PublicTeam | null = null;
  roster: any[] = [];
  loading = true;

  constructor(
    private publicSvc: PublicService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.loading = true;
    this.publicSvc.getPublicTeams().subscribe({
        next: (data) => {
            this.teams = data;
            this.loading = false;
        },
        error: () => this.loading = false
    });
  }

  async openTeam(team: PublicTeam) {
    this.selectedTeam = team;
    
    const loading = await this.loadingCtrl.create({ 
      message: 'Cargando plantilla...', 
      spinner: 'crescent' 
    });
    await loading.present();

    this.publicSvc.getTeamRoster(team.idEquipo).subscribe({
      next: (players) => {
        this.roster = players
            .map((p: any) => ({
                ...p,
                goles: p.goles || 0,
                asistencias: p.asistencias || 0,
                fotoUrl: p.fotoUrl || null
            }))
            .sort((a, b) => (a.dorsal || 99) - (b.dorsal || 99));
        
        loading.dismiss();
      },
      error: () => {
        this.roster = [];
        loading.dismiss();
      }
    });
  }

  closeTeam() {
    this.selectedTeam = null;
    this.roster = [];
  }
}