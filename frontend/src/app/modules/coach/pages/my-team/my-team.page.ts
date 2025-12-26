import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Player, Team } from 'src/app/shared/models/models';

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.page.html',
  styleUrls: ['./my-team.page.scss'],
})
export class MyTeamPage implements OnInit {
  
  keepers: Player[] = [];
  defenders: Player[] = [];
  midfielders: Player[] = [];
  forwards: Player[] = [];
  
  allPlayersCount: number = 0;
  coachTeamId: number | null = null; 
  coachTeamName: string = ''; 
  
  loading: boolean = true;
  isModalOpen = false;      // Modal de Lesión
  isEditModalOpen = false;  // Modal de Ficha Técnica
  selectedPlayer: Player | null = null;
  
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

  // Opciones para que el popover del select se vea oscuro
  customPopoverOptions: any = {
    cssClass: 'custom-dark-popover'
  };

  constructor(
    private playerService: PlayerService,
    private teamService: TeamService,
    private authSvc: AuthService,
    private http: HttpClient,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.detectCoachTeam();
  }

  detectCoachTeam() {
    this.authSvc.currentUser$.subscribe(user => {
      if (user) {
        const u = user as any;
        const userId = u.id || u.idUsuario;

        this.http.get(`http://localhost:8080/api/entrenadores/usuario/${userId}/equipo`).subscribe({
          next: (response: any) => {
            const equipo = response.equipo; 
            if (equipo) {
                this.coachTeamId = Number(equipo.idEquipo || equipo.id); 
                this.coachTeamName = equipo.nombre;
                this.loadPlayers();
            } else {
                this.loading = false;
            }
          },
          error: () => this.loading = false
        });
      }
    });
  }

