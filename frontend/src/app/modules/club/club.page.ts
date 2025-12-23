import { Component, OnInit } from '@angular/core';
import { PublicService } from 'src/app/core/services/public/public.service';
import { PublicTeam, PublicPlayer } from 'src/app/shared/models/models';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-club',
  templateUrl: './club.page.html',
  styleUrls: ['./club.page.scss'],
})
export class ClubPage implements OnInit {

  teams: PublicTeam[] = [];
  selectedTeam: PublicTeam | null = null;
  roster: PublicPlayer[] = [];
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
    this.publicSvc.getPublicTeams().subscribe(data => {
      this.teams = data;
      this.loading = false;
    });
  }

  async openTeam(team: PublicTeam) {
    this.selectedTeam = team;
    const loading = await this.loadingCtrl.create({ message: 'Cargando plantilla...' });
    await loading.present();

    this.publicSvc.getTeamRoster(team.idEquipo).subscribe({
      next: (players) => {
        // Ordenamos por dorsal
        this.roster = players.sort((a, b) => (a.dorsal || 99) - (b.dorsal || 99));
        loading.dismiss();
      },
      error: () => {
        loading.dismiss();
      }
    });
  }

  closeTeam() {
    this.selectedTeam = null;
    this.roster = [];
  }
}