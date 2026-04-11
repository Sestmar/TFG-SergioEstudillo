import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SeasonStats } from 'src/app/shared/models/models';

@Component({
  selector: 'app-season-stats-widget',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './season-stats-widget.component.html',
  styleUrls: ['./season-stats-widget.component.scss']
})
export class SeasonStatsWidgetComponent {
  @Input() stats: SeasonStats | null = null;
  @Input() mostrarEdicion: boolean = false;
  @Output() editarClicked = new EventEmitter<void>();

  get progreso(): number {
    if (!this.stats?.puntosObjetivo || this.stats.puntosObjetivo <= 0) return 0;
    return Math.min(this.stats.puntos / this.stats.puntosObjetivo, 1);
  }

  get diferencia(): string {
    if (!this.stats) return '0';
    const d = this.stats.gf - this.stats.gc;
    return d > 0 ? `+${d}` : `${d}`;
  }

  rachaColor(resultado: string): string {
    if (resultado === 'V') return 'victoria';
    if (resultado === 'E') return 'empate';
    return 'derrota';
  }
}
