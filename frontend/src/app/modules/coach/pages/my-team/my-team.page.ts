import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { PlayerService } from 'src/app/core/services/player/player.service';
import { TeamService } from 'src/app/core/services/team/team.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Player, Team } from 'src/app/shared/models/models';

@Component({
  selector: 'app-my-team',
  templateUrl: './my-team.page.html',
  styleUrls: ['./my-team.page.scss'],
})
export class MyTeamPage implements OnInit {
  
  myPlayers: Player[] = [];
  otherPlayers: Player[] = [];
  
  teams: Team[] = [];
  coachTeamId: number | null = null;
  loading: boolean = true;
  
  isModalOpen = false;
  isEditModalOpen = false;
  selectedPlayer: Player | null = null;
  injuryData = { tipo: '', duracion: '', notas: '' };

  techData = {
    dorsal: null as number | null,
    posicion: '',
    teamId: null as number | null
  };

  posicionesDisponibles = [
    'PORTERO', 'DEFENSA', 'LATERAL_DERECHO', 'LATERAL_IZQUIERDO', 'CENTRAL',
    'MEDIOCENTRO', 'EXTREMO', 'DELANTERO', 'PIVOTE', 'MEDIA_PUNTA'
  ];

  constructor(
    private playerService: PlayerService,
    private teamService: TeamService,
    private authSvc: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.detectCoachTeam();
    this.loadTeams();
  }

  detectCoachTeam() {
    this.authSvc.currentUser$.subscribe(user => {
      if (user) {
        // Simulamos que Carlos es del Primer Equipo (ID 1)
        this.coachTeamId = 1; 
        this.loadPlayers();
      }
    });
  }

  // --- DETECTIVE DE EQUIPOS (Versión Mejorada) ---
  private getTeamIdFromPlayer(p: any): number | null {
    // 1. Buscamos en objetos anidados
    if (p.equipo && typeof p.equipo === 'object' && p.equipo.id) return p.equipo.id;
    if (p.equipoActual && typeof p.equipoActual === 'object' && p.equipoActual.id) return p.equipoActual.id;
    
    // 2. Buscamos IDs directos
    if (typeof p.idEquipo === 'number') return p.idEquipo;
    if (typeof p.equipo === 'number') return p.equipo;
    
    return null;
  }
  
  private getTeamNameFromPlayer(p: any): string {
     // Intenta sacar el nombre, o devuelve 'Sin Equipo'
     if (p.equipo && p.equipo.nombre) return p.equipo.nombre;
     if (p.equipoActual && p.equipoActual.nombre) return p.equipoActual.nombre;
     return 'Sin Equipo';
  }

