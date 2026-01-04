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
  
  // Listas de jugadores
  starters: any[] = [];
  bench: any[] = [];
  fullSquadStats: any[] = [];

  // Marcador
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

    this.authSvc.currentUser$.subscribe(user => {
        const u = user as any;
        if (u && u.rol) {
            const r = String(u.rol).toUpperCase();
            this.isAdmin = r.includes('ADMIN'); 
            this.isCoach = r.includes('ENTRENADOR') || r.includes('STAFF');
        }
    });
  }

  async loadData() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando acta...', spinner: 'crescent' });
    await loading.present();

    this.matchSvc.getMatchById(this.matchId).subscribe({
      next: (m) => {
        this.match = m;
        this.matchStats.golesFavor = m.golesFavor || 0;
        this.matchStats.golesContra = m.golesContra || 0;
        
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
      
      const alineacionGuardada = lineupData || []; 
      const allPlayers = Array.isArray(allPlayersData) ? allPlayersData : (allPlayersData.data || []);

      const myTeamPlayers = allPlayers.filter((p: any) => {
         const pTeamId = p.equipoPrincipal?.id || p.equipoPrincipal?.idEquipo || p.equipoPrincipal;
         return pTeamId == teamId;
      });

      this.fullSquadStats = myTeamPlayers.map((player: any) => {
        const pId = player.idJugador || player.id;
        
        const savedData = alineacionGuardada.find((a: any) => {
            const savedId = a.jugador?.id || a.jugador?.idJugador || a.idJugador;
            return String(savedId) === String(pId);
        });
        
        // Objeto interno para el formulario (usamos nombres cortos 'amarilla', 'roja')
        let stats = {
            idJugador: pId,
            nombre: player.usuario?.nombre || player.nombre,
            apellidos: player.usuario?.apellidos || player.apellidos,
            dorsal: player.dorsal,
            fotoUrl: player.usuario?.fotoUrl || player.fotoUrl,
            posicion: player.posicion,
            
            esTitular: false,
            minutos: 0,
            goles: 0,
            minutoEntrada: null,
            minutoSalida: null,
            amarilla: false, 
            roja: false      
        };

        if (savedData) {
            stats.esTitular = !!savedData.esTitular;
            stats.goles = savedData.goles || 0;
            stats.minutos = savedData.minutosJugados || 0;
            stats.minutoEntrada = savedData.minutoEntrada;
            stats.minutoSalida = savedData.minutoSalida;
            // Mapear lo que viene del backend a nuestro modelo interno
            stats.amarilla = savedData.tarjetaAmarilla || false; 
            stats.roja = savedData.tarjetaRoja || false;         
            
            if(stats.esTitular && stats.minutos === 0) stats.minutos = 90;
        }

        return stats;
      });

      this.starters = this.fullSquadStats.filter(p => p.esTitular);
      this.bench = this.fullSquadStats.filter(p => !p.esTitular);

      loading.dismiss();

    }).catch(err => {
      console.error("Error cargando jugadores", err);
      loading.dismiss();
    });
  }

  private safeInt(value: any, defaultValue: number = 0): number {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = parseInt(value, 10);
    return isNaN(num) ? defaultValue : num;
  }

  private construirPayload() {
      const allStats = [...this.starters, ...this.bench];
      
      return {
          idPartido: this.matchId,
          golesFavor: this.safeInt(this.matchStats.golesFavor),
          golesContra: this.safeInt(this.matchStats.golesContra),
          
          estadisticas: allStats.map(p => {
            let minJugados = this.safeInt(p.minutos);
            const esTitular = !!p.esTitular;
            const minEntrada = this.safeInt(p.minutoEntrada, 0);
            const minSalida = this.safeInt(p.minutoSalida, 0);

            if (!esTitular && minEntrada > 0 && minJugados === 0) {
                minJugados = 90 - minEntrada;
            }
            
            if (esTitular && minSalida > 0) {
                minJugados = minSalida;
            }

            return {
                idJugador: p.idJugador,
                goles: this.safeInt(p.goles),
                minutos: minJugados, // Asegúrate si tu backend espera "minutos" o "minutosJugados"
                esTitular: esTitular,
                minutoEntrada: minEntrada > 0 ? minEntrada : null,
                minutoSalida: minSalida > 0 ? minSalida : null,
                
                // 🔥 CAMBIO CLAVE AQUÍ: Usar nombres que el Backend espera 🔥
                tarjetaAmarilla: p.amarilla || false, // Antes enviábamos "amarilla"
                tarjetaRoja: p.roja || false          // Antes enviábamos "roja"
            };
          })
      };
  }

  async confirmarCierreActa() {
      const alert = await this.alertCtrl.create({
          header: 'Cerrar Acta Oficial',
          message: `Resultado: ${this.matchStats.golesFavor} - ${this.matchStats.golesContra}\n\n¿Seguro que quieres finalizar el partido?`,
          buttons: [
              { text: 'Cancelar', role: 'cancel' },
              { 
                  text: 'Finalizar', 
                  handler: () => { this.cerrarActaOficial(); }
              }
          ]
      });
      await alert.present();
  }

  async cerrarActaOficial() {
    this.saving = true;
    const payload = this.construirPayload();

    console.log("📤 Enviando cierre de acta:", payload); 

    this.matchSvc.closeMatchReport(payload).subscribe({
        next: () => {
            this.saving = false;
            this.presentToast('Acta cerrada y estadísticas actualizadas 🏆', 'success');
            // Recargamos los datos para verificar que se guardó bien
            this.loadData(); 
        },
        error: (err) => {
            this.saving = false;
            console.error(err);
            this.presentToast('Error al cerrar acta. Verifica la consola.', 'danger');
        }
    });
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2500, color, position: 'top' });
    t.present();
  }
}