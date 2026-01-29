import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Player } from 'src/app/shared/models/models';
import { filter, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment'; // ✅ Importado para Render

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.page.html',
  styleUrls: ['./my-team.page.scss'],
})
export class MyTeamPage implements OnInit {
  
  // 🔥 LISTAS SEPARADAS
  injuredPlayers: Player[] = []; 
  
  keepers: Player[] = [];
  defenders: Player[] = [];
  midfielders: Player[] = [];
  forwards: Player[] = [];
  others: Player[] = []; 
  
  allPlayersCount: number = 0;
  coachTeamId: number | null = null; 
  coachTeamName: string = ''; 
  
  loading: boolean = true;
  isModalOpen = false;      
  isEditModalOpen = false;  
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

  customPopoverOptions: any = {
    cssClass: 'custom-dark-popover'
  };

  constructor(
    private playerService: PlayerService,
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
    this.loading = true;
    this.authSvc.currentUser$
      .pipe(
        filter(user => !!user), 
        switchMap(user => {
          const u = user as any;
          const userId = u.id || u.idUsuario || u.sub;
          // ✅ CORRECCIÓN: Usando environment.apiUrl para Render/Móvil
          return this.http.get(`${environment.apiUrl}/entrenadores/usuario/${userId}/equipo`);
        })
      )
      .subscribe({
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
        error: (err) => {
          console.error('Error cargando equipo:', err);
          this.loading = false;
        }
      });
  }

  loadPlayers() {
    if (!this.coachTeamId) return;

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

  // 🔥 LÓGICA DE FILTRADO (Con Cast 'as any' para TypeScript)
  private organizeByPosition(players: Player[]) {
      // 1. Separar Lesionados
      this.injuredPlayers = players.filter(p => {
          const estado = (p as any).estado;
          return estado === 'LESIONADO' || estado === 'BAJA';
      });

      // 2. Filtrar Disponibles (Para el resto de listas)
      const available = players.filter(p => {
          const estado = (p as any).estado;
          return estado !== 'LESIONADO' && estado !== 'BAJA';
      });

      // 3. Organizar Disponibles por Posición
      this.keepers = available.filter(p => this.checkPos(p, ['PORTERO']));
      
      this.defenders = available.filter(p => this.checkPos(p, ['DEFENSA', 'CENTRAL', 'LATERAL_DERECHO', 'LATERAL_IZQUIERDO']));
      
      this.midfielders = available.filter(p => this.checkPos(p, ['MEDIOCENTRO', 'PIVOTE', 'MEDIA_PUNTA']));
      
      this.forwards = available.filter(p => this.checkPos(p, ['DELANTERO', 'EXTREMO']));

      // 4. Los que sobran
      this.others = available.filter(p => {
          const pos = (p as any).posicion ? (p as any).posicion.toUpperCase() : '';
          const esPortero = ['PORTERO'].includes(pos);
          const esDefensa = ['DEFENSA', 'CENTRAL', 'LATERAL_DERECHO', 'LATERAL_IZQUIERDO'].includes(pos);
          const esMedio = ['MEDIOCENTRO', 'PIVOTE', 'MEDIA_PUNTA'].includes(pos);
          const esDelantero = ['DELANTERO', 'EXTREMO'].includes(pos);
          return !esPortero && !esDefensa && !esMedio && !esDelantero;
      });
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

  // --- MODALES ---
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
    const playerId = (this.selectedPlayer as any).id || (this.selectedPlayer as any).idJugador;

    this.playerService.updatePlayer(playerId, payload).subscribe({
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
    
    // Cambiamos estado a LESIONADO
    const cambios = { estado: 'LESIONADO', observaciones: `Baja: ${this.injuryData.tipo} (${this.injuryData.duracion})` };
    const payload = this.prepareDto(this.selectedPlayer, cambios);
    const playerId = (this.selectedPlayer as any).id || (this.selectedPlayer as any).idJugador;

    this.playerService.updatePlayer(playerId, payload).subscribe({
      next: async () => {
        await loading.dismiss();
        this.closeModals(); 
        this.loadPlayers(); 
        this.showToast('Baja registrada en enfermería', 'warning');
      },
      error: async () => { await loading.dismiss(); }
    });
  }

  onModalDismiss() {
      this.isModalOpen = false;
      this.isEditModalOpen = false;
  }
  
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
            const payload = this.prepareDto(player, { estado: 'ACTIVO', observaciones: 'Alta médica' });
            const id = (player as any).id || (player as any).idJugador;
            this.playerService.updatePlayer(id, payload).subscribe(() => {
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

  getAvatar(p: Player): string {
    const u = p.usuario as any;
    return u.fotoUrl || `https://ui-avatars.com/api/?name=${u.nombre}&background=random`;
  }
  
  async showToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    t.present();
  }
}