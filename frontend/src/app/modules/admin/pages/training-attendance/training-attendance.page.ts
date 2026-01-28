import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-training-attendance',
  templateUrl: './training-attendance.page.html',
  styleUrls: ['./training-attendance.page.scss'],
})
export class TrainingAttendancePage implements OnInit {
  
  trainingId: number = 0;
  teamId: number = 0;
  players: any[] = [];
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminSvc: AdminService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    const tId = this.route.snapshot.paramMap.get('id');
    const teamIdParam = this.route.snapshot.queryParamMap.get('teamId');
    
    if (tId && teamIdParam) {
        this.trainingId = +tId;
        this.teamId = +teamIdParam;
        this.loadPlayers();
    } else {
        console.error("Falta trainingId o teamId");
        this.presentToast('Error: Faltan datos del entrenamiento', 'danger');
    }
  }

  async loadPlayers() {
      const loading = await this.loadingCtrl.create({ spinner: 'crescent' });
      await loading.present();

      this.adminSvc.getTeamDetails(this.teamId).subscribe({
        next: (res: any) => {
          const rawPlayers = res.jugadores || [];

          this.players = rawPlayers.map((p: any) => ({
              ...p,
              idJugador: p.idJugador || p.id, 
              fotoUrl: p.fotoUrl || `https://ui-avatars.com/api/?name=${p.nombre}&background=random`,
              // 🔥 CAMBIO: Estado inicial null (ninguno seleccionado)
              estado: null 
          }));

          // Verificamos si ya hay datos guardados en la BD
          this.adminSvc.getAsistencia(this.trainingId).subscribe({
             next: (saved: any) => {
                if(saved && Array.isArray(saved) && saved.length > 0) {
                    saved.forEach((s: any) => {
                        const found = this.players.find(p => p.idJugador === s.idJugador);
                        if(found) found.estado = s.estado;
                    });
                }
                loading.dismiss();
             },
             error: () => loading.dismiss()
          });
        },
        error: (err) => {
            console.error(err);
            loading.dismiss();
            this.presentToast('Error cargando jugadores', 'danger');
        }
      });
  }

  // Método para cambiar estado (toggle)
  setEstado(player: any, nuevoEstado: string) {
      // Si pulsa el mismo, lo desmarca (vuelve a null)
      if (player.estado === nuevoEstado) {
          player.estado = null;
      } else {
          player.estado = nuevoEstado;
      }
  }

  guardar() {
      // Validar que al menos uno tenga estado (opcional)
      /* const markedCount = this.players.filter(p => p.estado).length;
      if (markedCount === 0) {
         this.presentToast('Marca al menos un jugador', 'warning');
         return;
      }
      */

      this.saving = true;
      const payload = {
          idEntrenamiento: this.trainingId,
          asistencias: this.players
            .filter(p => p.estado !== null) // Solo enviamos los que tienen estado marcado
            .map(p => ({
              idJugador: p.idJugador,
              estado: p.estado
          }))
      };

      this.adminSvc.guardarAsistencia(payload).subscribe({
          next: () => {
              this.saving = false;
              this.presentToast('Asistencia guardada correctamente ✅', 'success');
              // this.router.navigate(['/calendar']); // Opcional volver
          },
          error: (err) => {
              this.saving = false;
              console.error(err);
              this.presentToast('Error al guardar asistencia', 'danger');
          }
      });
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color, position: 'top' });
    t.present();
  }
}