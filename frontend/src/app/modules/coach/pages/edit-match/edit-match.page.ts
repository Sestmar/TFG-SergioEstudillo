import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchService } from 'src/app/core/services/match/match.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-edit-match',
  templateUrl: './edit-match.page.html',
  styleUrls: ['./edit-match.page.scss'],
})
export class EditMatchPage implements OnInit {
  matchId: number = 0;
  match: any = null;
  
  starters: any[] = [];
  bench: any[] = [];
  fullSquadStats: any[] = [];

  matchStats = {
    golesFavor: 0,
    golesContra: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private matchSvc: MatchService,
    private playerService: PlayerService,
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
    const loading = await this.loadingCtrl.create({ message: 'Preparando acta...' });
    await loading.present();

    this.matchSvc.getMatchById(this.matchId).subscribe({
      next: (m) => {
        this.match = m;
        this.matchStats.golesFavor = m.golesFavor || 0;
        this.matchStats.golesContra = m.golesContra || 0;
        this.loadPlayersAndMerge(m.idEquipo, loading);
      },
      error: () => loading.dismiss()
    });
  }

  loadPlayersAndMerge(teamId: number, loading: HTMLIonLoadingElement) {
    const p1 = this.matchSvc.getLineup(this.matchId).toPromise();
    const p2 = this.playerService.getAllPlayers().toPromise(); 

    Promise.all([p1, p2]).then(([lineupData, allPlayersData]: [any, any]) => {
      
      const alineacion = lineupData || [];
      const allPlayers = Array.isArray(allPlayersData) ? allPlayersData : (allPlayersData.data || []);

      const myTeamPlayers = allPlayers.filter((p: any) => {
         const pTeamId = p.equipoPrincipal?.id || p.equipoPrincipal?.idEquipo || p.equipoPrincipal;
         return pTeamId == teamId;
      });

      this.fullSquadStats = myTeamPlayers.map((player: any) => {
        const existingRecord = alineacion.find((a: any) => {
            const aId = a.idJugador || a.jugador?.idJugador;
            const pId = player.idJugador || player.id;
            return aId === pId;
        });

        if (existingRecord) {
          // TITULAR O YA JUGÓ
          return {
            ...existingRecord,
            nombre: existingRecord.nombre || player.usuario?.nombre,
            apellidos: existingRecord.apellidos || player.usuario?.apellidos,
            dorsal: existingRecord.dorsal || player.dorsal,
            fotoUrl: existingRecord.fotoUrl || player.usuario?.fotoUrl,
            idJugador: player.idJugador || player.id,
            
            esTitular: existingRecord.esTitular,
            minutos: existingRecord.minutosJugados !== null ? existingRecord.minutosJugados : (existingRecord.esTitular ? 90 : 0),
            goles: existingRecord.goles || 0,
            asistencias: existingRecord.asistencias || 0,
            amarilla: existingRecord.tarjetaAmarilla || false,
            roja: existingRecord.tarjetaRoja || false,
            
            // 🔥 MAPEO DE SUSTITUCIONES
            minutoEntrada: existingRecord.minutoEntrada || (existingRecord.esTitular ? 0 : null),
            minutoSalida: existingRecord.minutoSalida || null
          };
        } else {
          // SUPLENTE VIRGEN
          return {
            idJugador: player.idJugador || player.id,
            nombre: player.usuario?.nombre,
            apellidos: player.usuario?.apellidos,
            dorsal: player.dorsal,
            fotoUrl: player.usuario?.fotoUrl,
            posicion: player.posicion,
            
            esTitular: false,
            minutos: 0,
            goles: 0,
            asistencias: 0,
            amarilla: false,
            roja: false,
            
            // 🔥 INICIALIZACIÓN
            minutoEntrada: null,
            minutoSalida: null
          };
        }
      });

      this.starters = this.fullSquadStats.filter(p => p.esTitular);
      this.bench = this.fullSquadStats.filter(p => !p.esTitular);

      loading.dismiss();

    }).catch(err => {
      console.error("Error cargando jugadores", err);
      loading.dismiss();
    });
  }

  async saveActa() {
    const loading = await this.loadingCtrl.create({ message: 'Guardando acta...' });
    await loading.present();

    const allStats = [...this.starters, ...this.bench];

    const actaPayload = {
      idPartido: this.matchId,
      golesFavor: this.matchStats.golesFavor,
      golesContra: this.matchStats.golesContra,
      estadisticas: allStats.map(player => ({
        idJugador: player.idJugador,
        goles: player.goles,
        asistencias: player.asistencias,
        minutos: player.minutos,
        amarilla: player.amarilla,
        roja: player.roja,
        esTitular: player.esTitular,
        
        // 🔥 ENVÍO NUEVOS CAMPOS
        minutoEntrada: player.minutoEntrada,
        minutoSalida: player.minutoSalida
      }))
    };

    this.matchSvc.closeMatchReport(actaPayload).subscribe({
      next: async () => {
        await loading.dismiss();
        this.presentToast('Acta cerrada correctamente 📝', 'success');
        this.router.navigate(['/coach-dashboard']);
      },
      error: async (err) => {
        await loading.dismiss();
        console.error(err);
        this.presentToast('Error al guardar', 'danger');
      }
    });
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    t.present();
  }
}