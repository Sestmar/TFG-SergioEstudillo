import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchService } from 'src/app/core/services/match/match.service';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-edit-match',
  templateUrl: './edit-match.page.html',
  styleUrls: ['./edit-match.page.scss'],
})
export class EditMatchPage implements OnInit {
  matchId: number = 0;
  match: any = null;
  lineup: any[] = [];
  
  // Modelo para el formulario
  matchStats = {
    golesFavor: 0,
    golesContra: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private matchSvc: MatchService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.matchId = +id;
      this.loadData();
    }
  }

  async loadData() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando acta...' });
    await loading.present();

    // 1. Cargar datos del partido (para ver rival y goles actuales)
    this.matchSvc.getMatchById(this.matchId).subscribe(m => {
      this.match = m;
      this.matchStats.golesFavor = m.golesFavor || 0;
      this.matchStats.golesContra = m.golesContra || 0;
    });

    // 2. Cargar jugadores convocados (DTO Plano)
    this.matchSvc.getLineup(this.matchId).subscribe(list => {
      console.log('Datos recibidos para editar:', list); // Depuración

      this.lineup = list.map(item => ({
        ...item,
        // Al ser un DTO plano, las propiedades vienen directas
        goles: item.goles || 0,
        asistencias: item.asistencias || 0,
        // Si ya tiene minutos guardados úsalos, si no, pon 90 si es titular o 0 si no
        minutos: item.minutosJugados !== null ? item.minutosJugados : (item.esTitular ? 90 : 0),
        amarilla: item.tarjetaAmarilla || false,
        roja: item.tarjetaRoja || false
      }));
      loading.dismiss();
    });
  }

  async saveActa() {
    const loading = await this.loadingCtrl.create({ message: 'Cerrando acta...' });
    await loading.present();

    // Preparamos el objeto DTO exacto que espera Java
    const actaPayload = {
      idPartido: this.matchId,
      golesFavor: this.matchStats.golesFavor,
      golesContra: this.matchStats.golesContra,
      estadisticas: this.lineup.map(player => ({
        // 🔥 CORRECCIÓN AQUÍ: El ID está en la raíz del objeto, no anidado
        idJugador: player.idJugador, 
        goles: player.goles,
        asistencias: player.asistencias,
        minutos: player.minutos,
        amarilla: player.amarilla,
        roja: player.roja
      }))
    };

    this.matchSvc.closeMatchReport(actaPayload).subscribe({
      next: async () => {
        await loading.dismiss();
        this.presentToast('Acta cerrada y estadísticas actualizadas', 'success');
        this.router.navigate(['/coach-dashboard']); 
      },
      error: async (err) => {
        await loading.dismiss();
        console.error(err);
        this.presentToast('Error al guardar el acta', 'danger');
      }
    });
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    t.present();
  }
}