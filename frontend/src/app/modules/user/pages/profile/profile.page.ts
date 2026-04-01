import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { UploadService } from 'src/app/core/services/common/upload.service'; // ✅ Importar servicio de subida
import { User, Jugador } from 'src/app/shared/models/models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  private destroyRef = inject(DestroyRef);

  currentUser: User | null = null;
  playerData: Jugador | null = null;
  loading: boolean = true;
  
  editForm = {
    telefono: '',
    direccion: '',
    fotoUrl: ''
  };

  constructor(
    private authSvc: AuthService,
    private playerSvc: PlayerService,
    private uploadSvc: UploadService, // ✅ Inyectar servicio
    private location: Location,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.authSvc.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      if (user) {
        this.currentUser = user;
        const userId = user.idUsuario;

        this.playerSvc.getAllPlayers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
          next: (list: Jugador[]) => {
            const myPlayer = list.find((p: Jugador) => {
                return (p.usuario?.id || p.usuario?.idUsuario) === userId;
            });

            if (myPlayer) {
              this.playerData = myPlayer;
              const userFoto = myPlayer.usuario?.fotoUrl || this.currentUser?.fotoUrl;
              this.editForm.fotoUrl = userFoto || '';
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

  // ✅ NUEVA LÓGICA DE SUBIDA DE FOTO
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadPhoto(file);
    }
  }

  async uploadPhoto(file: File) {
    const loading = await this.loadingCtrl.create({ message: 'Subiendo foto...' });
    await loading.present();

    this.uploadSvc.uploadImage(file).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: { url: string }) => {
        const nuevaUrl = res.url;
        this.editForm.fotoUrl = nuevaUrl;
        if (this.currentUser) {
            this.currentUser.fotoUrl = nuevaUrl;
        }
        
        // 2. Guardar la URL en la base de datos (Entidad Usuario)
        this.updateUserPhoto(nuevaUrl, loading);
      },
      error: async (err) => {
        console.error(err);
        await loading.dismiss();
        this.showToast('Error al subir la imagen', 'danger');
      }
    });
  }

  updateUserPhoto(url: string, loading: HTMLIonLoadingElement) {
    const userId = this.currentUser?.idUsuario;
    
    // Usamos el método updateUser que añadiste al AuthService
    this.authSvc.updateUser(userId, { fotoUrl: url }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: async () => {
        await loading.dismiss();
        this.showToast('Foto de perfil actualizada 📸', 'success');
      },
      error: async (err) => {
        await loading.dismiss();
        console.error("Error guardando URL en usuario", err);
        this.showToast('Error al guardar la foto en el perfil', 'warning');
      }
    });
  }

  // Helper para mostrar nombre del equipo
  getTeamNameDisplay(): string {
    if (!this.playerData) return 'Cargando...';

    const ep = this.playerData.equipoPrincipal;
    if (ep && typeof ep === 'object') {
        return ep.nombre + (ep.categoria ? ` (${ep.categoria})` : '');
    }

    return 'Sin Equipo Asignado';
  }

  private prepareDto(player: Jugador, form: { telefono: string; direccion: string; fotoUrl: string }): Record<string, unknown> {
    const ep = player.equipoPrincipal;
    const teamToSend = typeof ep === 'object' ? (ep?.id || ep?.idEquipo) : ep;

    return {
      idUsuario: player.usuario?.id || player.usuario?.idUsuario,
      posicion: player.posicion,
      equipoPrincipal: teamToSend,
      dorsal: player.dorsal,
      estado: player.estado,
      observaciones: player.observaciones,
      telefonoContacto: form.telefono,
      direccion: form.direccion,
      fotoUrl: form.fotoUrl,
      fechaNacimiento: player.fechaNacimiento ? new Date(player.fechaNacimiento).toISOString().split('T')[0] : null,
      fechaAlta: player.fechaAlta ? new Date(player.fechaAlta).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
  }

  async saveProfile() {
    if (!this.playerData) return;
    const loader = await this.loadingCtrl.create({ message: 'Guardando cambios...' });
    await loader.present();

    const updatePayload = this.prepareDto(this.playerData, this.editForm);
    const playerId = this.playerData.idJugador || this.playerData.id;

    this.playerSvc.updatePlayer(playerId, updatePayload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: async () => {
        await loader.dismiss();
        this.showToast('Perfil actualizado correctamente', 'success');

        // Sincronizar teléfono en tabla usuario para que Twilio pueda enviarlo notificaciones
        const userId = this.currentUser?.idUsuario;
        if (userId && this.editForm.telefono) {
          this.authSvc.updateUser(userId, { telefono: this.editForm.telefono })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              error: (err) => console.error('Error sincronizando teléfono en usuario:', err)
            });
        }

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