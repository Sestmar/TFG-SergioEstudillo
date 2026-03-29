import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

// 1. IMPORTAMOS OnChanges y SimpleChanges (para evitar el bucle)

// Asumimos la interfaz del equipo
interface Equipo {
  id: number;
  nombre: string;
  categoria?: string;
  entrenador?: string;
}

@Component({
  selector: 'app-team-card',
  templateUrl: './team-card.component.html',
  styleUrls: ['./team-card.component.scss'],
})
export class TeamCardComponent implements OnChanges { // 2. IMPLEMENTAMOS OnChanges

  // 3. Aceptamos los @Inputs que tu landing.page.html (del mensaje #68) nos envía
  @Input() team: Equipo | undefined;
  @Input() showStats: boolean = false; 

  // 4. Aceptamos el @Output que tu landing.page.html escucha
  @Output() cardClick = new EventEmitter<Equipo>();

  // 5. Propiedad para guardar el estilo (¡NO es una función!)
  // Esto es lo que rompe el bucle infinito
  teamBackgroundStyle: string = 'linear-gradient(135deg, #555 0%, #333 100%)'; // Fondo por defecto

  constructor() { }

  // 6. Este "hook" se dispara SOLO cuando 'team' cambia
  ngOnChanges(changes: SimpleChanges) {
    if (changes['team'] && this.team) {
      // 7. Calculamos el fondo UNA SOLA VEZ y lo guardamos en la variable
      this.teamBackgroundStyle = this.generateTeamBackground(this.team);
    }
  }

  /**
   * Esta función la llama el HTML de la tarjeta
   */
  onCardClick() {
    this.cardClick.emit(this.team);
  }

  /**
   * Esta función AHORA ES PRIVADA. Solo la usa el .ts
   */
  private generateTeamBackground(team: Equipo): string {
    // Genera un gradiente simple (puedes cambiar esto)
    const hash = team.nombre.charCodeAt(0) % 50;
    const color1 = `hsl(${hash * 10}, 50%, 40%)`;
    const color2 = `hsl(${hash * 10}, 60%, 20%)`;
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  }
}