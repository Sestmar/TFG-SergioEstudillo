import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-dashboard-card',
  // HTML y CSS integrados. He añadido 'value' y 'subtitle'
  template: `
    <ion-card (click)="onCardClick()" button="true" class="dashboard-card">
      <ion-card-header class="ion-text-left">
        <div class="card-header-line">
          <ion-icon [name]="icon" [color]="color || 'primary'" class="card-icon"></ion-icon>
          <div class="value-text" [style.color]="'var(--ion-color-' + color + ')'">{{ value }}</div>
        </div>
        <ion-card-title>{{ title }}</ion-card-title>
        <ion-card-subtitle>{{ subtitle }}</ion-card-subtitle>
      </ion-card-header>
    </ion-card>
  `,
  styles: [`
    .dashboard-card {
      height: 100%;
      margin: 0;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      transition: all 0.2s ease-in-out;
    }
    .dashboard-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.12);
    }
    .card-header-line {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
    }
    .card-icon {
      font-size: 2.5rem;
    }
    .value-text {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
    }
    ion-card-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-top: 0.75rem;
    }
    ion-card-subtitle {
      font-size: 0.9rem;
    }
  `]
})
export class DashboardCardComponent {
  
  @Input() icon: string = 'apps-outline';
  @Input() title: string = 'Título';
  @Input() value: string | number = '0'; // <-- NUEVO
  @Input() subtitle: string = 'Descripción'; // <-- NUEVO
  @Input() color: string = 'primary';
  
  @Output() cardClick = new EventEmitter<void>();

  constructor() {}

  onCardClick() {
    this.cardClick.emit();
  }
}