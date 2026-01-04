import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; 
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { MatchService } from 'src/app/core/services/match/match.service'; 
import { HttpClient } from '@angular/common/http';
import { ToastController, ActionSheetController, ModalController } from '@ionic/angular';
import { Player } from 'src/app/shared/models/models';
import { ConvocationModalComponent } from 'src/app/shared/models/convocation-modal/convocation-modal.component';

interface PitchSlot {
  id: string;      
  player: Player | null; 
  isCaptain?: boolean;
  isPenaltyTaker?: boolean;
  isFreeKickTaker?: boolean;
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
  allTeamPlayers: Player[] = []; 
  
  formations = ['3-4-3', '3-5-2', '4-3-3', '4-4-2', '4-5-1', '5-3-2', '5-4-1'];
  selectedFormation = '4-3-3'; 

  forwards: PitchSlot[] = [];
  midfielders: PitchSlot[] = [];
  defenders: PitchSlot[] = [];
  goalkeeper: PitchSlot[] = []; 

  allSlotIds: string[] = [];

  constructor(
    private route: ActivatedRoute, 
    private playerSvc: PlayerService,
    private matchSvc: MatchService, 
    private authSvc: AuthService,
    private http: HttpClient,
    private toastCtrl: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('matchId');
    if (idParam) {
      this.matchId = +idParam;
      this.loadMatchData();
    } else {
      this.loading = false;
    }
  }

  // --- CONVOCATION LOGIC ---
  async openConvocation() {
    const currentTitulars = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper]
                            .filter(s => s.player !== null)
                            .map(s => s.player!);
    
    const currentSquad = [...this.bench, ...currentTitulars];

    const modal = await this.modalCtrl.create({
      component: ConvocationModalComponent,
      componentProps: {
        allPlayers: this.allTeamPlayers, 
        currentSquad: currentSquad       
      },
      cssClass: 'my-custom-modal-css' 
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
        this.applyNewConvocation(data);
    }
  }

  applyNewConvocation(selectedPlayers: Player[]) {
    const selectedIds = new Set(selectedPlayers.map(p => this.getPlayerId(p)));

    // Limpiar titulares desconvocados
    const allSlots = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    allSlots.forEach(slot => {
        if (slot.player && !selectedIds.has(this.getPlayerId(slot.player))) {
            this.clearSlot(slot.id);
        }
    });

    // Reconstruir banquillo
    this.bench = selectedPlayers.filter(p => {
        const isOnPitch = allSlots.some(slot => slot.player && this.getPlayerId(slot.player) === this.getPlayerId(p));
        return !isOnPitch; 
    });

    // Guardar indicando que es una convocatoria (true)
    this.saveTactics(true); 
  }

