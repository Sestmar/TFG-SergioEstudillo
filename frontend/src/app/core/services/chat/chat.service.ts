import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { catchError, tap, throwError } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { LocalNotifications } from '@capacitor/local-notifications';
import * as SockJS from 'sockjs-client';
import { environment } from '../../../../environments/environment';

export interface MensajeDto {
  id: number;
  remitenteId: number;
  remitenteNombre: string;
  remitenteApellidos: string;
  remitenteFotoUrl?: string;
  equipoId?: number;
  destinatarioId?: number;
  contenido: string;
  fechaHora: string;
  leido: boolean;
}

export interface EnviarMensajeDto {
  contenido: string;
  equipoId?: number;
  destinatarioId?: number;
}

@Injectable({ providedIn: 'root' })
export class ChatService implements OnDestroy {

  private readonly wsUrl = environment.apiUrl.replace('/api', '') + '/ws';
  private readonly apiUrl = environment.apiUrl;

  // Cliente para la vista /chat (mensajes en pantalla)
  private client: Client | null = null;
  private subscriptions: StompSubscription[] = [];

  // Cliente global para el badge del sidebar (escucha en segundo plano)
  private clientGlobal: Client | null = null;
  private subscriptionsGlobal: StompSubscription[] = [];

  private destroy$ = new Subject<void>();

  private mensajes$ = new BehaviorSubject<MensajeDto[]>([]);
  private conectado$ = new BehaviorSubject<boolean>(false);
  private noLeidos$ = new BehaviorSubject<number>(0);

  // Feature 1 — contador de no leídos del equipo para el badge del sidebar
  private _noLeidosEquipo$ = new BehaviorSubject<number>(0);
  readonly noLeidosEquipo$: Observable<number> = this._noLeidosEquipo$.asObservable();

  private currentUserId: number | null = null;

  get mensajes(): Observable<MensajeDto[]> { return this.mensajes$.asObservable(); }
  get conectado(): Observable<boolean> { return this.conectado$.asObservable(); }
  get noLeidos(): Observable<number> { return this.noLeidos$.asObservable(); }

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.registrarListenerNotificaciones();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Feature 1: conexión global para el badge del sidebar
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Conecta un WebSocket en segundo plano para escuchar mensajes del equipo
   * y actualizar el badge de no leídos sin necesidad de estar en /chat.
   * Llamar desde el layout principal tras el login.
   * No llamar si el usuario es ADMIN u otros roles sin equipo (equipoId null).
   */
  conectarGlobal(equipoId: number, currentUserId?: number): void {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    if (currentUserId !== undefined) {
      this.currentUserId = currentUserId;
    }

    // Evitar duplicar conexiones globales ya activas
    if (this.clientGlobal?.active) return;

    this.clientGlobal = this.crearClienteStomp(token, () => {
      this.limpiarSuscripcionesGlobal();

      // Inicializar badge con mensajes no leídos acumulados offline
      this.http.get<{ count: number }>(`${this.apiUrl}/chat/no-leidos`).subscribe({
        next: ({ count }) => this._noLeidosEquipo$.next(count),
        error: () => {}
      });

      const topicEquipo = `/topic/equipo/${equipoId}`;
      const sub = this.clientGlobal!.subscribe(
        topicEquipo,
        (frame: IMessage) => {
          const msg: MensajeDto = JSON.parse(frame.body);
          this.manejarMensajeGlobal(msg);
        }
      );
      this.subscriptionsGlobal.push(sub);
    });

    this.clientGlobal.activate();
  }

