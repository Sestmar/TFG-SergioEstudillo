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
    const loading = await this.loadingCtrl.create({ message: 'Cargando datos...' });
    await loading.present();

    this.matchSvc.getMatchById(this.matchId).subscribe({
      next: (m) => {
        this.match = m;
        this.matchStats.golesFavor = m.golesFavor || 0;
        this.matchStats.golesContra = m.golesContra || 0;
        
        // Cargamos jugadores y fusionamos
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
        
        // 🔥 FIX PERSISTENCIA: Convertimos a String para comparar, así no falla si uno es number y otro string
        const pId = player.idJugador || player.id;
        const existingRecord = alineacion.find((a: any) => {
            const aId = a.idJugador || a.jugador?.idJugador;
            return String(aId) === String(pId);
        });

        // Aseguramos que tenemos el ID correcto para trabajar
        const idJugadorSeguro = pId;

        if (existingRecord) {
          // --- JUGADOR CON DATOS GUARDADOS ---
          return {
            ...existingRecord,
            // Datos visuales
            nombre: existingRecord.nombre || player.usuario?.nombre,
            apellidos: existingRecord.apellidos || player.usuario?.apellidos,
            dorsal: existingRecord.dorsal || player.dorsal,
            fotoUrl: existingRecord.fotoUrl || player.usuario?.fotoUrl,
            idJugador: idJugadorSeguro,
            
            esTitular: existingRecord.esTitular,
            
            // Stats: Si vienen del backend, usarlas. Si no, inicializar.
            minutos: (existingRecord.minutosJugados !== undefined && existingRecord.minutosJugados !== null) 
                     ? existingRecord.minutosJugados 
                     : (existingRecord.esTitular ? 90 : 0),
            
            goles: existingRecord.goles || 0,
            asistencias: existingRecord.asistencias || 0,
            amarilla: existingRecord.tarjetaAmarilla || false,
            roja: existingRecord.tarjetaRoja || false,
            
            // Cambios: Importante mantener el 0 si existe
            minutoEntrada: existingRecord.minutoEntrada, 
            minutoSalida: existingRecord.minutoSalida
          };
        } else {
          // --- JUGADOR NUEVO (SIN DATOS) ---
          return {
            idJugador: idJugadorSeguro,
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
            minutoEntrada: null,
            minutoSalida: null
          };
        }
      });

      // Separar y Ordenar
      this.starters = this.fullSquadStats.filter(p => p.esTitular);
      // En el banquillo, mostramos primero a los que han jugado (tienen minutos)
      this.bench = this.fullSquadStats.filter(p => !p.esTitular)
                       .sort((a, b) => (b.minutos || 0) - (a.minutos || 0));

      loading.dismiss();

    }).catch(err => {
      console.error("Error cargando jugadores", err);
      loading.dismiss();
    });
  }

  // --- FUNCIÓN HELPER PARA LIMPIAR DATOS ---
  // Convierte cualquier cosa a un Entero válido o devuelve el valor por defecto
  private safeInt(value: any, defaultValue: any = 0): number | null {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  async saveActa() {
    const loading = await this.loadingCtrl.create({ message: 'Guardando acta...' });
    await loading.present();

    const allStats = [...this.starters, ...this.bench];

    // Construimos el Payload con limpieza de datos para evitar el error 400
    const actaPayload = {
      idPartido: this.matchId,
      golesFavor: this.safeInt(this.matchStats.golesFavor),
      golesContra: this.safeInt(this.matchStats.golesContra),
      estadisticas: allStats.map(p => ({
        idJugador: p.idJugador, // Este ID ya lo aseguramos al cargar
        goles: this.safeInt(p.goles),
        asistencias: this.safeInt(p.asistencias),
        minutos: this.safeInt(p.minutos),
        amarilla: !!p.amarilla, // Forzar booleano puro
        roja: !!p.roja,         // Forzar booleano puro
        esTitular: !!p.esTitular,
        
        // Para entrada/salida enviamos null si no hay dato, para que la BD lo guarde como NULL
        minutoEntrada: this.safeInt(p.minutoEntrada, null), 
        minutoSalida: this.safeInt(p.minutoSalida, null)
      }))
    };

    console.log("Enviando Payload Limpio:", actaPayload);

    this.matchSvc.closeMatchReport(actaPayload).subscribe({
      next: async () => {
        await loading.dismiss();
        this.presentToast('Acta actualizada correctamente 📝', 'success');
        this.router.navigate(['/coach-dashboard']);
      },
      error: async (err) => {
        await loading.dismiss();
        console.error("Error backend:", err);
        this.presentToast('Error al guardar. Revisa los datos.', 'danger');
      }
    });
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    t.present();
  }
}