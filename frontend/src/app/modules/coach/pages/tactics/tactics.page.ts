import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { Player } from 'src/app/shared/models/models';

// Definimos la interfaz fuera de la clase para que sea accesible
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
  saving = false; // Para el spinner del botón guardar
  currentTeamId: number | null = null;

  bench: Player[] = [];
  
  // Grid 5x4 inicializado vacío
  forwards: PitchSlot[] = this.createRow('FWD');
  midfielders: PitchSlot[] = this.createRow('MID');
  defenders: PitchSlot[] = this.createRow('DEF');
  goalkeeper: PitchSlot[] = this.createRow('GK', 1);

  constructor(
    private playerSvc: PlayerService,
    private authSvc: AuthService,
    private http: HttpClient,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.loadTeam();
  }

  // Helper para crear filas de huecos
  private createRow(prefix: string, count: number = 5): PitchSlot[] {
    return Array(count).fill(null).map((_, i) => ({
      id: `${prefix}-${i + 1}`,
      player: null
    }));
  }

  // 1. Obtener el equipo del entrenador logueado
  loadTeam() {
    this.authSvc.currentUser$.subscribe(user => {
      if (user) {
        const u = user as any;
        const userId = u.id || u.idUsuario;
        if (!userId) return;

        this.http.get(`http://localhost:8080/api/entrenadores/usuario/${userId}/equipo`)
        .subscribe({
          next: (equipo: any) => {
             this.currentTeamId = equipo.idEquipo || equipo.id;
             if (this.currentTeamId) {
                // Una vez tenemos el equipo, cargamos jugadores y táctica
                this.loadPlayersAndTactics(this.currentTeamId);
             }
          },
          error: (err) => { 
            console.error("Error equipo:", err);
            this.loading = false; 
          }
        });
      }
    });
  }

  // 2. Cargar jugadores y luego la alineación guardada
  loadPlayersAndTactics(teamId: number) {
    // A. Cargamos TODOS los jugadores al banquillo primero
    this.playerSvc.getAllPlayers().subscribe((res: any) => {
      const all = Array.isArray(res) ? res : (res.data || []);
      const myPlayers = all.filter((p: any) => {
          const pTeamId = p.equipoPrincipal?.idEquipo || p.equipoPrincipal?.id || p.equipoPrincipal;
          return pTeamId == teamId;
      });
      this.bench = myPlayers;

      // B. Ahora sí, buscamos la alineación en el backend
      this.fetchSavedLineup(teamId);
    });
  }

  // --- 📡 CARGAR DEL BACKEND ---
  fetchSavedLineup(teamId: number) {
    this.http.get(`http://localhost:8080/api/alineaciones/${teamId}`).subscribe({
      next: (savedSlots: any) => {
        if (Array.isArray(savedSlots)) {
          savedSlots.forEach((saved: any) => {
             // Buscamos al jugador en el banquillo usando su ID (soporta idJugador o id)
             const playerIdToFind = saved.idJugador || saved.player?.idJugador || saved.player?.id;
             const playerIndex = this.bench.findIndex(p => (p as any).idJugador === playerIdToFind || p.id === playerIdToFind);
             
             if (playerIndex > -1) {
               // Sacamos jugador del banquillo
               const player = this.bench[playerIndex];
               this.bench.splice(playerIndex, 1);

               // Lo ponemos en su slot correspondiente
               const targetSlot = this.findSlot(saved.slotId);
               if (targetSlot) {
                 targetSlot.player = player;
               }
             }
          });
        }
        this.loading = false;
      },
      error: (err) => {
        console.log("No hay alineación guardada o error:", err);
        this.loading = false;
      }
    });
  }

  // --- 💾 GUARDAR AL BACKEND ---
  saveTactics() {
    if (!this.currentTeamId) return;
    this.saving = true;

    // Recolectar todos los jugadores que están EN EL CAMPO
    const allSlots = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    
    // Crear el array para enviar al backend (solo los ocupados)
    const payload = allSlots
      .filter(slot => slot.player !== null) 
      .map(slot => ({
        // Enviamos el ID del jugador. Usamos 'as any' para asegurar compatibilidad.
        idJugador: (slot.player as any).idJugador || slot.player?.id,
        slotId: slot.id
      }));

    console.log("Guardando alineación:", payload);

    this.http.post(`http://localhost:8080/api/alineaciones/${this.currentTeamId}`, payload)
      .subscribe({
        next: async () => {
          this.saving = false;
          const toast = await this.toastCtrl.create({
            message: '¡Alineación guardada correctamente!', duration: 2000, color: 'success', position: 'top'
          });
          toast.present();
        },
        error: async (err) => {
          this.saving = false;
          console.error(err);
          const toast = await this.toastCtrl.create({
            message: 'Error al guardar alineación', duration: 2000, color: 'danger'
          });
          toast.present();
        }
      });
  }

  // --- 🔥 DRAG & DROP (Lógica Corregida) ---
  drop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) return;

    const isBenchSource = event.previousContainer.id === 'benchList';
    const isBenchTarget = event.container.id === 'benchList';

    // ✅ FIX: Obtener el jugador de forma segura según el origen
    let draggedPlayer: Player;
    if (isBenchSource) {
        // Si viene del banquillo, 'data' es un array
        draggedPlayer = event.previousContainer.data[event.previousIndex];
    } else {
        // Si viene de un slot, 'data' es el objeto jugador directamente
        draggedPlayer = event.previousContainer.data;
    }

    if (!draggedPlayer) return; // Seguridad

    // A. Soltar en Banquillo
    if (isBenchTarget) {
      this.bench.push(draggedPlayer);
      this.clearSlot(event.previousContainer.id);
    } 
    // B. Soltar en Campo
    else {
      const targetSlot = this.findSlot(event.container.id);
      if (!targetSlot) return;

      const existingPlayer = targetSlot.player;
      targetSlot.player = draggedPlayer;

      // Limpiar origen
      if (isBenchSource) {
        this.bench.splice(event.previousIndex, 1);
      } else {
        this.clearSlot(event.previousContainer.id);
      }

      // Intercambio (Swap)
      if (existingPlayer) {
        if (isBenchSource) this.bench.push(existingPlayer);
        else {
          const originSlot = this.findSlot(event.previousContainer.id);
          if (originSlot) originSlot.player = existingPlayer;
        }
      }
    }
  }

  // Helpers
  private findSlot(slotId: string): PitchSlot | undefined {
    const all = [...this.forwards, ...this.midfielders, ...this.defenders, ...this.goalkeeper];
    return all.find(s => s.id === slotId);
  }

  private clearSlot(slotId: string) {
    const slot = this.findSlot(slotId);
    if (slot) slot.player = null;
  }
}