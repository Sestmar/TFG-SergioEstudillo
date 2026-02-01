import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { OpenService } from '../../core/services/open/open.service';

@Component({
  selector: 'app-club',
  templateUrl: './club.page.html',
  styleUrls: ['./club.page.scss'],
})
export class ClubPage implements OnInit {

  teams: any[] = [];
  selectedTeam: any | null = null;
  roster: any[] = [];
  staff: any[] = [];
  loading = true;

  // ✅ VARIABLE SIMPLE PARA EL HTML
  coachName: string | null = null; 

  constructor(
    private openSvc: OpenService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.loading = true;
    this.openSvc.getPublicTeams().subscribe({
        next: (data) => {
            this.teams = data;
            this.loading = false;
        },
        error: (err) => {
            console.error('Error equipos:', err);
            this.loading = false;
        }
    });
  }

  async openTeam(teamSummary: any) {
    this.selectedTeam = teamSummary; 
    this.staff = []; 
    this.roster = [];
    this.coachName = null; // Reiniciamos al abrir

    const loading = await this.loadingCtrl.create({ message: 'Cargando ficha...', spinner: 'crescent' });
    await loading.present();

    const teamId = teamSummary.id || teamSummary.idEquipo;

    // 1. OBTENER DETALLE Y EXTRAER ENTRENADOR
    this.openSvc.getTeamDetail(teamId).subscribe({
        next: (fullTeam) => {
            console.log('✅ FICHA:', fullTeam);
            this.selectedTeam = fullTeam; 

            // 🔥 INTENTO DE EXTRACCIÓN DIRECTA (Buscamos en todos los rincones)
            let entrenador = null;
            
            // Prioridad 1: Propiedad 'entrenador' (Visto en tu consola)
            if (fullTeam.entrenador && fullTeam.entrenador.usuario) {
                entrenador = fullTeam.entrenador.usuario;
            }
            // Prioridad 2: Propiedad 'entrenadorPrincipal' (Modelo estricto)
            else if (fullTeam.entrenadorPrincipal && fullTeam.entrenadorPrincipal.usuario) {
                entrenador = fullTeam.entrenadorPrincipal.usuario;
            }

            // SI ENCONTRAMOS ALGO, ACTUALIZAMOS LA VARIABLE
            if (entrenador) {
                const nombre = entrenador.nombre || '';
                const apellidos = entrenador.apellidos || '';
                this.coachName = `${nombre} ${apellidos}`.trim();

                // Y lo metemos al staff visual también
                this.staff = [{
                    nombre: nombre,
                    apellidos: apellidos,
                    rol: 'Entrenador Principal',
                    fotoUrl: entrenador.fotoUrl || `https://ui-avatars.com/api/?name=${nombre}&background=random`
                }];
            } else if (fullTeam.entrenadorNombre) {
                // Fallback texto plano
                this.coachName = fullTeam.entrenadorNombre;
            }
        },
        error: () => console.log('Error carga detalle')
    });

    // 2. CARGAR JUGADORES
    this.openSvc.getTeamRoster(teamId).subscribe({
      next: (players) => {
        const lista = Array.isArray(players) ? players : [];
        this.roster = lista.map((p: any) => ({
            ...p,
            nombre: p.usuario?.nombre || p.nombre || 'Jugador',
            apellidos: p.usuario?.apellidos || p.apellidos || '',
            dorsal: p.dorsal || 99,
            goles: p.goles || 0,
            asistencias: p.asistencias || 0,
            fotoUrl: p.fotoUrl || p.usuario?.fotoUrl || `https://ui-avatars.com/api/?name=${p.usuario?.nombre || 'U'}&background=random`
        })).sort((a: any, b: any) => a.dorsal - b.dorsal);
        
        loading.dismiss();
      },
      error: () => { loading.dismiss(); }
    });
  }

  closeTeam() {
    this.selectedTeam = null;
    this.roster = [];
    this.staff = [];
    this.coachName = null;
  }
}