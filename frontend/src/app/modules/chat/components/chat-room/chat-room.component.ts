import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { MensajeDto, EnviarMensajeDto } from 'src/app/core/services/chat/chat.service';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements AfterViewChecked, OnChanges {

  @Input() mensajes: MensajeDto[] | null = [];
  @Input() currentUserId: number | undefined;
  @Output() onEnviar = new EventEmitter<EnviarMensajeDto>();

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  contenido: string = '';
  private shouldScroll = false;
  // IDs de remitentes cuya imagen de avatar falló al cargar
  avatarErrorIds = new Set<number>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mensajes']) {
      this.shouldScroll = true;
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    } catch (e) {}
  }

  enviar(): void {
    const texto = this.contenido?.trim();
    if (!texto) return;
    this.onEnviar.emit({ contenido: texto });
    this.contenido = '';
  }

  onImgError(event: Event, msg: MensajeDto): void {
    // Ocultamos la imagen rota y dejamos que el avatar-placeholder tome su lugar
    (event.target as HTMLImageElement).style.display = 'none';
    this.avatarErrorIds.add(msg.remitenteId);
  }
}
