import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular'; // Importamos IonicModule
import { CommonModule } from '@angular/common'; // Importamos CommonModule para *ngFor
import { FormsModule } from '@angular/forms';   // Importamos FormsModule para [(ngModel)]
import { Player } from 'src/app/shared/models/models';

@Component({
  selector: 'app-convocation-modal',
  templateUrl: './convocation-modal.component.html',
  styleUrls: ['./convocation-modal.component.scss'],
  standalone: true, // 🔥 ESTO ES LA CLAVE
  imports: [CommonModule, IonicModule, FormsModule] // 🔥 AQUÍ IMPORTAMOS LAS HERRAMIENTAS
})
export class ConvocationModalComponent implements OnInit {

  @Input() allPlayers: Player[] = [];     
  @Input() currentSquad: Player[] = [];   

  players: any[] = [];

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    console.log("Modal abierto. Total jugadores recibidos:", this.allPlayers.length);
    console.log("Convocados actuales:", this.currentSquad.length);

    // Usamos un Map para comparar IDs de forma segura
    const squadIds = new Set(this.currentSquad.map(p => this.getPlayerId(p)));

    this.players = this.allPlayers.map(p => ({
      ...p,
      selected: squadIds.has(this.getPlayerId(p)) 
    }));
    
    // Ordenar: Seleccionados primero
    this.players.sort((a, b) => {
        if (a.selected === b.selected) return 0;
        return a.selected ? -1 : 1;
    });
  }

  toggleSelection(p: any) {
    p.selected = !p.selected;
  }

  getSelectedCount() {
    return this.players.filter(p => p.selected).length;
  }

  save() {
    const selectedPlayers = this.players.filter(p => p.selected).map(p => {
        const { selected, ...originalPlayer } = p; 
        return originalPlayer;
    });
    this.modalCtrl.dismiss(selectedPlayers);
  }

  close() {
    this.modalCtrl.dismiss();
  }

  private getPlayerId(player: any): string {
    return String(player.id || player.idJugador || (player.usuario && player.usuario.id));
  }
}