import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; // ESENCIAL para ngIf, ngFor
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular'; // ESENCIAL para componentes Ionic
import { RouterModule, Routes } from '@angular/router';

import { PlayerDashboardPage } from './player-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: PlayerDashboardPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PlayerDashboardPage]
})
export class PlayerDashboardPageModule {}