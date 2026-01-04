import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
})
export class AdminDashboardPage implements OnInit {

  // Listas de datos
  candidates: any[] = []; 
  coachCandidates: any[] = [];
  activeUsers: any[] = [];
  teams: any[] = [];
  
  // Control de vista
  currentView = 'users';
  userSegment = 'pending';
  loading = false;

  // Control de Modales
  isUserModalOpen = false;
  isTeamModalOpen = false;
  isMatchModalOpen = false;

  // Formularios
  newUser = { nombre: '', apellidos: '', email: '', rol: 'JUGADOR', password: '123456' };
  newTeam = { nombre: '', categoria: '' };
  newMatch = { idEquipo: null, rival: '', lugar: '', fechaHora: new Date().toISOString() };
  
  selectedFile: File | null = null;
  staffRoles = ['Entrenador Principal', 'Segundo Entrenador', 'Preparador Físico', 'Delegado', 'Entrenador de Porteros'];

  constructor(
    private adminSvc: AdminService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    
    // 1. Cargar Equipos
    this.adminSvc.getTeams().subscribe({
      next: (res) => { this.teams = res; },
      error: () => this.loading = false
    });

    // 2. Cargar Usuarios y calcular candidatos manualmente
    this.loadUsersAndCalculateCandidates();
  }

  // 🔥 LÓGICA MAESTRA: Usamos la lista completa para evitar problemas del backend
  loadUsersAndCalculateCandidates() {
      this.adminSvc.getAllActiveUsers().subscribe({
          next: (res: any[]) => {
              console.log("👥 Usuarios Totales recibidos:", res.length);
              this.activeUsers = res;

              // Reiniciamos las listas de pendientes
              this.candidates = [];
              this.coachCandidates = [];

              res.forEach(user => {
                  // Normalizamos datos para evitar errores de mayúsculas/nulos
                  const rol = (user.rol || '').toUpperCase();
                  const equipo = user.equipoNombre; 
                  
                  // ¿Tiene equipo asignado?
                  // En tu backend, si no tiene equipo, devuelve "Sin Equipo" o "Staff Técnico"
                  // Ojo: "Staff Técnico" no es un equipo real, es un placeholder.
                  const hasRealTeam = equipo && equipo !== 'Sin Equipo' && equipo !== 'Staff Técnico';

                  if (!hasRealTeam) {
                      // ES UN CANDIDATO (Pendiente de asignar)
                      
                      // 1. Es Jugador?
                      if (rol.includes('JUGADOR')) {
                          this.candidates.push({ ...user, selectedTeamId: null });
                      } 
                      // 2. Es Entrenador?
                      else if (rol.includes('ENTRENADOR') || rol.includes('STAFF')) {
                          this.coachCandidates.push({ ...user, selectedTeamId: null, selectedRole: 'Entrenador Principal' });
                      }
                  }
              });

              console.log(`✅ Calculados: ${this.candidates.length} Jugadores y ${this.coachCandidates.length} Staff pendientes.`);
              this.loading = false;
          },
          error: (err) => {
              console.error("Error cargando usuarios", err);
              this.loading = false;
          }
      });
  }

  // Helper para limpiar el nombre del rol en la vista
  cleanRoleName(rol: string): string {
      if (!rol) return '';
      return rol.replace('ROLE_', '').replace('_', ' ');
  }

  // --- ACCIONES ---

  async onAssignPlayer(user: any) {
    if (!user.selectedTeamId) return this.presentToast('⚠️ Selecciona un equipo primero', 'warning');
    
    // En la lista de activeUsers, el ID viene como 'id' (mira tu Java: map.put("id", ...))
    const uid = user.id; 
    
    await this.processRequest(
        this.adminSvc.assignTeam(uid, user.selectedTeamId), 
        'Jugador fichado correctamente ⚽'
    );
    this.loadUsersAndCalculateCandidates();
  }

