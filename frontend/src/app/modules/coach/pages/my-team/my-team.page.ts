import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { Player } from 'src/app/shared/models/models';

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.page.html',
  styleUrls: ['./my-team.page.scss'],
})
export class MyTeamPage implements OnInit {
  players: Player[] = [];
  loading: boolean = true;
  
  isModalOpen = false;
  selectedPlayer: Player | null = null;
  injuryData = {
    tipo: '',
    duracion: '',
    notas: ''
  };

  constructor(
    private playerService: PlayerService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.loadPlayers();
  }

  loadPlayers() {
    this.loading = true;
    this.playerService.getAllPlayers().subscribe({
      next: (res: any) => {
        this.players = Array.isArray(res) ? res : (res.data || []);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  // --- HELPER ROBUSTO ---
  private prepareDto(player: Player, nuevoEstado: string, nuevasObservaciones: string): any {
    // Usamos 'as any' para poder leer propiedades que no coinciden con la interfaz estricta
    // pero que necesitamos enviar al backend.
    const rawPlayer = player as any;
    const rawUser = player.usuario as any;

    return {
      // Backend: idUsuario <--- Frontend: id (del usuario)
      idUsuario: rawUser.id || rawUser.idUsuario, 

      // Backend: posicion <--- Frontend: posicionPrimaria
      posicion: player.posicionPrimaria, 
      
      // Backend: equipoPrincipal <--- Frontend: equipoActual
      equipoPrincipal: player.equipoActual, 
      
      // Campos comunes
      dorsal: player.dorsal,
      estado: nuevoEstado,
      observaciones: nuevasObservaciones,

      // Campos que pueden no estar en la interfaz Player pero sí en el JSON del backend
      // Usamos 'rawPlayer' para evitar error de TypeScript "Property does not exist"
      fechaNacimiento: rawPlayer.fechaNacimiento || null,
      telefonoContacto: rawPlayer.telefonoContacto || null,
      direccion: rawPlayer.direccion || null,
      fechaAlta: rawPlayer.fechaAlta || new Date().toISOString(),
      fechaBaja: rawPlayer.fechaBaja || null,
    };
  }

  // --- OBTENER ID DEL JUGADOR DE FORMA SEGURA ---
  private getPlayerId(player: Player): number {
    const raw = player as any;
    // Intentamos leer 'id' y si no existe, leemos 'idJugador'
    // Esto previene el error ".../undefined"
    const id = raw.id || raw.idJugador;
    
    if (!id) {
      console.error("⛔ ERROR CRÍTICO: No se encuentra el ID del jugador", player);
    }
    return id;
  }

  // --- LÓGICA DEL MODAL ---

  openInjuryModal(player: Player) {
    this.selectedPlayer = player;
    this.injuryData = { tipo: '', duracion: '', notas: '' };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedPlayer = null;
  }

  async saveInjury() {
    if (!this.selectedPlayer) return;

    const loading = await this.loadingCtrl.create({ message: 'Registrando lesión...' });
    await loading.present();

    const obsTexto = `[BAJA MÉDICA] Tipo: ${this.injuryData.tipo} | Duración: ${this.injuryData.duracion} | Nota: ${this.injuryData.notas}`;
    
    // 1. Preparamos datos usando el mapeo correcto
    const payload = this.prepareDto(this.selectedPlayer, 'LESIONADO', obsTexto);
    
    // 2. Obtenemos ID de forma segura
    const playerId = this.getPlayerId(this.selectedPlayer);

    // 3. Enviamos
    this.playerService.updatePlayer(playerId, payload).subscribe({
      next: async () => {
        await loading.dismiss();
        this.closeModal();
        this.showToast('Jugador marcado como LESIONADO', 'warning');
        this.loadPlayers(); 
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('Error update:', err);
        this.showToast('Error al actualizar. Revisa la consola.', 'danger');
      }
    });
  }

  async setRecovered(player: Player) {
    const alert = await this.alertCtrl.create({
      header: '¿Dar de alta médica?',
      message: `¿${player.usuario.nombre} ya está listo para jugar?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, Alta Médica',
          handler: async () => {
            const payload = this.prepareDto(player, 'ACTIVO', 'Alta médica recibida. Disponible.');
            const id = this.getPlayerId(player);

            this.playerService.updatePlayer(id, payload).subscribe({
              next: () => {
                this.showToast('Jugador recuperado 💪', 'success');
                this.loadPlayers();
              },
              error: (err) => {
                console.error(err);
                this.showToast('Error al dar de alta', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async showToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    t.present();
  }

  getAvatar(p: Player): string {
    // Usamos 'as any' para acceder a fotoUrl o fotoPerfil sin que TS se queje
    const user = p.usuario as any;
    return user.fotoUrl || user.fotoPerfil || `https://ui-avatars.com/api/?name=${user.nombre}&background=random`;
  }
}