  loadPlayers() {
    this.loading = true;
    this.playerService.getAllPlayers().subscribe({
      next: (res: any) => {
        const all = Array.isArray(res) ? res : (res.data || []);
        
        // --- DEPURACIÓN: ESTO ES IMPORTANTE ---
        // Mira la consola del navegador. Aquí veremos cómo viene Messi realmente.
        if (all.length > 0) {
            console.log("🔍 Estructura del primer jugador:", all[0]);
        }
        // --------------------------------------

        if (this.coachTeamId) {
          this.myPlayers = all.filter((p: any) => {
             const tId = this.getTeamIdFromPlayer(p);
             return tId === this.coachTeamId;
          });

          this.otherPlayers = all.filter((p: any) => {
             const tId = this.getTeamIdFromPlayer(p);
             return tId !== this.coachTeamId;
          });
        } else {
          this.myPlayers = all;
          this.otherPlayers = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  loadTeams() {
    this.teamService.getTeams().subscribe({
      next: (res: any) => {
        this.teams = Array.isArray(res) ? res : (res.data || []);
      },
      error: (err) => console.error('Error cargando equipos', err)
    });
  }

  // --- 🔥 FIX 400: LIMPIEZA DE DATOS 🔥 ---
  private prepareDto(player: Player, cambios: any): any {
    const rawPlayer = player as any;
    const rawUser = player.usuario as any;

    // 1. Determinar el ID final del equipo
    let finalTeamId: number | null = null;
    
    // Si cambios.equipoPrincipal es undefined, no se ha tocado el select.
    // Si es null, se ha seleccionado "Sin Equipo".
    // Si es un número, es el nuevo ID.
    if (cambios.equipoPrincipal !== undefined) {
        finalTeamId = cambios.equipoPrincipal;
    } else {
        // Mantenemos el que tenía
        finalTeamId = this.getTeamIdFromPlayer(rawPlayer);
    }

    // Construimos el objeto equipo limpio
    const teamObject = finalTeamId ? { id: finalTeamId } : null;

    // Objeto FINAL limpio para Java
    const payload = {
      idUsuario: rawUser.id || rawUser.idUsuario, 
      posicion: cambios.posicion || rawPlayer.posicionPrimaria || rawPlayer.posicion,
      dorsal: cambios.dorsal !== undefined ? cambios.dorsal : player.dorsal,
      estado: cambios.estado || rawPlayer.estado,
      observaciones: cambios.observaciones !== undefined ? cambios.observaciones : rawPlayer.observaciones,

      // ✅ LA CLAVE: Usamos 'equipo' como nombre estándar
      equipo: teamObject,
      
      // ✅ PLAN B: Enviamos también 'idEquipo' por si tu backend usa DTO plano
      idEquipo: finalTeamId,

      // Datos legacy (por si acaso son obligatorios)
      fechaNacimiento: rawPlayer.fechaNacimiento || null,
      telefonoContacto: rawPlayer.telefonoContacto || null,
      direccion: rawPlayer.direccion || null,
      fechaAlta: rawPlayer.fechaAlta || new Date().toISOString(),
      fechaBaja: rawPlayer.fechaBaja || null,
    };

    console.log("📤 ENVIANDO PAYLOAD:", payload); // Para ver qué enviamos antes del fallo
    return payload;
  }

  private getPlayerId(player: Player): number {
    const raw = player as any;
    return raw.id || raw.idJugador;
  }

  // --- MODAL EDICIÓN ---
  openEditModal(player: Player) {
    this.selectedPlayer = player;
    const raw = player as any;
    const currentTeamId = this.getTeamIdFromPlayer(raw);

    this.techData = {
      dorsal: player.dorsal || null,
      posicion: raw.posicionPrimaria || raw.posicion || '',
      teamId: currentTeamId
    };
    this.isEditModalOpen = true;
  }

  async saveTechnicalData() {
    if (!this.selectedPlayer) return;
    const loading = await this.loadingCtrl.create({ message: 'Guardando cambios...' });
    await loading.present();

    const cambios = {
      dorsal: this.techData.dorsal,
      posicion: this.techData.posicion,
      equipoPrincipal: this.techData.teamId // Pasamos el ID del select
    };

    const payload = this.prepareDto(this.selectedPlayer, cambios);
    const playerId = this.getPlayerId(this.selectedPlayer);

    this.playerService.updatePlayer(playerId, payload).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isEditModalOpen = false; 
        this.showToast('Ficha actualizada correctamente ✅', 'success');
        this.loadPlayers(); 
      },
      error: async (err) => {
        await loading.dismiss();
        console.error("❌ Error Backend:", err);
        // Mostramos el mensaje de error del backend si existe
        const msg = err.error?.message || 'Datos inválidos (400)';
        this.showToast(`Error: ${msg}`, 'danger');
      }
    });
  }

  // ... (Resto de funciones: saveInjury, openInjuryModal, etc. mantienen igual)
  
  openInjuryModal(player: Player) {
    this.selectedPlayer = player;
    this.injuryData = { tipo: '', duracion: '', notas: '' };
    this.isModalOpen = true;
  }

  async saveInjury() {
    if (!this.selectedPlayer) return;
    const loading = await this.loadingCtrl.create({ message: 'Registrando lesión...' });
    await loading.present();
    const obsTexto = `[BAJA MÉDICA] Tipo: ${this.injuryData.tipo} | Duración: ${this.injuryData.duracion}`;
    const cambios = { estado: 'LESIONADO', observaciones: obsTexto };
    const payload = this.prepareDto(this.selectedPlayer, cambios);
    const playerId = this.getPlayerId(this.selectedPlayer);

    this.playerService.updatePlayer(playerId, payload).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isModalOpen = false;
        this.showToast('Baja registrada', 'warning');
        this.loadPlayers(); 
      },
      error: async () => { await loading.dismiss(); this.showToast('Error', 'danger'); }
    });
  }

  closeModals() {
    this.isModalOpen = false;
    this.isEditModalOpen = false;
    this.selectedPlayer = null;
  }

  async setRecovered(player: Player) {
      const alert = await this.alertCtrl.create({
      header: '¿Dar de alta?',
      message: 'El jugador volverá a estar ACTIVO.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            const cambios = { estado: 'ACTIVO', observaciones: 'Alta médica.' };
            const payload = this.prepareDto(player, cambios);
            const id = this.getPlayerId(player);
            this.playerService.updatePlayer(id, payload).subscribe(() => {
              this.showToast('Jugador recuperado 💪', 'success');
              this.loadPlayers();
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // Helpers HTML
  getPlayerPositionDisplay(player: any): string {
    return player.posicion || player.posicionPrimaria || '';
  }
  
  getPlayerTeamNameDisplay(player: any): string {
     return this.getTeamNameFromPlayer(player);
  }

  getAvatar(p: Player): string {
    const user = p.usuario as any;
    return user.fotoUrl || user.fotoPerfil || `https://ui-avatars.com/api/?name=${user.nombre}&background=random`;
  }

  async showToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2000, color });
    t.present();
  }
}