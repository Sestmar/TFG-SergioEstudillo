import { Component, Input, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { MatchService } from 'src/app/core/services/match/match.service';
import { TipoEvento, EstadoPartido } from 'src/app/shared/models/models';
// ✅ IMPORTAR SERVICIO DE SUBIDA
import { UploadService } from 'src/app/core/services/common/upload.service';

@Component({
  selector: 'app-create-convocation',
  templateUrl: './create-convocation.page.html',
  styleUrls: ['./create-convocation.page.scss'],
})
export class CreateConvocationPage implements OnInit {

  private destroyRef = inject(DestroyRef);

  @Input() teamId: number | null = null;

  segmentValue = 'PARTIDO';
  
  formData = {
    rival: '',
    lugar: '',
    fecha: '',
    hora: '',
    tipo: 'PARTIDO',
    competicion: '', 
    observaciones: '',
    escudoRivalUrl: '' // ✅ NUEVO CAMPO
  };

  uploadingImage = false; // Estado visual de carga

  constructor(
    private modalCtrl: ModalController,
    private matchSvc: MatchService,
    private uploadSvc: UploadService, // ✅ INYECCIÓN
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
  }

  close() {
    this.modalCtrl.dismiss();
  }

  segmentChanged(ev: any) {
    this.segmentValue = ev.detail.value;
    this.formData.tipo = this.segmentValue;
  }

  // ✅ LÓGICA DE SUBIDA DE ESCUDO
  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadingImage = true;
      this.uploadSvc.uploadImage(file).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (res: any) => {
          this.formData.escudoRivalUrl = res.url;
          this.uploadingImage = false;
          this.presentToast('Escudo subido correctamente 🛡️', 'success');
        },
        error: (err) => {
          console.error(err);
          this.uploadingImage = false;
          this.presentToast('Error al subir el escudo', 'danger');
        }
      });
    }
  }

  async createEvent() {
    if (!this.formData.fecha || !this.formData.hora || !this.formData.lugar) {
      this.presentToast('Por favor, rellena fecha, hora y lugar', 'warning');
      return;
    }

    if (this.formData.tipo === 'PARTIDO' && !this.formData.rival) {
      this.presentToast('Indica el rival del partido', 'warning');
      return;
    }

    if (!this.teamId) {
      this.presentToast('Error crítico: No se ha detectado el equipo asignado.', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando convocatoria...' });
    await loading.present();

    try {
      const fechaBase = this.formData.fecha.split('T')[0];
      
      let horaLimpia = this.formData.hora;
      if (this.formData.hora.includes('T')) {
         horaLimpia = this.formData.hora.split('T')[1].substring(0, 5);
      }

      const fechaHoraCombinada = `${fechaBase}T${horaLimpia}:00`;

      const payload = {
        idEquipo: this.teamId,
        rival: this.formData.tipo === 'PARTIDO' ? this.formData.rival : null,
        escudoRivalUrl: this.formData.tipo === 'PARTIDO' ? this.formData.escudoRivalUrl : null,
        lugar: this.formData.lugar,
        fechaHora: fechaHoraCombinada,
        tipo: this.formData.tipo as TipoEvento,
        golesFavor: 0,
        golesContra: 0,
        estado: 'PENDIENTE' as EstadoPartido,
        competicion: this.formData.competicion,
        observaciones: this.formData.observaciones
      };

      this.matchSvc.createMatch(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: async (res) => {
          await loading.dismiss();
          this.presentToast('Convocatoria creada con éxito', 'success');
          this.modalCtrl.dismiss({ created: true });
        },
        error: async (err) => {
          await loading.dismiss();
          console.error('Error creando partido:', err);
          this.presentToast('Error al guardar el evento.', 'danger');
        }
      });

    } catch (e) {
      await loading.dismiss();
      console.error('Error procesando datos:', e);
      this.presentToast('Error inesperado.', 'danger');
    }
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 3000, color, position: 'top' });
    t.present();
  }
}