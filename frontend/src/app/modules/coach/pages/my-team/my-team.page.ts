import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { AlertController, ToastController, LoadingController, NavController } from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { CoachService } from 'src/app/core/services/coach/coach.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Jugador } from 'src/app/shared/models/models';
import { filter, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.page.html',
  styleUrls: ['./my-team.page.scss'],
})
export class MyTeamPage implements OnInit {

  private destroyRef = inject(DestroyRef);

  // 🔥 LISTAS SEPARADAS
  injuredPlayers: Jugador[] = []; 
  
  keepers: Jugador[] = [];
  defenders: Jugador[] = [];
  midfielders: Jugador[] = [];
  forwards: Jugador[] = [];
  others: Jugador[] = []; 
  
  allPlayersCount: number = 0;
  coachTeamId: number | null = null; 
  coachTeamName: string = ''; 
  
  loading: boolean = true;
  isModalOpen = false;      
  isEditModalOpen = false;  
  selectedPlayer: Jugador | null = null;
  
  injuryData = { tipo: '', duracion: '', notas: '' };

  techData = {
    dorsal: null as number | null,
    posicion: '',
    teamId: null as number | null
  };

  posicionesDisponibles = [
    'PORTERO', 'DEFENSA', 'LATERAL_DERECHO', 'LATERAL_IZQUIERDO', 'CENTRAL',
    'MEDIOCENTRO', 'EXTREMO', 'DELANTERO', 'PIVOTE', 'MEDIA_PUNTA'
  ];

  customPopoverOptions: any = {
    cssClass: 'custom-dark-popover'
  };

  constructor(
    private playerService: PlayerService,
    private authSvc: AuthService,
    private coachSvc: CoachService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController
  ) { }

  goBack() {
    this.navCtrl.back();
  }

  ngOnInit() {
    this.detectCoachTeam();
  }

