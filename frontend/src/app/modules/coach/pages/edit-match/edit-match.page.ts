import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchService } from 'src/app/core/services/match/match.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';

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

  isAdmin = false;
  isCoach = false;
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private matchSvc: MatchService,
    private playerService: PlayerService,
    private authSvc: AuthService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.matchId = +id;
      this.loadData();
    }

    // Detección de roles segura
    this.authSvc.currentUser$.subscribe(user => {
        const u = user as any;
        if (u && u.rol) {
            const r = String(u.rol).toUpperCase();
            this.isAdmin = r.includes('ADMIN'); 
            this.isCoach = r.includes('ENTRENADOR') || r.includes('COACH') || r.includes('STAFF') || r.includes('DELEGADO');
        }
    });
  }

  async loadData() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando datos...' });
    await loading.present();

    this.matchSvc.getMatchById(this.matchId).subscribe({
      next: (m) => {
        this.match = m;
        this.matchStats.golesFavor = m.golesFavor || 0;
        this.matchStats.golesContra = m.golesContra || 0;
        
        // Si hay equipo asignado, cargamos jugadores
        const teamId = m.idEquipo || (m.equipo ? m.equipo.idEquipo : null);
        if (teamId) {
             this.loadPlayersAndMerge(teamId, loading);
        } else {
             loading.dismiss();
        }
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

      // Filtramos solo los jugadores de ESTE equipo
      const myTeamPlayers = allPlayers.filter((p: any) => {
         const pTeamId = p.equipoPrincipal?.id || p.equipoPrincipal?.idEquipo || p.equipoPrincipal;
         return pTeamId == teamId;
      });

      this.fullSquadStats = myTeamPlayers.map((player: any) => {
        const pId = player.idJugador || player.id;
        // Buscamos si ya tiene datos guardados en la alineación
        const existingRecord = alineacion.find((a: any) => String(a.idJugador || a.jugador?.idJugador) === String(pId));
        
        let stats = {
            idJugador: pId,
            nombre: player.usuario?.nombre,
            apellidos: player.usuario?.apellidos,
            dorsal: player.dorsal,
            fotoUrl: player.usuario?.fotoUrl,
            posicion: player.posicion,
            esTitular: false,
            minutos: 0,
            goles: 0,
            minutoEntrada: null,
            minutoSalida: null
        };

        if (existingRecord) {
          stats = {
            ...stats,
            ...existingRecord, // Sobrescribimos con lo que venga del backend
            nombre: player.usuario?.nombre, 
            apellidos: player.usuario?.apellidos,
            fotoUrl: player.usuario?.fotoUrl
          };
          // Aseguramos números
          stats.goles = existingRecord.goles || 0;
          stats.minutos = (existingRecord.minutosJugados !== undefined) ? existingRecord.minutosJugados : (stats.esTitular ? 90 : 0);
        }

        return stats;
      });

      this.starters = this.fullSquadStats.filter(p => p.esTitular);
      this.bench = this.fullSquadStats.filter(p => !p.esTitular).sort((a, b) => (b.minutos || 0) - (a.minutos || 0));

      loading.dismiss();

    }).catch(err => {
      console.error("Error cargando jugadores", err);
      loading.dismiss();
    });
  }

  private safeInt(value: any, defaultValue: any = 0): number | null {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  // 🔥 MÉTODO CLAVE: Prepara los datos para enviarlos al Backend
  private construirPayload() {
      const allStats = [...this.starters, ...this.bench];
      return {
          idPartido: this.matchId,
          golesFavor: this.safeInt(this.matchStats.golesFavor),
          golesContra: this.safeInt(this.matchStats.golesContra),
          // Enviamos la lista completa de jugadores con sus stats
          estadisticas: allStats.map(p => ({
            idJugador: p.idJugador,
            goles: this.safeInt(p.goles),
            minutos: this.safeInt(p.minutos),
            esTitular: !!p.esTitular,
            minutoEntrada: this.safeInt(p.minutoEntrada, null),
            minutoSalida: this.safeInt(p.minutoSalida, null)
          }))
      };
  }

  // --- ENTRENADOR: SOLO GUARDAR ---
  async guardarAlineacion() {
    this.saving = true;
    const payload = this.construirPayload();

    this.matchSvc.saveLineupOnly(payload).subscribe({
      next: async () => {
        this.saving = false;
        this.presentToast('Alineación guardada 📋', 'success');
        this.router.navigate(['/coach-dashboard']);
      },
      error: async (err) => {
        this.saving = false;
        this.presentToast('Error al guardar.', 'danger');
      }
    });
  }

  // --- ADMIN: CONFIRMAR CIERRE ---
  async confirmarCierreActa() {
      const alert = await this.alertCtrl.create({
          header: 'Cerrar Acta Oficial',
          message: `Resultado: ${this.matchStats.golesFavor} - ${this.matchStats.golesContra}\n\nSe guardarán los minutos y goles asignados a los jugadores.\n¿Finalizar partido?`,
          buttons: [
              { text: 'Cancelar', role: 'cancel' },
              { 
                  text: 'Finalizar', 
                  handler: () => {
                      this.cerrarActaOficial();
                  }
              }
          ]
      });
      await alert.present();
  }

  // --- ADMIN: ENVIAR DATOS Y CERRAR ---
  async cerrarActaOficial() {
    this.saving = true;
    
    // Aquí enviamos el payload COMPLETO (Resultado + Jugadores)
    const payload = this.construirPayload();

    this.matchSvc.closeMatchReport(payload).subscribe({
        next: () => {
            this.saving = false;
            this.presentToast('Partido finalizado correctamente 🏁', 'success');
            this.router.navigate(['/admin']);
        },
        error: (err) => {
            this.saving = false;
            console.error(err);
            this.presentToast('Error al cerrar el acta', 'danger');
        }
    });
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    t.present();
  }
}