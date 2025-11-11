import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Team } from '@shared/models';

@Component({
  selector: 'app-team-card',
  templateUrl: './team-card.component.html',
  styleUrls: ['./team-card.component.scss'],
})
export class TeamCardComponent {
  @Input() team: Team;
  @Input() showStats = true;
  @Output() cardClick = new EventEmitter<number>();

  constructor() {}

  onCardClick() {
    if (this.team) {
      this.cardClick.emit(this.team.id);
    }
  }

  /**
   * Obtiene el color de fondo basado en el color principal del equipo
   */
  getTeamBackground(): string {
    return this.team?.colorPrincipal || '#3880ff';
  }

  /**
   * Obtiene el color del texto basado en el color secundario del equipo
   */
  getTeamTextColor(): string {
    return this.team?.colorSecundario || '#ffffff';
  }

  /**
   * Obtiene la posición en la liga con formato
   */
  getFormattedPosition(): string {
    if (!this.team?.estadisticas?.posicionLiga) {
      return 'Sin posición';
    }
    
    const position = this.team.estadisticas.posicionLiga;
    let suffix = 'º';
    
    if (position === 1) suffix = 'º';
    else if (position === 2) suffix = 'º';
    else if (position === 3) suffix = 'º';
    
    return `${position}${suffix}`;
  }

  /**
   * Verifica si el equipo tiene estadísticas
   */
  hasStats(): boolean {
    return !!this.team?.estadisticas;
  }
}