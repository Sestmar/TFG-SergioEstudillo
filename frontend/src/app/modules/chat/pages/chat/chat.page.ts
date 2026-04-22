import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as emojiData from '@emoji-mart/data';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ChatService, MensajeDto, EnviarMensajeDto, MiembroPreview } from '@core/services/chat/chat.service';
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
  miembrosEquipo: MiembroPreview[] = [];

  // Paginación
  cargandoMas = false;
  hayMas = false;
  private paginaActual = 0;

  // Emoji picker (vive en el page, fuera de ion-content, para evitar contain:size)
  showEmojiPicker = false;
  emojiData = emojiData;
  pendingEmoji: string | null = null;

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
            return;
          }
          this.iniciarChat();
        },
        error: () => {
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
        error: () => {}
      });
  }

  private iniciarChat(): void {
    this.paginaActual = 0;
    this.hayMas = false;
    this.cargandoMas = false;
    this.chatService.limpiarMensajes();
    this.chatService.desconectar();

    if (this.modoChat === 'equipo' && this.equipoId) {
      this.chatService.cargarHistorialEquipo(this.equipoId, 0)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => { this.hayMas = data.hasMore; },
          error: () => {}
        });
      this.chatService.getMiembrosEquipo(this.equipoId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (miembros) => {
            // Excluir al usuario actual de la lista de menciones
            this.miembrosEquipo = miembros.filter(m => m.id !== this.currentUser?.idUsuario);
          },
          error: () => {}
        });
      this.chatService.conectar(this.equipoId);
      this.chatService.marcarLeidos().pipe(takeUntil(this.destroy$)).subscribe({
        next: () => this.chatService.resetearNoLeidos()
      });
    } else if (this.modoChat === 'privado' && this.destinatarioSeleccionado) {
      this.chatService.cargarHistorialPrivado(this.destinatarioSeleccionado.id, 0)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => { this.hayMas = data.hasMore; },
          error: () => {}
        });
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
    this.paginaActual = 0;
    this.hayMas = false;
    this.cargandoMas = false;
    this.chatService.desconectar();
    this.chatService.limpiarMensajes();
    this.chatService.cargarHistorialPrivado(usuario.id, 0)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => { this.hayMas = data.hasMore; },
        error: () => {}
      });
    this.chatService.conectar(undefined, usuario.id);
  }

  onCargarMas(): void {
    if (this.cargandoMas || !this.hayMas) return;
    this.cargandoMas = true;
    this.paginaActual++;

    const obs$ = this.modoChat === 'equipo' && this.equipoId
      ? this.chatService.cargarHistorialEquipo(this.equipoId, this.paginaActual)
      : this.modoChat === 'privado' && this.destinatarioSeleccionado
        ? this.chatService.cargarHistorialPrivado(this.destinatarioSeleccionado.id, this.paginaActual)
        : null;

    if (!obs$) { this.cargandoMas = false; return; }

    obs$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.hayMas = data.hasMore;
        this.cargandoMas = false;
      },
      error: () => { this.cargandoMas = false; }
    });
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

  onEmojiToggle(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any): void {
    this.pendingEmoji = event.emoji.native;
    this.showEmojiPicker = false;
    // Reset tras un tick para que ngOnChanges se dispare incluso con el mismo emoji
    setTimeout(() => { this.pendingEmoji = null; }, 50);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chatService.desconectar();
  }
}
