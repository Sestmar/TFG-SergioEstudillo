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
  
  // Grid 5x4 inicializado vacío
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

  // 2. Cargar datos del Partido de forma SEGURA
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
        
        // Filtramos solo los de este equipo
        const myPlayers = all.filter((p: any) => {
            const pTeamId = p.equipoPrincipal?.id || p.equipoPrincipal?.idEquipo || p.equipoPrincipal;
            return pTeamId == teamId;
        });
        
        this.bench = myPlayers;
        
        // Buscamos si ya hay táctica guardada
        this.fetchSavedLineup();
      },
      error: (err) => {
        console.error("Error cargando jugadores", err);
        this.loading = false; 
      }
    });
  }

  // --- 📡 CARGAR DEL BACKEND ---
  fetchSavedLineup() {
    this.matchSvc.getLineup(this.matchId).subscribe({
      next: (savedSlots: any) => {
        if (Array.isArray(savedSlots) && savedSlots.length > 0) {
          savedSlots.forEach((saved: any) => {
              // 1. Identificar jugador
              const playerIdToFind = saved.idJugador || saved.jugador?.idJugador || saved.jugador?.id || saved.player?.id;
              
              // 2. Buscarlo en el banquillo
              const playerIndex = this.bench.findIndex(p => (p as any).idJugador === playerIdToFind || p.id === playerIdToFind);
              
              if (playerIndex > -1) {
                const player = this.bench[playerIndex];
                this.bench.splice(playerIndex, 1); // Sacar del banquillo

                // 3. Colocar en el hueco
                const targetId = saved.slotId; // ✅ Usamos slotId que es lo que guarda Java
                
                const targetSlot = targetId ? this.findSlot(targetId) : null;
                if (targetSlot) {
                  targetSlot.player = player;
                } else {
                    this.bench.push(player);
                }
              }
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.log("Alineación vacía o error al cargar", err);
        this.loading = false; 
      }
    });
  }

  // --- 💾 GUARDAR AL BACKEND (CORREGIDO) ---
  // FUNCIÓN GUARDAR (Sustituye la que tengas)
  saveTactics() {
    if (!this.matchId) return;
    this.saving = true;

    // Recolectar fichas del campo
    const allSlots = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    
    // Crear payload limpio
    const payload = allSlots
      .filter(slot => slot.player !== null) 
      .map(slot => ({
        // ✅ Coincide con AlineacionDto (Java)
        idPartido: this.matchId,
        idJugador: (slot.player as any).idJugador || slot.player?.id,
        slotId: slot.id  // Ej: "FWD-1"
      }));

    console.log("Enviando alineación:", payload);

    this.matchSvc.saveLineup(payload).subscribe({
        next: async () => {
          this.saving = false;
          const toast = await this.toastCtrl.create({
            message: '¡Alineación guardada!', duration: 2000, color: 'success', position: 'top'
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

  // --- 🔥 DRAG & DROP ---
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