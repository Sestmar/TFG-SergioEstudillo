import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // ✅ NECESARIO
import { ToastController, LoadingController } from '@ionic/angular';
import { ConvocationService } from 'src/app/core/services/convocation/convocation.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-create-convocation',
  templateUrl: './create-convocation.page.html',
  styleUrls: ['./create-convocation.page.scss'],
})
export class CreateConvocationPage implements OnInit {
  convocationForm: FormGroup;
  loadingData: boolean = true;

  constructor(
    private fb: FormBuilder,
    private convocationService: ConvocationService,
    private authSvc: AuthService,
    private http: HttpClient, // ✅ Inyectado para buscar el equipo
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
      equipoId: [null, Validators.required] // ✅ YA NO ES 23 FIJO
    });
  }

  ngOnInit() {
    this.detectCoachTeam();
  }

  // --- 🔥 DETECTAR EL EQUIPO AUTOMÁTICAMENTE 🔥 ---
  detectCoachTeam() {
    this.authSvc.currentUser$.subscribe(user => {
      if (user) {
        const userId = (user as any).id || (user as any).idUsuario;
        
        // Llamamos al mismo endpoint que en el dashboard
        this.http.get(`http://localhost:8080/api/entrenadores/usuario/${userId}/equipo`).subscribe({
          next: (equipo: any) => {
            const teamId = equipo.idEquipo || equipo.id;
            console.log("✅ Convocatoria asignada al equipo ID:", teamId);
            
            // Asignamos el ID al formulario automáticamente
            this.convocationForm.patchValue({ equipoId: teamId });
            this.loadingData = false;
          },
          error: (err) => {
            console.error("Error al detectar equipo para crear evento", err);
            this.showToast('Error: No tienes equipo asignado', 'danger');
            this.loadingData = false;
          }
        });
      }
    });
  }

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
        this.showToast('¡Convocatoria creada correctamente!', 'success');
        this.router.navigate(['/coach-dashboard']);
      },
      error: async (err) => {
        await loading.dismiss();
        console.error(err);
        this.showToast('Error al crear la convocatoria', 'danger');
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