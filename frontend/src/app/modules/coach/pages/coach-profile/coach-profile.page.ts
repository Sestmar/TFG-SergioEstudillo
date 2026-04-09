import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CoachService } from 'src/app/core/services/coach/coach.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { Location } from '@angular/common';
import { CoachProfileDto } from 'src/app/shared/models/models';

// 🔥 NUEVOS IMPORTS
import { UploadService } from 'src/app/core/services/common/upload.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-coach-profile',
  templateUrl: './coach-profile.page.html',
  styleUrls: ['./coach-profile.page.scss'],
})
export class CoachProfilePage implements OnInit {

  private destroyRef = inject(DestroyRef);
  coachId: number | null = null;
  coachData: CoachProfileDto = {
    especialidad: '',
    licencia: '',
    telefonoContacto: '',
    usuario: { nombre: '', apellidos: '' }
  };

  constructor(
    private route: ActivatedRoute,
    private coachSvc: CoachService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private location: Location,
    // 🔥 INYECCIONES PARA FOTO
    private uploadSvc: UploadService,
    private authSvc: AuthService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.coachId = +id;
      this.loadProfile();
    }
  }

  loadProfile() {
    if(!this.coachId) return;
    this.coachSvc.getProfile(this.coachId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(data => {
      this.coachData = data;
    });
  }

  // 🔥 NUEVA LÓGICA DE SUBIDA DE FOTO
  onFileSelected(event: Event) {
    const file: File = (event.target as HTMLInputElement).files?.[0]!;
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
        // 1. Actualizar visualmente al instante
        this.coachData.usuario.fotoUrl = nuevaUrl;
        
        // 2. Guardar la URL en la base de datos (Entidad Usuario)
        this.updateUserPhoto(nuevaUrl, loading);
      },
      error: async () => {
        await loading.dismiss();
        this.presentToast('Error al subir la imagen', 'danger');
      }
    });
  }

  updateUserPhoto(url: string, loading: HTMLIonLoadingElement) {
    const userId = this.coachData.usuario.id || this.coachData.usuario.idUsuario;
    
    // Llamamos al AuthService para actualizar solo el usuario
    // (Asumiendo que tienes un updateUser genérico, si no, usa el endpoint que tengas)
    this.authSvc.updateUser(userId, { fotoUrl: url }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: async () => {
        await loading.dismiss();
        this.presentToast('Foto de perfil actualizada 📸', 'success');
      },
      error: async () => {
        await loading.dismiss();
        this.presentToast('Error al guardar la foto en el perfil', 'warning');
      }
    });
  }
  // ------------------------------------

  async saveProfile() {
    const loading = await this.loadingCtrl.create({ message: 'Guardando cambios...' });
    await loading.present();

    const dto = {
      idUsuario: this.coachData.usuario.idUsuario || this.coachData.usuario.id,
      especialidad: this.coachData.especialidad,
      licencia: this.coachData.licencia,
      telefonoContacto: this.coachData.telefonoContacto,
      fechaAlta: this.coachData.fechaAlta // Mantenemos la fecha original
    };

    this.coachSvc.updateProfile(this.coachId!, dto).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: async () => {
        await loading.dismiss();
        this.presentToast('Perfil actualizado correctamente', 'success');

        // Sincronizar teléfono en tabla usuario para que Twilio pueda enviar notificaciones
        const userId = this.coachData.usuario.idUsuario || this.coachData.usuario.id;
        if (userId && this.coachData.telefonoContacto) {
          this.authSvc.updateUser(userId, { telefono: this.coachData.telefonoContacto })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              error: () => {}
            });
        }

        this.goBack();
      },
      error: async () => {
        await loading.dismiss();
        this.presentToast('Error al guardar cambios', 'danger');
      }
    });
  }

  goBack() {
    this.location.back();
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color, position: 'top' });
    t.present();
  }
}