import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';

// ✅ CORRECCIÓN: Usamos TeamService con ruta relativa física
import { TeamService } from '../../core/services/team/team.service';
// Usamos 'any' para evitar conflictos de modelos antiguos
import { Team } from '../../shared/models/models'; 

@Component({
  selector: 'app-club',
  templateUrl: './club.page.html',
  styleUrls: ['./club.page.scss'],
})
export class ClubPage implements OnInit {

  teams: any[] = [];
  selectedTeam: any | null = null;
  roster: any[] = [];
  loading = true;

  constructor(
    private teamSvc: TeamService, // ✅ Inyectamos TeamService
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.loading = true;
    // ✅ Usamos getTeams del servicio corregido
    this.teamSvc.getTeams().subscribe({
        next: (data: any) => {
            // Manejamos si devuelve array directo o objeto con propiedad teams
            this.teams = Array.isArray(data) ? data : (data.teams || []);
            this.loading = false;
        },
        error: () => this.loading = false
    });
  }

  async openTeam(team: any) {
    this.selectedTeam = team;
    
    const loading = await this.loadingCtrl.create({ 
      message: 'Cargando plantilla...', 
      spinner: 'crescent' 
    });
    await loading.present();

    const teamId = team.id || team.idEquipo;

    // ✅ Usamos getTeamById para sacar los jugadores
    this.teamSvc.getTeamById(teamId).subscribe({
      next: (fullTeam: any) => {
        // Mapeamos los jugadores que vienen en el detalle del equipo
        const players = fullTeam.jugadores || [];
        
        this.roster = players
            .map((p: any) => ({
                ...p,
                nombre: p.nombre,
                apellidos: p.apellidos,
                dorsal: p.dorsal || 99,
                goles: p.goles || 0,
                asistencias: p.asistencias || 0,
                fotoUrl: p.fotoUrl || `https://ui-avatars.com/api/?name=${p.nombre}&background=random`
            }))
            .sort((a: any, b: any) => (a.dorsal) - (b.dorsal));
        
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