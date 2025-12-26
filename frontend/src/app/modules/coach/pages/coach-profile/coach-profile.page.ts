import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoachService } from 'src/app/core/services/coach/coach.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { Location } from '@angular/common';

// 🔥 NUEVOS IMPORTS
import { UploadService } from 'src/app/core/services/common/upload.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-coach-profile',
  templateUrl: './coach-profile.page.html',
  styleUrls: ['./coach-profile.page.scss'],
})
export class CoachProfilePage implements OnInit {

  coachId: number | null = null;
  coachData: any = {
    especialidad: '',
    licencia: '',
    telefonoContacto: '',
    usuario: {} 
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
    this.coachSvc.getProfile(this.coachId).subscribe(data => {
      this.coachData = data;
    });
  }

  // 🔥 NUEVA LÓGICA DE SUBIDA DE FOTO
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadPhoto(file);
    }
  }

  async uploadPhoto(file: File) {
    const loading = await this.loadingCtrl.create({ message: 'Subiendo foto...' });
    await loading.present();

    this.uploadSvc.uploadImage(file).subscribe({
      next: (res: any) => {
        const nuevaUrl = res.url;
        // 1. Actualizar visualmente al instante
        this.coachData.usuario.fotoUrl = nuevaUrl;
        
        // 2. Guardar la URL en la base de datos (Entidad Usuario)
        this.updateUserPhoto(nuevaUrl, loading);
      },
      error: async (err) => {
        console.error(err);
        await loading.dismiss();
        this.presentToast('Error al subir la imagen', 'danger');
      }
    });
  }

  updateUserPhoto(url: string, loading: HTMLIonLoadingElement) {
    const userId = this.coachData.usuario.id || this.coachData.usuario.idUsuario;
    
    // Llamamos al AuthService para actualizar solo el usuario
    // (Asumiendo que tienes un updateUser genérico, si no, usa el endpoint que tengas)
    this.authSvc.updateUser(userId, { fotoUrl: url }).subscribe({
      next: async () => {
        await loading.dismiss();
        this.presentToast('Foto de perfil actualizada 📸', 'success');
      },
      error: async (err) => {
        await loading.dismiss();
        console.error("Error guardando URL en usuario", err);
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

    this.coachSvc.updateProfile(this.coachId!, dto).subscribe({
      next: async () => {
        await loading.dismiss();
        this.presentToast('Perfil actualizado correctamente', 'success');
        this.goBack();
      },
      error: async (err) => {
        console.error(err);
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