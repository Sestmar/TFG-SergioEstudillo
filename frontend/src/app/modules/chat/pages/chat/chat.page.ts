import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ChatService, MensajeDto, EnviarMensajeDto } from '@core/services/chat/chat.service';
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

    // El rol puede venir con o sin prefijo ROLE_ (depende de si el usuario fue creado
    // por registro propio o por el admin). Normalizamos a mayúsculas y usamos includes
    // para cubrir ambos casos: 'ENTRENADOR' y 'ROLE_ENTRENADOR'.
    const rol = (this.currentUser?.rol ?? '').toUpperCase();
    const esEntrenador = rol.includes('ENTRENADOR') || rol.includes('CUERPO_TECNICO') || rol.includes('COACH');
    const endpoint = esEntrenador
      ? `${environment.apiUrl}/entrenadores/usuario/${userId}/equipo`
      : `${environment.apiUrl}/jugadores/usuario/${userId}/equipo`;

    this.http.get<any>(endpoint)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respuesta) => {
          // El endpoint de jugadores devuelve el objeto Equipo directamente (con idEquipo en raíz).
          // El endpoint de entrenadores devuelve { equipo: {...}, rol: "...", entrenadorId: ... },
          // por lo que hay que extraer idEquipo desde respuesta.equipo.idEquipo.
          this.equipoId = respuesta?.idEquipo ?? respuesta?.equipo?.idEquipo;
          if (!this.equipoId) {
            console.warn('[Chat] El endpoint devolvió respuesta sin idEquipo — no se conectará al chat');
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
      this.chatService.marcarLeidos().pipe(takeUntil(this.destroy$)).subscribe({
        next: () => this.chatService.resetearNoLeidos()
      });
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
