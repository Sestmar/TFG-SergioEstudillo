import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatchService } from 'src/app/core/services/match/match.service';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Partido, Jugador, LineupSlotDto } from 'src/app/shared/models/models';

interface PlayerMatchStat {
  idJugador: number;
  nombre: string;
  apellidos: string;
  dorsal?: number;
  fotoUrl: string;
  posicion?: string;
  esTitular: boolean;
  minutos: number;
  goles: number;
  asistencias: number;
  minutoEntrada: number | null;
  minutoSalida: number | null;
  tarjetaAmarilla: boolean;
  tarjetaRoja: boolean;
}

@Component({
  selector: 'app-edit-match',
  templateUrl: './edit-match.page.html',
  styleUrls: ['./edit-match.page.scss'],
})
export class EditMatchPage implements OnInit {
  private destroyRef = inject(DestroyRef);
  matchId: number = 0;
  match: Partido | null = null;

  starters: PlayerMatchStat[] = [];
  bench: PlayerMatchStat[] = [];
  fullSquadStats: PlayerMatchStat[] = [];

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

    this.authSvc.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
        if (user?.rol) {
            const r = String(user.rol).toUpperCase();
            this.isAdmin = r.includes('ADMIN');
            this.isCoach = r.includes('ENTRENADOR') || r.includes('STAFF');
        }
    });
  }

  async loadData() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando acta...', spinner: 'crescent' });
    await loading.present();

    this.matchSvc.getMatchById(this.matchId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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

    Promise.all([p1, p2]).then(([lineupData, allPlayersData]: [LineupSlotDto[] | undefined, Jugador[] | undefined]) => {

      const alineacionGuardada: LineupSlotDto[] = lineupData || [];
      const allPlayers: Jugador[] = allPlayersData || [];

      const myTeamPlayers = allPlayers.filter((p: Jugador) => {
         const ep = p.equipoPrincipal;
         const pTeamId = typeof ep === 'object' ? (ep?.id || ep?.idEquipo) : ep;
         return pTeamId == teamId;
      });

      this.fullSquadStats = myTeamPlayers.map((player: Jugador) => {
        const pId = player.idJugador || player.id;

        const savedData = alineacionGuardada.find((a: LineupSlotDto) => {
            const savedId = a.jugador?.id || a.jugador?.idJugador || a.idJugador;
            return String(savedId) === String(pId);
        });

        const originalFoto = player.usuario?.fotoUrl;
        const nombreCompleto = (player.usuario?.nombre || '') + ' ' + (player.usuario?.apellidos || '');
        const safeImg = originalFoto || `https://ui-avatars.com/api/?name=${nombreCompleto}&background=random&color=fff&size=128`;
        
        let stats = {
            idJugador: pId,
            nombre: player.usuario?.nombre || '',
            apellidos: player.usuario?.apellidos || '',
            dorsal: player.dorsal,
            fotoUrl: safeImg,
            posicion: player.posicion,
            
            esTitular: false,
            minutos: 0,
            goles: 0,
            asistencias: 0,
            minutoEntrada: null,
            minutoSalida: null,
            tarjetaAmarilla: false,
            tarjetaRoja: false
        };

        if (savedData) {
            stats.esTitular = !!savedData.esTitular;
            stats.goles = savedData.goles || 0;
            stats.asistencias = savedData.asistencias || 0; 
            stats.minutos = savedData.minutosJugados || 0;
            stats.minutoEntrada = savedData.minutoEntrada;
            stats.minutoSalida = savedData.minutoSalida;
            stats.tarjetaAmarilla = !!savedData.tarjetaAmarilla;
            stats.tarjetaRoja = !!savedData.tarjetaRoja;
            
            if(stats.esTitular && stats.minutos === 0) stats.minutos = 90;
        }

        return stats;
      });

      this.starters = this.fullSquadStats.filter(p => p.esTitular);
      this.bench = this.fullSquadStats.filter(p => !p.esTitular);

      loading.dismiss();

    }).catch(() => {
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

            if (!esTitular && minEntrada > 0 && minJugados === 0) minJugados = 90 - minEntrada;
            if (esTitular && minSalida > 0) minJugados = minSalida;

            return {
                idJugador: p.idJugador,
                goles: this.safeInt(p.goles),
                asistencias: this.safeInt(p.asistencias), 
                minutos: minJugados,
                esTitular: esTitular,
                minutoEntrada: minEntrada > 0 ? minEntrada : null,
                minutoSalida: minSalida > 0 ? minSalida : null,
                amarilla: !!p.tarjetaAmarilla, // 🔥 NOMBRE CORREGIDO
                roja: !!p.tarjetaRoja          // 🔥 NOMBRE CORREGIDO
            };
          })
      };
  }

  toggleAmarilla(p: PlayerMatchStat) {
    p.tarjetaAmarilla = !p.tarjetaAmarilla;
  }

  toggleRoja(p: PlayerMatchStat) {
    p.tarjetaRoja = !p.tarjetaRoja;
  }

  async confirmarCierreActa() {
      const alert = await this.alertCtrl.create({
          header: '📋 Cerrar Acta Oficial',
          message: `Resultado: ${this.matchStats.golesFavor} - ${this.matchStats.golesContra}\n\n¿Seguro que quieres finalizar el partido?`,
          cssClass: 'night-alert',
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

    this.matchSvc.closeMatchReport(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: async () => {
            this.saving = false;
            this.loadData();
            const alert = await this.alertCtrl.create({
                header: 'Acta Cerrada',
                message: '¿Querés explorar el análisis técnico del encuentro?',
                cssClass: 'night-alert',
                buttons: [
                    { text: 'Ahora no', role: 'cancel' },
                    {
                        text: 'Ver Análisis',
                        handler: () => {
                            this.router.navigate(['/match-insights', this.matchId]);
                        }
                    }
                ]
            });
            await alert.present();
        },
        error: () => {
            this.saving = false;
            this.presentToast('Error al cerrar acta.', 'danger');
        }
    });
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2500, color, position: 'top' });
    t.present();
  }

  goBack() {
    this.router.navigate(['/admin']); 
  }

  // Sustituye tu método handleImgError por este:
  handleImgError(event: any, type: string, name: string = '') {
    // 1. Detener el bucle infinito inmediatamente
    event.target.onerror = null; 
    
    // 2. Asignar imagen de respaldo según el tipo
    if (type === 'local') {
        event.target.src = 'assets/img/mi-club-logo.png';
    } else if (type === 'rival') {
        // 🔥 CORRECCIÓN: Asegúrate de que este archivo exista en tu carpeta assets
        // Si no tienes 'icon-shield.png', usa una URL externa segura o un svg
        event.target.src = 'https://cdn-icons-png.flaticon.com/512/16/16480.png'; 
    } else {
        // Jugador
        const nombreParaAvatar = name || 'Jugador';
        event.target.src = `https://ui-avatars.com/api/?name=${nombreParaAvatar}&background=random&color=fff&size=128`;
    }
  }
}