import { Component, Input, OnInit } from '@angular/core'; // 🔥 Importante: Input
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { MatchService } from 'src/app/core/services/match/match.service';

@Component({
  selector: 'app-create-convocation',
  templateUrl: './create-convocation.page.html',
  styleUrls: ['./create-convocation.page.scss'],
})
export class CreateConvocationPage implements OnInit {

  // 🔥 RECIBIMOS EL ID DESDE EL DASHBOARD (Gracias a componentProps)
  @Input() teamId: number | null = null;

  segmentValue = 'PARTIDO'; // 'PARTIDO' o 'ENTRENAMIENTO'
  
  formData = {
    rival: '',
    lugar: '',
    fecha: '',
    hora: '',
    tipo: 'PARTIDO', // Se actualiza con el segmento
    competicion: '', 
    observaciones: ''
  };

  constructor(
    private modalCtrl: ModalController,
    private matchSvc: MatchService, // Asegúrate de tener este servicio importado correctamente
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    // Depuración: Verificamos en consola si el ID llegó correctamente
    console.log('✅ Modal abierto. ID de Equipo recibido:', this.teamId);
  }

  close() {
    this.modalCtrl.dismiss();
  }

  segmentChanged(ev: any) {
    this.segmentValue = ev.detail.value;
    this.formData.tipo = this.segmentValue;
  }

  async createEvent() {
    // 1. Validaciones básicas de formulario
    if (!this.formData.fecha || !this.formData.hora || !this.formData.lugar) {
      this.presentToast('Por favor, rellena fecha, hora y lugar', 'warning');
      return;
    }

    if (this.formData.tipo === 'PARTIDO' && !this.formData.rival) {
      this.presentToast('Indica el rival del partido', 'warning');
      return;
    }

    // 🔥 Validación crítica: ¿Tenemos equipo asignado?
    if (!this.teamId) {
      console.error('Error: teamId es nulo o indefinido en el modal.');
      this.presentToast('Error crítico: No se ha detectado el equipo asignado.', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando convocatoria...' });
    await loading.present();

    try {
      // 2. Construir fecha completa ISO (YYYY-MM-DDTHH:mm:00)
      // Ajuste para inputs tipo fecha/hora de Ionic
      const fechaBase = this.formData.fecha.split('T')[0]; // "2025-12-31"
      
      // Intentamos extraer la hora limpia si viene en formato ISO largo
      let horaLimpia = this.formData.hora;
      if (this.formData.hora.includes('T')) {
         horaLimpia = this.formData.hora.split('T')[1].substring(0, 5); // "13:00"
      }

      const fechaHoraCombinada = `${fechaBase}T${horaLimpia}:00`;

      // 3. Preparar objeto para el Backend
      const payload = {
        idEquipo: this.teamId, // ✅ Usamos el ID recibido por Input
        rival: this.formData.tipo === 'PARTIDO' ? this.formData.rival : null,
        lugar: this.formData.lugar,
        fechaHora: fechaHoraCombinada,
        tipo: this.formData.tipo, // 'PARTIDO' o 'ENTRENAMIENTO'
        golesFavor: 0,
        golesContra: 0,
        estado: 'PENDIENTE',
        competicion: this.formData.competicion,
        observaciones: this.formData.observaciones
      };

      console.log('Enviando payload al servidor:', payload);

      // 4. Llamar al servicio
      this.matchSvc.createMatch(payload).subscribe({
        next: async (res) => {
          await loading.dismiss();
          this.presentToast('Convocatoria creada con éxito', 'success');
          // Cerramos el modal y pasamos un dato "created: true" para que el dashboard recargue
          this.modalCtrl.dismiss({ created: true });
        },
        error: async (err) => {
          await loading.dismiss();
          console.error('Error creando partido:', err);
          this.presentToast('Error al guardar el evento. Revisa la consola.', 'danger');
        }
      });

    } catch (e) {
      await loading.dismiss();
      console.error('Error procesando datos:', e);
      this.presentToast('Error inesperado al procesar los datos.', 'danger');
    }
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 3000, color, position: 'top' });
    t.present();
  }
}