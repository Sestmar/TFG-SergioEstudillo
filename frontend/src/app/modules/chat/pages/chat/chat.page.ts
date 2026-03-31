import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ChatService, MensajeDto, EnviarMensajeDto } from 'src/app/core/services/chat/chat.service';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { User, AdminUserDto } from 'src/app/shared/models/models';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss']
})
export class ChatPage implements OnInit, OnDestroy {

  currentUser: User | null = null;
  mensajes$: Observable<MensajeDto[]>;
  conectado$: Observable<boolean>;

  modoChat: 'equipo' | 'privado' = 'equipo';
  usuariosDisponibles: AdminUserDto[] = [];
  destinatarioSeleccionado: AdminUserDto | null = null;

  private destroy$ = new Subject<void>();
  private equipoId: number | undefined;

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private adminService: AdminService,
    private http: HttpClient
  ) {
    this.mensajes$ = this.chatService.mensajes;
    this.conectado$ = this.chatService.conectado;
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (!user) return;

        if (user.rol === 'ADMIN') {
          this.modoChat = 'privado';
          this.cargarUsuarios();
        } else {
          // JUGADOR / ENTRENADOR: primero obtener el equipo, luego conectar
          this.cargarEquipoYConectar();
        }
      });
  }

  // Obtiene el idEquipo según el rol del usuario y arranca el chat de equipo
  private cargarEquipoYConectar(): void {
    const userId = this.currentUser?.idUsuario;
    if (!userId) return;

    // ENTRENADOR tiene su propio endpoint; JUGADOR usa el de jugadores
    const esEntrenador = this.currentUser?.rol === 'ENTRENADOR';
    const endpoint = esEntrenador
      ? `${environment.apiUrl}/entrenadores/usuario/${userId}/equipo`
      : `${environment.apiUrl}/jugadores/usuario/${userId}/equipo`;

    console.log(`[Chat] Cargando equipo para ${esEntrenador ? 'ENTRENADOR' : 'JUGADOR'} userId=${userId}`);

    this.http.get<any>(endpoint)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (equipo) => {
          this.equipoId = equipo?.idEquipo;
          console.log('[Chat] equipoId resuelto:', this.equipoId);
          if (!this.equipoId) {
            console.warn('[Chat] El endpoint devolvió equipo sin idEquipo — no se conectará al chat');
            return;
          }
          this.iniciarChat();
        },
        error: (err) => {
          console.warn('[Chat] Sin equipo asignado (error', err?.status, ') — no se conectará al chat de equipo');
          // No llamar iniciarChat() si no hay equipoId: no tiene sentido conectar sin equipo
        }
      });
  }

  private cargarUsuarios(): void {
    this.adminService.getAllActiveUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.usuariosDisponibles = users.filter(u => u.id !== this.currentUser?.idUsuario);
        },
        error: (err) => console.error('Error cargando usuarios', err)
      });
  }

  private iniciarChat(): void {
    this.chatService.limpiarMensajes();
    this.chatService.desconectar();

    if (this.modoChat === 'equipo' && this.equipoId) {
      this.chatService.cargarHistorialEquipo(this.equipoId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({ error: (err) => console.error('Error historial equipo', err) });
      this.chatService.conectar(this.equipoId);
    } else if (this.modoChat === 'privado' && this.destinatarioSeleccionado) {
      this.chatService.cargarHistorialPrivado(this.destinatarioSeleccionado.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({ error: (err) => console.error('Error historial privado', err) });
      this.chatService.conectar(undefined, this.destinatarioSeleccionado.id);
    }
  }

  cambiarModo(modo: 'equipo' | 'privado'): void {
    if (this.modoChat === modo) return;
    this.modoChat = modo;
    this.destinatarioSeleccionado = null;
    this.chatService.desconectar();
    this.iniciarChat();
  }

  seleccionarDestinatario(usuario: AdminUserDto): void {
    this.destinatarioSeleccionado = usuario;
    this.chatService.desconectar();
    this.chatService.limpiarMensajes();
    this.chatService.cargarHistorialPrivado(usuario.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ error: (err) => console.error('Error cargando historial', err) });
    this.chatService.conectar(undefined, usuario.id);
  }

  enviarMensaje(dto: EnviarMensajeDto): void {
    const payload: EnviarMensajeDto = { ...dto };

    if (this.modoChat === 'equipo' && this.equipoId) {
      payload.equipoId = this.equipoId;
    } else if (this.modoChat === 'privado' && this.destinatarioSeleccionado) {
      payload.destinatarioId = this.destinatarioSeleccionado.id;
    }

    this.chatService.enviarMensaje(payload);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chatService.desconectar();
  }
}
