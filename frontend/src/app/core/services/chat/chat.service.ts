import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { catchError, tap, throwError } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
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

  private client: Client | null = null;
  private subscriptions: StompSubscription[] = [];
  private destroy$ = new Subject<void>();

  private mensajes$ = new BehaviorSubject<MensajeDto[]>([]);
  private conectado$ = new BehaviorSubject<boolean>(false);
  private noLeidos$ = new BehaviorSubject<number>(0);

  get mensajes(): Observable<MensajeDto[]> { return this.mensajes$.asObservable(); }
  get conectado(): Observable<boolean> { return this.conectado$.asObservable(); }
  get noLeidos(): Observable<number> { return this.noLeidos$.asObservable(); }

  constructor(private http: HttpClient) {}

  conectar(idEquipo?: number, idDestinatario?: number): void {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    this.client = new Client({
      webSocketFactory: () => new (SockJS as any)(this.wsUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      debug: (msg: string) => {
        if (!environment.production) console.log('[STOMP]', msg);
      },
      onConnect: () => {
        this.conectado$.next(true);
        this.limpiarSuscripciones();

        if (idEquipo) {
          const sub = this.client!.subscribe(
            `/topic/equipo/${idEquipo}`,
            (frame: IMessage) => {
              const msg: MensajeDto = JSON.parse(frame.body);
              this.agregarMensaje(msg);
            }
          );
          this.subscriptions.push(sub);
        }

        if (idDestinatario !== undefined) {
          const sub = this.client!.subscribe(
            '/user/queue/mensajes',
            (frame: IMessage) => {
              const msg: MensajeDto = JSON.parse(frame.body);
              this.agregarMensaje(msg);
            }
          );
          this.subscriptions.push(sub);
        }
      },
      onDisconnect: () => this.conectado$.next(false),
      onStompError: (frame) => {
        console.error('[STOMP Error]', frame.headers['message']);
        this.conectado$.next(false);
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.desconectar();
  }
}