  async onAssignCoach(coach: any) {
      if (!coach.selectedTeamId) return this.presentToast('⚠️ Selecciona un equipo', 'warning');
      if (!coach.selectedRole) return this.presentToast('⚠️ Selecciona un rol', 'warning');
      
      const userId = coach.id; // Igual que arriba, viene como 'id'
      
      await this.processRequest(
          this.adminSvc.assignCoach(userId, coach.selectedTeamId, coach.selectedRole),
          'Staff asignado correctamente 📋'
      );
      this.loadUsersAndCalculateCandidates();
  }

  async createNewUser() {
      if(!this.newUser.nombre || !this.newUser.email) return this.presentToast('Datos incompletos', 'warning');
      
      await this.processRequest(
          this.adminSvc.createUser(this.newUser), 
          'Usuario creado con éxito'
      );
      
      this.isUserModalOpen = false;
      this.newUser = { nombre: '', apellidos: '', email: '', rol: 'JUGADOR', password: '123456' }; 
      
      // Damos un respiro al backend para que guarde antes de recargar
      setTimeout(() => {
          this.loadUsersAndCalculateCandidates();
      }, 500);
  }

  async deleteUser(user: any) {
      const alert = await this.alertCtrl.create({
          header: 'Confirmar Eliminación',
          message: `¿Seguro que quieres eliminar a ${user.nombre}?`,
          buttons: [
              { text: 'Cancelar', role: 'cancel' },
              { 
                  text: 'Eliminar', 
                  role: 'destructive',
                  handler: () => {
                      this.processRequest(
                          this.adminSvc.deleteUser(user.id), 'Usuario eliminado'
                      ).then(() => {
                          this.loadUsersAndCalculateCandidates();
                      });
                  }
              }
          ]
      });
      await alert.present();
  }

  // --- RESTO DE FUNCIONES (Equipos, Partidos) ---
  // (Sin cambios, funcionan bien)

  async createNewTeam() {
      if(!this.newTeam.nombre) return this.presentToast('Nombre obligatorio', 'warning');
      await this.processRequest(this.adminSvc.createTeam(this.newTeam), 'Equipo creado');
      this.isTeamModalOpen = false;
      this.newTeam = { nombre: '', categoria: '' };
      this.adminSvc.getTeams().subscribe(res => this.teams = res);
  }

  openTeamDetail(team: any) {
      if (!team) return;
      const tid = team.idEquipo || team.id;
      if(tid) this.router.navigate(['/team-detail', tid]);
  }

  goToTeamCalendar(team: any) {
      if (!team) return;
      const teamId = team.idEquipo || team.id;
      if(teamId) this.router.navigate(['/calendar'], { queryParams: { teamId: teamId } });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async createMatch() {
      if(!this.newMatch.idEquipo || !this.newMatch.rival) {
          return this.presentToast('Completa los datos del partido', 'warning');
      }

      const formData = new FormData();
      formData.append('idEquipo', String(this.newMatch.idEquipo));
      formData.append('rival', this.newMatch.rival);
      formData.append('lugar', this.newMatch.lugar);
      formData.append('fechaHora', this.newMatch.fechaHora);
      
      if (this.selectedFile) {
          formData.append('file', this.selectedFile);
      }

      await this.processRequest(
          this.adminSvc.createMatch(formData),
          'Partido agendado ⚽'
      );
      this.isMatchModalOpen = false;
      this.newMatch = { idEquipo: null, rival: '', lugar: '', fechaHora: new Date().toISOString() };
      this.selectedFile = null;
  }

  async processRequest(observable$: any, successMsg: string) {
    const loading = await this.loadingCtrl.create({ message: 'Procesando...', spinner: 'crescent' });
    await loading.present();
    return new Promise<void>((resolve) => {
        observable$.subscribe({
          next: async () => {
            await loading.dismiss();
            this.presentToast(successMsg, 'success');
            resolve();
          },
          error: async (err: any) => {
            await loading.dismiss();
            console.error(err);
            this.presentToast('Error en la operación', 'danger');
            resolve();
          }
        });
    });
  }

  async presentToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 3000, color, position: 'top' });
    t.present();
  }

  segmentChanged(ev: any) {
      this.currentView = ev.detail.value;
  }
}