import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; 
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MatchService } from 'src/app/core/services/match/match.service'; 
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { Player } from 'src/app/shared/models/models';

interface PitchSlot {
  id: string;      
  player: Player | null; 
}

@Component({
  selector: 'app-tactics',
  templateUrl: './tactics.page.html',
  styleUrls: ['./tactics.page.scss'],
})
export class TacticsPage implements OnInit {

  loading = true;
  saving = false;
  
  matchId: number = 0; 
  matchInfo: any = null; 
  currentTeamId: number | null = null;

  bench: Player[] = [];
  
  forwards: PitchSlot[] = this.createRow('FWD');
  midfielders: PitchSlot[] = this.createRow('MID');
  defenders: PitchSlot[] = this.createRow('DEF');
  goalkeeper: PitchSlot[] = this.createRow('GK', 1);

  constructor(
    private route: ActivatedRoute, 
    private playerSvc: PlayerService,
    private matchSvc: MatchService, 
    private authSvc: AuthService,
    private http: HttpClient,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('matchId');
    if (idParam) {
      this.matchId = +idParam;
      this.loadMatchData();
    } else {
      console.error("No se proporcionó ID de partido");
      this.loading = false;
    }
  }

  private createRow(prefix: string, count: number = 5): PitchSlot[] {
    return Array(count).fill(null).map((_, i) => ({
      id: `${prefix}-${i + 1}`,
      player: null
    }));
  }

  // 2. Cargar datos
  loadMatchData() {
    this.matchSvc.getMatchById(this.matchId).subscribe({
      next: (match) => {
        this.matchInfo = match;
        const teamObj = match.equipo;
        this.currentTeamId = teamObj?.id || teamObj?.idEquipo || match.idEquipo || (typeof teamObj === 'number' ? teamObj : null);
        
        if (this.currentTeamId) {
          this.loadPlayersAndTactics(this.currentTeamId);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error("Error cargando partido", err);
        this.loading = false;
      }
    });
  }

  // 3. Cargar jugadores y alineación
  loadPlayersAndTactics(teamId: number) {
    this.playerSvc.getAllPlayers().subscribe({
      next: (res: any) => {
        const all = Array.isArray(res) ? res : (res.data || []);
        const myPlayers = all.filter((p: any) => {
            const pTeamId = p.equipoPrincipal?.id || p.equipoPrincipal?.idEquipo || p.equipoPrincipal;
            return pTeamId == teamId;
        });
        
        this.bench = myPlayers;
        this.fetchSavedLineup();
      },
      error: (err) => {
        console.error(err);
        this.loading = false; 
      }
    });
  }

  // Cargar del Backend
  fetchSavedLineup() {
    this.matchSvc.getLineup(this.matchId).subscribe({
      next: (savedSlots: any) => {
        if (Array.isArray(savedSlots)) {
          savedSlots.forEach((saved: any) => {
              const playerIdToFind = saved.jugador?.idJugador || saved.jugador?.id;
              const playerIndex = this.bench.findIndex(p => (p as any).idJugador === playerIdToFind || p.id === playerIdToFind);
              
              if (playerIndex > -1) {
                const player = this.bench[playerIndex];
                const targetSlotId = saved.slotId; 
                const targetSlot = this.findSlot(targetSlotId);

                if (targetSlot) {
                  this.bench.splice(playerIndex, 1);
                  targetSlot.player = player;
                }
              }
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.log(err);
        this.loading = false; 
      }
    });
  }

  // --- GUARDAR (ACTUALIZADO CON MATCHID) ---
  saveTactics() {
    if (!this.matchId) return;
    this.saving = true;

    const allSlots = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    
    // Crear payload
    const payload = allSlots
      .filter(slot => slot.player !== null) 
      .map(slot => ({
        idPartido: this.matchId,
        idJugador: (slot.player as any).idJugador || slot.player?.id,
        slotId: slot.id 
      }));

    console.log("Enviando alineación (Limpieza + Guardado):", payload);

    // ✅ PASAMOS EL ID EN LA LLAMADA
    this.matchSvc.saveLineup(this.matchId, payload).subscribe({
        next: async () => {
          this.saving = false;
          const toast = await this.toastCtrl.create({
            message: '¡Alineación actualizada correctamente!', duration: 2000, color: 'success', position: 'top'
          });
          toast.present();
        },
        error: async (err) => {
          this.saving = false;
          console.error("Error backend:", err);
          const toast = await this.toastCtrl.create({
            message: 'Error al guardar.', duration: 2000, color: 'danger'
          });
          toast.present();
        }
      });
  }

  // --- DRAG & DROP ---
  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) return;

    const isBenchSource = event.previousContainer.id === 'benchList';
    const isBenchTarget = event.container.id === 'benchList';

    let draggedPlayer: Player;
    if (isBenchSource) {
        draggedPlayer = event.previousContainer.data[event.previousIndex];
    } else {
        draggedPlayer = event.previousContainer.data;
    }

    if (!draggedPlayer) return;

    if (isBenchTarget) {
      this.bench.push(draggedPlayer);
      this.clearSlot(event.previousContainer.id);
    } else {
      const targetSlot = this.findSlot(event.container.id);
      if (!targetSlot) return;

      const existingPlayer = targetSlot.player;
      targetSlot.player = draggedPlayer;

      if (isBenchSource) {
        this.bench.splice(event.previousIndex, 1);
      } else {
        this.clearSlot(event.previousContainer.id);
      }

      if (existingPlayer) {
        if (isBenchSource) this.bench.push(existingPlayer);
        else {
          const originSlot = this.findSlot(event.previousContainer.id);
          if (originSlot) originSlot.player = existingPlayer;
        }
      }
    }
  }

  private findSlot(slotId: string): PitchSlot | undefined {
    const all = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    return all.find(s => s.id === slotId);
  }

  private clearSlot(slotId: string) {
    const slot = this.findSlot(slotId);
    if (slot) slot.player = null;
  }
}