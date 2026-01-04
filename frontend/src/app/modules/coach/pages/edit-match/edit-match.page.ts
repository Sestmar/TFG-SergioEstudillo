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
        
        // Determinar ID del equipo local
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
    // 1. Obtener lo que ya hay guardado en BD (si se guardó antes)
    const p1 = this.matchSvc.getLineup(this.matchId).toPromise();
    // 2. Obtener toda la plantilla para mostrar también a los que no jugaron
    const p2 = this.playerService.getAllPlayers().toPromise(); 

    Promise.all([p1, p2]).then(([lineupData, allPlayersData]: [any, any]) => {
      
      const alineacionGuardada = lineupData || []; 
      const allPlayers = Array.isArray(allPlayersData) ? allPlayersData : (allPlayersData.data || []);

      // Filtrar plantilla del equipo local
      const myTeamPlayers = allPlayers.filter((p: any) => {
         const pTeamId = p.equipoPrincipal?.id || p.equipoPrincipal?.idEquipo || p.equipoPrincipal;
         return pTeamId == teamId;
      });

      // Fusionar datos
      this.fullSquadStats = myTeamPlayers.map((player: any) => {
        const pId = player.idJugador || player.id;
        
        // ¿Existe ya en la alineación?
        const savedData = alineacionGuardada.find((a: any) => {
            const savedId = a.jugador?.id || a.jugador?.idJugador || a.idJugador;
            return String(savedId) === String(pId);
        });
        
        let stats = {
            idJugador: pId,
            nombre: player.usuario?.nombre || player.nombre,
            apellidos: player.usuario?.apellidos || player.apellidos,
            dorsal: player.dorsal,
            fotoUrl: player.usuario?.fotoUrl || player.fotoUrl,
            posicion: player.posicion,
            
            // Valores por defecto
            esTitular: false,
            minutos: 0,
            goles: 0,
            minutoEntrada: null,
            minutoSalida: null
        };

        if (savedData) {
            stats.esTitular = !!savedData.esTitular;
            stats.goles = savedData.goles || 0;
            stats.minutos = savedData.minutosJugados || 0;
            stats.minutoEntrada = savedData.minutoEntrada;
            stats.minutoSalida = savedData.minutoSalida;
            
            // Fix visual: si es titular y minutos es 0, sugerir 90 (solo visual, no guardar aún)
            if(stats.esTitular && stats.minutos === 0) stats.minutos = 90;
        }

        return stats;
      });

      // Separar listas
      this.starters = this.fullSquadStats.filter(p => p.esTitular);
      this.bench = this.fullSquadStats.filter(p => !p.esTitular);

      loading.dismiss();

    }).catch(err => {
      console.error("Error cargando jugadores", err);
      loading.dismiss();
    });
  }

  // Convierte cualquier input a Entero seguro
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
            // Lógica de autocompletar minutos
            let minJugados = this.safeInt(p.minutos);
            const esTitular = !!p.esTitular;
            const minEntrada = this.safeInt(p.minutoEntrada, 0);
            const minSalida = this.safeInt(p.minutoSalida, 0);

            // CASO 1: Suplente entra (tiene minuto entrada pero minutos jugados es 0 o vacio)
            if (!esTitular && minEntrada > 0 && minJugados === 0) {
                minJugados = 90 - minEntrada;
            }
            
            // CASO 2: Titular sale (tiene minuto salida pero minutos jugados es 90 o 0)
            if (esTitular && minSalida > 0) {
                minJugados = minSalida;
            }

            return {
                idJugador: p.idJugador,
                goles: this.safeInt(p.goles),
                minutos: minJugados,
                esTitular: esTitular,
                minutoEntrada: minEntrada > 0 ? minEntrada : null,
                minutoSalida: minSalida > 0 ? minSalida : null
            };
          })
      };
  }

  async guardarAlineacion() {
    this.saving = true;
    // Para el coach, solo guardamos alineación base, no cerramos acta
    // Podrías tener un endpoint específico saveLineupOnly si quieres, 
    // pero usar el mismo con cuidado está bien si el backend lo soporta.
    // Asumiremos que el coach solo guarda posiciones en la otra pantalla (Tactics).
    // Esta pantalla es más para el acta.
    this.saving = false;
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
            this.router.navigate(['/admin']);
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