  // --- ROLES LOGIC ---
  async openPlayerOptions(slot: PitchSlot) {
    if (!slot.player) return;

    const actionSheet = await this.actionSheetCtrl.create({
      header: `Opciones para ${slot.player.usuario.nombre}`,
      cssClass: 'tactics-action-sheet',
      buttons: [
        {
          text: slot.isCaptain ? 'Quitar Capitanía' : 'Hacer Capitán (C)',
          icon: 'ribbon-outline',
          handler: () => { this.setCaptain(slot); }
        },
        {
          text: slot.isPenaltyTaker ? 'Quitar Penaltis' : 'Lanzador de Penaltis (P)',
          icon: 'football-outline',
          handler: () => { slot.isPenaltyTaker = !slot.isPenaltyTaker; }
        },
        {
          text: slot.isFreeKickTaker ? 'Quitar Faltas' : 'Lanzador de Faltas (F)',
          icon: 'alert-circle-outline',
          handler: () => { slot.isFreeKickTaker = !slot.isFreeKickTaker; }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  setCaptain(targetSlot: PitchSlot) {
    if (targetSlot.isCaptain) {
        targetSlot.isCaptain = false;
        return;
    }
    const allSlots = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    allSlots.forEach(s => s.isCaptain = false);
    targetSlot.isCaptain = true;
  }

  // --- FORMATION & DATA LOGIC ---
  onFormationChange(event: any) {
    const newFormation = event.detail.value;
    this.selectedFormation = newFormation; 
    this.updatePitchRows(newFormation);
  }

  updatePitchRows(formation: string) {
    const parts = formation.split('-').map(Number); 
    const defCount = parts[0];
    const midCount = parts[1];
    const fwdCount = parts[2];

    this.goalkeeper = this.resizeRow(this.goalkeeper || [], 1, 'GK');
    this.defenders = this.resizeRow(this.defenders || [], defCount, 'DEF');
    this.midfielders = this.resizeRow(this.midfielders || [], midCount, 'MID');
    this.forwards = this.resizeRow(this.forwards || [], fwdCount, 'FWD');

    this.updateDragConnections();
  }

  private resizeRow(currentRow: PitchSlot[], newSize: number, prefix: string): PitchSlot[] {
    const newRow: PitchSlot[] = [];
    for (let i = 0; i < newSize; i++) {
        if (i < currentRow.length) {
            newRow.push(currentRow[i]);
        } else {
            newRow.push({ id: `${prefix}-${i + 1}`, player: null });
        }
    }
    if (currentRow.length > newSize) {
        const overflowSlots = currentRow.slice(newSize);
        overflowSlots.forEach(slot => {
            if (slot.player) {
                const exists = this.bench.some(p => this.getPlayerId(p) === this.getPlayerId(slot.player!));
                if (!exists) this.bench.push(slot.player);
            }
        });
    }
    return newRow;
  }

  private updateDragConnections() {
    this.allSlotIds = [
        'benchList', 
        ...this.forwards.map(s => s.id),
        ...this.midfielders.map(s => s.id),
        ...this.defenders.map(s => s.id),
        ...this.goalkeeper.map(s => s.id)
    ];
  }

  private getPlayerId(player: any): string {
      return String(player.id || player.idJugador || (player.usuario && player.usuario.id));
  }

  getBorderColor(posicion: string): string {
    if (!posicion) return '#94a3b8'; 
    const pos = posicion.toUpperCase();
    if (pos.includes('PORTERO')) return '#fbbf24'; 
    if (pos.includes('DEFENSA') || pos.includes('LATERAL') || pos.includes('CENTRAL')) return '#38bdf8'; 
    if (pos.includes('MEDIO') || pos.includes('PIVOTE') || pos.includes('INTERIOR')) return '#4ade80'; 
    if (pos.includes('DELANTERO') || pos.includes('EXTREMO') || pos.includes('PUNTA')) return '#f87171'; 
    return '#94a3b8';
  }

  getShortName(nombre: string): string {
      return nombre ? nombre.split(' ')[0] : '';
  }

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
      error: () => this.loading = false
    });
  }

  loadPlayersAndTactics(teamId: number) {
    this.playerSvc.getAllPlayers().subscribe({
      next: (res: any) => {
        const all = Array.isArray(res) ? res : (res.data || []);
        
        const teamPlayers = all.filter((p: any) => {
            const pTeamId = p.equipoPrincipal?.id || p.equipoPrincipal?.idEquipo || p.equipoPrincipal;
            return String(pTeamId) === String(teamId);
        });

        const uniquePlayersMap = new Map();
        teamPlayers.forEach((p: any) => {
            const uniqueId = this.getPlayerId(p);
            if (uniqueId && !uniquePlayersMap.has(uniqueId)) {
                uniquePlayersMap.set(uniqueId, p);
            }
        });

        this.allTeamPlayers = Array.from(uniquePlayersMap.values());
        this.bench = []; 
        this.fetchSavedLineup();
      },
      error: () => this.loading = false 
    });
  }

  fetchSavedLineup() {
    this.matchSvc.getLineup(this.matchId).subscribe({
      next: (savedSlots: any) => {
        
        if (Array.isArray(savedSlots) && savedSlots.length > 0) {
            let maxDef = 0, maxMid = 0, maxFwd = 0;
            savedSlots.forEach((slot: any) => {
                const id = slot.slotId || '';
                if (id.startsWith('DEF-')) { const num = parseInt(id.split('-')[1]); if (num > maxDef) maxDef = num; }
                if (id.startsWith('MID-')) { const num = parseInt(id.split('-')[1]); if (num > maxMid) maxMid = num; }
                if (id.startsWith('FWD-')) { const num = parseInt(id.split('-')[1]); if (num > maxFwd) maxFwd = num; }
            });

            if (maxDef > 0 && maxMid > 0 && maxFwd > 0) {
                const detectedFormation = `${maxDef}-${maxMid}-${maxFwd}`;
                if (this.formations.includes(detectedFormation)) {
                    this.selectedFormation = detectedFormation;
                } else { this.selectedFormation = '4-3-3'; }
            } else { this.selectedFormation = '4-3-3'; }
        } else {
            this.selectedFormation = '4-3-3';
            // Si no hay datos, convocamos a TODOS por defecto
            this.bench = [...this.allTeamPlayers];
        }

        this.updatePitchRows(this.selectedFormation);

        if (Array.isArray(savedSlots) && savedSlots.length > 0) {
          const savedIds = new Set();

          savedSlots.forEach((saved: any) => {
              const playerId = saved.idJugador || saved.jugador?.idJugador;
              if (playerId) savedIds.add(String(playerId));

              const playerObj = this.allTeamPlayers.find(p => this.getPlayerId(p) === String(playerId));
              
              if (playerObj) {
                if (!saved.slotId || saved.slotId.startsWith('BENCH')) {
                    this.bench.push(playerObj);
                } 
                else {
                    const targetSlot = this.findSlot(saved.slotId);
                    if (targetSlot) {
                        targetSlot.player = playerObj;
                        targetSlot.isCaptain = saved.esCapitan || false;
                        targetSlot.isPenaltyTaker = saved.esLanzadorPenaltis || false;
                        targetSlot.isFreeKickTaker = saved.esLanzadorFaltas || false;
                    } else {
                        this.bench.push(playerObj);
                    }
                }
              }
          });
        }
        this.loading = false;
      },
      error: () => this.loading = false 
    });
  }

  // 🔥 ARREGLADO: PARAMETRO OPCIONAL isConvocation
  async saveTactics(isConvocation: boolean = false) {
    if (!this.matchId) return;
    const allPitchSlots = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    const playersOnPitch = allPitchSlots.filter(s => s.player !== null);

    // Solo validamos 11 jugadores si NO es una convocatoria (es decir, si le das al botón verde "Guardar")
    if (!isConvocation) {
        if (playersOnPitch.length !== 11) {
            const t = await this.toastCtrl.create({ message: `Alineación incompleta: ${playersOnPitch.length}/11`, duration: 2000, color: 'warning' });
            t.present();
            return;
        }

        if (!this.goalkeeper[0]?.player) {
            const t = await this.toastCtrl.create({ message: `¡Falta el portero!`, duration: 2000, color: 'warning' });
            t.present();
            return;
        }
    }

    this.saving = true;

    const pitchPayload = playersOnPitch.map(slot => ({
        idPartido: this.matchId,
        idJugador: (slot.player as any).idJugador || slot.player?.id,
        slotId: slot.id,
        esCapitan: slot.isCaptain || false,
        esLanzadorPenaltis: slot.isPenaltyTaker || false,
        esLanzadorFaltas: slot.isFreeKickTaker || false
    }));

    const benchPayload = this.bench.map(p => ({
        idPartido: this.matchId,
        idJugador: (p as any).idJugador || p.id,
        slotId: `BENCH_${(p as any).idJugador || p.id}`, 
        esCapitan: false,
        esLanzadorPenaltis: false,
        esLanzadorFaltas: false
    }));

    const fullPayload = [...pitchPayload, ...benchPayload];

    this.matchSvc.saveLineup(this.matchId, fullPayload).subscribe({
        next: async () => {
          this.saving = false;
          // Mensaje distinto según la acción
          const msg = isConvocation ? 'Convocatoria actualizada ✅' : 'Alineación guardada 💾';
          const t = await this.toastCtrl.create({ message: msg, duration: 2000, color: 'success' });
          t.present();
        },
        error: async () => {
          this.saving = false;
          const t = await this.toastCtrl.create({ message: 'Error al guardar', duration: 2000, color: 'danger' });
          t.present();
        }
      });
  }

  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) return;
    const isBenchSource = event.previousContainer.id === 'benchList';
    const isBenchTarget = event.container.id === 'benchList';
    const draggedPlayer: Player = event.item.data;

    if (!draggedPlayer) return;

    if (isBenchTarget) {
      const exists = this.bench.some(p => this.getPlayerId(p) === this.getPlayerId(draggedPlayer));
      if (!exists) this.bench.push(draggedPlayer);
      this.clearSlot(event.previousContainer.id);
    } else {
      const targetSlot = this.findSlot(event.container.id);
      if (!targetSlot) return;
      const existingPlayer = targetSlot.player;
      
      targetSlot.isCaptain = false; 
      targetSlot.isPenaltyTaker = false;
      targetSlot.isFreeKickTaker = false;

      targetSlot.player = draggedPlayer;

      if (isBenchSource) {
        const idx = this.bench.findIndex(p => this.getPlayerId(p) === this.getPlayerId(draggedPlayer));
        if (idx > -1) this.bench.splice(idx, 1);
      } else {
        const originSlot = this.findSlot(event.previousContainer.id);
        if (originSlot) {
             targetSlot.isCaptain = originSlot.isCaptain;
             targetSlot.isPenaltyTaker = originSlot.isPenaltyTaker;
             targetSlot.isFreeKickTaker = originSlot.isFreeKickTaker;
             this.clearSlot(event.previousContainer.id);
        }
      }

      if (existingPlayer) {
        if (isBenchSource) {
            this.bench.push(existingPlayer);
        } else {
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
    if (slot) {
        slot.player = null;
        slot.isCaptain = false;
        slot.isPenaltyTaker = false;
        slot.isFreeKickTaker = false;
    }
  }
}