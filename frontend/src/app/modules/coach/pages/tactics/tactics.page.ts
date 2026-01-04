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
  
  // Variables para formaciones
  formations = ['3-4-3', '3-5-2', '4-3-3', '4-4-2', '4-5-1', '5-3-2', '5-4-1'];
  selectedFormation = '4-3-3'; // Por defecto, se sobrescribirá al cargar

  // Filas del campo
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
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('matchId');
    if (idParam) {
      this.matchId = +idParam;
      this.loadMatchData();
    } else {
      this.loading = false;
    }
    // No llamamos a updatePitchRows aquí todavía, esperamos a ver si hay datos guardados
  }

  onFormationChange(event: any) {
    const newFormation = event.detail.value;
    this.selectedFormation = newFormation; // Actualizamos la variable visual
    this.updatePitchRows(newFormation);
  }

  updatePitchRows(formation: string) {
    const parts = formation.split('-').map(Number); // "4-4-2" -> [4, 4, 2]
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
    // Jugadores sobrantes vuelven al banquillo
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
        
        // Filtramos por equipo
        const teamPlayers = all.filter((p: any) => {
            const pTeamId = p.equipoPrincipal?.id || p.equipoPrincipal?.idEquipo || p.equipoPrincipal;
            return String(pTeamId) === String(teamId);
        });

        // Eliminamos duplicados
        const uniquePlayersMap = new Map();
        teamPlayers.forEach((p: any) => {
            const uniqueId = this.getPlayerId(p);
            if (uniqueId && !uniquePlayersMap.has(uniqueId)) {
                uniquePlayersMap.set(uniqueId, p);
            }
        });

        this.bench = Array.from(uniquePlayersMap.values());
        this.fetchSavedLineup();
      },
      error: () => this.loading = false 
    });
  }

  fetchSavedLineup() {
    this.matchSvc.getLineup(this.matchId).subscribe({
      next: (savedSlots: any) => {
        
        // 1. DETERMINAR LA FORMACIÓN GUARDADA (Lógica Nueva)
        if (Array.isArray(savedSlots) && savedSlots.length > 0) {
            
            // Contamos cuántos slots hay guardados de cada tipo
            // Los slots se guardan como "DEF-1", "DEF-2", etc. El último número nos dice el tamaño.
            let maxDef = 0, maxMid = 0, maxFwd = 0;

            savedSlots.forEach((slot: any) => {
                const id = slot.slotId || '';
                if (id.startsWith('DEF-')) {
                    const num = parseInt(id.split('-')[1]);
                    if (num > maxDef) maxDef = num;
                }
                if (id.startsWith('MID-')) {
                    const num = parseInt(id.split('-')[1]);
                    if (num > maxMid) maxMid = num;
                }
                if (id.startsWith('FWD-')) {
                    const num = parseInt(id.split('-')[1]);
                    if (num > maxFwd) maxFwd = num;
                }
            });

            // Si hemos encontrado una formación válida (ej: 4-4-2), la aplicamos
            if (maxDef > 0 && maxMid > 0 && maxFwd > 0) {
                const detectedFormation = `${maxDef}-${maxMid}-${maxFwd}`;
                // Verificamos si existe en nuestra lista permitida, si no, fallback a 4-3-3
                if (this.formations.includes(detectedFormation)) {
                    this.selectedFormation = detectedFormation;
                } else {
                    // Si es una formación rara (ej: expulsaron a uno y guardaron 4-4-1),
                    // intentamos aproximar o nos quedamos con la más grande que quepa.
                    // Por simplicidad, si no coincide exacto, usamos 4-3-3 pero los jugadores se colocarán igual.
                    this.selectedFormation = '4-3-3'; 
                }
            } else {
                this.selectedFormation = '4-3-3';
            }
        } else {
            // Si no hay nada guardado, defecto
            this.selectedFormation = '4-3-3';
        }

        // 2. APLICAR LA FORMACIÓN DETECTADA
        this.updatePitchRows(this.selectedFormation);

        // 3. COLOCAR A LOS JUGADORES EN SUS HUECOS
        if (Array.isArray(savedSlots) && savedSlots.length > 0) {
          savedSlots.forEach((saved: any) => {
              const playerIdToFind = saved.idJugador || saved.jugador?.idJugador || saved.jugador?.id;
              if (!playerIdToFind) return; 

              const playerIndex = this.bench.findIndex(p => this.getPlayerId(p) === String(playerIdToFind));
              
              if (playerIndex > -1) {
                const player = this.bench[playerIndex];
                const targetSlot = this.findSlot(saved.slotId);

                if (targetSlot) {
                  this.bench.splice(playerIndex, 1); 
                  targetSlot.player = player;        
                } 
              }
          });
        }
        this.loading = false;
      },
      error: () => this.loading = false 
    });
  }

  // ... (El resto de funciones saveTactics, drop, findSlot, etc. siguen IGUAL que antes)
  
  async saveTactics() {
    if (!this.matchId) return;
    const allSlots = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    const playersOnPitch = allSlots.filter(s => s.player !== null);

    if (playersOnPitch.length !== 11) {
        const t = await this.toastCtrl.create({ message: `Alineación incompleta: ${playersOnPitch.length}/11`, duration: 2000, color: 'warning' });
        t.present();
        return;
    }
    // (Validación portero aquí...)

    this.saving = true;
    const payload = playersOnPitch.map(slot => ({
        idPartido: this.matchId,
        idJugador: (slot.player as any).idJugador || slot.player?.id,
        slotId: slot.id 
    }));

    this.matchSvc.saveLineup(this.matchId, payload).subscribe({
        next: async () => {
          this.saving = false;
          const t = await this.toastCtrl.create({ message: 'Alineación guardada 💾', duration: 2000, color: 'success' });
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
      targetSlot.player = draggedPlayer;

      if (isBenchSource) {
        const idx = this.bench.findIndex(p => this.getPlayerId(p) === this.getPlayerId(draggedPlayer));
        if (idx > -1) this.bench.splice(idx, 1);
      } else {
        this.clearSlot(event.previousContainer.id);
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
    if (slot) slot.player = null;
  }
}