  detectCoachTeam() {
    this.loading = true;
    this.authSvc.currentUser$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(user => !!user),
        switchMap(user => this.coachSvc.getDashboardData(user!.idUsuario))
      )
      .subscribe({
        next: (response) => {
          const equipo = response.equipo;
          if (equipo) {
             this.coachTeamId = Number(equipo.idEquipo || equipo.id);
             this.coachTeamName = equipo.nombre;
             this.loadPlayers();
          } else {
             this.loading = false;
          }
        },
        error: (err) => {
          console.error('Error cargando equipo:', err);
          this.loading = false;
        }
      });
  }

  loadPlayers() {
    if (!this.coachTeamId) return;

    this.playerService.getAllPlayers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (all: Jugador[]) => {
        const myPlayers = all.filter((p: Jugador) => {
              const playerTeamId = this.getTeamIdFromPlayer(p);
              return playerTeamId == this.coachTeamId;
        });

        this.allPlayersCount = myPlayers.length;
        this.organizeByPosition(myPlayers);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // 🔥 LÓGICA DE FILTRADO (Con Cast 'as any' para TypeScript)
  private organizeByPosition(players: Jugador[]) {
      this.injuredPlayers = players.filter(p => p.estado === 'LESIONADO' || p.estado === 'BAJA');
      const available = players.filter(p => p.estado !== 'LESIONADO' && p.estado !== 'BAJA');

      // 3. Organizar Disponibles por Posición
      this.keepers = available.filter(p => this.checkPos(p, ['PORTERO']));
      
      this.defenders = available.filter(p => this.checkPos(p, ['DEFENSA', 'CENTRAL', 'LATERAL_DERECHO', 'LATERAL_IZQUIERDO']));
      
      this.midfielders = available.filter(p => this.checkPos(p, ['MEDIOCENTRO', 'PIVOTE', 'MEDIA_PUNTA']));
      
      this.forwards = available.filter(p => this.checkPos(p, ['DELANTERO', 'EXTREMO']));

      this.others = available.filter(p => {
          const pos = p.posicion ? p.posicion.toUpperCase() : '';
          const esPortero = ['PORTERO'].includes(pos);
          const esDefensa = ['DEFENSA', 'CENTRAL', 'LATERAL_DERECHO', 'LATERAL_IZQUIERDO'].includes(pos);
          const esMedio = ['MEDIOCENTRO', 'PIVOTE', 'MEDIA_PUNTA'].includes(pos);
          const esDelantero = ['DELANTERO', 'EXTREMO'].includes(pos);
          return !esPortero && !esDefensa && !esMedio && !esDelantero;
      });
  }

  private checkPos(p: Jugador, validPositions: string[]): boolean {
      const pos = p.posicion ? p.posicion.toUpperCase() : '';
      return validPositions.includes(pos);
  }

  private getTeamIdFromPlayer(p: Jugador): number | null {
    if (!p) return null;
    if (p.equipoPrincipal && typeof p.equipoPrincipal === 'object') {
        return Number(p.equipoPrincipal.idEquipo || p.equipoPrincipal.id);
    }
    if (typeof p.equipoPrincipal === 'number') return Number(p.equipoPrincipal);
    return null;
  }

  // --- MODALES ---
  openEditModal(player: Jugador) {
    this.selectedPlayer = player;
    this.techData = {
      dorsal: player.dorsal || null,
      posicion: player.posicion || '',
      teamId: this.coachTeamId
    };
    this.isEditModalOpen = true;
  }

  switchToInjuryModal() {
    const playerToReport = this.selectedPlayer;
    this.isEditModalOpen = false;
    setTimeout(() => {
        if(playerToReport) this.openInjuryModal(playerToReport);
    }, 200); 
  }

  async saveTechnicalData() {
    if (!this.selectedPlayer) return;
    const loading = await this.loadingCtrl.create({ message: 'Actualizando...' });
    await loading.present();

    const cambios = {
      dorsal: this.techData.dorsal,
      posicion: this.techData.posicion,
      equipoPrincipal: this.coachTeamId 
    };

    const payload = this.prepareDto(this.selectedPlayer, cambios);
    const playerId = this.selectedPlayer.idJugador || this.selectedPlayer.id;

    this.playerService.updatePlayer(playerId, payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: async () => {
        await loading.dismiss();
        this.closeModals();
        this.showToast('Ficha actualizada', 'success');
        this.loadPlayers(); 
      },
      error: async () => {
        await loading.dismiss();
        this.showToast('Error al actualizar', 'danger');
      }
    });
  }

  private prepareDto(player: Jugador, cambios: Record<string, unknown>): Record<string, unknown> {
    return {
      idUsuario: player.usuario?.id || player.usuario?.idUsuario,
      posicion: cambios['posicion'] !== undefined ? cambios['posicion'] : player.posicion,
      dorsal: cambios['dorsal'] !== undefined ? cambios['dorsal'] : player.dorsal,
      estado: cambios['estado'] || player.estado || 'ACTIVO',
      equipoPrincipal: this.coachTeamId,
      observaciones: cambios['observaciones'] || player.observaciones,
      fechaNacimiento: player.fechaNacimiento,
      fechaAlta: player.fechaAlta
    };
  }

  openInjuryModal(player: Jugador) {
    this.selectedPlayer = player;
    this.injuryData = { tipo: '', duracion: '', notas: '' };
    this.isModalOpen = true;
  }

  async saveInjury() {
    if (!this.selectedPlayer) return;
    const loading = await this.loadingCtrl.create({ message: 'Registrando...' });
    await loading.present();
    
    // Cambiamos estado a LESIONADO
    const cambios = { estado: 'LESIONADO', observaciones: `Baja: ${this.injuryData.tipo} (${this.injuryData.duracion})` };
    const payload = this.prepareDto(this.selectedPlayer, cambios);
    const playerId = this.selectedPlayer.idJugador || this.selectedPlayer.id;

    this.playerService.updatePlayer(playerId, payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: async () => {
        await loading.dismiss();
        this.closeModals();
        this.loadPlayers();
        this.showToast('Baja registrada en enfermería', 'warning');
      },
      error: async () => { await loading.dismiss(); }
    });
  }

  onEditModalDismiss() {
    this.isEditModalOpen = false;
    // IMPORTANTE: No tocamos isModalOpen aquí
  }

  onInjuryModalDismiss() {
    this.isModalOpen = false;
    this.selectedPlayer = null; // Limpiamos selección al salir de la lesión
  }
  
  closeModals() {
    this.isModalOpen = false;
    this.isEditModalOpen = false;
    this.selectedPlayer = null;
  }

  async setRecovered(player: Jugador) {
      const alert = await this.alertCtrl.create({
      header: '🏥 ¿Alta Médica?',
      subHeader: `${player.usuario?.nombre || ''} volverá a estar disponible.`,
      cssClass: 'night-alert',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar Alta',
          handler: () => {
            const payload = this.prepareDto(player, { estado: 'ACTIVO', observaciones: 'Alta médica' });
            const id = player.idJugador || player.id;
            this.playerService.updatePlayer(id, payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
                this.closeModals(); 
                this.loadPlayers();
                this.showToast('Jugador recuperado y disponible', 'success');
            });
          }
        }
      ]
    });
    await alert.present();
  }

  getAvatar(p: Jugador): string {
    return p.usuario?.fotoUrl || `https://ui-avatars.com/api/?name=${p.usuario?.nombre || ''}&background=random`;
  }
  
  async showToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    t.present();
  }
}