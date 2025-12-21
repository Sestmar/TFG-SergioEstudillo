import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { MatchService } from 'src/app/core/services/match/match.service'; 
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-create-convocation',
  templateUrl: './create-convocation.page.html',
  styleUrls: ['./create-convocation.page.scss'],
})
export class CreateConvocationPage implements OnInit {
  convocationForm: FormGroup;
  loadingData: boolean = true;
  teamId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private matchSvc: MatchService,
    private authSvc: AuthService,
    private http: HttpClient,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    this.convocationForm = this.fb.group({
      tipo: ['PARTIDO', Validators.required],
      titulo: ['', [Validators.required, Validators.minLength(3)]], // Esto será el Rival
      lugar: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: [''] // Opcional, para que no falle el HTML
    });
  }

  ngOnInit() {
    this.detectCoachTeam();
  }

  detectCoachTeam() {
    this.authSvc.currentUser$.subscribe(user => {
      if (user) {
        const userId = (user as any).id || (user as any).idUsuario;
        
        // Buscamos el equipo del entrenador
        this.http.get(`http://localhost:8080/api/entrenadores/usuario/${userId}/equipo`).subscribe({
          next: (equipo: any) => {
            this.teamId = equipo.idEquipo || equipo.id;
            console.log("✅ Equipo detectado ID:", this.teamId);
            this.loadingData = false;
          },
          error: (err) => {
            console.error("Error detectando equipo:", err);
            this.showToast('No se pudo detectar tu equipo', 'danger');
            this.loadingData = false;
          }
        });
      }
    });
  }

  async onSubmit() {
    // 1. Validar formulario
    if (this.convocationForm.invalid) {
      this.convocationForm.markAllAsTouched();
      this.showToast('Revisa los campos obligatorios', 'warning');
      return;
    }

    // 2. Validar Equipo
    if (!this.teamId) {
      this.showToast('Error: No tienes equipo asignado', 'danger');
      return;
    }

    // 3. Loading
    const loading = await this.loadingCtrl.create({ message: 'Creando evento...' });
    await loading.present();

    const formData = this.convocationForm.value;
    
    // 4. Preparar objeto Partido para Java
    const newMatch = {
      idEquipo: this.teamId,
      rival: formData.titulo, // Mapeamos titulo -> rival
      lugar: formData.lugar,
      fechaHora: new Date(formData.fechaInicio).toISOString(),
      tipo: formData.tipo, 
      observaciones: ''
    };

    // 5. Enviar al Backend
    this.matchSvc.createMatch(newMatch).subscribe({
      next: async (res) => {
        await loading.dismiss();
        this.showToast('¡Evento creado correctamente!', 'success');
        this.modalCtrl.dismiss({ created: true }); // Cierra y avisa para recargar
      },
      error: async (err) => {
        await loading.dismiss();
        console.error(err);
        this.showToast('Error al conectar con el servidor', 'danger');
      }
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async showToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg, duration: 2000, color: color, position: 'top'
    });
    toast.present();
  }
}