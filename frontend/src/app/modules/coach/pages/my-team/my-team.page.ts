import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http'; // ✅ IMPORTANTE: Para llamar al nuevo endpoint
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
  
  // ✅ CAMBIO 1: Ya no hay número fijo. Se llena dinámicamente desde el backend.
  coachTeamId: number | null = null; 
  coachTeamName: string = ''; // Opcional, por si quieres mostrar el nombre del equipo
  
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
    private http: HttpClient, // ✅ Inyectamos HttpClient
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.detectCoachTeam();
    this.loadTeams();
  }

  // --- 🔥 DETECCIÓN DINÁMICA DEL EQUIPO DEL ENTRENADOR 🔥 ---
  detectCoachTeam() {
    this.authSvc.currentUser$.subscribe(user => {
      if (user) {
        const u = user as any;
        const userId = u.id || u.idUsuario;

        // Llamamos al nuevo endpoint que conecta Usuario -> Entrenador -> Equipo
        this.http.get(`http://localhost:8080/api/entrenadores/usuario/${userId}/equipo`).subscribe({
          next: (equipo: any) => {
            console.log("✅ Equipo del Entrenador detectado:", equipo);
            // Asignamos el ID dinámicamente (tu entidad usa idEquipo)
            this.coachTeamId = equipo.idEquipo || equipo.id;
            this.coachTeamName = equipo.nombre;
            
            // Ahora que sabemos el equipo, cargamos los jugadores
            this.loadPlayers();
          },
          error: (err) => {
            console.error("❌ Error detectando equipo:", err);
            this.loading = false;
            this.showToast('No tienes equipo asignado o no eres entrenador', 'warning');
          }
        });
      }
    });
  }

  // --- DETECTIVE DE EQUIPOS EN JUGADORES ---
  private getTeamIdFromPlayer(p: any): number | null {
    let val: any = null;
    if (p.equipoPrincipal && typeof p.equipoPrincipal === 'object') {
        val = p.equipoPrincipal.id || p.equipoPrincipal.idEquipo;
    }
    else if (typeof p.equipoPrincipal === 'number') val = p.equipoPrincipal;
    else if (p.equipo && p.equipo.id) val = p.equipo.id;
    else if (typeof p.idEquipo === 'number') val = p.idEquipo;

    return val ? Number(val) : null;
  }
  
  private getTeamNameFromPlayer(p: any): string {
     if (p.equipoPrincipal && typeof p.equipoPrincipal === 'object') {
         return p.equipoPrincipal.nombre || 'Sin Nombre';
     }
     if (p.equipo && p.equipo.nombre) return p.equipo.nombre;
     return 'Sin Equipo';
  }

  loadPlayers() {
    if (!this.coachTeamId) return;

    this.loading = true;
    this.playerService.getAllPlayers().subscribe({
      next: (res: any) => {
        const all = Array.isArray(res) ? res : (res.data || []);
        
        // 1. MI EQUIPO: Los que coinciden con mi ID
        this.myPlayers = all.filter((p: any) => {
             const tId = this.getTeamIdFromPlayer(p);
             return tId == this.coachTeamId;
        });

        // 2. DISPONIBLES: 🔥 CAMBIO CLAVE 🔥
        // Antes: return tId != this.coachTeamId; (Mostraba a los de otros equipos)
        // Ahora: return tId == null; (Solo muestra a los que están libres)
        this.otherPlayers = all.filter((p: any) => {
             const tId = this.getTeamIdFromPlayer(p);
             return tId === null; 
        });

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

  // Helper de fechas
  private formatDateForJava(dateStr: string | Date | null): string | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  }

  // --- PREPARE DTO INTELIGENTE ---
  private prepareDto(player: Player, cambios: any): any {
    const rawPlayer = player as any;
    const rawUser = player.usuario as any;

    let finalTeamId: number | null = null;
    const inputTeam = cambios.equipoPrincipal;

    // LÓGICA DE DETECCIÓN INTELIGENTE (Selector UI)
    if (inputTeam !== undefined) {
        if (typeof inputTeam === 'number') {
            finalTeamId = inputTeam;
        } else if (typeof inputTeam === 'string') {
            console.warn(`⚠️ Texto detectado: "${inputTeam}". Buscando ID...`);
            
            const nombreLimpio = inputTeam.split('(')[0].trim(); 
            const foundTeam = this.teams.find(t => t.nombre.trim() === nombreLimpio);

            if (foundTeam) {
                const t = foundTeam as any;
                finalTeamId = t.id || t.idEquipo;
            } else {
                // Fallback seguro: Si falla la detección, no asignamos nada para evitar errores
                console.error("No se encontró el equipo por nombre, asignando null");
                finalTeamId = null;
            }
        } else {
            // Caso objeto
            const val = inputTeam as any;
            finalTeamId = val ? (val.id || val.idEquipo) : null;
        }
    } else {
        finalTeamId = this.getTeamIdFromPlayer(rawPlayer);
    }

    const fechaNac = this.formatDateForJava(rawPlayer.fechaNacimiento);
    const fechaAlt = this.formatDateForJava(rawPlayer.fechaAlta || new Date());
    const fechaBaj = this.formatDateForJava(rawPlayer.fechaBaja);

    const payload = {
      idUsuario: rawUser.id || rawUser.idUsuario, 
      posicion: cambios.posicion || rawPlayer.posicionPrimaria || rawPlayer.posicion,
      dorsal: cambios.dorsal !== undefined ? cambios.dorsal : player.dorsal,
      estado: cambios.estado || rawPlayer.estado,
      observaciones: cambios.observaciones !== undefined ? cambios.observaciones : rawPlayer.observaciones,
      
      equipoPrincipal: finalTeamId, 
      
      fechaNacimiento: fechaNac,
      telefonoContacto: rawPlayer.telefonoContacto || null,
      direccion: rawPlayer.direccion || null,
      fechaAlta: fechaAlt,
      fechaBaja: fechaBaj,
    };

    console.log("📤 PAYLOAD FINAL:", payload);
    return payload;
  }

  private getPlayerId(player: Player): number {
    const raw = player as any;
    return raw.id || raw.idJugador;
  }

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
    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    const cambios = {
      dorsal: this.techData.dorsal,
      posicion: this.techData.posicion,
      equipoPrincipal: this.techData.teamId
    };

    const payload = this.prepareDto(this.selectedPlayer, cambios);
    const playerId = this.getPlayerId(this.selectedPlayer);

    this.playerService.updatePlayer(playerId, payload).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isEditModalOpen = false; 
        this.showToast('¡Fichaje realizado con éxito! 📝✅', 'success');
        // Recargamos para ver los cambios en la lista correcta
        setTimeout(() => this.loadPlayers(), 500); 
      },
      error: async (err) => {
        await loading.dismiss();
        console.error("❌ Error:", err);
        const errorMsg = err.error?.message || JSON.stringify(err.error) || 'Error desconocido';
        this.showToast(`Error: ${errorMsg}`, 'danger');
      }
    });
  }

  openInjuryModal(player: Player) {
    this.selectedPlayer = player;
    this.injuryData = { tipo: '', duracion: '', notas: '' };
    this.isModalOpen = true;
  }

  async saveInjury() {
    if (!this.selectedPlayer) return;
    const loading = await this.loadingCtrl.create({ message: 'Registrando...' });
    await loading.present();
    const obsTexto = `[BAJA MÉDICA] Tipo: ${this.injuryData.tipo} | Duración: ${this.injuryData.duracion}`;
    const cambios = { estado: 'LESIONADO', observaciones: obsTexto };
    
    const payload = this.prepareDto(this.selectedPlayer, cambios);
    const playerId = this.getPlayerId(this.selectedPlayer);

    this.playerService.updatePlayer(playerId, payload).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isModalOpen = false;
        this.showToast('Baja registrada correctamente', 'warning');
        this.loadPlayers(); 
      },
      error: async (err) => { 
          await loading.dismiss(); 
          console.error(err);
          this.showToast('Error al registrar baja', 'danger'); 
      }
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