  loadPlayers() {
    if (!this.coachTeamId) return;

    this.loading = true;
    this.playerService.getAllPlayers().subscribe({
      next: (res: any) => {
        const all = Array.isArray(res) ? res : (res.data || []);
        
        const myPlayers = all.filter((p: any) => {
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

  private organizeByPosition(players: Player[]) {
      this.keepers = players.filter(p => this.checkPos(p, ['PORTERO']));
      this.defenders = players.filter(p => this.checkPos(p, ['DEFENSA', 'CENTRAL', 'LATERAL_DERECHO', 'LATERAL_IZQUIERDO']));
      this.midfielders = players.filter(p => this.checkPos(p, ['MEDIOCENTRO', 'PIVOTE', 'MEDIA_PUNTA']));
      this.forwards = players.filter(p => this.checkPos(p, ['DELANTERO', 'EXTREMO']));
  }

  private checkPos(p: any, validPositions: string[]): boolean {
      const pos = p.posicion ? p.posicion.toUpperCase() : '';
      return validPositions.includes(pos);
  }

  private getTeamIdFromPlayer(p: any): number | null {
    if (!p) return null;
    if (p.equipoPrincipal && typeof p.equipoPrincipal === 'object') {
        return Number(p.equipoPrincipal.idEquipo || p.equipoPrincipal.id);
    }
    if (typeof p.equipoPrincipal === 'number') return Number(p.equipoPrincipal);
    if (p.equipo && typeof p.equipo === 'object') return Number(p.equipo.idEquipo || p.equipo.id);
    return null;
  }

  // --- GESTIÓN DE MODALES ---
  openEditModal(player: Player) {
    this.selectedPlayer = player;
    const raw = player as any;
    this.techData = {
      dorsal: player.dorsal || null,
      posicion: raw.posicion || '',
      teamId: this.coachTeamId 
    };
    this.isEditModalOpen = true;
  }

  // 🔥 CORRECCIÓN BUG TRANSICIÓN
  switchToInjuryModal() {
    // Guardamos la referencia al jugador actual
    const playerToReport = this.selectedPlayer;
    
    // Cerramos el primer modal
    this.isEditModalOpen = false;

    // Abrimos el segundo modal con un pequeño delay, asegurando que tenemos el jugador
    setTimeout(() => {
        if(playerToReport) {
            this.openInjuryModal(playerToReport);
        }
    }, 200); // Aumentamos un poco el tiempo para asegurar fluidez
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
    const playerId = (this.selectedPlayer as any).id || (this.selectedPlayer as any).idJugador;

    this.playerService.updatePlayer(playerId, payload).subscribe({
      next: async () => {
        await loading.dismiss();
        this.closeModals(); // Cerramos y limpiamos
        this.showToast('Ficha actualizada', 'success');
        this.loadPlayers(); 
      },
      error: async () => {
        await loading.dismiss();
        this.showToast('Error al actualizar', 'danger');
      }
    });
  }

  private prepareDto(player: Player, cambios: any): any {
    const rawPlayer = player as any;
    return {
      idUsuario: rawPlayer.usuario.id || rawPlayer.usuario.idUsuario,
      posicion: cambios.posicion !== undefined ? cambios.posicion : rawPlayer.posicion,
      dorsal: cambios.dorsal !== undefined ? cambios.dorsal : player.dorsal,
      estado: cambios.estado || rawPlayer.estado || 'ACTIVO',
      equipoPrincipal: this.coachTeamId,
      observaciones: cambios.observaciones || rawPlayer.observaciones,
      fechaNacimiento: rawPlayer.fechaNacimiento,
      fechaAlta: rawPlayer.fechaAlta
    };
  }

  openInjuryModal(player: Player) {
    this.selectedPlayer = player;
    this.injuryData = { tipo: '', duracion: '', notas: '' };
    this.isModalOpen = true;
  }

  async saveInjury() {
    if (!this.selectedPlayer) return;
    const loading = await this.loadingCtrl.create({ message: 'Registrando...' });
    await loading.present();
    
    const cambios = { estado: 'LESIONADO', observaciones: `Baja: ${this.injuryData.tipo}` };
    const payload = this.prepareDto(this.selectedPlayer, cambios);
    const playerId = (this.selectedPlayer as any).id || (this.selectedPlayer as any).idJugador;

    this.playerService.updatePlayer(playerId, payload).subscribe({
      next: async () => {
        await loading.dismiss();
        this.closeModals(); // Cerramos y limpiamos
        this.loadPlayers(); 
        this.showToast('Baja registrada', 'warning');
      },
      error: async () => { await loading.dismiss(); }
    });
  }

  // 🔥 CORRECCIÓN: No limpiamos el jugador aquí inmediatamente
  // Esto se llama cuando el modal se cierra por arrastre o click fuera
  onModalDismiss() {
      this.isModalOpen = false;
      this.isEditModalOpen = false;
      // NO ponemos selectedPlayer a null aquí para evitar el bug de transición
  }
  
  // Método explícito para cerrar y limpiar cuando terminamos
  closeModals() {
    this.isModalOpen = false;
    this.isEditModalOpen = false;
    this.selectedPlayer = null;
  }

  async setRecovered(player: Player) {
      const alert = await this.alertCtrl.create({
      header: '¿Alta Médica?',
      subHeader: `${player.usuario.nombre} volverá a estar disponible.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar Alta',
          handler: () => {
            const payload = this.prepareDto(player, { estado: 'ACTIVO' });
            const id = (player as any).id || (player as any).idJugador;
            this.playerService.updatePlayer(id, payload).subscribe(() => {
                this.closeModals(); // Cerramos y limpiamos
                this.loadPlayers();
                this.showToast('Jugador recuperado', 'success');
            });
          }
        }
      ]
    });
    await alert.present();
  }

  getAvatar(p: Player): string {
    const u = p.usuario as any;
    return u.fotoUrl || `https://ui-avatars.com/api/?name=${u.nombre}&background=random`;
  }
  
  async showToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    t.present();
  }
}