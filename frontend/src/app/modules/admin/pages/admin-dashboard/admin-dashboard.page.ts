import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
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

  // Control del tipo de evento (Partido vs Entrenamiento)
  eventType: 'MATCH' | 'TRAINING' = 'MATCH';

  // Formularios
  newUser = { nombre: '', apellidos: '', email: '', rol: 'JUGADOR', password: '123456' };
  newTeam = { nombre: '', categoria: '' };
  
  // Usaremos este objeto para ambos (Partido y Entrenamiento)
  newMatch: any = { idEquipo: null, rival: '', lugar: '', fechaHora: new Date().toISOString(), escudoRivalUrl: '' };
  
  selectedFile: File | null = null;
  staffRoles = ['Entrenador Principal', 'Segundo Entrenador', 'Preparador Físico', 'Delegado', 'Entrenador de Porteros'];

  constructor(
    private adminSvc: AdminService,
    private authSvc: AuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadData();
  }

  async logout() {
      const alert = await this.alertCtrl.create({
          header: 'Cerrar Sesión',
          message: '¿Estás seguro de que quieres salir?',
          buttons: [
              { text: 'Cancelar', role: 'cancel' },
              { 
                  text: 'Salir', 
                  role: 'destructive',
                  handler: () => {
                      this.authSvc.logout();
                  }
              }
          ]
      });
      await alert.present();
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

  // LÓGICA: Usamos la lista completa para evitar problemas del backend
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
      
      const userId = coach.id;
      
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

  // --- RESTO DE FUNCIONES (Equipos) ---

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

  // 🔥 GESTIÓN DE EVENTOS (PARTIDOS Y ENTRENAMIENTOS)

  // Método Maestro: Decide si crear Partido o Entrenamiento
  crearEvento() {
      if (this.eventType === 'MATCH') {
          this.createMatch();
      } else {
          this.crearEntrenamiento();
      }
  }

  async createMatch() {
      if(!this.newMatch.idEquipo || !this.newMatch.rival) {
          return this.presentToast('Completa los datos del partido', 'warning');
      }

      // ✅ VOLVEMOS A USAR FORMDATA (Para contentar al Backend)
      const formData = new FormData();
      formData.append('idEquipo', String(this.newMatch.idEquipo));
      formData.append('rival', this.newMatch.rival);
      formData.append('lugar', this.newMatch.lugar);
      formData.append('fechaHora', this.newMatch.fechaHora);
      
      // TRUCO: Si hay URL escrita, la mandamos en un campo de texto extra
      // OJO: Si tu backend espera 'file', no le mandamos nada en 'file' (será null)
      // Pero si tu backend tiene un campo 'escudoRivalUrl' o similar, funcionará.
      
      // Si tu backend NO está preparado para recibir la URL,
      // la única forma de arreglar esto SIN tocar backend es:
      // 1. O subes el backend modificado (recomendado).
      // 2. O nos quedamos sin foto en el partido (solo texto).
      
      // INTENTO: Mandar la URL como texto en un campo genérico por si acaso
      if (this.newMatch.escudoRivalUrl) {
           formData.append('escudoRivalUrl', this.newMatch.escudoRivalUrl);
      }

      await this.processRequest(
          this.adminSvc.createMatch(formData),
          'Partido agendado ⚽'
      );
      this.closeEventModal();
  }

  // 🔥 NUEVO MÉTODO PARA ENTRENAMIENTOS
  async crearEntrenamiento() {
      if (!this.newMatch.idEquipo || !this.newMatch.fechaHora) {
          return this.presentToast('Faltan datos obligatorios', 'warning');
      }
  
      const payload = {
          idEquipo: this.newMatch.idEquipo,
          fechaHora: this.newMatch.fechaHora,
          lugar: this.newMatch.lugar || 'Ciudad Deportiva',
          descripcion: 'Sesión de Entrenamiento'
      };
  
      await this.processRequest(
          this.adminSvc.createTraining(payload),
          'Entrenamiento agendado 🏋️‍♂️'
      );
      this.closeEventModal();
  }

  // Helper para cerrar y limpiar
  closeEventModal() {
    this.isMatchModalOpen = false;
    // ✅ Reseteamos también la URL
    this.newMatch = { idEquipo: null, rival: '', lugar: '', fechaHora: new Date().toISOString(), escudoRivalUrl: '' };
    this.selectedFile = null;
    this.eventType = 'MATCH';
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

  // Para detectar cambio de pestaña en el modal
  modalSegmentChanged(ev: any) {
      this.eventType = ev.detail.value;
  }
}