  /** Resetea el contador de no leídos del equipo a 0. */
  resetearNoLeidos(): void {
    this._noLeidosEquipo$.next(0);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Conexión principal para la vista /chat
  // ─────────────────────────────────────────────────────────────────────────────

  conectar(idEquipo?: number, idDestinatario?: number): void {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    // El usuario entra al chat: limpiar badge
    this.resetearNoLeidos();

    this.client = this.crearClienteStomp(token, () => {
      console.log('[ChatService] STOMP conectado. idEquipo:', idEquipo, '| idDestinatario:', idDestinatario);
      this.conectado$.next(true);
      this.limpiarSuscripciones();

      if (idEquipo) {
        const topicEquipo = `/topic/equipo/${idEquipo}`;
        console.log('[ChatService] Suscribiendo a', topicEquipo);
        const sub = this.client!.subscribe(
          topicEquipo,
          (frame: IMessage) => {
            console.log('[ChatService] Mensaje recibido en', topicEquipo, frame.body);
            const msg: MensajeDto = JSON.parse(frame.body);
            this.agregarMensaje(msg);
          }
        );
        this.subscriptions.push(sub);
        console.log('[ChatService] Suscripción activa:', topicEquipo);
      }

      if (idDestinatario !== undefined) {
        const topicPrivado = '/user/queue/mensajes';
        console.log('[ChatService] Suscribiendo a', topicPrivado);
        const sub = this.client!.subscribe(
          topicPrivado,
          (frame: IMessage) => {
            console.log('[ChatService] Mensaje privado recibido', frame.body);
            const msg: MensajeDto = JSON.parse(frame.body);
            this.agregarMensaje(msg);
          }
        );
        this.subscriptions.push(sub);
        console.log('[ChatService] Suscripción activa:', topicPrivado);
      }
    });

    this.client.activate();
  }

  desconectar(): void {
    this.limpiarSuscripciones();
    if (this.client?.active) {
      this.client.deactivate();
    }
    this.conectado$.next(false);
    this.mensajes$.next([]);
  }

  desconectarGlobal(): void {
    this.limpiarSuscripcionesGlobal();
    if (this.clientGlobal?.active) {
      this.clientGlobal.deactivate();
    }
    this.clientGlobal = null;
  }

  enviarMensaje(dto: EnviarMensajeDto): void {
    if (!this.client?.active) {
      console.warn('STOMP no conectado');
      return;
    }
    this.client.publish({
      destination: '/app/chat.enviar',
      body: JSON.stringify(dto)
    });
  }

  cargarHistorialEquipo(idEquipo: number): Observable<MensajeDto[]> {
    return this.http.get<MensajeDto[]>(`${this.apiUrl}/chat/equipo/${idEquipo}`).pipe(
      tap(mensajes => this.mensajes$.next(mensajes)),
      catchError(err => throwError(() => err))
    );
  }

  cargarHistorialPrivado(idOtroUsuario: number): Observable<MensajeDto[]> {
    return this.http.get<MensajeDto[]>(`${this.apiUrl}/chat/privado/${idOtroUsuario}`).pipe(
      tap(mensajes => this.mensajes$.next(mensajes)),
      catchError(err => throwError(() => err))
    );
  }

  obtenerNoLeidos(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/chat/no-leidos`);
  }

  marcarLeidos(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/chat/marcar-leidos`, {});
  }

  limpiarMensajes(): void {
    this.mensajes$.next([]);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Privados
  // ─────────────────────────────────────────────────────────────────────────────

  /** Factory para crear clientes STOMP evitando duplicar configuración. */
  private crearClienteStomp(token: string, onConnect: () => void): Client {
    return new Client({
      webSocketFactory: () => new (SockJS as any)(this.wsUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      debug: (msg: string) => {
        if (!environment.production) console.log('[STOMP]', msg);
      },
      onConnect,
      onDisconnect: () => {},
      onStompError: (frame) => {
        console.error('[STOMP Error]', frame.headers['message']);
      }
    });
  }

  /**
   * Lógica de contador + notificación local cuando llega un mensaje global.
   * Si el usuario está en /chat no se incrementa el badge ni se dispara notificación.
   */
  private async manejarMensajeGlobal(msg: MensajeDto): Promise<void> {
    const usuarioEnChat = this.router.url.includes('/chat');
    if (usuarioEnChat) return;

    if (this.currentUserId !== null && msg.remitenteId === this.currentUserId) return;

    this._noLeidosEquipo$.next(this._noLeidosEquipo$.getValue() + 1);
    await this.dispararNotificacion(msg);
  }

  // Feature 2: notificación local con Capacitor
  private async dispararNotificacion(msg: MensajeDto): Promise<void> {
    try {
      const permiso = await LocalNotifications.requestPermissions();
      if (permiso.display !== 'granted') return;

      await LocalNotifications.schedule({
        notifications: [{
          id: Date.now(),
          title: msg.remitenteNombre,
          body: msg.contenido,
          actionTypeId: 'OPEN_CHAT',
          extra: { route: '/chat' }
        }]
      });
    } catch (err) {
      console.warn('[ChatService] No se pudo disparar notificación local:', err);
    }
  }

  /** Registra el listener una sola vez en el constructor para navegar a /chat al tocar la notificación. */
  private registrarListenerNotificaciones(): void {
    LocalNotifications.addListener('localNotificationActionPerformed', () => {
      this.router.navigate(['/chat']);
    }).catch(err => {
      // En web/browser LocalNotifications no está disponible — silenciar el error
      console.warn('[ChatService] LocalNotifications no disponible en esta plataforma:', err);
    });
  }

  private agregarMensaje(msg: MensajeDto): void {
    const actuales = this.mensajes$.getValue();
    if (!actuales.find(m => m.id === msg.id)) {
      this.mensajes$.next([...actuales, msg]);
    }
  }

  private limpiarSuscripciones(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }

  private limpiarSuscripcionesGlobal(): void {
    this.subscriptionsGlobal.forEach(s => s.unsubscribe());
    this.subscriptionsGlobal = [];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.desconectar();
    this.desconectarGlobal();
  }
}
