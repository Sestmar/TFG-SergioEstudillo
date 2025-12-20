import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { ConvocationService } from 'src/app/core/services/convocation/convocation.service';

@Component({
  selector: 'app-create-convocation',
  templateUrl: './create-convocation.page.html',
  styleUrls: ['./create-convocation.page.scss'],
})
export class CreateConvocationPage implements OnInit {
  convocationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private convocationService: ConvocationService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    this.convocationForm = this.fb.group({
      tipo: ['PARTIDO', Validators.required],
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      lugar: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      equipoId: [23, Validators.required] // Hardcodeado al equipo del Míster
    });
  }

  ngOnInit() {}

  async onSubmit() {
    if (this.convocationForm.invalid) {
      this.convocationForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Creando...' });
    await loading.present();

    const formData = this.convocationForm.value;
    
    // Convertir fechas a formato ISO para el backend Java
    const payload = {
      ...formData,
      fechaHoraInicio: new Date(formData.fechaInicio).toISOString(),
      fechaHoraFin: new Date(formData.fechaFin).toISOString()
    };

    this.convocationService.createConvocation(payload).subscribe({
      next: async () => {
        await loading.dismiss();
        this.showToast('¡Convocatoria creada!', 'success');
        this.router.navigate(['/coach-dashboard']);
      },
      error: async (err) => {
        await loading.dismiss();
        console.error(err);
        this.showToast('Error al conectar con el servidor', 'danger');
      }
    });
  }

  async showToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: color,
      position: 'top'
    });
    toast.present();
  }
}