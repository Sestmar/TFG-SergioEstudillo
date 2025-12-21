import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { Player } from 'src/app/shared/models/models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  
  currentUser: any = null;
  playerData: Player | null = null;
  loading: boolean = true;
  
  editForm = {
    telefono: '',
    direccion: '',
    fotoUrl: ''
  };

  constructor(
    private authSvc: AuthService,
    private playerSvc: PlayerService,
    private location: Location,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.authSvc.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        const u = user as any;
        const userId = u.id || u.idUsuario;
        
        this.playerSvc.getAllPlayers().subscribe({
          next: (res: any) => {
            const list = Array.isArray(res) ? res : (res.data || []);
            const myPlayer = list.find((p: any) => {
                const pUser = p.usuario || {};
                return (pUser.id || pUser.idUsuario || p.idUsuario) === userId;
            });
            
            if (myPlayer) {
              this.playerData = myPlayer;
              const raw = myPlayer as any;
              this.editForm.telefono = raw.telefonoContacto || '';
              this.editForm.direccion = raw.direccion || '';
              const userFoto = (myPlayer.usuario as any)?.fotoPerfil || (myPlayer.usuario as any)?.fotoUrl;
              this.editForm.fotoUrl = userFoto || raw.fotoUrl || '';
            }
            this.loading = false;
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
          }
        });
      }
    });
  }

  // ✅ HELPER VITAL PARA EL HTML
  getTeamNameDisplay(): string {
    if (!this.playerData) return 'Cargando...';
    
    const p = this.playerData as any;
    const team = p.equipoPrincipal || p.equipo || p.equipoActual;

    if (team && typeof team === 'object') {
        return team.nombre + (team.categoria ? ` (${team.categoria.nombre})` : '');
    }
    
    if (team === 23) return 'Primer Equipo (Senior)';

    return 'Sin Equipo Asignado';
  }

  private prepareDto(player: Player, form: any): any {
    const rawPlayer = player as any;
    const rawUser = (player.usuario || {}) as any;

    let teamToSend = rawPlayer.equipoPrincipal;
    if (teamToSend && typeof teamToSend === 'object') {
        teamToSend = teamToSend.id || teamToSend.idEquipo;
    }

    return {
      idUsuario: rawUser.id || rawUser.idUsuario, 
      posicion: rawPlayer.posicionPrimaria || rawPlayer.posicion, 
      equipoPrincipal: teamToSend, 
      dorsal: player.dorsal,
      estado: rawPlayer.estado, 
      observaciones: rawPlayer.observaciones,
      telefonoContacto: form.telefono,
      direccion: form.direccion,
      // Fechas limpias
      fechaNacimiento: rawPlayer.fechaNacimiento ? new Date(rawPlayer.fechaNacimiento).toISOString().split('T')[0] : null,
      fechaAlta: rawPlayer.fechaAlta ? new Date(rawPlayer.fechaAlta).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      fechaBaja: rawPlayer.fechaBaja ? new Date(rawPlayer.fechaBaja).toISOString().split('T')[0] : null,
    };
  }

  async saveProfile() {
    if (!this.playerData) return;
    const loader = await this.loadingCtrl.create({ message: 'Guardando cambios...' });
    await loader.present();

    const updatePayload = this.prepareDto(this.playerData, this.editForm);
    const raw = this.playerData as any;
    const playerId = raw.id || raw.idJugador;

    this.playerSvc.updatePlayer(playerId, updatePayload).subscribe({
      next: async () => {
        await loader.dismiss();
        this.showToast('Perfil actualizado correctamente', 'success');
        this.loadProfile(); 
      },
      error: async (err) => {
        await loader.dismiss();
        console.error('Error al guardar:', err);
        this.showToast('Error al guardar perfil', 'danger');
      }
    });
  }

  goBack() {
    this.location.back();
  }

  async showToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    t.present();
  }
}