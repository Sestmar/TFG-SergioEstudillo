import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  HostListener
} from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { MensajeDto, EnviarMensajeDto, ChatService, MiembroPreview, ReaccionDto } from '@core/services/chat/chat.service';
import type { ParentPreviewDto } from '@core/services/chat/chat.service';
import { VoiceRecorder } from 'capacitor-voice-recorder';

const MAX_IMAGE_SIZE = 5  * 1024 * 1024; //  5 MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25 MB

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements AfterViewInit, AfterViewChecked, OnChanges, OnDestroy {

  @Input() mensajes: MensajeDto[] | null = [];
  @Input() currentUserId: number | undefined;
  @Input() miembros: MiembroPreview[] = [];
  @Input() appendEmoji: string | null = null;
  @Input() cargandoMas: boolean = false;
  @Input() hayMas: boolean = false;
  @Output() onEnviar = new EventEmitter<EnviarMensajeDto>();
  @Output() emojiToggle = new EventEmitter<void>();
  @Output() cargarMas = new EventEmitter<void>();

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('fileInput') private fileInput!: ElementRef<HTMLInputElement>;

  contenido: string = '';

  // Estado: imagen / vídeo
  imagenSeleccionada: File | null = null;
  imagenPreviewUrl: string | null = null;
  imagenError: string | null = null;
  subiendoImagen = false;
  esVideo = false;

  // Estado: audio
  grabando = false;
  subiendoAudio = false;
  timerSegundos = 0;
  audioError: string | null = null;

  // Estado: menú contextual / edición
  menuMensajeId: number | null = null;
  editandoId: number | null = null;
  textoEdicion = '';
  confirmandoEliminacion: number | null = null;

  // Estado: menciones
  mentionResults: MiembroPreview[] = [];
  private mentionStartIndex = -1;

  // Estado: reacciones
  readonly QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];
  reactionBarMsgId: number | null = null;

  // Estado: swipe-to-reply
  mensajeRespondiendo: MensajeDto | null = null;
  private swipeStartX = 0;
  private swipeOffsets = new Map<number, number>(); // id → offset px actual
  private swipeActive = new Map<number, boolean>();  // id → si está en curso
  private hapticFired = new Map<number, boolean>();  // id → si ya vibró
  private readonly SWIPE_THRESHOLD = 65;
  private readonly SWIPE_MAX = 80;

  private shouldScroll = false;
  // Scroll position preservation when prepending older messages
  private pendingScrollRestore = false;
  private savedScrollHeight = 0;
  private savedScrollTop = 0;

  avatarErrorIds = new Set<number>();

  private recordingTimer: ReturnType<typeof setInterval> | null = null;
  private audioCancelado = false;

  constructor(private chatService: ChatService, private sanitizer: DomSanitizer) {}

  get puedeEnviar(): boolean {
    return !this.subiendoImagen && !this.subiendoAudio
        && (!!this.contenido?.trim() || !!this.imagenSeleccionada);
  }

  get timerDisplay(): string {
    const m = Math.floor(this.timerSegundos / 60).toString().padStart(2, '0');
    const s = (this.timerSegundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.menuMensajeId !== null) this.cerrarMenu();
    if (this.reactionBarMsgId !== null) this.closeReactionBar();
    if (this.mentionResults.length > 0) this.closeMentionList();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // cargandoMas going true signals that a prepend is about to happen
    if (changes['cargandoMas']?.currentValue === true) {
      this.pendingScrollRestore = true;
    }

    if (changes['mensajes']) {
      if (this.pendingScrollRestore && !changes['mensajes'].isFirstChange()) {
        // Prepend in progress — save current scroll position before DOM updates
        const el = this.messagesContainer?.nativeElement;
        if (el) {
          this.savedScrollHeight = el.scrollHeight;
          this.savedScrollTop = el.scrollTop;
        }
        // Do NOT scroll to bottom
      } else {
        this.shouldScroll = true;
      }
    }

    if (changes['appendEmoji']?.currentValue) {
      this.contenido = (this.contenido ?? '') + changes['appendEmoji'].currentValue;
    }
  }

  ngAfterViewInit(): void {
    const el = this.messagesContainer?.nativeElement;
    if (el) el.addEventListener('scroll', this.onContainerScroll);
  }

  ngAfterViewChecked(): void {
    // Restore scroll position after prepended messages expand the DOM
    if (this.pendingScrollRestore && this.savedScrollHeight > 0) {
      const el = this.messagesContainer?.nativeElement;
      if (el) {
        const diff = el.scrollHeight - this.savedScrollHeight;
        if (diff > 0) {
          el.scrollTop = this.savedScrollTop + diff;
          this.pendingScrollRestore = false;
          this.savedScrollHeight = 0;
          this.savedScrollTop = 0;
        }
      }
    }
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    const el = this.messagesContainer?.nativeElement;
    if (el) el.removeEventListener('scroll', this.onContainerScroll);
    this.cancelarImagen();
    if (this.grabando) {
      this.audioCancelado = true;
      this.limpiarGrabacion();
      VoiceRecorder.stopRecording().catch(() => {});
    }
  }

  private onContainerScroll = (): void => {
    const el = this.messagesContainer?.nativeElement;
    if (!el || !this.hayMas || this.cargandoMas || this.pendingScrollRestore) return;
    if (el.scrollTop <= 50) {
      this.cargarMas.emit();
    }
  };

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch (e) {}
  }

  // ── Imagen ───────────────────────────────────────────────────────────────────

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // permite re-seleccionar el mismo archivo

    if (!file) return;

    this.imagenError = null;
    const esVideoFile = file.type.startsWith('video/');
    const limite = esVideoFile ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    const limiteTexto = esVideoFile ? '25 MB' : '5 MB';

    if (file.size > limite) {
      this.imagenError = `El archivo no puede superar ${limiteTexto}.`;
      return;
    }

    this.cancelarImagen();
    this.imagenSeleccionada = file;
    this.esVideo = esVideoFile;
    this.imagenPreviewUrl = URL.createObjectURL(file);
  }

  cancelarImagen(): void {
    if (this.imagenPreviewUrl) URL.revokeObjectURL(this.imagenPreviewUrl);
    this.imagenSeleccionada = null;
    this.imagenPreviewUrl = null;
    this.imagenError = null;
    this.esVideo = false;
  }

  // ── Audio (capacitor-voice-recorder) ─────────────────────────────────────────

  async iniciarGrabacion(): Promise<void> {
    this.audioError = null;

    try {
      const perm = await VoiceRecorder.requestAudioRecordingPermission();
      if (!perm.value) {
        this.audioError = 'Permiso de micrófono denegado.';
        return;
      }
      await VoiceRecorder.startRecording();
      this.audioCancelado = false;
      this.grabando = true;
      this.timerSegundos = 0;
      this.recordingTimer = setInterval(() => this.timerSegundos++, 1000);
    } catch {
      this.audioError = 'No se pudo acceder al micrófono.';
    }
  }

  async detenerGrabacion(): Promise<void> {
    this.limpiarGrabacion();
    try {
      const result = await VoiceRecorder.stopRecording();
      if (!this.audioCancelado) {
        const { recordDataBase64, mimeType } = result.value;
        const bytes = atob(recordDataBase64);
        const byteArray = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) byteArray[i] = bytes.charCodeAt(i);
        const blob = new Blob([byteArray], { type: mimeType });
        this.enviarAudio(blob, mimeType);
      }
    } catch {
      if (!this.audioCancelado) this.audioError = 'No se pudo detener la grabación.';
    }
  }

  async cancelarGrabacion(): Promise<void> {
    this.audioCancelado = true;
    this.limpiarGrabacion();
    try { await VoiceRecorder.stopRecording(); } catch { /* ya estaba parado */ }
  }

  private limpiarGrabacion(): void {
    if (this.recordingTimer) clearInterval(this.recordingTimer);
    this.recordingTimer = null;
    this.grabando = false;
    this.timerSegundos = 0;
  }

  private enviarAudio(blob: Blob, mimeType: string): void {
    const ext = mimeType.includes('aac') ? '.aac' : mimeType.includes('ogg') ? '.ogg' : '.mp4';
    const file = new File([blob], `audio-${Date.now()}${ext}`, { type: mimeType });

    const parentId = this.mensajeRespondiendo?.id;
    this.subiendoAudio = true;
    this.chatService.uploadChatFile(file).subscribe({
      next: ({ url }) => {
        this.onEnviar.emit({ urlAdjunto: url, tipoAdjunto: 'AUDIO', parentId });
        this.mensajeRespondiendo = null;
        this.subiendoAudio = false;
      },
      error: () => {
        this.audioError = 'No se pudo enviar el audio. Intentá de nuevo.';
        this.subiendoAudio = false;
      }
    });
  }

  // ── Envío de texto/imagen ────────────────────────────────────────────────────

  enviar(): void {
    if (!this.puedeEnviar) return;

    const parentId = this.mensajeRespondiendo?.id;

    if (this.imagenSeleccionada) {
      this.subiendoImagen = true;
      this.chatService.uploadChatFile(this.imagenSeleccionada).subscribe({
        next: ({ url }) => {
          this.onEnviar.emit({
            contenido: this.contenido?.trim() || null,
            urlAdjunto: url,
            tipoAdjunto: this.esVideo ? 'VIDEO' : 'IMAGEN',
            parentId
          });
          this.cancelarImagen();
          this.contenido = '';
          this.mensajeRespondiendo = null;
          this.subiendoImagen = false;
        },
        error: () => {
          this.imagenError = 'No se pudo subir la imagen. Intentá de nuevo.';
          this.subiendoImagen = false;
        }
      });
      return;
    }

    const texto = this.contenido?.trim();
    if (!texto) return;
    this.onEnviar.emit({ contenido: texto, parentId });
    this.contenido = '';
    this.mensajeRespondiendo = null;
  }

  // ── Menú contextual ──────────────────────────────────────────────────────────

  toggleMenu(event: Event, msg: MensajeDto): void {
    if (msg.remitenteId !== this.currentUserId || msg.eliminado) return;
    event.stopPropagation();
    const mismo = this.menuMensajeId === msg.id;
    this.cerrarMenu();
    if (!mismo) this.menuMensajeId = msg.id;
  }

  cerrarMenu(): void {
    this.menuMensajeId = null;
    this.confirmandoEliminacion = null;
  }

  // ── Edición inline ────────────────────────────────────────────────────────────

  iniciarEdicion(msg: MensajeDto, event: Event): void {
    event.stopPropagation();
    this.cerrarMenu();
    this.editandoId = msg.id;
    this.textoEdicion = msg.contenido ?? '';
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.textoEdicion = '';
  }

  guardarEdicion(msg: MensajeDto): void {
    const texto = this.textoEdicion.trim();
    if (!texto || texto === msg.contenido) {
      this.cancelarEdicion();
      return;
    }
    this.chatService.editarMensaje(msg.id, texto).subscribe({
      next: (actualizado) => {
        this.chatService.actualizarMensajeLocal(actualizado);
        this.cancelarEdicion();
      },
      error: () => this.cancelarEdicion()
    });
  }

  // ── Eliminar ──────────────────────────────────────────────────────────────────

  pedirConfirmacionEliminar(id: number, event: Event): void {
    event.stopPropagation();
    this.confirmandoEliminacion = id;
  }

  confirmarEliminar(id: number, event: Event): void {
    event.stopPropagation();
    this.chatService.eliminarMensaje(id).subscribe({
      next: (actualizado) => {
        this.chatService.actualizarMensajeLocal(actualizado);
        this.cerrarMenu();
      },
      error: () => this.cerrarMenu()
    });
  }

  // ── Reacciones ────────────────────────────────────────────────────────────────

  closeReactionBar(): void {
    this.reactionBarMsgId = null;
  }

  reaccionar(msg: MensajeDto, emoji: string, event: Event): void {
    event.stopPropagation();
    const miReaccion = this.getMiReaccion(msg);

    const obs$ = miReaccion === emoji
      ? this.chatService.quitarReaccion(msg.id)   // toggle off
      : this.chatService.reaccionar(msg.id, emoji);

    obs$.subscribe({ error: () => {} });
    this.closeReactionBar();
  }

  getMiReaccion(msg: MensajeDto): string | null {
    if (!this.currentUserId || !msg.reacciones?.length) return null;
    for (const r of msg.reacciones) {
      if (r.usuarioIds.includes(this.currentUserId)) return r.emoji;
    }
    return null;
  }

  // ── Menciones ────────────────────────────────────────────────────────────────

  onInputChange(value: string): void {
    // Busca el último @ seguido de nombre (puede tener un espacio interno para apellidos)
    const match = /@([A-Za-záéíóúüñÁÉÍÓÚÜÑ]*(?: [A-Za-záéíóúüñÁÉÍÓÚÜÑ]*)?)$/.exec(value);

    if (!match) {
      this.closeMentionList();
      return;
    }

    this.mentionStartIndex = match.index;
    const query = match[1].trim().toLowerCase();

    this.mentionResults = query === ''
      ? [...this.miembros]
      : this.miembros.filter(m =>
          `${m.nombre} ${m.apellidos}`.toLowerCase().includes(query)
        );

    if (this.mentionResults.length === 0) {
      this.closeMentionList();
    }
  }

  selectMention(m: MiembroPreview): void {
    const fullName = `${m.nombre} ${m.apellidos}`;
    this.contenido = this.contenido.slice(0, this.mentionStartIndex) + `@${fullName} `;
    this.closeMentionList();
  }

  closeMentionList(): void {
    this.mentionResults = [];
    this.mentionStartIndex = -1;
  }

  getMentionHtml(contenido?: string): SafeHtml {
    if (!contenido) return this.sanitizer.bypassSecurityTrustHtml('');
    // Escapar HTML para evitar XSS antes de inyectar los spans
    const escaped = contenido
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const html = escaped.replace(
      /@([A-Za-záéíóúüñÁÉÍÓÚÜÑ]+ [A-Za-záéíóúüñÁÉÍÓÚÜÑ]+)/g,
      '<span class="mention">@$1</span>'
    );
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // ── Swipe-to-reply ────────────────────────────────────────────────────────────

  openReactionBar(msgId: number, event: Event): void {
    event.stopPropagation();
    this.reactionBarMsgId = this.reactionBarMsgId === msgId ? null : msgId;
  }

  onPointerDown(event: PointerEvent, msg: MensajeDto): void {
    if (msg.eliminado) return;
    // No capturar el puntero si el usuario tocó un elemento interactivo (botón del menú,
    // textarea de edición, etc.). setPointerCapture redirige todos los eventos de puntero
    // al bubble, lo que hace que el `click` sintetizado aterrice en toggleMenu en lugar
    // del botón real, impidiendo que Editar/Borrar/Reaccionar funcionen.
    const target = event.target as HTMLElement;
    if (target.closest('button, textarea, a, input')) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.swipeStartX = event.clientX;
    this.swipeActive.set(msg.id, true);
    this.hapticFired.set(msg.id, false);
  }

  onPointerMove(event: PointerEvent, msg: MensajeDto): void {
    if (!this.swipeActive.get(msg.id)) return;

    const delta = event.clientX - this.swipeStartX;
    const offset = Math.max(0, Math.min(delta, this.SWIPE_MAX));
    this.swipeOffsets.set(msg.id, offset);

    if (offset >= this.SWIPE_THRESHOLD && !this.hapticFired.get(msg.id)) {
      this.hapticFired.set(msg.id, true);
      import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      });
    }
  }

  onPointerUp(event: PointerEvent, msg: MensajeDto): void {
    if (!this.swipeActive.get(msg.id)) return;
    this.swipeActive.set(msg.id, false);

    const offset = this.swipeOffsets.get(msg.id) ?? 0;
    if (offset >= this.SWIPE_THRESHOLD) {
      this.activarRespuesta(msg);
    }
    this.swipeOffsets.set(msg.id, 0);
  }

  onPointerCancel(event: PointerEvent, msg: MensajeDto): void {
    this.swipeActive.set(msg.id, false);
    this.swipeOffsets.set(msg.id, 0);
  }

  getBubbleTransform(msg: MensajeDto): string {
    const offset = this.swipeOffsets.get(msg.id) ?? 0;
    return offset > 0 ? `translateX(${offset}px)` : '';
  }

  getHintTransform(msg: MensajeDto): string {
    const offset = this.swipeOffsets.get(msg.id) ?? 0;
    // Counter-transform: el hint permanece fijo a la izquierda de la posición original
    return `translate(calc(-100% - 8px + ${offset}px), -50%)`;
  }

  getSwipeOpacity(msg: MensajeDto): number {
    const offset = this.swipeOffsets.get(msg.id) ?? 0;
    return Math.min(offset / this.SWIPE_THRESHOLD, 1);
  }

  activarRespuesta(msg: MensajeDto): void {
    this.mensajeRespondiendo = msg;
  }

  cancelarRespuesta(): void {
    this.mensajeRespondiendo = null;
  }

  getPreviewTexto(msg: MensajeDto): string {
    if (msg.contenido) {
      return msg.contenido.length > 60 ? msg.contenido.substring(0, 60) + '…' : msg.contenido;
    }
    if (msg.tipoAdjunto === 'IMAGEN') return '📷 Imagen';
    if (msg.tipoAdjunto === 'VIDEO')  return '🎬 Vídeo';
    if (msg.tipoAdjunto === 'AUDIO')  return '🎤 Nota de voz';
    return '📎 Adjunto';
  }

  // ──────────────────────────────────────────────────────────────────────────────

  getSafeUrl(url: string | null): SafeUrl | null {
    if (!url) return null;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  onImgError(event: Event, msg: MensajeDto): void {
    (event.target as HTMLImageElement).style.display = 'none';
    this.avatarErrorIds.add(msg.remitenteId);
  }
}
