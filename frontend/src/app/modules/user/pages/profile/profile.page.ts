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
  
  // Datos editables
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
        // 🛠️ CORRECCIÓN 1: Casteamos a 'any' para evitar error si 'id' no está en la interfaz User
        const u = user as any;
        const userId = u.id || u.idUsuario;
        
        // Cargar ficha de jugador asociada
        this.playerSvc.getAllPlayers().subscribe({
          next: (res: any) => {
            const list = Array.isArray(res) ? res : (res.data || []);
            // Buscamos al jugador por ID de usuario
            const myPlayer = list.find((p: any) => {
                const pUser = p.usuario || {};
                return (pUser.id || pUser.idUsuario || p.idUsuario) === userId;
            });
            
            if (myPlayer) {
              this.playerData = myPlayer;
              
              // Rellenar formulario
              const raw = myPlayer as any;
              this.editForm.telefono = raw.telefonoContacto || '';
              this.editForm.direccion = raw.direccion || '';
              
              // Intentamos sacar la foto del usuario o del jugador
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

  // --- HELPER PARA LIMPIAR DATOS ---
  private prepareDto(player: Player, form: any): any {
    // 🛠️ CORRECCIÓN CLAVE: Convertimos a 'any' al principio
    const rawPlayer = player as any;
    const rawUser = (player.usuario || {}) as any;

    return {
      // Campos obligatorios para el Backend
      idUsuario: rawUser.id || rawUser.idUsuario, 
      
      // 🛠️ CORRECCIÓN 2: Usamos rawPlayer para evitar "Property 'posicion' does not exist"
      posicion: rawPlayer.posicionPrimaria || rawPlayer.posicion, 
      
      equipoPrincipal: rawPlayer.equipoActual || rawPlayer.equipoPrincipal, 
      dorsal: player.dorsal,
      
      // 🛠️ CORRECCIÓN 3: Usamos rawPlayer para evitar "Property 'estado' does not exist"
      estado: rawPlayer.estado, 
      
      observaciones: rawPlayer.observaciones,

      // Campos que estamos editando
      telefonoContacto: form.telefono,
      direccion: form.direccion,

      // Mantener fechas
      fechaNacimiento: rawPlayer.fechaNacimiento || null,
      fechaAlta: rawPlayer.fechaAlta || new Date().toISOString(),
      fechaBaja: rawPlayer.fechaBaja || null,
    };
  }

  async saveProfile() {
    if (!this.playerData) return;

    const loader = await this.loadingCtrl.create({ message: 'Guardando cambios...' });
    await loader.present();

    // 1. Usamos el helper
    const updatePayload = this.prepareDto(this.playerData, this.editForm);
    
    // 2. Obtenemos ID seguro
    const raw = this.playerData as any;
    const playerId = raw.id || raw.idJugador;

    this.playerSvc.updatePlayer(playerId, updatePayload).subscribe({
      next: async () => {
        await loader.dismiss();
        this.showToast('Perfil actualizado correctamente', 'success');
        this.loadProfile(); // Recargar
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