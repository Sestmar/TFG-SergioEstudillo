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

  getBorderColor(posicion: string): string {
    if (!posicion) return '#94a3b8'; 
    const pos = posicion.toUpperCase();
    if (pos.includes('PORTERO')) return '#22c55e'; 
    if (pos.includes('DEFENSA') || pos.includes('LATERAL') || pos.includes('CENTRAL')) return '#eab308'; 
    if (pos.includes('MEDIO') || pos.includes('PIVOTE') || pos.includes('INTERIOR')) return '#3b82f6'; 
    if (pos.includes('DELANTERO') || pos.includes('EXTREMO') || pos.includes('PUNTA')) return '#ef4444'; 
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
      error: (err) => {
        console.error("Error cargando partido", err);
        this.loading = false;
      }
    });
  }

  loadPlayersAndTactics(teamId: number) {
    this.playerSvc.getAllPlayers().subscribe({
      next: (res: any) => {
        const all = Array.isArray(res) ? res : (res.data || []);
        const myPlayers = all.filter((p: any) => {
            const pTeamId = p.equipoPrincipal?.id || p.equipoPrincipal?.idEquipo || p.equipoPrincipal;
            return pTeamId == teamId;
        });
        
        this.bench = myPlayers;
        // Importante: llamamos a fetch después de llenar el banquillo
        this.fetchSavedLineup();
      },
      error: (err) => {
        console.error(err);
        this.loading = false; 
      }
    });
  }

  fetchSavedLineup() {
    this.matchSvc.getLineup(this.matchId).subscribe({
      next: (savedSlots: any) => {
        console.log("📥 Alineación recibida (DTO):", savedSlots);

        if (Array.isArray(savedSlots) && savedSlots.length > 0) {
          savedSlots.forEach((saved: any) => {
              
              // 🔥 CORRECCIÓN CLAVE: El DTO plano trae 'idJugador' en la raíz, no dentro de 'jugador'
              const playerIdToFind = saved.idJugador || saved.jugador?.idJugador || saved.jugador?.id;
              
              if (!playerIdToFind) return; // Si no hay ID, saltamos

              // Buscamos al jugador en el banquillo
              const playerIndex = this.bench.findIndex(p => {
                  const pId = (p as any).idJugador || p.id;
                  return String(pId) === String(playerIdToFind);
              });
              
              if (playerIndex > -1) {
                const player = this.bench[playerIndex];
                const targetSlotId = saved.slotId; 
                const targetSlot = this.findSlot(targetSlotId);

                if (targetSlot) {
                  console.log(`✅ Moviendo ${player.usuario.nombre} a ${targetSlotId}`);
                  this.bench.splice(playerIndex, 1); // Sacar del banquillo
                  targetSlot.player = player;        // Poner en campo
                } else {
                  console.warn(`⚠️ Slot ${targetSlotId} no encontrado para jugador ${playerIdToFind}`);
                }
              } else {
                console.warn(`⚠️ Jugador ID ${playerIdToFind} no encontrado en la plantilla cargada.`);
              }
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.error("Error cargando alineación:", err);
        this.loading = false; 
      }
    });
  }

  saveTactics() {
    if (!this.matchId) return;
    this.saving = true;

    const allSlots = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    
    const payload = allSlots
      .filter(slot => slot.player !== null) 
      .map(slot => ({
        idPartido: this.matchId,
        idJugador: (slot.player as any).idJugador || slot.player?.id,
        slotId: slot.id 
      }));

    console.log("📤 Guardando táctica:", payload);

    this.matchSvc.saveLineup(this.matchId, payload).subscribe({
        next: async () => {
          this.saving = false;
          const toast = await this.toastCtrl.create({
            message: '¡Alineación guardada correctamente! 💾', duration: 2000, color: 'success', position: 'top'
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