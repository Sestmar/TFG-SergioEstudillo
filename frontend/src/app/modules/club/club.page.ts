import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingController } from '@ionic/angular';
import { OpenService } from '../../core/services/open/open.service';
import { PublicTeam, PublicPlayer, AdminEquipoDto, UsuarioResumen } from '../../shared/models/models';

interface StaffMember {
  nombre: string;
  apellidos: string;
  rol: string;
  fotoUrl: string;
}

@Component({
  selector: 'app-club',
  templateUrl: './club.page.html',
  styleUrls: ['./club.page.scss'],
})
export class ClubPage implements OnInit {

  private destroyRef = inject(DestroyRef);
  teams: PublicTeam[] = [];
  selectedTeam: AdminEquipoDto | null = null;
  roster: PublicPlayer[] = [];
  staff: StaffMember[] = [];
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
    this.openSvc.getPublicTeams().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (data) => {
            this.teams = data;
            this.loading = false;
        },
        error: () => {
            this.loading = false;
        }
    });
  }

  async openTeam(teamSummary: PublicTeam) {
    this.selectedTeam = teamSummary; 
    this.staff = []; 
    this.roster = [];
    this.coachName = null; // Reiniciamos al abrir

    const loading = await this.loadingCtrl.create({ message: 'Cargando ficha...', spinner: 'crescent' });
    await loading.present();

    const teamId = teamSummary.idEquipo;

    // 1. OBTENER DETALLE Y EXTRAER ENTRENADOR
    this.openSvc.getTeamDetail(teamId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (fullTeam) => {
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
        error: () => {}
    });

    // 2. CARGAR JUGADORES
    // En el método openTeam -> getTeamRoster
    this.openSvc.getTeamRoster(teamId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (players: PublicPlayer[]) => {
        this.roster = players
            .map(p => ({
                ...p,
                nombre: p.nombre || 'Jugador',
                apellidos: p.apellidos || '',
                dorsal: p.dorsal || 99,
                goles: p.goles || 0,
                asistencias: p.asistencias || 0,
                fotoUrl: p.fotoUrl || `https://ui-avatars.com/api/?name=${p.nombre}&background=random`
            }))
            .sort((a, b) => (a.dorsal || 99) - (b.dorsal || 99));
        
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

  getEstadoClass(estado?: string): string {
    switch (estado?.toUpperCase()) {
      case 'LESIONADO': return 'estado-lesionado';
      case 'BAJA':      return 'estado-baja';
      case 'ACTIVO':
      default:          return 'estado-activo';
    }
  }
}