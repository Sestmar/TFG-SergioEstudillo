import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoachService } from 'src/app/core/services/coach/coach.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { Location } from '@angular/common';

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
    private location: Location
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

  async saveProfile() {
    const loading = await this.loadingCtrl.create({ message: 'Guardando cambios...' });
    await loading.present();

    const dto = {
      idUsuario: this.coachData.usuario.idUsuario,
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