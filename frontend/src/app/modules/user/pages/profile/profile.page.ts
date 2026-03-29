import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { UploadService } from 'src/app/core/services/common/upload.service'; // ✅ Importar servicio de subida
import { Player } from 'src/app/shared/models/models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  private destroyRef = inject(DestroyRef);

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
        const u = user as any;
        const userId = u.id || u.idUsuario;
        
        // Cargar datos del jugador asociados al usuario
        this.playerSvc.getAllPlayers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
              // Prioridad: Foto del usuario > Foto en datos del jugador > cadena vacía
              const userFoto = (myPlayer.usuario as any)?.fotoPerfil || (myPlayer.usuario as any)?.fotoUrl || this.currentUser.fotoUrl;
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
      next: (res: any) => {
        const nuevaUrl = res.url;
        // 1. Actualizar visualmente al instante
        this.editForm.fotoUrl = nuevaUrl;
        if (this.currentUser) {
            this.currentUser.fotoUrl = nuevaUrl; // Actualizar objeto local usuario
            this.currentUser.fotoPerfil = nuevaUrl; // Por si acaso usas este campo
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
    const userId = this.currentUser.id || this.currentUser.idUsuario;
    
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
    
    const p = this.playerData as any;
    const team = p.equipoPrincipal || p.equipo || p.equipoActual;

    if (team && typeof team === 'object') {
        return team.nombre + (team.categoria ? ` (${team.categoria.nombre})` : '');
    }
    
    if (team === 23) return 'Primer Equipo (Senior)'; // Ejemplo hardcoded que tenías

    return 'Sin Equipo Asignado';
  }

  private prepareDto(player: Player, form: any): any {
    const rawPlayer = player as any;
    const rawUser = (player.usuario || {}) as any;

    let teamToSend = rawPlayer.equipoPrincipal;
    if (teamToSend && typeof teamToSend === 'object') {
        teamToSend = teamToSend.id || teamToSend.idEquipo;
    }

    // Nota: fotoUrl aquí se refiere a la foto en la tabla 'jugador', 
    // pero idealmente deberíamos usar la de la tabla 'usuario' que actualizamos arriba.
    // Aun así, lo enviamos por consistencia.
    return {
      idUsuario: rawUser.id || rawUser.idUsuario, 
      posicion: rawPlayer.posicionPrimaria || rawPlayer.posicion, 
      equipoPrincipal: teamToSend, 
      dorsal: player.dorsal,
      estado: rawPlayer.estado, 
      observaciones: rawPlayer.observaciones,
      telefonoContacto: form.telefono,
      direccion: form.direccion,
      fotoUrl: form.fotoUrl, // Enviamos la URL también al registro de jugador si tu backend lo soporta
      
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

    this.playerSvc.updatePlayer(playerId, updatePayload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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